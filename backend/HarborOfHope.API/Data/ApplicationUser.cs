using Microsoft.AspNetCore.Identity;

namespace HarborOfHope.API.Data;

public class ApplicationUser : IdentityUser
{
    public int? SupporterId { get; set; }
}
