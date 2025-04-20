using System.ComponentModel.DataAnnotations;

public class Channel
{
    [Key]
    public int ChannelId { get; set; }
    public string? Name { get; set; }
    public string? Url { get; set; }
    public string? Category { get; set; }
    public string? Icon { get; set; }
}