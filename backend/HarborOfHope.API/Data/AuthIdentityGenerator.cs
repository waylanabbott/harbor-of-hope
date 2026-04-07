using Microsoft.AspNetCore.Identity;

namespace HarborOfHope.API.Data;

public class AuthIdentityGenerator
{
    public static async Task GenerateDefaultIdentityAsync(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // Create roles
        foreach (var roleName in new[] { AuthRoles.Admin, AuthRoles.Donor })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var createRoleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!createRoleResult.Succeeded)
                {
                    throw new Exception($"Failed to create role '{roleName}': {string.Join(", ", createRoleResult.Errors.Select(e => e.Description))}");
                }
            }
        }

        // Account 1: Admin (no MFA) — gets both Admin + Donor roles
        await CreateOrResetUser(userManager, new ApplicationUser
        {
            UserName = "admin@harbor.local",
            Email = "admin@harbor.local",
            EmailConfirmed = true
        }, "HarborOfHope2026!", new[] { AuthRoles.Admin, AuthRoles.Donor });

        // Account 2: Donor (no MFA, linked to supporter)
        await CreateOrResetUser(userManager, new ApplicationUser
        {
            UserName = "donor@harbor.local",
            Email = "donor@harbor.local",
            EmailConfirmed = true,
            SupporterId = 1
        }, "HarborOfHope2026!", new[] { AuthRoles.Donor });

        // Account 3: MFA admin (user enables MFA via manage page) — gets both Admin + Donor roles
        await CreateOrResetUser(userManager, new ApplicationUser
        {
            UserName = "mfa@harbor.local",
            Email = "mfa@harbor.local",
            EmailConfirmed = true
        }, "HarborOfHope2026!", new[] { AuthRoles.Admin, AuthRoles.Donor });
    }

    private static async Task CreateOrResetUser(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string password,
        string[] roles)
    {
        var existingUser = await userManager.FindByEmailAsync(user.Email!);
        if (existingUser != null)
        {
            // Reset password for existing test accounts so seeded credentials always work
            var token = await userManager.GeneratePasswordResetTokenAsync(existingUser);
            var resetResult = await userManager.ResetPasswordAsync(existingUser, token, password);
            if (!resetResult.Succeeded)
            {
                Console.WriteLine($"[Seed] Warning: Could not reset password for '{user.Email}': {string.Join(", ", resetResult.Errors.Select(e => e.Description))}");
            }

            // Ensure all roles are assigned
            foreach (var role in roles)
            {
                if (!await userManager.IsInRoleAsync(existingUser, role))
                {
                    await userManager.AddToRoleAsync(existingUser, role);
                }
            }

            Console.WriteLine($"[Seed] Reset password for existing user: {user.Email} with roles: {string.Join(", ", roles)}");
            return;
        }

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            throw new Exception($"Failed to create user '{user.Email}': {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
        }

        foreach (var role in roles)
        {
            var addRoleResult = await userManager.AddToRoleAsync(user, role);
            if (!addRoleResult.Succeeded)
            {
                throw new Exception($"Failed to assign role '{role}' to user '{user.Email}': {string.Join(", ", addRoleResult.Errors.Select(e => e.Description))}");
            }
        }

        Console.WriteLine($"[Seed] Created user: {user.Email} with roles: {string.Join(", ", roles)}");
    }
}
