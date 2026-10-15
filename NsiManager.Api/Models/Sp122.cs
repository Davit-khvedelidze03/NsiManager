namespace NsiManager.Api.Models;

public class Sp122
{
    public int Prkey { get; set; }
    public int Ng { get; set; }          // ვაგონის ნომრის ქვედა ზღვარი
    public int Vg { get; set; }          // ვაგონის ნომრის ზედა ზღვარი
    public string? Kol { get; set; }     // ღერძების რაოდენობა
    public decimal? Ves { get; set; }    // ტარას წონა
    public string? Udl { get; set; }     // პირობითი სიგრძე
    public string? Dm { get; set; }      // ფიზიკური სიგრძე (მმ)
    public string? Prg { get; set; }     // ტვირთამწეობის ზღვარი
    public string? Utv { get; set; }     // ვაგონის პირობითი ტიპის კოდი
    public string? Rod { get; set; }     // ვაგონის სახეობა
    public decimal? Spec { get; set; }   // სპეციალიზაცია
    public decimal? Negab { get; set; }  // არაგაბარიტულობა
    public decimal? NSlujb { get; set; } // მომსახურების ვადა        (n_slujb)
    public string? NazGr { get; set; }   // დამატებითი მახასიათებელი (naz_gr)
    public string? NazRus { get; set; }  // დამატებითი მახასიათებელი (naz_rus)
}

//ჩანაწერების საერთო რაოდდენობა
public class Sp122ListRow : Sp122
{
    public int TotalCount { get; set; }
}
