using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container FIRST
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


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

// Console.WriteLine("Connection string: " + 
//     builder.Configuration.GetConnectionString("ApplicationDbContext"));
    
builder.WebHost.UseUrls("http://localhost:5125");

// register the DB
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ApplicationDbContext")));
// Add this to verify config is loading


//Proper HTTPS Setup
/*builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Listen(IPAddress.Any, 5125); // HTTP
    serverOptions.Listen(IPAddress.Any, 7125, listenOptions => // HTTPS
    {
        listenOptions.UseHttps("certificate.pfx", "password");
    });
});

// Set the HTTPS port for redirection
builder.WebHost.UseSetting("https_port", "7125");*/


var app = builder.Build();

// 3. Use CORS middleware AFTER building but BEFORE other middleware
app.UseCors("ReactPolicy");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

/*
    Moving to Production
    Changes Needed:
    * Update CORS Policy
    1. Replace localhost with your production domain(s)
    2. Consider being more restrictive with methods/headers if possible

    * API Endpoint Configuration
    1 Change all API calls from localhost:5125 to your production API URL

    * Environment variables Configuration
    1. Use environment variables to store sensitive information like connection strings, API keys, etc.
*/ 

