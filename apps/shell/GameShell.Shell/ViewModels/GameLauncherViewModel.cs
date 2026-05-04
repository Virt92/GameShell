using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GameShell.Shell.Models;

namespace GameShell.Shell.ViewModels;

public partial class GameLauncherViewModel : ObservableObject
{
    [ObservableProperty]
    private List<GameItem> _games = new();

    [ObservableProperty]
    private string _searchQuery = "";

    [ObservableProperty]
    private string _selectedCategory = "Всі";

    public List<string> Categories => new() { "Всі", "FPS", "MOBA", "Battle Royale", "RPG", "Спорт", "Гонки" };

    [RelayCommand]
    private void LaunchGame(GameItem game)
    {
        if (string.IsNullOrEmpty(game.ExePath)) return;
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = game.ExePath,
                UseShellExecute = true,
            });
        }
        catch
        {
            // Handle launch error
        }
    }
}
