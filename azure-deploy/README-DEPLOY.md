# Harbor of Hope -- Azure Deployment Guide

## Prerequisites

Before deploying, ensure you have the following installed:

- **Azure CLI** (`az`) -- Install with `brew install azure-cli`
- **.NET 10 SDK** -- [Download](https://dotnet.microsoft.com/download/dotnet/10.0)
- **Node.js 20+** -- [Download](https://nodejs.org/)
- **Python 3.12** -- [Download](https://www.python.org/downloads/)

## Azure Account Setup

1. Create an Azure account or sign in at https://portal.azure.com
2. Ensure you have an active subscription:
   - **Azure for Students**: Free $100 credit (no credit card needed) -- https://azure.microsoft.com/en-us/free/students/
   - **Free Tier**: $200 credit for 30 days -- https://azure.microsoft.com/en-us/free/
   - **Pay-as-you-go**: For production use
3. Log in via CLI:
   ```bash
   az login
   ```
4. Verify your subscription:
   ```bash
   az account show
   ```

## Deploying

Run the deployment script from the project root:

```bash
DB_ADMIN_PASSWORD="YourSecurePassword123!" ./azure-deploy/deploy.sh
```

The `DB_ADMIN_PASSWORD` is **required** and sets the PostgreSQL admin password.

### Optional Configuration

Override defaults with environment variables:

| Variable          | Default              | Description                  |
|-------------------|----------------------|------------------------------|
| RESOURCE_GROUP    | harborofhope-rg      | Azure resource group name    |
| LOCATION          | eastus               | Azure region                 |
| APP_NAME          | harborofhope         | .NET App Service name        |
| FLASK_APP_NAME    | harborofhope-ml      | Flask App Service name       |
| DB_SERVER_NAME    | harborofhope-db      | PostgreSQL server name       |
| DB_ADMIN_USER     | hohadmin             | PostgreSQL admin username    |
| DB_NAME           | harborofhope         | PostgreSQL database name     |

Example with custom settings:

```bash
RESOURCE_GROUP="mygroup" LOCATION="westus2" DB_ADMIN_PASSWORD="MyPass!" ./azure-deploy/deploy.sh
```

## What Gets Deployed

The script creates the following Azure resources:

1. **Resource Group** -- Container for all resources
2. **Azure Database for PostgreSQL Flexible Server** (Burstable B1ms, 32GB) -- Application database
3. **App Service Plan** (Linux B1) -- Shared compute for both web apps
4. **.NET App Service** -- Serves the React SPA and .NET Web API
5. **Flask App Service** -- Serves the ML prediction API (8 models)

## Post-Deployment Verification

1. **Main site**: Visit `https://<APP_NAME>.azurewebsites.net`
   - You should see the Harbor of Hope landing page
   - The first startup may take 1-2 minutes as the database is migrated and seeded

2. **Flask health check**: Visit `https://<FLASK_APP_NAME>.azurewebsites.net/health`
   - Should return JSON with loaded model names

3. **Test accounts** (created on first startup via database seeding):
   - **Admin**: `admin@harborofhope.org` / (password set during seeding)
   - **Donor**: `donor@harborofhope.org` / (password set during seeding)

## Troubleshooting

### View application logs

```bash
# .NET backend logs
az webapp log tail --resource-group harborofhope-rg --name harborofhope

# Flask API logs
az webapp log tail --resource-group harborofhope-rg --name harborofhope-ml
```

### Check app status

```bash
az webapp show --resource-group harborofhope-rg --name harborofhope --query state -o tsv
```

### Restart an app

```bash
az webapp restart --resource-group harborofhope-rg --name harborofhope
```

### Common issues

- **502 Bad Gateway**: App is still starting. Wait 1-2 minutes, then refresh.
- **Database connection error**: Verify the firewall rule allows Azure services (`0.0.0.0`).
- **Flask models not loading**: Ensure the `models/` directory was included in the zip deployment.
- **CORS errors**: Check that `ALLOWED_ORIGINS` is set correctly on the Flask App Service.

## Cleanup

To delete all Azure resources and stop billing:

```bash
az group delete --name harborofhope-rg --yes
```

This removes the resource group and everything inside it (App Services, database, plan).
