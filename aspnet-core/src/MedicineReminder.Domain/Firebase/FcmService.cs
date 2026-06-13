using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace MedicineReminder.Firebase;

/// <summary>
/// Firebase Cloud Messaging (FCM) service for sending push notifications
/// </summary>
public interface IFcmService : ITransientDependency
{
    Task SendNotificationAsync(string token, string title, string body);
}

/// <summary>
/// Implementation of Firebase Cloud Messaging service
/// Uses Firebase FCM HTTP v1 API
/// </summary>
public class FcmService : IFcmService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly FcmConfiguration _configuration;

    public FcmService(IHttpClientFactory httpClientFactory, FcmConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task SendNotificationAsync(string token, string title, string body)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("FcmClient");

            var message = new
            {
                message = new
                {
                    token = token,
                    notification = new
                    {
                        title = title,
                        body = body
                    }
                }
            };

            var response = await client.PostAsJsonAsync(
                $"https://fcm.googleapis.com/v1/projects/{_configuration.ProjectId}/messages:send",
                message);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"FCM send error: {error}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FCM send error: {ex.Message}");
        }
    }
}

/// <summary>
/// FCM Configuration from appsettings.json
/// </summary>
public class FcmConfiguration
{
    public string ProjectId { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string PrivateKey { get; set; } = string.Empty;
}
