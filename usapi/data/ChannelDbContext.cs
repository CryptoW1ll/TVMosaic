using Microsoft.EntityFrameworkCore;

public class ChannelDbContext : DbContext
{
    public ChannelDbContext(DbContextOptions<ChannelDbContext> options) : base(options)
    {
    }

    // tables in the database
    public DbSet<Channel> Channels => Set<Channel>();

    // dotnet ef migrations remove
    // protected override void OnModelCreating(ModelBuilder modelBuilder)
    // {
    //     base.OnModelCreating(modelBuilder); 
    // }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
    }
}