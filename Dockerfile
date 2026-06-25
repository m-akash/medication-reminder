# ─────────────────────────────────────────────────────────────────────
# Dockerfile — MedicineReminder (single-domain deploy)
#
# Builds the Angular production bundle, merges it into the backend wwwroot,
# then builds the ABP HttpApi.Host (.NET 10). The resulting image serves
# both the SPA and the API from one host.
#
# Build:
#   docker build -t medicinereminder .
#
# Run:
#   docker run -p 8080:8080 --env-file .env medicinereminder
# ─────────────────────────────────────────────────────────────────────

# ── Stage 1: build the Angular client ────────────────────────────────
FROM node:22-bookworm-slim AS angular-build

WORKDIR /angular-client

# Install deps first for better layer caching.
COPY angular-client/package.json angular-client/package-lock.json ./
RUN npm ci

# Copy the rest of the Angular sources and build the production bundle.
COPY angular-client/ ./
RUN npm run build:prod

# ── Stage 2: restore + build the backend ─────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build

WORKDIR /src

# Copy the solution and project files first (cache restore).
COPY aspnet-core/MedicineReminder.slnx ./
COPY aspnet-core/NuGet.Config ./
COPY aspnet-core/common.props ./
COPY aspnet-core/src/MedicineReminder.Domain.Shared/MedicineReminder.Domain.Shared.csproj src/MedicineReminder.Domain.Shared/
COPY aspnet-core/src/MedicineReminder.Domain/MedicineReminder.Domain.csproj src/MedicineReminder.Domain/
COPY aspnet-core/src/MedicineReminder.Application.Contracts/MedicineReminder.Application.Contracts.csproj src/MedicineReminder.Application.Contracts/
COPY aspnet-core/src/MedicineReminder.Application/MedicineReminder.Application.csproj src/MedicineReminder.Application/
COPY aspnet-core/src/MedicineReminder.EntityFrameworkCore/MedicineReminder.EntityFrameworkCore.csproj src/MedicineReminder.EntityFrameworkCore/
COPY aspnet-core/src/MedicineReminder.HttpApi/MedicineReminder.HttpApi.csproj src/MedicineReminder.HttpApi/
COPY aspnet-core/src/MedicineReminder.HttpApi.Client/MedicineReminder.HttpApi.Client.csproj src/MedicineReminder.HttpApi.Client/
COPY aspnet-core/src/MedicineReminder.HttpApi.Host/MedicineReminder.HttpApi.Host.csproj src/MedicineReminder.HttpApi.Host/
COPY aspnet-core/src/MedicineReminder.DbMigrator/MedicineReminder.DbMigrator.csproj src/MedicineReminder.DbMigrator/

# Restore the Host project (pulls in transitive deps).
RUN dotnet restore src/MedicineReminder.HttpApi.Host/MedicineReminder.HttpApi.Host.csproj

# Copy the rest of the backend sources.
COPY aspnet-core/ ./

# Merge the Angular build into the Host wwwroot (mirrors deploy/build-and-copy.sh).
# Preserve ABP's own assets (libs/, images/, global-styles.css); overwrite hashed
# Angular bundles and the SPA entry point (index.html).
COPY --from=angular-build /angular-client/dist/angular-client/browser/. ./src/MedicineReminder.HttpApi.Host/wwwroot/

WORKDIR /src/src/MedicineReminder.HttpApi.Host
RUN dotnet publish MedicineReminder.HttpApi.Host.csproj -c Release -o /app/publish /p:UseAppHost=false

# ── Stage 3: runtime ─────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

# Non-root user for the running process. The Logs/ folder is writable because
# Serilog writes "Logs/logs.txt"; create it ahead of time.
RUN addgroup --system app && adduser --system --ingroup app app \
    && mkdir -p /app/Logs && chown -R app:app /app

WORKDIR /app
COPY --from=backend-build /app/publish ./
RUN chown -R app:app /app

USER app
EXPOSE 8080

# Kestrel listens on 8080 by default in the aspnet base image (ASPNETCORE_HTTP_PORTS).
ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_PRINT_TELEMETRY_MESSAGE=false

ENTRYPOINT ["dotnet", "MedicineReminder.HttpApi.Host.dll"]
