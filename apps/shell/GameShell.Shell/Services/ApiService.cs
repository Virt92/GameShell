using System.Net.Http;
using System.Net.Http.Json;

namespace GameShell.Shell.Services;

public class ApiService
{
    private readonly HttpClient _httpClient;
    private string? _accessToken;

    public ApiService()
    {
        _httpClient = new HttpClient();
    }

    public void Configure(string baseUrl, string? token = null)
    {
        _httpClient.BaseAddress = new Uri(baseUrl);
        _accessToken = token;
        if (token != null)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }
    }

    public async Task<T?> GetAsync<T>(string url)
    {
        var response = await _httpClient.GetAsync($"/api/{url}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>();
    }

    public async Task<T?> PostAsync<T>(string url, object data)
    {
        var response = await _httpClient.PostAsJsonAsync($"/api/{url}", data);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>();
    }

    public async Task<LoginResponse?> SendSms(string phone, string clubId)
    {
        return await PostAsync<LoginResponse>("auth/player/sms", new { phone, clubId });
    }

    public async Task<LoginResponse?> VerifySms(string phone, string code, string clubId)
    {
        var result = await PostAsync<LoginResponse>("auth/player/verify", new { phone, code, clubId });
        if (result?.AccessToken != null)
        {
            _accessToken = result.AccessToken;
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _accessToken);
        }
        return result;
    }
}

public class LoginResponse
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public PlayerInfo? Player { get; set; }
}

public class PlayerInfo
{
    public string? Id { get; set; }
    public string? Phone { get; set; }
    public string? Nickname { get; set; }
    public decimal Balance { get; set; }
    public int BonusPoints { get; set; }
    public string? LoyaltyLevel { get; set; }
}
