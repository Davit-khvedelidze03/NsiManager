using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Text;

namespace NsiManager.Api.Dtos;

public class Sp122Request : IValidatableObject
{
    [Required(ErrorMessage = "ვაგონის ნომრის ქვედა ზღვარი სავალდებულოა")]
    [Range(10000000, 99999999, ErrorMessage = "ვაგონის ნომერი უნდა იყოს 8-ნიშნა")]
    public int? Ng { get; set; }

    [Required(ErrorMessage = "ვაგონის ნომრის ზედა ზღვარი სავალდებულოა")]
    [Range(10000000, 99999999, ErrorMessage = "ვაგონის ნომერი უნდა იყოს 8-ნიშნა")]
    public int? Vg { get; set; }

    [StringLength(10, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? Kol { get; set; }
    public decimal? Ves { get; set; }
    [StringLength(10, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? Udl { get; set; }
    [StringLength(10, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? Dm { get; set; }
    [StringLength(10, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? Prg { get; set; }
    [StringLength(10, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? Utv { get; set; }
    [StringLength(10, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? Rod { get; set; }
    public decimal? Spec { get; set; }
    public decimal? Negab { get; set; }
    public decimal? NSlujb { get; set; }
    private string? nazGr;
    public string? NazGr { get => nazGr; set => nazGr = TrimName(value); }
    private string? nazRus;
    public string? NazRus { get => nazRus; set => nazRus = TrimName(value); }
    private static string? TrimName(string? value)
    {
        var trimmed = value?.Trim();
        return trimmed is null ? null : string.Concat(trimmed.EnumerateRunes().Take(70).Select(rune => rune.ToString())).Trim();
    }

    private static bool TryNumber(string? value, out decimal number)
    {
        number = 0;
        return value is not null && Regex.IsMatch(value, @"^-?\d+([.,]\d+)?$")
            && decimal.TryParse(value.Replace(',', '.'), NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint,
                CultureInfo.InvariantCulture, out number);
    }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Ng.HasValue && Ng.Value % 10 != 0)
            yield return new ValidationResult("ქვედა ზღვარი უნდა მთავრდებოდეს 0-ით", [nameof(Ng)]);
        if (Vg.HasValue && Vg.Value % 10 != 9)
            yield return new ValidationResult("ზედა ზღვარი უნდა მთავრდებოდეს 9-ით", [nameof(Vg)]);
        if (Ng.HasValue && Vg.HasValue && Ng >= Vg)
            yield return new ValidationResult("ზედა ზღვარი უნდა აღემატებოდეს ქვედას", [nameof(Vg)]);

        foreach (var (name, value) in new[] { (nameof(Kol), Kol), (nameof(Udl), Udl), (nameof(Dm), Dm), (nameof(Rod), Rod), (nameof(Utv), Utv) })
            if (!TryNumber(value, out var number) || number == 0)
                yield return new ValidationResult("შეიყვანეთ ნულისგან განსხვავებული რიცხვი", [name]);
        if (!Ves.HasValue || Ves.Value == 0)
            yield return new ValidationResult("შეიყვანეთ ნულისგან განსხვავებული წონა", [nameof(Ves)]);

        if (Ng.HasValue && TryNumber(Utv, out var code) && code != 0)
        {
            var length = Ng.Value is >= 39000000 and <= 39999999 or >= 50000000 and <= 59999999 ? 4 : 3;
            var normalized = decimal.Round(code, 0, MidpointRounding.AwayFromZero).ToString("0", CultureInfo.InvariantCulture);
            if (normalized.Length != length)
                yield return new ValidationResult($"ტიპის კოდი ამ ნომრისთვის უნდა იყოს {length}-ნიშნა", [nameof(Utv)]);
        }
    }
}
