# Medicine Reminder

A production-ready **medication adherence** application that helps users track their prescriptions, never miss a dose, and stay on top of refills. Built on the **ABP Framework** with a .NET backend and an Angular SPA frontend, deployable as a single self-contained web app.

> Track. Remind. Refill. — Never miss a dose again.

---

## Features

### Medication management
- **Add & edit medicines** with name, dosage (e.g. `500mg`, `1 tablet`), treatment duration, instructions, and pill inventory.
- **Frequency pattern** in `Morning-Afternoon-Evening` format (e.g. `1-0-1` = take a dose in the morning and evening, skip the afternoon). Each position is a slot: `1` = take, `0` = skip.
- **Pill inventory tracking** with per-dose pill counts and `DosesPerDay`, enabling smart refill alerts.
- **Daily dose logging** (`MedicineTakenDay`) records taken/missed status per time slot, powering the adherence reports.

### Smart reminders
- A **Hangfire background job** runs every **5 minutes** to evaluate every active reminder.
- **Dose reminders** fire when a scheduled time passes — multiple medicines due at the same time-of-day are **grouped into a single notification** (e.g. all your evening meds in one email).
- **Missed-dose alerts** trigger once a dose is more than **60 minutes overdue** (and still not taken).
- Reminders are delivered via **HTML email** *and* **in-app notifications**, so you're covered whether the app is open or not.

### Refill alerts
- Automatic warnings when a medicine is running low — **≤ 20 pills remaining** or **≤ 20 days of supply** left — surfaced on the dashboard.

### Reporting & insights
- **Adherence reports** visualize dose history and statistics so users (and carers) can see how consistently medication is being taken.

### User settings & profiles
- Per-user **settings** stored as JSON: notification toggles (on/off, missed-dose alerts), default reminder times, medicine defaults, and privacy preferences.
- Default reminder times fall back to `08:00 / 14:00 / 20:00` unless customised per user or per medicine.

### Platform & security
- **OAuth 2.0 / OpenID Connect** authentication via OpenIDDict (password flow, JWT access + refresh tokens, certificate-signed).
- **Multi-tenancy** support built in (ABP multi-tenancy is enabled).
- **Structured logging** with Serilog.
- **SQL Server** persistence via Entity Framework Core.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | .NET 10, **ABP Framework 10.1** |
| Data access | Entity Framework Core 10 (SQL Server) |
| Auth | OpenIDDict (OAuth 2.0 / OIDC) |
| Background jobs | Hangfire 1.8 |
| Email | MailKit (ABP `IEmailSender`) |
| Logging | Serilog |
| Frontend | Angular 19, TypeScript 5.7 |
| UI styling | Tailwind CSS 3.4 + DaisyUI 5.5 |
| Database | Microsoft SQL Server |

---

## Solution structure

```
medication-reminder/
├── aspnet-core/                     # .NET backend (ABP)
│   └── src/
│       ├── MedicineReminder.Domain.Shared    # constants, localization, multi-tenancy config
│       ├── MedicineReminder.Domain            # entities & domain logic
│       ├── MedicineReminder.Application.Contracts   # DTOs & service interfaces
│       ├── MedicineReminder.Application       # application services & background jobs
│       ├── MedicineReminder.EntityFrameworkCore      # EF Core / SQL Server data layer
│       ├── MedicineReminder.HttpApi           # API controllers
│       ├── MedicineReminder.HttpApi.Client    # C# API client
│       ├── MedicineReminder.HttpApi.Host      # main host (serves API + Angular SPA)
│       └── MedicineReminder.DbMigrator        # console app: migrate + seed DB
├── angular-client/                  # Angular 19 SPA
├── Dockerfile                       # multi-stage: builds Angular + .NET, single-domain serve
├── Dockerfile.DbMigrator            # one-off schema migration + seed
├── docker-compose.yml               # SQL Server + DbMigrator + App
└── deploy/build-and-copy.sh         # build Angular → merge into backend wwwroot
```

### Domain entities

| Entity | Responsibility |
| --- | --- |
| `Medicine` | The medication: dosage, frequency, duration, pill inventory, instructions |
| `Reminder` | A reminder schedule for a medicine, with active/inactive state |
| `ReminderTime` | Specific times of day attached to a reminder |
| `MedicineTakenDay` | Per-day, per-slot dose tracking (`1-0-1` style taken / `RemindersSent` flags) |
| `AppUser` | User profile (extends ABP `IdentityUser`) |
| `UserSettings` | Per-user JSON preferences (notifications, defaults, privacy) |
| `Notification` | In-app notifications (types: `REMINDER`, `MISSED_DOSE`, refill, system, success) |

---

## Getting started

### Prerequisites
- **.NET 10 SDK**
- **Node.js 20.11+** (and npm)
- **SQL Server** (LocalDB, Developer, or Express all work locally)
- *(optional)* Docker, for the containerised stack

### Option A — Run locally (developer workflow)

1. **Configure the database** — edit the connection string in
   [aspnet-core/src/MedicineReminder.HttpApi.Host/appsettings.json](aspnet-core/src/MedicineReminder.HttpApi.Host/appsettings.json).

2. **Create the database & seed data** — run the DbMigrator console app:
   ```bash
   cd aspnet-core/src/MedicineReminder.DbMigrator
   dotnet run
   ```

3. **Start the backend**:
   ```bash
   cd aspnet-core/src/MedicineReminder.HttpApi.Host
   dotnet run
   ```

4. **Start the Angular frontend**:
   ```bash
   cd angular-client
   npm install
   ng serve
   ```
   The API serves on its configured port (default `8080`); the Angular dev server proxies API calls to it.

### Option B — Run with Docker (single-domain deploy)

The compose stack spins up SQL Server, runs the DbMigrator, and serves the whole app (API + SPA) from a single domain.

1. **Copy the environment template and fill it in**:
   ```bash
   cp .env.example .env
   # edit .env: SQL_PASSWORD, OpenIddict pfx path/password, SMTP credentials
   ```

2. **Migrate & seed the database** (one-off):
   ```bash
   docker compose --profile migrate up --build dbmigrator
   ```

3. **Build and run the app**:
   ```bash
   docker compose up --build app
   ```
   The app is then served on `APP_PORT` (default `8080`).

---

## Configuration

### `appsettings.json` (HttpApi.Host)
- **Connection string** — SQL Server target.
- **OpenIddict** — signing/encryption certificate (`openiddict.pfx`) and password.
- **SMTP / email** — *must* live under the `Settings:Abp.Mailing.Smtp.*` key (host, port, user, password, from address/name). If placed elsewhere, ABP silently falls back to `127.0.0.1:25` and email reminders will not deliver.
- **Hangfire** — job storage (SQL Server) and the recurring `MedicineReminderJob` schedule.

### `.env` (Docker)
See [.env.example](.env.example) for all variables: `SQL_PASSWORD`, `SQL_DATABASE`, `APP_PORT`, `OPENIDDICT_PFX_PATH` / `OPENIDDICT_PFX_PASSWORD`, and the `SMTP_*` block.

> **Tip:** For Gmail SMTP, use an **App Password** (not your account password). On some networks IPv6 routes to Google are broken — if SMTP connects but never delivers, force IPv4.

---

## How the reminder engine works

The scheduler (`MedicineReminderJob`) is the heart of the app:

1. **Every 5 minutes**, Hangfire fires the job. It begins an explicit Unit of Work so a single `DbContext` lives for the whole run (avoids `ObjectDisposedException` when async continuations resume after the DI scope is gone).
2. It loads every `Medicine` that has **active reminders** and the owning user's settings.
3. For each medicine it generates **today's dose times** from the frequency pattern and reminder times (per-user defaults → per-medicine reminders → `08:00/14:00/20:00` fallback).
4. For each dose it evaluates, **relative to the dose time** (not the jittery moment Hangfire fired):
   - **Due** when `doseTime ≤ now < doseTime + 60 min`
   - **Missed** when `now ≥ doseTime + 60 min`
   - A `RemindersSent` flag per slot prevents duplicate sends across runs.
5. Doses due at the same **time-of-day** (Morning / Afternoon / Evening) are **grouped** into one email and one in-app notification.
6. Email sends are wrapped so a failed SMTP delivery **never aborts** the run or skips the in-app notification — failures are logged and the job continues.

---

## Useful scripts

- [deploy/build-and-copy.sh](deploy/build-and-copy.sh) — builds the Angular production bundle and merges it into the backend `wwwroot`, so the HttpApi.Host can serve the SPA on a single domain.
- `Dockerfile` / `Dockerfile.DbMigrator` — container builds for the app and the migrator.
