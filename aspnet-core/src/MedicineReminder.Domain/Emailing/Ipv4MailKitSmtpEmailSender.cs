using System;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;
using Volo.Abp.MailKit;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace MedicineReminder.Emailing;

[Dependency(ServiceLifetime.Transient, ReplaceServices = true)]
public class Ipv4MailKitSmtpEmailSender : MailKitSmtpEmailSender
{
    public new ILogger<Ipv4MailKitSmtpEmailSender> Logger { get; set; }

    public Ipv4MailKitSmtpEmailSender(
        Volo.Abp.MultiTenancy.ICurrentTenant currentTenant,
        Volo.Abp.Emailing.Smtp.ISmtpEmailSenderConfiguration smtpConfiguration,
        IBackgroundJobManager backgroundJobManager,
        IOptions<AbpMailKitOptions> abpMailKitConfiguration)
        : base(currentTenant, smtpConfiguration, backgroundJobManager, abpMailKitConfiguration)
    {
        Logger = NullLogger<Ipv4MailKitSmtpEmailSender>.Instance;
    }

    protected override async Task ConfigureClient(SmtpClient client)
    {
        var host = await SmtpConfiguration.GetHostAsync();
        var port = await SmtpConfiguration.GetPortAsync();

        var secureSocketOption = await GetSecureSocketOption();
        if (port == 587 && secureSocketOption == SecureSocketOptions.SslOnConnect)
        {
            secureSocketOption = SecureSocketOptions.StartTls;
        }

        var ipv4 = (await Dns.GetHostAddressesAsync(host))
            .FirstOrDefault(a => a.AddressFamily == AddressFamily.InterNetwork);

        if (ipv4 != null)
        {
            Logger.LogInformation("[SMTP] Connecting to {Host} via IPv4 {Ip}:{Port} ({Secure})",
                host, ipv4, port, secureSocketOption);

            client.ServerCertificateValidationCallback = (s, cert, chain, sslPolicyErrors) =>
            {
                if (sslPolicyErrors == System.Net.Security.SslPolicyErrors.None)
                {
                    return true;
                }

                var cert2 = new System.Security.Cryptography.X509Certificates.X509Certificate2(cert!);
                var dnsName = cert2.GetNameInfo(
                    System.Security.Cryptography.X509Certificates.X509NameType.DnsName, false);
                return string.Equals(dnsName, host, StringComparison.OrdinalIgnoreCase);
            };

            await client.ConnectAsync(ipv4.ToString(), port, secureSocketOption);
        }
        else
        {
            Logger.LogWarning("[SMTP] No IPv4 address found for {Host}; falling back to hostname connect", host);
            await client.ConnectAsync(host, port, secureSocketOption);
        }

        if (await SmtpConfiguration.GetUseDefaultCredentialsAsync())
        {
            return;
        }

        await client.AuthenticateAsync(
            await SmtpConfiguration.GetUserNameAsync(),
            await SmtpConfiguration.GetPasswordAsync()
        );
    }
}
