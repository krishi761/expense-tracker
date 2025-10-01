# Expense Tracker

- **RESTful API**: Clean, RESTful endpoints for all operations
- **Entity Framework Core**: Code-first database approach with migrations
- **SQLite Database**: Lightweight, file-based database for easy deployment
- **DTOs**: Data Transfer Objects for clean API contracts
- **CORS Support**: Cross-origin resource sharing for frontend integration

## Tech Stack

### Frontend

- **Angular 20** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **CSS3** - Styling and responsive design

### Backend

- **.NET 9** - Latest .NET framework
- **Entity Framework Core 9** - ORM for database operations
- **SQLite** - Embedded database
- **Swagger/OpenAPI** - API documentation

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **.NET 9 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Angular CLI** - Install globally with `npm install -g @angular/cli`

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd expense-tracker
```

### 2. Backend Setup (.NET Web API)

1. Navigate to the API directory:

   ```bash
   cd ExpenseAPI
   ```

2. Restore NuGet packages:

   ```bash
   dotnet restore
   ```

3. Run database migrations (creates the SQLite database):

   ```bash
   dotnet ef database update
   ```

4. Start the API server:

   ```bash
   dotnet run
   ```

   The API will be available at `http://localhost:8000`

### 3. Frontend Setup (Angular)

1. Navigate back to the project root:

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

   The Angular app will be available at `http://localhost:4200`

## The API includes Swagger documentation available at `http://localhost:8000/swagger` when the backend is running.

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
