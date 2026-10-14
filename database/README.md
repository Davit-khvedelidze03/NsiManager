# ბაზის სკრიპტები

## გაშვების თანმიმდევრობა

1. `00_create_database.sql`
2. `auth/01_users_table.sql` → `auth/02_users_procedures.sql` → `auth/03_seed_users.sql` *(მხოლოდ ლოკალურად)*
3. `sp122/01_table.sql` → `sp122/02_procedures.sql` → `sp122/03_seed_data.sql` *(მხოლოდ ლოკალურად)*

ყველა სკრიპტი შეიძლება რამდენჯერმე გაეშვას: ცხრილები `IF ... IS NULL`-ით იქმნება,
procedure-ები `CREATE OR ALTER`-ით.

## ახალი ცნობარის დამატება

საქაღალდე `database/<ცნობარი>/`:

| ფაილი | შიგთავსი |
|---|---|
| `01_table.sql` | ცხრილი |
| `02_procedures.sql` | `<X>_GetList`, `<X>_GetById`, `<X>_Insert`, `<X>_Update`, `<X>_Delete` |
| `03_seed_data.sql` | სატესტო მონაცემები |

## procedure-ების წესები

- `GetList` იღებს `@Search`, `@Page`, `@PageSize` (`0` = ყველა) და აბრუნებს სვეტს `TotalCount`.
- `Insert` და `Update` აბრუნებენ შენახულ ჩანაწერს.
- შეცდომა — `THROW` ქართული შეტყობინებით:

| კოდი | HTTP | მნიშვნელობა |
|---|---|---|
| 50001 | 400 | არასწორი მონაცემი |
| 50002 | 409 | კონფლიქტი (დუბლიკატი, გადაფარვა) |
| 50004 | 404 | ჩანაწერი ვერ მოიძებნა |

## სატესტო მომხმარებლები

| მომხმარებელი | პაროლი | როლი |
|---|---|---|
| admin | Admin123! | Admin |
| user | User123! | User |
