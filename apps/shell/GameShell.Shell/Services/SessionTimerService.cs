namespace GameShell.Shell.Services;

public class SessionTimerService
{
    private System.Timers.Timer? _timer;
    private DateTime _sessionEnd;
    private bool _warned10Min;
    private bool _warned2Min;

    public event Action<TimeSpan>? OnTick;
    public event Action<int>? OnWarning; // minutes remaining
    public event Action? OnExpired;

    public TimeSpan Remaining => _sessionEnd - DateTime.UtcNow;

    public void Start(int durationMinutes)
    {
        _sessionEnd = DateTime.UtcNow.AddMinutes(durationMinutes);
        _warned10Min = false;
        _warned2Min = false;

        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += TimerTick;
        _timer.Start();
    }

    public void Extend(int additionalMinutes)
    {
        _sessionEnd = _sessionEnd.AddMinutes(additionalMinutes);
        _warned10Min = false;
        _warned2Min = false;
    }

    public void Stop()
    {
        _timer?.Stop();
        _timer?.Dispose();
        _timer = null;
    }

    private void TimerTick(object? sender, System.Timers.ElapsedEventArgs e)
    {
        var remaining = _sessionEnd - DateTime.UtcNow;

        if (remaining <= TimeSpan.Zero)
        {
            Stop();
            OnExpired?.Invoke();
            return;
        }

        OnTick?.Invoke(remaining);

        if (!_warned10Min && remaining <= TimeSpan.FromMinutes(10))
        {
            _warned10Min = true;
            OnWarning?.Invoke(10);
        }

        if (!_warned2Min && remaining <= TimeSpan.FromMinutes(2))
        {
            _warned2Min = true;
            OnWarning?.Invoke(2);
        }
    }
}
