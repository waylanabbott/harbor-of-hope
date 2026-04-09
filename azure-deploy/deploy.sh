#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Harbor of Hope -- Azure Deployment Script
#
# Provisions all Azure resources and deploys .NET + React, Flask ML API,
# and Azure Database for PostgreSQL.
#
# Usage:
#   DB_ADMIN_PASSWORD="YourSecurePassword123!" ./deploy.sh
#
# Optional overrides (environment variables):
#   RESOURCE_GROUP, LOCATION, APP_NAME, FLASK_APP_NAME,
#   DB_SERVER_NAME, DB_ADMIN_USER, DB_NAME
###############################################################################

# ── Configuration ──────────────────────────────────────────────────────────────
RESOURCE_GROUP="${RESOURCE_GROUP:-harbor-hope-rg}"
LOCATION="${LOCATION:-westus2}"
APP_NAME="${APP_NAME:-harbor-of-hope}"
FLASK_APP_NAME="${FLASK_APP_NAME:-harborofhope-ml}"
DB_SERVER_NAME="${DB_SERVER_NAME:-harborofhope-db}"
DB_ADMIN_USER="${DB_ADMIN_USER:-hohadmin}"
DB_NAME="${DB_NAME:-harborofhope}"

# DB password is REQUIRED
if [ -z "${DB_ADMIN_PASSWORD:-}" ]; then
  echo "ERROR: DB_ADMIN_PASSWORD must be set."
  echo "Usage: DB_ADMIN_PASSWORD=\"YourPassword\" ./deploy.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Prerequisites ──────────────────────────────────────────────────────────────
echo "=== Checking prerequisites ==="

if ! command -v az &> /dev/null; then
  echo "ERROR: Azure CLI (az) is not installed."
  echo "Install with: brew install azure-cli"
  exit 1
fi

if ! az account show &> /dev/null; then
  echo "ERROR: Not logged in to Azure. Run: az login"
  exit 1
fi

SUBSCRIPTION=$(az account show --query name -o tsv)
echo "Using Azure subscription: $SUBSCRIPTION"

# ── 1. Resource Group ──────────────────────────────────────────────────────────
echo ""
echo "=== Creating Resource Group: $RESOURCE_GROUP ==="
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# ── 2. Azure Database for PostgreSQL Flexible Server ───────────────────────────
echo ""
echo "=== Creating PostgreSQL Flexible Server: $DB_SERVER_NAME ==="
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DB_SERVER_NAME" \
  --location "$LOCATION" \
  --admin-user "$DB_ADMIN_USER" \
  --admin-password "$DB_ADMIN_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --yes \
  --output none

echo "Creating database: $DB_NAME"
az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$DB_SERVER_NAME" \
  --database-name "$DB_NAME" \
  --output none

echo "Allowing Azure services to access database"
az postgres flexible-server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DB_SERVER_NAME" \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0 \
  --output none

# ── 3. App Service Plan (shared) ──────────────────────────────────────────────
echo ""
echo "=== Creating App Service Plan: ${APP_NAME}-plan ==="
az appservice plan create \
  --resource-group "$RESOURCE_GROUP" \
  --name "${APP_NAME}-plan" \
  --sku B1 \
  --is-linux \
  --output none

# ── 4. .NET App Service ───────────────────────────────────────────────────────
echo ""
echo "=== Creating .NET App Service: $APP_NAME ==="
az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan "${APP_NAME}-plan" \
  --name "$APP_NAME" \
  --runtime "DOTNETCORE:10.0" \
  --output none

CONN_STRING="Host=${DB_SERVER_NAME}.postgres.database.azure.com;Database=${DB_NAME};Username=${DB_ADMIN_USER};Password=${DB_ADMIN_PASSWORD};SSL Mode=Require;Trust Server Certificate=true"

echo "Configuring connection string"
az webapp config connection-string set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --connection-string-type PostgreSQL \
  --settings DefaultConnection="$CONN_STRING" \
  --output none

echo "Configuring app settings"
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --settings \
    MlApiUrl="https://${FLASK_APP_NAME}.azurewebsites.net" \
    FrontendUrl="https://${APP_NAME}.azurewebsites.net" \
    ASPNETCORE_ENVIRONMENT=Production \
  --output none

# ── 5. Flask App Service ──────────────────────────────────────────────────────
echo ""
echo "=== Creating Flask App Service: $FLASK_APP_NAME ==="
az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan "${APP_NAME}-plan" \
  --name "$FLASK_APP_NAME" \
  --runtime "PYTHON:3.12" \
  --output none

echo "Configuring Flask app settings"
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FLASK_APP_NAME" \
  --settings \
    ALLOWED_ORIGINS="https://${APP_NAME}.azurewebsites.net" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  --output none

echo "Setting Flask startup command"
az webapp config set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FLASK_APP_NAME" \
  --startup-file "gunicorn --bind=0.0.0.0:8000 flask_api.app:app" \
  --output none

# ── 6. Build Frontend ─────────────────────────────────────────────────────────
echo ""
echo "=== Building frontend ==="
cd "$PROJECT_ROOT/frontend"
npm ci
npm run build
cd "$PROJECT_ROOT"

# ── 7. Deploy .NET Backend (from source — let Azure/Oryx build it) ────────────
echo ""
echo "=== Deploying .NET backend from source ==="
cd "$PROJECT_ROOT/backend/HarborOfHope.API"
az webapp up \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --plan "${APP_NAME}-plan" \
  --runtime "DOTNETCORE:10.0" \
  --os-type Linux
cd "$PROJECT_ROOT"

# ── 8. Deploy Flask API ───────────────────────────────────────────────────────
echo ""
echo "=== Deploying Flask API ==="
cd "$PROJECT_ROOT/ml-pipelines"
zip -r "$PROJECT_ROOT/azure-deploy/flask.zip" flask_api/ models/
cd "$PROJECT_ROOT"

az webapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FLASK_APP_NAME" \
  --src azure-deploy/flask.zip \
  --output none

# ── 9. Summary ────────────────────────────────────────────────────────────────
echo ""
echo "==========================================="
echo "  Deployment complete!"
echo "==========================================="
echo ""
echo "  Main site:  https://${APP_NAME}.azurewebsites.net"
echo "  Flask API:  https://${FLASK_APP_NAME}.azurewebsites.net/health"
echo "  Database:   ${DB_SERVER_NAME}.postgres.database.azure.com"
echo ""
echo "  Resource group: $RESOURCE_GROUP"
echo "  To tear down:   az group delete --name $RESOURCE_GROUP --yes"
echo ""
