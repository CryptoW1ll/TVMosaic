using System.ComponentModel.DataAnnotations;

public class Channel
{
    [Key]
    public int    ChannelId { get; set; }          // PK
    public string TvgId     { get; set; } = null!;
    public string Name      { get; set; } = null!;
    public string Logo      { get; set; } = null!;
    public string Category  { get; set; } = null!;
    public string Url { get; set; } = null!;
}