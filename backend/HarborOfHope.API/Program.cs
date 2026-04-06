using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using HarborOfHope.API.Data;
using HarborOfHope.API.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendClient";
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// PostgreSQL -- BOTH contexts on same connection string
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connString)
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));
builder.Services.AddDbContext<AuthIdentityDbContext>(options =>
    options.UseNpgsql(connString)
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// Identity
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AuthIdentityDbContext>();

// Google OAuth (conditional -- only if credentials configured)
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
            options.SignInScheme = IdentityConstants.ExternalScheme;
            options.CallbackPath = "/signin-google";
        });
}

// Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.AdminOnly, policy => policy.RequireRole(AuthRoles.Admin));
    options.AddPolicy(AuthPolicies.DonorOnly, policy => policy.RequireRole(AuthRoles.Donor));
});

// Password policy (IS 414 requirement -- 14 char passphrase, no complexity)
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 14;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredUniqueChars = 1;
});

// Cookie config (httpOnly, SameSite Lax, Secure always, 7-day sliding)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;
    // Return 401/403 instead of redirect for API calls
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(frontendUrl)
            .AllowCredentials()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Startup: migrations + seeding
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

using (var scope = app.Services.CreateScope())
{
    var identityDb = scope.ServiceProvider.GetRequiredService<AuthIdentityDbContext>();
    var appDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await identityDb.Database.MigrateAsync();
    await appDb.Database.MigrateAsync();
    await AuthIdentityGenerator.GenerateDefaultIdentityAsync(scope.ServiceProvider, app.Configuration);
    await SeedData.SeedAsync(appDb);
}

// Middleware pipeline (ORDER MATTERS)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseSecurityHeaders();
app.UseCors(FrontendCorsPolicy);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Serve React SPA static files from wwwroot/
app.UseStaticFiles();

app.MapControllers();

// SPA fallback: any non-API, non-file request returns index.html
app.MapFallbackToFile("index.html");

app.Run();
