using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Common;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MedicineReminder.BackgroundJobs;
using MedicineReminder.EntityFrameworkCore;
using MedicineReminder.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;
using Microsoft.OpenApi;
using OpenIddict.Server;
using OpenIddict.Validation.AspNetCore;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Account.Web;
using Volo.Abp.AspNetCore.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Shared;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Autofac;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.OpenIddict;
using Volo.Abp.Security.Claims;
using Volo.Abp.Swashbuckle;
using Volo.Abp.UI.Navigation.Urls;
using Volo.Abp.VirtualFileSystem;

namespace MedicineReminder;

[DependsOn(
    typeof(MedicineReminderHttpApiModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMultiTenancyModule),
    typeof(MedicineReminderApplicationModule),
    typeof(MedicineReminderEntityFrameworkCoreModule),
    typeof(AbpAspNetCoreMvcUiLeptonXLiteThemeModule),
    typeof(AbpAccountWebOpenIddictModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule)
)]
public class MedicineReminderHttpApiHostModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();
        var configuration = context.Services.GetConfiguration();

        // In production, ABP's dev encryption/signing certificate is disabled and
        // a real X.509 certificate (openiddict.pfx) is used instead. Without it,
        // token signing/encryption fails in prod and login breaks.
        // For IIS (MonsterASP Windows) the MachineKeySet flag is required.
        if (!hostingEnvironment.IsDevelopment())
        {
            PreConfigure<AbpOpenIddictAspNetCoreOptions>(options =>
            {
                options.AddDevelopmentEncryptionAndSigningCertificate = false;
            });

            PreConfigure<OpenIddictServerBuilder>(serverBuilder =>
            {
                var pfxPath = configuration["OpenIddict:PfxPath"] ?? "openiddict.pfx";
                var pfxPassword = configuration["OpenIddict:PfxPassword"]
                                  ?? throw new InvalidOperationException(
                                      "OpenIddict:PfxPassword is not set in the production appsettings.");
                serverBuilder.AddProductionEncryptionAndSigningCertificate(
                    pfxPath,
                    pfxPassword,
                    X509KeyStorageFlags.MachineKeySet);

                // When running over HTTP (free hosting, no HTTPS) OpenIddict's
                // transport-security (HTTPS) requirement must be disabled. This is
                // INSECURE - passwords/tokens travel in plaintext. Only use when no
                // HTTPS is available. Set App:AllowHttp to false once HTTPS is on.
                if (configuration.GetValue("App:AllowHttp", false))
                {
                    serverBuilder.UseAspNetCore()
                        .DisableTransportSecurityRequirement();
                }
            });
        }

        PreConfigure<OpenIddictBuilder>(builder =>
        {
            builder.AddValidation(options =>
            {
                options.AddAudiences("MedicineReminder");
                options.UseLocalServer();
                options.UseAspNetCore();
            });
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        ConfigureAuthentication(context);
        ConfigureBundles();
        ConfigureUrls(configuration);
        ConfigureConventionalControllers();
        ConfigureVirtualFileSystem(context);
        ConfigureCors(context, configuration);
        ConfigureSwaggerServices(context, configuration);
        ConfigureHangfire(context, configuration);
    }

    private void ConfigureAuthentication(ServiceConfigurationContext context)
    {
        context.Services.ForwardIdentityAuthenticationForBearer(OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
        context.Services.Configure<AbpClaimsPrincipalFactoryOptions>(options =>
        {
            options.IsDynamicClaimsEnabled = true;
        });
    }

    private void ConfigureBundles()
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                LeptonXLiteThemeBundles.Styles.Global,
                bundle =>
                {
                    bundle.AddFiles("/global-styles.css");
                }
            );
        });
    }

    private void ConfigureUrls(IConfiguration configuration)
    {
        Configure<AppUrlOptions>(options =>
        {
            options.Applications["MVC"].RootUrl = configuration["App:SelfUrl"];
            options.RedirectAllowedUrls.AddRange(configuration["App:RedirectAllowedUrls"]?.Split(',') ?? Array.Empty<string>());

            options.Applications["Angular"].RootUrl = configuration["App:ClientUrl"];
            options.Applications["Angular"].Urls[AccountUrlNames.PasswordReset] = "account/reset-password";
        });
    }

    private void ConfigureVirtualFileSystem(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        if (hostingEnvironment.IsDevelopment())
        {
            Configure<AbpVirtualFileSystemOptions>(options =>
            {
                options.FileSets.ReplaceEmbeddedByPhysical<MedicineReminderDomainSharedModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MedicineReminder.Domain.Shared"));
                options.FileSets.ReplaceEmbeddedByPhysical<MedicineReminderDomainModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MedicineReminder.Domain"));
                options.FileSets.ReplaceEmbeddedByPhysical<MedicineReminderApplicationContractsModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MedicineReminder.Application.Contracts"));
                options.FileSets.ReplaceEmbeddedByPhysical<MedicineReminderApplicationModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MedicineReminder.Application"));
            });
        }
    }

    private void ConfigureConventionalControllers()
    {
        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(MedicineReminderApplicationModule).Assembly);
        });
    }

    private static void ConfigureSwaggerServices(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddAbpSwaggerGenWithOAuth(
            configuration["AuthServer:Authority"]!,
            new Dictionary<string, string>
            {
                    {"MedicineReminder", "MedicineReminder API"}
            },
            options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "MedicineReminder API", Version = "v1" });
                options.DocInclusionPredicate((docName, description) => true);
                options.CustomSchemaIds(type => type.FullName);
            });
    }

    private void ConfigureCors(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins(configuration["App:CorsOrigins"]?
                        .Split(",", StringSplitOptions.RemoveEmptyEntries)
                        .Select(o => o.RemovePostFix("/"))
                        .ToArray() ?? Array.Empty<string>())
                    .WithAbpExposedHeaders()
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    private void ConfigureHangfire(ServiceConfigurationContext context, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default");

        context.Services.AddHangfire(config =>
        {
            config.UseSimpleAssemblyNameTypeSerializer();
            config.UseRecommendedSerializerSettings();
            config.UseSqlServerStorage(connectionString, new SqlServerStorageOptions
            {
                QueuePollInterval = TimeSpan.FromSeconds(15)
            });
        });

        context.Services.AddHangfireServer(options =>
        {
            options.ServerName = "MedicineReminderServer";
        });
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();

        if (!env.IsDevelopment())
        {
            app.UseErrorPage();
        }

        app.UseCorrelationId();
        // Serve the Angular build output (root-level hashed JS/CSS/assets) from wwwroot.
        // MapAbpStaticAssets handles ABP's own MVC theme assets (libs/, images/).
        app.UseStaticFiles();
        app.MapAbpStaticAssets();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAbpOpenIddictValidation();

        if (MultiTenancyConsts.IsEnabled)
        {
            app.UseMultiTenancy();
        }
        app.UseUnitOfWork();
        app.UseDynamicClaims();
        app.UseAuthorization();

        // Configure Hangfire dashboard and server
        app.UseHangfireDashboard("/hangfire", new DashboardOptions
        {
            Authorization = new[] { new HangfireAuthorizationFilter() }
        });

        // Set up recurring jobs
        var backgroundJobClient = context.ServiceProvider.GetRequiredService<IBackgroundJobClient>();
        var recurringJobManager = context.ServiceProvider.GetRequiredService<IRecurringJobManager>();

        // Add recurring job for medicine reminders (every 5 minutes)
        recurringJobManager.AddOrUpdate<MedicineReminderJob>(
            "medicine-reminder-job",
            job => job.ExecuteAsync(new MedicineReminderJobArgs()),
            "*/5 * * * *"); // Cron expression: every 5 minutes

        // Swagger only in Development. In production Swagger is off - that way the
        // root '/' serves the Angular UI (avoids Swagger's / -> /swagger redirect)
        // and the API docs are not exposed publicly. Remove the env condition to
        // enable Swagger in production.
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseAbpSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "MedicineReminder API");

                var configuration = context.ServiceProvider.GetRequiredService<IConfiguration>();
                c.OAuthClientId(configuration["AuthServer:SwaggerClientId"]);
                c.OAuthScopes("MedicineReminder");
            });
        }

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();
        app.UseConfiguredEndpoints(endpoints =>
        {
            // Shared logic for serving the Angular index.html.
            static async Task ServeAngularIndex(HttpContext httpContext)
            {
                var env = httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
                var indexFile = Path.Combine(env.WebRootPath ?? "wwwroot", "index.html");
                if (!File.Exists(indexFile))
                {
                    httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                    await httpContext.Response.WriteAsync("Angular build not found in wwwroot. Run deploy/build-and-copy.sh.");
                    return;
                }

                httpContext.Response.StatusCode = StatusCodes.Status200OK;
                httpContext.Response.ContentType = "text/html; charset=utf-8";
                await httpContext.Response.SendFileAsync(indexFile);
            }

            // Explicitly map root '/' to the Angular index so that another
            // middleware (e.g. Swagger's / -> /swagger redirect) does not claim it.
            // In a single-domain setup '/' shows the Angular UI.
            endpoints.MapGet("/", ServeAngularIndex);

            // SPA fallback: route any remaining unmatched (non-API) GET request to the
            // Angular index.html so that client-side routing (deep links / refresh)
            // does not 404. Backend routes (/api, /connect, /hangfire, /swagger) are
            // matched earlier and never reach this; the guard is defense-in-depth.
            endpoints.MapFallback(async httpContext =>
            {
                var path = httpContext.Request.Path.Value ?? string.Empty;
                if (path.StartsWith("/api", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/connect", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/hangfire", StringComparison.OrdinalIgnoreCase) ||
                    path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase))
                {
                    httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                    return;
                }

                await ServeAngularIndex(httpContext);
            });
        });
    }
}

/// <summary>
/// Hangfire Dashboard Authorization Filter
/// Allows access to the dashboard in development
/// </summary>
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        // In production, implement proper authentication
        // For now, allow access in development
        return true;
    }
}

