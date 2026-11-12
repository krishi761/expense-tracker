using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using ExpenseAPI.Data;
using ExpenseAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services
	.AddControllers()
	.AddJsonOptions(options =>
		options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var sqlServerConnection = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(sqlServerConnection))
{
	throw new InvalidOperationException(
		"Configure the SQL Server connection with ConnectionStrings__DefaultConnection.");
}

builder.Services.AddDbContext<ExpenseDbContext>(options =>
	options.UseSqlServer(sqlServerConnection));

var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (string.IsNullOrWhiteSpace(redisConnection))
{
	throw new InvalidOperationException(
		"Configure the Redis connection with ConnectionStrings__Redis or .NET User Secrets.");
}

builder.Services.AddStackExchangeRedisCache(options =>
{
	options.Configuration = redisConnection;
	options.InstanceName = "ExpenseTracker:";
});
builder.Services.AddScoped<RedisCacheService>();
builder.Services.AddScoped<SqlServerIdentityService>();

var allowedOrigins = builder.Configuration
	.GetSection("Cors:AllowedOrigins")
	.Get<string[]>() ?? [];
if (!builder.Environment.IsDevelopment() && allowedOrigins.Length == 0)
{
	throw new InvalidOperationException(
		"Configure Cors:AllowedOrigins with the deployed frontend origin.");
}

// Add CORS
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAngularApp",
		policy =>
		{
			policy.WithOrigins(allowedOrigins)
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

		var identityService = scope.ServiceProvider.GetRequiredService<SqlServerIdentityService>();
		await identityService.ReseedAllAsync();

		// Seed the database with initial data if it's empty
		logger.LogInformation("Seeding database with initial data...");
		DbSeeder.SeedDatabase(context);
		logger.LogInformation("Database seeding completed successfully.");

		await identityService.ReseedAllAsync();
		logger.LogInformation("SQL Server identity counters synchronized with existing records.");
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
	app.UseSwagger();
	app.UseSwaggerUI();
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