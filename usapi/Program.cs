using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();

// 1. Add services to the container FIRST
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();


// 2. Add CORS policy BEFORE building the app
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", // DEV Frontend URL
                           "http://127.0.0.1:5500", // dist Frontend URL
                           "http://localhost:5000", // Backend URL 
                           "http://localhost:5125") // DEV Backend URL
                         //"https://yourproductiondomain.com", // Production Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
// Set the URL for the backend API 
builder.WebHost.UseUrls("http://localhost:5125");

// register the DB
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ApplicationDbContext")));

builder.Services.AddHostedService<PlaylistSyncService>();

var app = builder.Build();

// 3. Use CORS middleware AFTER building but BEFORE other middleware
app.UseCors("ReactPolicy");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();