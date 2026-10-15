# NsiManager — პროგრესი და გეგმა

> ეს ფაილი პროექტის მიმდინარე მდგომარეობას აღწერს. ახალ სესიაში მუშაობის გაგრძელებამდე ჯერ ის წაიკითხეთ.
> ბოლო განახლება: 2026-10-14

## პროექტი

NSI ცნობარების მართვის ვებ-აპლიკაცია. პირველი ცნობარია **SP-122** (8-ნიშნა ნუმერაციის სისტემა
სატვირთო ვაგონებისთვის), მეორე **PORT**. მომავალში ასობით ცნობარი დაემატება.

- GitHub: https://github.com/Davit-khvedelidze03/NsiManager (private)
- ლოკალურად: `~/RiderProjects/NsiManager`
- ვიზუალის ნიმუში: Lovable-ის პროტოტიპი (modern-catalogue-builder.lovable.app)

## მიღებული გადაწყვეტილებები

- **არქიტექტურა DictionariesManager-ის პრინციპით**: თითო ცნობარს თავისი ცხრილი, stored procedure-ები,
  Model, Repository, Controller და Angular-ის კომპონენტი აქვს. ზოგადი (მეტამონაცემებზე აგებული) მიდგომა უარყოფილია.
- **ბაზასთან წვდომა**: Dapper + stored procedures, `Connections` + `DapperActions`.
- DictionariesManager-თან შედარებით გაუმჯობესებები:
  - ბაზის ყველა სკრიპტი რეპოშია (`database/`)
  - თითო ცნობარს ცალკე repository აქვს
  - პაროლი User Secrets-შია და არა `appsettings.json`-ში
  - როლები API-შიც მოწმდება (`[Authorize(Roles = "Admin")]`)
  - ძებნა და გვერდებად დაყოფა ბაზაში ხდება
  - საერთო ვიზუალი `styles.css`-შია
- **როლები**: `Admin` ცვლის მონაცემებს, `User` მხოლოდ ნახულობს. გამოიყენება `auth.Users` ცხრილი და JWT.
- **შეცდომები**: SQL `THROW` 50001 → 400, 50002 → 409, 50004 → 404, ქართული შეტყობინებით.
  API ყოველთვის აბრუნებს `{ "message": "..." }`.
- **SP-122-ის წესები** (ჩემი ვარაუდით დამატებული, საჭიროებს დადასტურებას): ნომერი 8-ნიშნაა,
  დიაპაზონები ერთმანეთს არ კვეთს.
- **Excel ჯერ არ კეთდება.** ღილაკი ინტერფეისში იქნება, მაგრამ ფუნქციის გარეშე.
  `SP122_GetList @PageSize = 0` მომავლისთვის დარჩა.

## ტექნოლოგიები

- .NET 10 Web API: Dapper, Microsoft.Data.SqlClient, JwtBearer, OpenAPI
- Angular 22: standalone კომპონენტები, CSS
- SQL Server Docker-ში, ბაზა `NSI`; DataGrip, Rider

## ეტაპები

| # | ეტაპი | სტატუსი |
|---|---|---|
| 0 | მომზადება: პროექტები, git, GitHub | ✅ |
| 1 | ბაზა: `database/` (auth + sp122 სკრიპტები) | ✅ დაწერილია და DataGrip-ში გაშვებულია |
| 2 | Backend: SP-122 API | ⏳ კოდი დაწერილია, build-ი და ტესტები დარჩა |
| 3 | როლები: login, JWT, Admin/User | — |
| 4 | Frontend-ის ჩარჩო: header, ალერტები, loading, login | — |
| 5 | SP-122-ის გვერდი: ფორმა, ცხრილი, ძებნა, გვერდები | — |
| 6 | PORT იგივე ნიმუშით | — |
| 7 | დახვეწა: Excel, ისტორია, ტესტები, deploy | — |

## შემდეგი ნაბიჯები (ეტაპი 2-ის დასრულება)

1. `git add database && git commit -m "Add database scripts: auth and SP-122"`
2. `rm -r NsiManager.Api/Services` და
   `git rm -q NsiManager.Api/WeatherForecast.cs NsiManager.Api/Controllers/WeatherForecastController.cs`
3. `dotnet user-secrets list`: პორტი DataGrip-ის კავშირს უნდა ემთხვეოდეს (ფოტოზე 1432 ეწერა, შესამოწმებელია)
4. `dotnet build`
5. `dotnet run --launch-profile http` → http://localhost:5259
6. `NsiManager.Api.http`-ის 10 მოთხოვნის ტესტირება Rider-ში
7. `git add -A && git commit -m "Add SP-122 API" && git push`

## ახალი ცნობარის დამატების ჩამონათვალი

**ბაზა** (`database/<x>/`): `01_table.sql`, `02_procedures.sql` (GetList / GetById / Insert / Update / Delete),
`03_seed_data.sql`

**Backend**: `Models/<X>.cs`, `Dtos/<X>Request.cs`, `Repositories/Interfaces/I<X>Repository.cs`,
`Repositories/<X>Repository.cs`, `Controllers/<X>Controller.cs`, რეგისტრაცია `Program.cs`-ში

**Frontend** (`domain-modules/<x>/`): model, `<x>-api.service.ts`, `<x>-form.service.ts`,
`<x>-list` კომპონენტი, routes, ჩანართი header-ში

## სატესტო მომხმარებლები (მხოლოდ ლოკალურად)

| მომხმარებელი | პაროლი | როლი |
|---|---|---|
| admin | Admin123! | Admin |
| user | User123! | User |
