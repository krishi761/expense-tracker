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

- **.NET 9** - Latest .NET framework
- **Entity Framework Core 9** - ORM for database operations
- **SQL Server** - Enterprise database with Docker support
- **HTTP Test File** - Pre-configured API testing

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **.NET 9 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Angular CLI** - Install globally with `npm install -g @angular/cli`
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **SQL Server** (via Docker) - Instructions below

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/krishi761/expense-tracker.git
cd expense-tracker
```

### 2. Database Setup (SQL Server with Docker)

#### Option A: Using Docker (Recommended)

1. **Start SQL Server in Docker:**

   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Password.1" \
      -p 1433:1433 --name sqlserver \
      -d mcr.microsoft.com/mssql/server:2022-latest
   ```

2. **Verify SQL Server is running:**

   ```bash
   docker ps
   ```

   You should see the SQL Server container running on port 1433.

#### Option B: Using Local SQL Server Installation

If you have SQL Server installed locally, update the connection string in `ExpenseAPI/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ExpenseDb;Integrated Security=true;TrustServerCertificate=True;"
  }
}
```

### 3. Backend Setup (.NET Web API)

1. **Navigate to the API directory:**

   ```bash
   cd ExpenseAPI
   ```

2. **Restore NuGet packages:**

   ```bash
   dotnet restore
   ```

3. **Update the connection string (if needed):**

   Edit `appsettings.json` to match your SQL Server setup:

   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=ExpenseDb;User Id=SA;Password=Password.1;TrustServerCertificate=True;"
     }
   }
   ```

4. **Run database migrations:**

   ```bash
   dotnet ef database update
   ```

   This will create the database and tables automatically.

5. **Start the API server:**

   ```bash
   dotnet run
   ```

   The API will be available at `http://localhost:8000`

### 4. Frontend Setup (Angular)

1. **Navigate back to the project root:**

   ```bash
   cd ..
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

   The Angular app will be available at `http://localhost:4200`

### 5. Verify Setup

1. **API Health Check:**

   - Test endpoints using the provided HTTP file: `ExpenseAPI.http`
   - Or test directly: `http://localhost:8000/api/categories`

2. **Frontend Check:**
   - Visit `http://localhost:4200` to see the Angular application
   - Navigate through the menu to test functionality

## 🧪 API Testing

### Using the HTTP Test File

The project includes an `ExpenseAPI.http` file for testing all API endpoints. This file contains pre-configured requests for all CRUD operations.

#### How to Use:

1. **VS Code with REST Client Extension:**

   ```bash
   # Install the REST Client extension
   # Open ExpenseAPI.http file
   # Click "Send Request" above any endpoint
   ```

2. **IntelliJ IDEA:**

   ```bash
   # Open ExpenseAPI.http file
   # Click the green arrow next to any request
   ```

3. **Other HTTP Clients:**
   - Copy the requests from the HTTP file
   - Paste into Postman, Insomnia, or any HTTP client

#### Available Test Scenarios:

- **Categories**: GET, POST, PUT, DELETE operations
- **SubCategories**: Full CRUD with category relationships
- **Expenses**: Complete expense management with relationships
- **Sample Data**: Pre-configured requests to create test data
- **Error Testing**: Invalid requests to test error handling

#### Example Usage:

```http
### Get all categories
GET http://localhost:8000/api/categories
Accept: application/json

### Create a new category
POST http://localhost:8000/api/categories
Content-Type: application/json

{
  "name": "Healthcare",
  "description": "Medical and health-related expenses"
}
```

## 🔧 Configuration

### Database Connection

The application uses the following default connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ExpenseDb;User Id=SA;Password=Password.1;TrustServerCertificate=True;"
  }
}
```

### Environment Variables

For production deployment, consider using environment variables:

```bash
export ConnectionStrings__DefaultConnection="Server=your-server;Database=ExpenseDb;User Id=your-user;Password=your-password;TrustServerCertificate=True;"
```

## 🐳 Docker Commands Reference

### SQL Server Container Management

```bash
# Start SQL Server
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Password.1" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest

# Stop SQL Server
docker stop sqlserver

# Start existing container
docker start sqlserver

# Remove container
docker rm sqlserver

# View logs
docker logs sqlserver
```

### Database Management

```bash
# Connect to SQL Server (if you have sqlcmd installed)
sqlcmd -S localhost -U SA -P "Password.1"

# Or use Azure Data Studio / SQL Server Management Studio
# Server: localhost,1433
# Username: SA
# Password: Password.1
```

## Usage Guide

### Navigation

- **Menu Items**: Click to view read-only lists (Categories, Sub-categories, Expenses)
- **Manage Submenu**: Click to access full management interface with add/edit/delete functionality
- **Expand/Collapse**: Click the arrow icons to expand/collapse submenus
- **Mobile Navigation**: Use the hamburger menu on mobile devices

### Managing Data

1. **View Data**: Navigate to main menu items to see read-only lists
2. **Add New Items**: Go to "Manage" submenu and click "Add" buttons
3. **Edit Items**: Click "Edit" button in the Actions column
4. **Delete Items**: Click "Delete" button and confirm in the modal dialog

##

- Built with Angular 20 and .NET 9
- Uses Entity Framework Core for data access
- SQLite for lightweight database storage
- Modern responsive design principles

---

**Happy Expense Tracking! 💰**
