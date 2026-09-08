using Microsoft.AspNetCore.Identity;

namespace dizajn_Projekti.Services
{
    // Shared by every place that creates an Identity user (patient/doctor registration,
    // admin-created doctor accounts) so password/account error wording stays consistent
    // and never leaks ASP.NET Identity's raw error descriptions to the client.
    public static class IdentityErrorHelper
    {
        public static string Format(IdentityError error)
        {
            return error.Code switch
            {
                "PasswordTooShort" => "Password must be at least 8 characters long.",
                "PasswordRequiresUpper" => "Password must contain at least one uppercase letter.",
                "PasswordRequiresLower" => "Password must contain at least one lowercase letter.",
                "PasswordRequiresDigit" => "Password must contain at least one number.",
                "PasswordRequiresNonAlphanumeric" => "Password must contain at least one special character.",
                "DuplicateUserName" => "This email is already registered.",
                "DuplicateEmail" => "This email is already registered.",
                "InvalidEmail" => "Please enter a valid email address.",
                _ => error.Description
            };
        }
    }
}
