using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Service Registration
builder.Services.AddControllers();

// Entity Framework with SQL Server
builder.Services.AddDbContext<ExpenseDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:5000",
                    "http://localhost:3000"
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    
    // Add a more permissive policy for development
    options.AddPolicy("DevelopmentCors",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Initialize the database with migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ExpenseDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Apply any pending migrations to the database
        logger.LogInformation("Applying database migrations...");
        context.Database.Migrate();
        logger.LogInformation("Database migrations applied successfully.");
        
        // Seed the database with initial data if it's empty
        logger.LogInformation("Seeding database with initial data...");
        DbSeeder.SeedDatabase(context);
        logger.LogInformation("Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization error: {ErrorMessage}", ex.Message);
        throw new InvalidOperationException($"Failed to initialize database: {ex.Message}", ex);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Use more permissive CORS in development
    app.UseCors("DevelopmentCors");
}
else
{
    app.UseHttpsRedirection();
    app.UseCors("AllowAngularApp");
}

app.UseAuthorization();

app.MapControllers();

app.Run();