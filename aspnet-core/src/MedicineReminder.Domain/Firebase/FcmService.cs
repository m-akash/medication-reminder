using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace MedicineReminder.Firebase;

/// <summary>
/// Firebase Cloud Messaging (FCM) service for sending push notifications.
/// </summary>
public interface IFcmService : ITransientDependency
{
    Task SendNotificationAsync(string token, string title, string body);
}

/// <summary>
/// Implementation of Firebase Cloud Messaging service using the FCM HTTP v1 API.
///
/// Authenticates with a Google service account (firebase-service-account.json),
/// minting a short-lived OAuth2 access token that is attached as a bearer token
/// to each request. The v1 endpoint rejects unauthenticated requests with 401.
/// </summary>
public class FcmService : IFcmService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly FcmConfiguration _configuration;
    private readonly ILogger<FcmService> _logger;

    // scopes required to send messages through FCM HTTP v1.
    private static readonly string[] FcmScopes = { "https://www.googleapis.com/auth/firebase.messaging" };

    public FcmService(
        IHttpClientFactory httpClientFactory,
        FcmConfiguration configuration,
        ILogger<FcmService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendNotificationAsync(string token, string title, string body)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("FCM send skipped: token is empty.");
            return;
        }

        try
        {
            var credential = LoadCredential();
            if (credential == null)
            {
                return; // configuration errors already logged in LoadCredential
            }

            var accessToken = await credential.GetAccessTokenForRequestAsync(
                "https://oauth2.googleapis.com/token",
                CancellationToken.None);
            if (string.IsNullOrEmpty(accessToken))
            {
                _logger.LogError("FCM send aborted: failed to obtain OAuth2 access token.");
                return;
            }

            var client = _httpClientFactory.CreateClient("FcmClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var message = new
            {
                message = new
                {
                    token = token,
                    notification = new { title = title, body = body }
                }
            };

            var response = await client.PostAsJsonAsync(
                $"https://fcm.googleapis.com/v1/projects/{_configuration.ProjectId}/messages:send",
                message);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("FCM send failed ({StatusCode}): {Error}", response.StatusCode, error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FCM send error");
        }
    }

    /// <summary>
    /// Loads the service account credential from the JSON file.
    /// The file path is relative to the application base directory (copied to the
    /// output folder by the project file) or may be an absolute path.
    /// </summary>
    private ServiceAccountCredential? LoadCredential()
    {
        if (string.IsNullOrWhiteSpace(_configuration.ServiceAccountFilePath))
        {
            _logger.LogError("FCM config missing: Firebase:ServiceAccountFilePath is not set.");
            return null;
        }

        var path = _configuration.ServiceAccountFilePath;
        if (!Path.IsPathRooted(path))
        {
            path = Path.Combine(AppContext.BaseDirectory, path);
        }

        if (!File.Exists(path))
        {
            _logger.LogError("FCM service account file not found at: {Path}", path);
            return null;
        }

        try
        {
            using var stream = File.OpenRead(path);
            // Load via GoogleCredential (handles JSON parsing) then unwrap the
            // underlying ServiceAccountCredential, which exposes
            // GetAccessTokenForRequestAsync for minting OAuth2 tokens.
            var googleCredential = GoogleCredential.FromStream(stream).CreateScoped(FcmScopes);

            if (googleCredential.UnderlyingCredential is ServiceAccountCredential serviceAccountCredential)
            {
                return serviceAccountCredential;
            }

            _logger.LogError("FCM credential in {Path} is not a service account key.", path);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load FCM service account credential from {Path}", path);
            return null;
        }
    }
}

/// <summary>
/// FCM configuration from appsettings.json.
/// </summary>
public class FcmConfiguration
{
    public string ProjectId { get; set; } = string.Empty;

    /// <summary>
    /// Path to the Firebase service account JSON. Relative paths are resolved
    /// against the application base directory. The file is gitignored.
    /// </summary>
    public string ServiceAccountFilePath { get; set; } = string.Empty;
}
