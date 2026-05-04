using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GameShell.Shell.Services;

namespace GameShell.Shell.ViewModels;

public partial class LockScreenViewModel : ObservableObject
{
    private readonly ApiService _apiService;

    [ObservableProperty]
    private string _phone = "";

    [ObservableProperty]
    private string _smsCode = "";

    [ObservableProperty]
    private bool _isSmsSent;

    [ObservableProperty]
    private string? _errorMessage;

    public LockScreenViewModel(ApiService apiService)
    {
        _apiService = apiService;
    }

    [RelayCommand]
    private async Task SendSms()
    {
        try
        {
            ErrorMessage = null;
            await _apiService.SendSms(Phone, ""); // clubId from config
            IsSmsSent = true;
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Помилка: {ex.Message}";
        }
    }

    [RelayCommand]
    private async Task VerifySms()
    {
        try
        {
            ErrorMessage = null;
            var result = await _apiService.VerifySms(Phone, SmsCode, "");
            // Navigate to game launcher
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Невірний код: {ex.Message}";
        }
    }
}
