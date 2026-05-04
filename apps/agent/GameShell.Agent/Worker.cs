namespace GameShell.Agent;

/// <summary>
/// GameShell Agent - Windows Service that runs on each gaming PC.
/// Responsibilities:
/// - Collects hardware telemetry (CPU/GPU/RAM/temp) and sends to Local Hub
/// - Receives commands from Local Hub (shutdown, restart, lock, install game, etc.)
/// - Manages game installations via Steam/Epic/custom paths
/// - Monitors running processes and reports to backend
/// - Handles Wake-on-LAN responses
/// </summary>
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("GameShell Agent started at: {time}", DateTimeOffset.Now);

        while (!stoppingToken.IsCancellationRequested)
        {
            // TODO: Collect telemetry
            // TODO: Check for pending commands
            // TODO: Report status to Local Hub

            _logger.LogInformation("Agent heartbeat at: {time}", DateTimeOffset.Now);
            await Task.Delay(5000, stoppingToken);
        }
    }
}
