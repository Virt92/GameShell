using System.Windows;

namespace GameShell.Shell.Views;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }

    private void OnSendSmsClick(object sender, RoutedEventArgs e)
    {
        var phone = PhoneInput.Text;
        if (string.IsNullOrWhiteSpace(phone)) return;

        // TODO: Call API to send SMS
        MessageBox.Show($"SMS-код відправлено на {phone}", "GameShell");
    }

    private void OnGuestClick(object sender, RoutedEventArgs e)
    {
        // Switch to game launcher view
        LockScreen.Visibility = Visibility.Collapsed;
        GameLauncher.Visibility = Visibility.Visible;
    }
}
