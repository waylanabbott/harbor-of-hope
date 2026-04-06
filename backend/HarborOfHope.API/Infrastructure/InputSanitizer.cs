using System.Text.Encodings.Web;

namespace HarborOfHope.API.Infrastructure;

public static class InputSanitizer
{
    public static string? Sanitize(string? input)
        => input is null ? null : HtmlEncoder.Default.Encode(input);
}
