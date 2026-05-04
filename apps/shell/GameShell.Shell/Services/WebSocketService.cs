using Microsoft.AspNetCore.SignalR.Client;

namespace GameShell.Shell.Services;

public class WebSocketService
{
    private HubConnection? _connection;

    public event Action<string, object?>? OnCommand;
    public event Action<string>? OnNotification;

    public async Task ConnectAsync(string hubUrl, string hostId)
    {
        _connection = new HubConnectionBuilder()
            .WithUrl(hubUrl)
            .WithAutomaticReconnect()
            .Build();

        _connection.On<string, object>("ReceiveCommand", (command, payload) =>
        {
            OnCommand?.Invoke(command, payload);
        });

        _connection.On<string>("ReceiveNotification", (message) =>
        {
            OnNotification?.Invoke(message);
        });

        await _connection.StartAsync();
        await _connection.InvokeAsync("RegisterHost", hostId);
    }

    public async Task SendTelemetry(object telemetryData)
    {
        if (_connection?.State == HubConnectionState.Connected)
        {
            await _connection.InvokeAsync("SendTelemetry", telemetryData);
        }
    }

    public async Task DisconnectAsync()
    {
        if (_connection != null)
        {
            await _connection.StopAsync();
            await _connection.DisposeAsync();
        }
    }
}
