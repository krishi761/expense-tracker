# Expense Tracker

A full-stack expense management application built with Angular and .NET Web API.

## Features

- **RESTful API**: Clean, RESTful endpoints for all operations
- **Entity Framework Core**: Code-first database approach with migrations
- **SQL Server Database**: Enterprise-grade database with Docker support
- **DTOs**: Data Transfer Objects for clean API contracts
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Hierarchical Navigation**: Intuitive menu system with read-only and management views

## Tech Stack

### Frontend

- **Angular 18** - Modern web framework with standalone components
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **CSS3** - Styling and responsive design

### Backend

- .NET 10 Web API
- Entity Framework Core 10
- SQL Server
- Redis cache

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (v18 or higher)
- .NET 10 SDK
- Angular CLI (`npm install -g @angular/cli`)
- A SQL Server instance and an Azure Managed Redis instance (or another Redis-compatible server)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/krishi761/expense-tracker.git
cd expense-tracker
```

### 2. Configure development secrets

The API uses .NET User Secrets locally. From `ExpenseAPI`, set the SQL Server and Redis values without committing them:

```bash
cd ExpenseAPI
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_SQL_SERVER_CONNECTION_STRING"
dotnet user-secrets set "ConnectionStrings:Redis" "localhost:6379"
```

For Azure Managed Redis during local development, store its TLS connection string in the `ConnectionStrings:Redis` secret as described below. The API requires an explicit Redis connection and does not silently use localhost.

### 3. Backend Setup (.NET API)

From the repository root, run the API with the Development profile so it loads User Secrets:

```bash
cd ExpenseAPI
export ConnectionStrings__DefaultConnection='Data Source=localhost,1434;Initial Catalog=ExpenseManagement;User ID=SA;Password=Whitepaper#9098;Pooling=False;Connect Timeout=15;Encrypt=True;Trust Server Certificate=True;Authentication=SqlPassword;Application Name=ExpenseTracker;Command Timeout=30'
dotnet restore
dotnet ef database update
dotnet run --launch-profile http
```

`Initial Catalog=ExpenseManagement` selects the app database. EF Core applies pending migrations at startup. Never commit connection strings or passwords.

The API reads and writes SQL Server data through Entity Framework Core, with retries for transient SQL failures such as Azure SQL serverless resume. The categories, subcategories, and expenses list endpoints use Redis cache-aside with a two-minute TTL; successful writes invalidate the relevant cached lists.

The existing `ExpenseManagement.db` SQLite file is not migrated or used. If it contains data you need, migrate that data to SQL Server separately before switching over.

   The API will be available at `http://localhost:8000`

### Redis cache behavior

- Redis is configured through `ConnectionStrings__Redis`; the API does not assume a local endpoint.
- Cached list data expires after two minutes.
- Successful creates, updates, and deletes invalidate affected list caches.
- If Redis is unavailable, the cache service logs the Redis error and falls back to the source query for reads.
- `/api/Expenses/diagnostics` includes `redisAvailable`, verified with a short-lived Redis write/read check.

### Configure Azure Managed Redis

The API project has a .NET User Secrets ID. From `ExpenseAPI`, store credentials locally rather than in `appsettings.json`. Copy the hostname and TLS port from the Azure portal. For Azure Managed Redis, access-key authentication is disabled by default; enable it in the instance's Authentication settings before using a key. Microsoft recommends Microsoft Entra authentication where possible. Never commit access keys or paste them into shared logs or chat.

For local Redis instead, run `dotnet user-secrets set "ConnectionStrings:Redis" "localhost:6379"` from `ExpenseAPI`.

To avoid putting the key in shell history, enter it through a hidden prompt instead:

```bash
cd ExpenseAPI
printf "Azure Redis host: "
IFS= read -r REDIS_HOST
printf "Azure Redis TLS port: "
IFS= read -r REDIS_PORT
printf "Azure Redis access key: "
IFS= read -r -s REDIS_ACCESS_KEY
printf '\n'
REDIS_CONNECTION="${REDIS_HOST}:${REDIS_PORT},password=${REDIS_ACCESS_KEY},ssl=True,abortConnect=False"
dotnet user-secrets set "ConnectionStrings:Redis" "$REDIS_CONNECTION"
unset REDIS_CONNECTION
unset REDIS_ACCESS_KEY
```

The `dotnet user-secrets set` command confirms when the value has been saved. Avoid running `dotnet user-secrets list` while screen sharing because it prints secret values.

`dotnet run --launch-profile http` runs the API in Development, where ASP.NET Core loads User Secrets. The Redis connection setting is required; the API no longer silently defaults to local Redis. For production, provide `ConnectionStrings__Redis` through the hosting platform's secret configuration.

### Azure deployment checklist

Azure resources are managed separately from this repository. Before publishing:

1. Provision Azure SQL Database (or another SQL Server reachable from the API) and Azure Managed Redis. The development SQL container at `localhost,1434` is not reachable by an API running in Azure. Configure Azure SQL firewall/network access for the API host.
2. Deploy the API and Angular frontend together to Azure App Service. In App Service **Environment variables**, set `ConnectionStrings__DefaultConnection` and `ConnectionStrings__Redis` to the Azure service connection strings. Keep credentials in App Service settings/Key Vault, not in source files.
3. If Azure Managed Redis is private-networked, configure App Service VNet integration to a VNet that can reach the Redis private endpoint, and ensure the Redis hostname resolves through the expected private DNS zone. The app can fall back to SQL when Redis is unavailable, but cache-backed requests will be slower.
4. Configure `Cors__AllowedOrigins__0` in the API App Service with a valid origin. The API requires this setting in production; with the frontend served from the same App Service origin, browser API calls are same-origin.
5. Ensure `src/environments/environment.production.ts` points to the App Service API base URL ending in `/api`. The production frontend is built and packaged into `ExpenseAPI/wwwroot` by the deployment workflow.
6. Apply EF Core migrations to the Azure SQL database before serving traffic. The API also calls `Database.Migrate()` on startup, so its SQL identity must have permission to change schema. For production, prefer applying migrations as a controlled deployment step and grant the runtime identity only the database permissions it needs.

The existing local 40-category/40-subcategory/10,000-expense dataset is not copied by these deployment steps. Plan a separate data transfer into Azure SQL if you want to keep it; the startup seeder only creates a small sample dataset when the database is empty.

### GitHub Actions deployment

The API deployment workflow builds the Angular frontend, packages it with the API, and deploys both to the existing App Service when relevant files are pushed to `main`. It can also be started manually from the repository's **Actions** tab.

Before the first workflow run, configure these values under the GitHub repository's **Settings → Secrets and variables → Actions**:

- Secret `AZURE_WEBAPP_PUBLISH_PROFILE`: download the publish profile from the App Service in the Azure portal and save its full contents as a GitHub secret.
- Repository variable `AZURE_WEBAPP_NAME`: the App Service resource name (for this setup, `expense-manager-api`).

Do not add publish profiles, deployment tokens, or database/Redis connection strings to the repository. SQL, Redis, and `Cors__AllowedOrigins__0` must already be configured as App Service settings. The existing Static Web App resource is not used by this deployment setup.

### Database migrations

The EF Core migrations in `ExpenseAPI/Migrations` target SQL Server. When the EF model changes, create and apply a migration with:

```bash
cd ExpenseAPI
dotnet ef migrations add DescribeYourChange
dotnet ef database update
```

### Generated IDs

Categories, subcategories, and expenses use SQL Server identity IDs. On API startup and after deletions, the API reseeds each identity to the current maximum row ID so the next successful insert uses the next number. SQL Server can still leave gaps if an insert fails or a transaction rolls back; identity values are not a gapless sequence.

### Frontend Setup (Angular)

In a separate terminal, from the repository root:

```bash
npm install
npm start
```

The Angular app will start on `http://localhost:4200`.

### Quick Start (Both Servers)

For convenience, you can start the API and frontend in separate terminals using the commands above. Both must be running for the application to work.

## API Endpoints

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Sub-categories

- `GET /api/subcategories` - Get all sub-categories with category names
- `GET /api/subcategories/{id}` - Get sub-category by ID
- `GET /api/subcategories/ByCategory/{categoryId}` - Get sub-categories by category
- `POST /api/subcategories` - Create new sub-category
- `PUT /api/subcategories/{id}` - Update sub-category
- `DELETE /api/subcategories/{id}` - Delete sub-category

### Expenses

- `GET /api/expenses` - Get all expenses with category and sub-category names
- `GET /api/expenses/{id}` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

## Database Schema

### Categories Table

- `Id` (INT IDENTITY, Primary Key)
- `Name` (NVARCHAR(100), Required)
- `Description` (NVARCHAR(500), Required)

### SubCategories Table

- `Id` (INT IDENTITY, Primary Key)
- `Name` (NVARCHAR(100), Required)
- `Description` (NVARCHAR(500), Required)
- `CategoryId` (INT, Foreign Key to Categories)

### Expenses Table

- `Id` (INT IDENTITY, Primary Key)
- `Name` (NVARCHAR(200), Required)
- `Description` (NVARCHAR(1000), Required)
- `Amount` (DECIMAL(18,2), Required)
- `Date` (DATETIME2, Required)
- `CategoryId` (INT, Foreign Key to Categories)
- `SubCategoryId` (INT, Foreign Key to SubCategories)
