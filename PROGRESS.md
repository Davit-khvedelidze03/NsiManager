# NsiManager — პროგრესი და გეგმა

> ეს ფაილი პროექტის მიმდინარე მდგომარეობას აღწერს. ახალ სესიაში მუშაობის გაგრძელებამდე ჯერ ის წაიკითხეთ.
> ბოლო განახლება: 2026-10-15 (რეალური მონაცემები)

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
- **როლები**: `Admin` ცვლის მონაცემებს, `User` მხოლოდ ნახულობს.
  **ჯერჯერობით ავტორიზაციის გარეშე**: header-ის მარჯვენა კუთხეში დემო გადამრთველია „ადმინი / მომხმარებელი“
  (`core/services/role.service.ts`, არჩევანი localStorage-ში ინახება). ის მხოლოდ ინტერფეისს ცვლის,
  API ღიაა. ნამდვილი login (`auth.Users` + JWT + `[Authorize]`) მოგვიანებით დაემატება. ბაზის ცხრილი უკვე მზადაა.
- **შეცდომები**: SQL `THROW` 50001 → 400, 50002 → 409, 50004 → 404, ქართული შეტყობინებით.
  API ყოველთვის აბრუნებს `{ "message": "..." }`.
- **SP-122-ის წესები** (დადასტურებულია რეალურ მონაცემებზე, 3267 ჩანაწერი): ნომერი 8-ნიშნაა;
  ჩანაწერი ვაგონებს **ციფრების მიხედვით** აღწერს (პირველი 3, მე-4…მე-7 ციფრი; მე-8 საკონტროლოა).
  ჩანაწერები რიცხვით შეიძლება კვეთდეს, მაგრამ ერთ ვაგონს არ უნდა იზიარებდეს.
  (თავდაპირველი ვარაუდი „რიცხვით არ კვეთს“ არასწორი აღმოჩნდა და გასწორდა.)
- **რეალური მონაცემები**: `database/sp122/04_import_real_data.sql` (Excel-იდან,
  `import/convert_sp122.py`-ით). `naz_gr` ძველი Georgian-PS კოდირებიდან გადაყვანილია Unicode-ში.
  Excel-ის სვეტები, რომლებიც ცხრილში ჯერ არ არის (`uch_rod`, `naz_ge`, `nomp`, `nomd`, `nomk`, `nomkrp`;
  `ng3…vg7` ng/vg-დან გამოითვლება), შენახულია `import/sp122_clean.csv`-ში.
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
| 1 | ბაზა: `database/` (auth + sp122 სკრიპტები) | ✅ |
| 2 | Backend: SP-122 API | ✅ build გადის |
| 3 | როლები: login, JWT | ⏸ გადადებულია. ახლა მოქმედებს დემო გადამრთველი |
| 4 | Frontend-ის ჩარჩო: header, ჩანართები, რეჟიმის გადამრთველი, ალერტები, loading, დადასტურება | ⏳ კოდი დაწერილია, გაშვება/შემოწმება დარჩა |
| 5 | SP-122-ის გვერდი: ფორმა, ცხრილი, ძებნა, გვერდები | ⏳ კოდი დაწერილია, გაშვება/შემოწმება დარჩა |
| 6 | PORT იგივე ნიმუშით | — |
| 7 | დახვეწა: login, Excel, ისტორია, ტესტები, deploy | — |

## შემდეგი ნაბიჯები (ეტაპი 4–5-ის შემოწმება)

1. Terminal 1: `cd NsiManager.Api && dotnet run --launch-profile http` (API → http://localhost:5259)
2. Terminal 2: `cd nsi-client && ng serve` → http://localhost:4200
   (`/api` მოთხოვნებს `proxy.conf.json` API-ზე გადაამისამართებს, ამიტომ CORS საჭირო არ არის)
3. შემოწმება: სია, ძებნა, დამატება, მონიშვნა → შენახვა, წაშლა, შეცდომის ალერტები, რეჟიმის გადამრთველი
4. `git add -A && git commit -m "Add frontend: layout, role switch, SP-122 page" && git push`

## Frontend-ის სტრუქტურა (`nsi-client/src/app`)

```
core/        api.ts, layout/ (layout, header, navigation.ts), services/role.service.ts,
             interceptors/ (loading, error), not-found/
shared/      alert/, loading/, confirm-dialog/, models/ (paged-result, api-error)
domain-modules/sp122/
             models/sp122.ts, models/sp122-fields.ts (ველები, ქართული სათაურები, ვალიდაცია)
             services/sp122-api.service.ts (HTTP), services/sp122-form.service.ts (state)
             sp122-list/ (გვერდი), sp122.routes.ts
styles.css   საერთო ვიზუალი: .page, .card, .form-grid, .btn, .data-table ...
```

## ახალი ცნობარის დამატების ჩამონათვალი

**ბაზა** (`database/<x>/`): `01_table.sql`, `02_procedures.sql` (GetList / GetById / Insert / Update / Delete),
`03_seed_data.sql`

**Backend**: `Models/<X>.cs`, `Dtos/<X>Request.cs`, `Repositories/Interfaces/I<X>Repository.cs`,
`Repositories/<X>Repository.cs`, `Controllers/<X>Controller.cs`, რეგისტრაცია `Program.cs`-ში

**Frontend** (`domain-modules/<x>/`): `models/<x>.ts`, `models/<x>-fields.ts`, `services/<x>-api.service.ts`,
`services/<x>-form.service.ts`, `<x>-list/` კომპონენტი, `<x>.routes.ts`, ხაზი `app.routes.ts`-ში
და ჩანართი `core/layout/navigation.ts`-ში

## სატესტო მომხმარებლები (მხოლოდ ლოკალურად)

| მომხმარებელი | პაროლი | როლი |
|---|---|---|
| admin | Admin123! | Admin |
| user | User123! | User |
