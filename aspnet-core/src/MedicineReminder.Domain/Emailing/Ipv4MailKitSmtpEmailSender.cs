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

/// <summary>
/// MailKit-based email sender that connects over IPv4 only.
///
/// smtp.gmail.com advertises both A (IPv4) and AAAA (IPv6) records, and
/// Dns.GetHostAddressesAsync can return the IPv6 address first. On this
/// machine the IPv6 path to Gmail is broken (utun tunnels report "No route to
/// host" / "Connection refused"), so a connection attempt that touches IPv6
/// can fail before falling back to IPv4. This sender resolves only the A
/// record and connects to the IPv4 literal directly, bypassing IPv6 entirely.
/// Because the connect target is an IP rather than a host name, the TLS
/// certificate is validated manually against the configured SMTP host name.
/// </summary>
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

        // Map SslOnConnect to StartTls when port is 587 to prevent handshaking failures
        // arising from EnableSsl=true in settings.
        var secureSocketOption = await GetSecureSocketOption();
        if (port == 587 && secureSocketOption == SecureSocketOptions.SslOnConnect)
        {
            secureSocketOption = SecureSocketOptions.StartTls;
        }

        // Resolve ONLY IPv4 (A records). On this machine the IPv6 path to smtp.gmail.com
        // returns "No route to host" / "Connection refused" (broken IPv6 via utun tunnels),
        // and MailKit's connect attempt can fail before falling back to IPv4 inside the host
        // process. By resolving to an IPv4 literal and connecting to that, we skip IPv6
        // entirely. We still pass `host` as the SSL/TLS server name so the certificate
        // validates against smtp.gmail.com.
        var ipv4 = (await Dns.GetHostAddressesAsync(host))
            .FirstOrDefault(a => a.AddressFamily == AddressFamily.InterNetwork);

        if (ipv4 != null)
        {
            Logger.LogInformation("[SMTP] Connecting to {Host} via IPv4 {Ip}:{Port} ({Secure})",
                host, ipv4, port, secureSocketOption);

            // Connect to the IPv4 literal. Since the connection target is an IP rather than
            // a host name, validate the TLS certificate manually against the configured SMTP
            // host name (e.g. smtp.gmail.com) instead of the IP string.
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
