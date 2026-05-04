using CommunityToolkit.Mvvm.ComponentModel;

namespace GameShell.Shell.ViewModels;

public partial class ShopViewModel : ObservableObject
{
    [ObservableProperty]
    private string _selectedCategory = "Всі";
}
