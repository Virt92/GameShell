using System.Diagnostics;

namespace GameShell.Shell.Services;

/// <summary>
/// Monitors running processes and kills unauthorized ones.
/// Prevents users from opening Task Manager, CMD, etc.
/// </summary>
public class ProcessMonitorService
{
    private System.Timers.Timer? _timer;
    private bool _isActive;

    private static readonly HashSet<string> BlockedProcesses = new(StringComparer.OrdinalIgnoreCase)
    {
        "taskmgr",
        "cmd",
        "powershell",
        "pwsh",
        "regedit",
        "msconfig",
        "control",
    };

    public void Start()
    {
        if (_isActive) return;
        _timer = new System.Timers.Timer(2000);
        _timer.Elapsed += CheckProcesses;
        _timer.Start();
        _isActive = true;
    }

    public void Stop()
    {
        _timer?.Stop();
        _timer?.Dispose();
        _timer = null;
        _isActive = false;
    }

    private void CheckProcesses(object? sender, System.Timers.ElapsedEventArgs e)
    {
        foreach (var process in Process.GetProcesses())
        {
            try
            {
                if (BlockedProcesses.Contains(process.ProcessName))
                {
                    process.Kill();
                }
            }
            catch
            {
                // Process may have already exited
            }
        }
    }
}
