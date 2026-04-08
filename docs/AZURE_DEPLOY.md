# Deploying to Azure App Service

Follow these steps to deploy your Travel Concierge application to Azure. This guide assumes you have the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed.

### 1. Build the Frontend
Before deploying, you must build the frontend so the backend can serve the static files.

```bash
# From the root directory
npm run build
```

The app is now ready for deployment!

### 2. Login to Azure
```bash
az login
```

### 3. Create an Azure App Service
Enter the following command to create a Linux Web App in your subscription. Replace `<unique-app-name>` with a name like `travel-concierge-yourname`.

```bash
az webapp up --name <unique-app-name> --runtime "NODE:18-lts" --sku B1 --logs
```

*Note: The `--sku B1` is recommended for workshops to ensure performance, but you can use `F1` for free (limited).*

### 4. Configure Environment Variables
Your app needs the credentials from your `.env` file to talk to Azure AI Foundry and Search. Go to the Azure Portal (or use CLI) to add these as **App Settings**:

| Key | Value (from your .env) |
|---|---|
| `AZURE_FOUNDRY_BASE_URL` | Your Foundry Endpoint |
| `AZURE_FOUNDRY_API_KEY` | Your Foundry Key |
| `AZURE_FOUNDRY_MODEL_DEPLOYMENT` | `gpt-4o` |
| `AZURE_FOUNDRY_EMBEDDING_DEPLOYMENT` | `text-embedding-3-small` |
| `AZURE_SEARCH_ENDPOINT` | Your Search Endpoint |
| `AZURE_SEARCH_API_KEY` | Your Search Key |
| `AZURE_SEARCH_INDEX_PREFIX` | Your Index Name |

#### Setting via CLI:
```bash
az webapp config appsettings set --name <unique-app-name> --resource-group <resource-group-name> --settings \
AZURE_FOUNDRY_BASE_URL="xxx" \
AZURE_FOUNDRY_API_KEY="xxx" \
... (add all others)
```

### 5. Finalize
Once the `az webapp up` completion finishes and the settings are applied, your app will be live at:
`https://<unique-app-name>.azurewebsites.net`

### Troubleshooting
- **Logs:** Run `az webapp log tail --name <unique-app-name>` to see live server output.
- **Port:** The backend is configured to use `process.env.PORT`, which Azure App Service provides automatically.
- **Data Fallback:** The `.json` files in the `/data` folder are included in the deployment and will act as a fallback automatically if the Azure Search connection fails.
