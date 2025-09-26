# Expense Tracker

with following menu items :

- **Manage Categories**
- **Manage Sub-categories**
- **Manage Expenses**

## Tech Stack

### Frontend

- Angular 20
- TypeScript
- RxJS
- CSS

### Backend

- .NET 9 Web API
- Entity Framework Core 9
- SQLite Database

## Prerequisites

- Node.js (v18 or higher)
- .NET 9 SDK
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### 2. Backend Setup (.NET API)

1. Navigate to the API directory:

   ```bash
   cd ExpenseAPI
   ```

2. Restore NuGet packages:

   ```bash
   dotnet restore
   ```

3. Run database migrations (this will create the SQLite database):

   ```bash
   dotnet ef database update
   ```

4. Run the API:
   ```bash
   dotnet run --urls="http://localhost:8000"
   ```

The API will start on `http://localhost:8000`.

### 3. Frontend Setup (Angular)

1. Navigate back to the project root directory:

   ```bash
   cd ..
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The Angular app will start on `http://localhost:4200`.

### 4. Quick Start (Both Servers)

For convenience, you can use the provided scripts to start both servers:

**Linux/macOS:**

```bash
./start-servers.sh
```

**Windows:**

```bash
start-servers.bat
```

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

- `Id` (INTEGER, Primary Key, Auto Increment)
- `Name` (TEXT, Required)
- `Description` (TEXT, Required)

### SubCategories Table

- `Id` (INTEGER, Primary Key, Auto Increment)
- `Name` (TEXT, Required)
- `Description` (TEXT, Required)
- `CategoryId` (INTEGER, Foreign Key to Categories)

### Expenses Table

- `Id` (INTEGER, Primary Key, Auto Increment)
- `Name` (TEXT, Required)
- `Description` (TEXT, Required)
- `Amount` (DECIMAL(18,2), Required)
- `Date` (TEXT, Required) - Displayed in dd/MM/yyyy format
- `CategoryId` (INTEGER, Foreign Key to Categories)
- `SubCategoryId` (INTEGER, Foreign Key to SubCategories)
