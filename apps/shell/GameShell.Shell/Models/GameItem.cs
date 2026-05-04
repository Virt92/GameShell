namespace GameShell.Shell.Models;

public class GameItem
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string? CoverUrl { get; set; }
    public string? ExePath { get; set; }
    public string? Launcher { get; set; }
    public double? SizeGb { get; set; }
}
