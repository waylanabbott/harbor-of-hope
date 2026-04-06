using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HarborOfHope.API.Data;

public class AuthIdentityDbContextFactory : IDesignTimeDbContextFactory<AuthIdentityDbContext>
{
    public AuthIdentityDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AuthIdentityDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Database=harbor_of_hope;Username=postgres;Password=postgres");
        return new AuthIdentityDbContext(optionsBuilder.Options);
    }
}
