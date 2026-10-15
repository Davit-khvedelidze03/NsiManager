using System.ComponentModel.DataAnnotations;

namespace NsiManager.Api.Dtos;

public class Sp122Request
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
    [StringLength(500, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? NazGr { get; set; }
    [StringLength(500, ErrorMessage = "{0}: მაქსიმუმ {1} სიმბოლო")] public string? NazRus { get; set; }
}
