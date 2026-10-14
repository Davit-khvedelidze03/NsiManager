/* =====================================================================
   SP-122 — 8-ნიშნა ნუმერაციის სისტემა სატვირთო ვაგონებისთვის
   ცხრილი. თუ უკვე არსებობს, არაფერს აკეთებს.
   ===================================================================== */
USE NSI;
GO

IF OBJECT_ID(N'dbo.[SP-122]', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.[SP-122] (
        prkey    INT IDENTITY(1,1) NOT NULL,
        ng       INT            NOT NULL,   -- ვაგონის ნომრის ქვედა ზღვარი
        vg       INT            NOT NULL,   -- ვაგონის ნომრის ზედა ზღვარი
        kol      NVARCHAR(10)   NULL,       -- ღერძების რაოდენობა
        ves      DECIMAL(10,2)  NULL,       -- ტარას წონა
        udl      NVARCHAR(10)   NULL,       -- პირობითი სიგრძე
        dm       NVARCHAR(10)   NULL,       -- ფიზიკური სიგრძე (მმ)
        prg      NVARCHAR(10)   NULL,       -- ტვირთამწეობის ზღვარი
        utv      NVARCHAR(10)   NULL,       -- ვაგონის პირობითი ტიპის კოდი
        rod      NVARCHAR(10)   NULL,       -- ვაგონის სახეობა
        spec     DECIMAL(10,0)  NULL,       -- სპეციალიზაცია
        negab    DECIMAL(10,0)  NULL,       -- არაგაბარიტულობა
        n_slujb  DECIMAL(10,0)  NULL,       -- მომსახურების ვადა
        naz_gr   NVARCHAR(500)  NULL,       -- დამატებითი მახასიათებელი (ქართულად)
        naz_rus  NVARCHAR(500)  NULL,       -- დამატებითი მახასიათებელი (რუსულად)

        CONSTRAINT PK_SP122       PRIMARY KEY (prkey),
        CONSTRAINT UQ_SP122_Range UNIQUE (ng, vg),
        CONSTRAINT CK_SP122_Range CHECK (ng <= vg)
    );
END
GO
