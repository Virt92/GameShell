using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using GameShell.Shell.Services;
using GameShell.Shell.ViewModels;

namespace GameShell.Shell;

public partial class App : Application
{
    private readonly IHost _host;

    public App()
    {
        _host = Host.CreateDefaultBuilder()
            .ConfigureServices((context, services) =>
            {
                // Services
                services.AddSingleton<ApiService>();
                services.AddSingleton<WebSocketService>();
                services.AddSingleton<SessionTimerService>();
                services.AddSingleton<KeyboardHookService>();
                services.AddSingleton<ProcessMonitorService>();

                // ViewModels
                services.AddTransient<LockScreenViewModel>();
                services.AddTransient<GameLauncherViewModel>();
                services.AddTransient<ShopViewModel>();
                services.AddTransient<MainViewModel>();
            })
            .Build();
    }

    public static T GetService<T>() where T : class
        => (Current as App)?._host.Services.GetRequiredService<T>()!;

    protected override async void OnStartup(StartupEventArgs e)
    {
        await _host.StartAsync();
        base.OnStartup(e);
    }

    protected override async void OnExit(ExitEventArgs e)
    {
        await _host.StopAsync();
        _host.Dispose();
        base.OnExit(e);
    }
}
