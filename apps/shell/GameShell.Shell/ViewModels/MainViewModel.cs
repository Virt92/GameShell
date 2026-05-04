using CommunityToolkit.Mvvm.ComponentModel;

namespace GameShell.Shell.ViewModels;

public partial class MainViewModel : ObservableObject
{
    [ObservableProperty]
    private bool _isLoggedIn;

    [ObservableProperty]
    private string _currentView = "lock";

    [ObservableProperty]
    private string _timerDisplay = "00:00:00";

    [ObservableProperty]
    private string _balanceDisplay = "0 ₴";

    [ObservableProperty]
    private string? _playerName;
}
