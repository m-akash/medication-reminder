using System.Collections.Generic;
using System.Net;
using System.Text;

namespace MedicineReminder.Application.Emailing;

/// <summary>
/// A rendered email ready to hand to <c>IEmailSender.SendAsync</c> with
/// <c>isBodyHtml: true</c>.
/// </summary>
public readonly record struct EmailContent(string Subject, string HtmlBody);

/// <summary>
/// A single medicine to display in an email. Mirrors the job's private
/// <c>MedicineInfo</c> so the template layer does not depend on it.
/// </summary>
public readonly record struct MedicineItem(string Name, string Dosage);

/// <summary>
/// Builds good-looking, email-client-safe HTML for the app's notification
/// emails. Static, side-effect free, no dependencies. All CSS is inline and the
/// layout is table-based so it renders consistently in Gmail, Outlook, and
/// Apple Mail. Icons are emoji (no external images / no SVG) and all dynamic
/// text is HTML-encoded.
/// </summary>
public static class EmailTemplates
{
    private const string FontStack =
        "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

    /// <summary>
    /// Reminder that a dose window is open now.
    /// </summary>
    public static EmailContent DoseReminder(
        string recipientName,
        string doseTimeName,
        IReadOnlyList<MedicineItem> medicines)
    {
        var name = SafeName(recipientName);
        var dose = SafeText(doseTimeName);

        return new EmailContent(
            Subject: $"Time for your {dose} dose",
            HtmlBody: Render(
                title: $"Time for your {dose} dose",
                preheader: $"Time for your {dose} dose",
                greeting: $"Hi {name},",
                heroEmoji: "⏰",
                heroMessage: $"It's time to take your {dose} dose:",
                medicines: medicines));
    }

    /// <summary>
    /// Alert that a dose window has passed without being marked as taken.
    /// </summary>
    public static EmailContent MissedDose(
        string recipientName,
        string doseTimeName,
        IReadOnlyList<MedicineItem> medicines)
    {
        var name = SafeName(recipientName);
        var dose = SafeText(doseTimeName);

        return new EmailContent(
            Subject: "Missed Dose",
            HtmlBody: Render(
                title: "Missed Dose",
                preheader: "You missed a dose — please check",
                greeting: $"Hi {name},",
                heroEmoji: "⚠️",
                heroMessage: $"You missed your {dose.ToLowerInvariant()} dose of:",
                medicines: medicines));
    }

    /// <summary>
    /// End-to-end pipeline test email. No medicine list.
    /// </summary>
    public static EmailContent TestNotification(string recipientName)
    {
        var name = SafeName(recipientName);

        return new EmailContent(
            Subject: "Test notification",
            HtmlBody: Render(
                title: "Test notification",
                preheader: "Test notification from Medicine Reminder",
                greeting: $"Hi {name},",
                heroEmoji: "🎉",
                heroMessage: "If you can read this, email notifications are working!",
                medicines: null));
    }

    /// <summary>
    /// Shared document shell. <paramref name="medicines"/> may be null/empty to
    /// omit the medicine list (e.g. the test email).
    /// </summary>
    private static string Render(
        string title,
        string preheader,
        string greeting,
        string heroEmoji,
        string heroMessage,
        IReadOnlyList<MedicineItem>? medicines)
    {
        var html = new StringBuilder();

        html.Append("<!DOCTYPE html>");
        html.Append("<html lang=\"en\">");
        html.Append("<head>");
        html.Append("<meta charset=\"utf-8\">");
        html.Append("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
        html.Append($"<title>{WebUtility.HtmlEncode(title)}</title>");
        html.Append("</head>");
        html.Append($"<body style=\"margin:0;padding:0;background-color:#f4f6f9;font-family:{FontStack};\">");

        // Outer wrapper table.
        html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" ");
        html.Append("style=\"background-color:#f4f6f9;padding:24px 0;\">");
        html.Append("<tr><td align=\"center\">");

        // Inner card container (600px).
        html.Append("<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" ");
        html.Append("style=\"width:600px;max-width:600px;background-color:#ffffff;");
        html.Append("border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);\">");

        // Header bar.
        html.Append("<tr><td style=\"background-color:#0d9488;padding:24px 32px;\">");
        html.Append("<span style=\"font-size:24px;vertical-align:middle;\">💊</span>");
        html.Append("<span style=\"color:#ffffff;font-size:18px;font-weight:600;");
        html.Append("vertical-align:middle;margin-left:8px;\">Medicine Reminder</span>");
        html.Append("</td></tr>");

        // Body.
        html.Append("<tr><td style=\"padding:32px;\">");

        // Preheader: hidden plaintext preview shown by inbox lists.
        html.Append("<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f6f9;\">");
        html.Append(WebUtility.HtmlEncode(preheader));
        html.Append("</div>");

        // Greeting.
        html.Append("<p style=\"margin:0 0 8px;color:#0f172a;font-size:18px;font-weight:600;\">");
        html.Append(greeting);
        html.Append("</p>");

        // Hero line.
        html.Append("<p style=\"margin:0 0 24px;color:#334155;font-size:16px;line-height:1.5;\">");
        html.Append($"<span style=\"font-size:20px;\">{heroEmoji}</span> ");
        html.Append(heroMessage);
        html.Append("</p>");

        // Medicine list.
        if (medicines != null && medicines.Count > 0)
        {
            html.Append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" ");
            html.Append("style=\"width:100%;border-collapse:separate;border-spacing:0 8px;\">");
            foreach (var medicine in medicines)
            {
                html.Append(Card(medicine));
            }
            html.Append("</table>");
        }

        html.Append("</td></tr>"); // end body

        // Footer.
        html.Append("<tr><td style=\"padding:20px 32px;background-color:#f8fafc;");
        html.Append("border-top:1px solid #e2e8f0;\">");
        html.Append("<p style=\"margin:0;color:#64748b;font-size:12px;line-height:1.5;\">");
        html.Append("You received this email because medicine reminders are enabled. ");
        html.Append("Please do not reply to this message.");
        html.Append("</p>");
        html.Append("</td></tr>");

        html.Append("</table>"); // inner card
        html.Append("</td></tr>");
        html.Append("</table>"); // outer wrapper
        html.Append("</body></html>");

        return html.ToString();
    }

    /// <summary>
    /// One medicine rendered as a green card. The dosage is shown only when
    /// non-empty so a missing dosage leaves no stray parentheses or cell.
    /// </summary>
    private static string Card(MedicineItem medicine)
    {
        var name = WebUtility.HtmlEncode(SafeText(medicine.Name));
        var dosage = SafeText(medicine.Dosage);

        var html = new StringBuilder();
        html.Append("<tr><td style=\"background-color:#d1fae5;border-radius:10px;");
        html.Append("padding:14px 16px;border-left:4px solid #10b981;\">");

        html.Append($"<span style=\"color:#064e3b;font-size:15px;font-weight:600;\">{name}</span>");

        if (!string.IsNullOrWhiteSpace(dosage))
        {
            html.Append("<span style=\"color:#047857;font-size:13px;margin-left:6px;\">");
            html.Append($"({WebUtility.HtmlEncode(dosage)})");
            html.Append("</span>");
        }

        html.Append("</td></tr>");
        return html.ToString();
    }

    private static string SafeName(string? name) =>
        string.IsNullOrWhiteSpace(name) ? "there" : WebUtility.HtmlEncode(name.Trim());

    private static string SafeText(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();
}
