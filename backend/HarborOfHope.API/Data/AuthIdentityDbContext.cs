using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HarborOfHope.API.Data;

public class AuthIdentityDbContext : IdentityDbContext<ApplicationUser>
{
    public AuthIdentityDbContext(DbContextOptions<AuthIdentityDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("identity");
    }
}
