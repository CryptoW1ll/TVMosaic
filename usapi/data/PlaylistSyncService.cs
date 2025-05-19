using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;


public class PlaylistSyncService : BackgroundService
{
    private readonly IServiceProvider _sp;
    private const string Url = "https://iptv-org.github.io/iptv/countries/us.m3u";

    public PlaylistSyncService(IServiceProvider sp) => _sp = sp;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(6));   // refresh 4×/day
        do { await SyncOnce(ct); } while (await timer.WaitForNextTickAsync(ct));
    }

    private async Task SyncOnce(CancellationToken ct)
    {
        var lines = (await new HttpClient().GetStringAsync(Url, ct)).Split('\n');
        var pairs = lines.Chunk(2).Where(c => c.Length == 2 && c[0].StartsWith("#EXTINF"));

        var records = new List<Channel>();
        var regex = new Regex(@"(\w+?)=""(.*?)""", RegexOptions.Compiled);

        foreach (var chunk in pairs)
        {
            var meta = chunk[0];
            var url = chunk[1].Trim();
            var attrs = regex.Matches(meta)
                             .ToDictionary(m => m.Groups[1].Value, m => m.Groups[2].Value);

            records.Add(new Channel
            {
                TvgId = attrs.GetValueOrDefault("tvg-id") ?? "",
                Name = meta[(meta.IndexOf(',') + 1)..].Trim(),
                Logo = attrs.GetValueOrDefault("tvg-logo") ?? "",
                Category = attrs.GetValueOrDefault("group-title") ?? "",
                Url = url
            });
        }

        await using var scope = _sp.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        //db.Channels.ExecuteDelete();                  // simple: wipe & replace

        await db.Database.ExecuteSqlRawAsync("DELETE FROM [Channels]"); // wipe table
        //D:\Github\TVMosiac\usapi\data\PlaylistSyncService.cs(46,27): error CS1061: 'DatabaseFacade' does not contain a definition for 'ExecuteSqlRawAsync' and no accessible extension method 'ExecuteSqlRawAsync' accepting a first argument of type 'DatabaseFacade' could be found (are you missing a using directive or
        await db.Channels.AddRangeAsync(records, ct);
        await db.SaveChangesAsync(ct);
    }
}
