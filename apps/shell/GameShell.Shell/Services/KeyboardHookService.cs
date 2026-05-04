using System.Runtime.InteropServices;

namespace GameShell.Shell.Services;

/// <summary>
/// Low-level keyboard hook to block system shortcuts (Alt+Tab, Win, Ctrl+Alt+Del proxy)
/// when shell is in kiosk mode. Only active on Windows.
/// </summary>
public class KeyboardHookService
{
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_SYSKEYDOWN = 0x0104;

    // Virtual key codes to block
    private static readonly HashSet<int> BlockedKeys = new()
    {
        0x5B, // Left Windows
        0x5C, // Right Windows
    };

    private IntPtr _hookId = IntPtr.Zero;
    private LowLevelKeyboardProc? _proc;
    private bool _isActive;

    public void Install()
    {
        if (_isActive) return;
        _proc = HookCallback;
        _hookId = SetHook(_proc);
        _isActive = true;
    }

    public void Uninstall()
    {
        if (!_isActive) return;
        UnhookWindowsHookEx(_hookId);
        _hookId = IntPtr.Zero;
        _isActive = false;
    }

    private IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN))
        {
            int vkCode = Marshal.ReadInt32(lParam);

            // Block Windows key
            if (BlockedKeys.Contains(vkCode))
            {
                return (IntPtr)1;
            }

            // Block Alt+Tab
            bool altPressed = (GetAsyncKeyState(0xA4) & 0x8000) != 0;
            if (altPressed && vkCode == 0x09) // Tab
            {
                return (IntPtr)1;
            }

            // Block Alt+F4
            if (altPressed && vkCode == 0x73) // F4
            {
                return (IntPtr)1;
            }
        }

        return CallNextHookEx(_hookId, nCode, wParam, lParam);
    }

    private static IntPtr SetHook(LowLevelKeyboardProc proc)
    {
        using var curProcess = System.Diagnostics.Process.GetCurrentProcess();
        using var curModule = curProcess.MainModule!;
        return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
    }

    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll")]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(int vKey);
}
