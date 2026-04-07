using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using HarborOfHope.API.Data;

namespace HarborOfHope.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IConfiguration configuration) : ControllerBase
{
    private const string DefaultFrontendUrl = "http://localhost:3000";
    private const string DefaultExternalReturnPath = "/admin/dashboard";

    // ── Public endpoints ──

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentSession()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new
            {
                isAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>(),
                supporterId = (int?)null
            });
        }

        var user = await userManager.GetUserAsync(User);
        var roles = User.Claims
            .Where(claim => claim.Type == ClaimTypes.Role)
            .Select(claim => claim.Value)
            .Distinct()
            .OrderBy(role => role)
            .ToArray();

        return Ok(new
        {
            isAuthenticated = true,
            userName = user?.UserName ?? User.Identity?.Name,
            email = user?.Email,
            roles,
            supporterId = user?.SupporterId
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: true,
            lockoutOnFailure: false);

        if (result.RequiresTwoFactor)
        {
            if (!string.IsNullOrWhiteSpace(request.TwoFactorCode))
            {
                var mfaResult = await signInManager.TwoFactorAuthenticatorSignInAsync(
                    request.TwoFactorCode, isPersistent: true, rememberClient: false);

                if (mfaResult.Succeeded)
                {
                    return Ok(new { message = "Login successful." });
                }

                return Unauthorized(new { message = "Invalid two-factor code." });
            }

            return Ok(new { requiresTwoFactor = true });
        }

        if (result.Succeeded)
        {
            return Ok(new { message = "Login successful." });
        }

        return Unauthorized(new { message = "Invalid email or password." });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Registration failed.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        await userManager.AddToRoleAsync(user, AuthRoles.Donor);
        return Ok(new { message = "Registration successful." });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok(new { message = "Logout successful." });
    }

    [HttpGet("providers")]
    public IActionResult GetExternalProviders()
    {
        var providers = new List<object>();

        if (IsGoogleConfigured())
        {
            providers.Add(new
            {
                name = GoogleDefaults.AuthenticationScheme,
                displayName = "Google"
            });
        }

        return Ok(providers);
    }

    [HttpGet("external-login")]
    public IActionResult ExternalLogin(
        [FromQuery] string provider,
        [FromQuery] string? returnPath = null)
    {
        if (!string.Equals(provider, GoogleDefaults.AuthenticationScheme, StringComparison.OrdinalIgnoreCase) ||
            !IsGoogleConfigured())
        {
            return BadRequest(new { message = "The requested external login provider is not available." });
        }

        var callbackUrl = Url.Action(nameof(ExternalLoginCallback), new
        {
            returnPath = NormalizeReturnPath(returnPath)
        });

        if (string.IsNullOrWhiteSpace(callbackUrl))
        {
            return Problem("Unable to create the external login callback URL.");
        }

        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            GoogleDefaults.AuthenticationScheme,
            callbackUrl);

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("external-callback")]
    public async Task<IActionResult> ExternalLoginCallback(
        [FromQuery] string? returnPath = null,
        [FromQuery] string? remoteError = null)
    {
        if (!string.IsNullOrWhiteSpace(remoteError))
        {
            return Redirect(BuildFrontendErrorUrl("External login failed."));
        }

        var info = await signInManager.GetExternalLoginInfoAsync();
        if (info is null)
        {
            return Redirect(BuildFrontendErrorUrl("External login information was unavailable."));
        }

        var signInResult = await signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
        {
            return Redirect(BuildFrontendSuccessUrl(returnPath));
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email) ??
            info.Principal.FindFirstValue("email");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Redirect(BuildFrontendErrorUrl("The external provider did not return an email address."));
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return Redirect(BuildFrontendErrorUrl("Unable to create a local account for the external login."));
            }

            await userManager.AddToRoleAsync(user, AuthRoles.Donor);
        }

        var addLoginResult = await userManager.AddLoginAsync(user, info);
        if (!addLoginResult.Succeeded)
        {
            return Redirect(BuildFrontendErrorUrl("Unable to associate the external login with the local account."));
        }

        await signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
        return Redirect(BuildFrontendSuccessUrl(returnPath));
    }

    // ── Authenticated endpoints ──

    [Authorize]
    [HttpGet("manage/2fa")]
    public async Task<IActionResult> GetMfaStatus()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var isMfaEnabled = await userManager.GetTwoFactorEnabledAsync(user);
        var hasAuthenticator = await userManager.GetAuthenticatorKeyAsync(user) != null;
        var recoveryCodesLeft = await userManager.CountRecoveryCodesAsync(user);

        return Ok(new
        {
            isMfaEnabled,
            hasAuthenticator,
            recoveryCodesLeft
        });
    }

    [Authorize]
    [HttpPost("manage/2fa/setup")]
    public async Task<IActionResult> SetupMfa()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        await userManager.ResetAuthenticatorKeyAsync(user);
        var unformattedKey = await userManager.GetAuthenticatorKeyAsync(user);

        if (string.IsNullOrEmpty(unformattedKey))
        {
            return Problem("Unable to generate authenticator key.");
        }

        var email = await userManager.GetEmailAsync(user);
        var authenticatorUri = GenerateQrCodeUri(email!, unformattedKey);

        return Ok(new
        {
            sharedKey = FormatKey(unformattedKey),
            authenticatorUri
        });
    }

    [Authorize]
    [HttpPost("manage/2fa/verify")]
    public async Task<IActionResult> VerifyMfa([FromBody] MfaVerifyRequest request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        var verificationCode = request.Code.Replace(" ", string.Empty).Replace("-", string.Empty);
        var is2FaTokenValid = await userManager.VerifyTwoFactorTokenAsync(
            user,
            userManager.Options.Tokens.AuthenticatorTokenProvider,
            verificationCode);

        if (!is2FaTokenValid)
        {
            return BadRequest(new { message = "Verification code is invalid." });
        }

        await userManager.SetTwoFactorEnabledAsync(user, true);
        var recoveryCodes = await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

        return Ok(new
        {
            message = "2FA has been enabled.",
            recoveryCodes
        });
    }

    [Authorize]
    [HttpPost("manage/2fa/disable")]
    public async Task<IActionResult> DisableMfa()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();

        await userManager.SetTwoFactorEnabledAsync(user, false);
        await userManager.ResetAuthenticatorKeyAsync(user);

        return Ok(new { message = "2FA has been disabled." });
    }

    // ── Admin user management ──

    [Authorize(Policy = AuthPolicies.AdminOnly)]
    [HttpGet("users")]
    public async Task<IActionResult> ListUsers()
    {
        var users = userManager.Users.OrderBy(u => u.Email).ToList();
        var result = new List<object>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            result.Add(new
            {
                id = user.Id,
                email = user.Email,
                roles = roles.ToArray(),
                emailConfirmed = user.EmailConfirmed,
                twoFactorEnabled = user.TwoFactorEnabled,
                supporterId = user.SupporterId
            });
        }

        return Ok(result);
    }

    [Authorize(Policy = AuthPolicies.AdminOnly)]
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var validRoles = new[] { AuthRoles.Admin, AuthRoles.Donor };
        var role = validRoles.Contains(request.Role) ? request.Role : AuthRoles.Donor;

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Failed to create user.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        // Every user gets Donor role; admins get both Admin + Donor
        await userManager.AddToRoleAsync(user, AuthRoles.Donor);
        if (role == AuthRoles.Admin)
        {
            await userManager.AddToRoleAsync(user, AuthRoles.Admin);
        }

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            roles = roles.ToArray(),
            emailConfirmed = user.EmailConfirmed,
            twoFactorEnabled = user.TwoFactorEnabled,
            supporterId = user.SupporterId
        });
    }

    [Authorize(Policy = AuthPolicies.AdminOnly)]
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleRequest request)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (request.Role != AuthRoles.Admin && request.Role != AuthRoles.Donor)
        {
            return BadRequest(new { message = "Invalid role." });
        }

        // Everyone keeps Donor. Toggle Admin on/off.
        var currentRoles = await userManager.GetRolesAsync(user);
        if (request.Role == AuthRoles.Admin && !currentRoles.Contains(AuthRoles.Admin))
        {
            await userManager.AddToRoleAsync(user, AuthRoles.Admin);
        }
        else if (request.Role == AuthRoles.Donor && currentRoles.Contains(AuthRoles.Admin))
        {
            await userManager.RemoveFromRoleAsync(user, AuthRoles.Admin);
        }

        // Ensure Donor role is always present
        if (!currentRoles.Contains(AuthRoles.Donor))
        {
            await userManager.AddToRoleAsync(user, AuthRoles.Donor);
        }

        var updatedRoles = await userManager.GetRolesAsync(user);
        return Ok(new { message = $"Roles updated to: {string.Join(", ", updatedRoles)}." });
    }

    [Authorize(Policy = AuthPolicies.AdminOnly)]
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        // Prevent self-deletion
        var currentUser = await userManager.GetUserAsync(User);
        if (currentUser?.Id == user.Id)
        {
            return BadRequest(new { message = "You cannot delete your own account." });
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Failed to delete user.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        return NoContent();
    }

    // ── Helpers ──

    private bool IsGoogleConfigured()
    {
        return !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) &&
               !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]);
    }

    private string NormalizeReturnPath(string? returnPath)
    {
        if (string.IsNullOrWhiteSpace(returnPath) || !returnPath.StartsWith('/'))
        {
            return DefaultExternalReturnPath;
        }
        return returnPath;
    }

    private string BuildFrontendSuccessUrl(string? returnPath)
    {
        var frontendUrl = configuration["FrontendUrl"] ?? DefaultFrontendUrl;
        return $"{frontendUrl.TrimEnd('/')}{NormalizeReturnPath(returnPath)}";
    }

    private string BuildFrontendErrorUrl(string errorMessage)
    {
        var frontendUrl = configuration["FrontendUrl"] ?? DefaultFrontendUrl;
        var loginUrl = $"{frontendUrl.TrimEnd('/')}/login";
        return QueryHelpers.AddQueryString(loginUrl, "externalError", errorMessage);
    }

    private static string FormatKey(string unformattedKey)
    {
        var result = new StringBuilder();
        var currentPosition = 0;
        while (currentPosition + 4 < unformattedKey.Length)
        {
            result.Append(unformattedKey.AsSpan(currentPosition, 4)).Append(' ');
            currentPosition += 4;
        }
        if (currentPosition < unformattedKey.Length)
        {
            result.Append(unformattedKey.AsSpan(currentPosition));
        }
        return result.ToString().ToLowerInvariant();
    }

    private static string GenerateQrCodeUri(string email, string unformattedKey)
    {
        return string.Format(
            "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6",
            UrlEncoder.Default.Encode("Harbor of Hope"),
            UrlEncoder.Default.Encode(email),
            unformattedKey);
    }
}

// ── Request DTOs ──

public record LoginRequest(string Email, string Password, string? TwoFactorCode = null);
public record RegisterRequest(string Email, string Password);
public record MfaVerifyRequest(string Code);
public record CreateUserRequest(string Email, string Password, string Role);
public record ChangeRoleRequest(string Role);
