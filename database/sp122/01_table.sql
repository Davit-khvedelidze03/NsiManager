CREATE DATABASE NSI;
GO

USE NSI;
GO

CREATE TABLE dbo.[SP-122] (
                              prkey    INT IDENTITY(1,1) PRIMARY KEY,
    ng       INT            NOT NULL,   -- 1. ვაგონის ნომრის ქვედა ზღვარი
    vg       INT            NOT NULL,   -- 2. ვაგონის ნომრის ზედა ზღვარი
    kol      NVARCHAR(10)   NULL,       -- 3. ღერძთა რაოდენობა
    utv      NVARCHAR(10)   NULL,       -- 4. ვაგონის პირობითი ტიპის კოდი
    ves      DECIMAL(10,2)  NULL,       -- 5. ტარას წონა
    rod      NVARCHAR(10)   NULL,       -- 6. ვაგონის სახეობა
    udl      NVARCHAR(10)   NULL,       -- 7. პირობითი სიგრძე
    spec     DECIMAL(10,0)  NULL,       -- 8. სპეციალიზაცია
    dm       NVARCHAR(10)   NULL,       -- 9. ფიზიკური სიგრძე (მ)
    negab    DECIMAL(10,0)  NULL,       -- 10. არაგაბარიტულობა
    prg      NVARCHAR(10)   NULL,       -- 11. ტვირთამწეობა
    n_slujb  DECIMAL(10,0)  NULL,       -- 12. მუშაობის ვადა
    naz_gr   NVARCHAR(500)  NULL,       -- 13. დამატებითი დახასიათება (ქართ.)
    naz_rus  NVARCHAR(500)  NULL,       -- 14. დამატებითი დახასიათება (რუს.)

    CONSTRAINT UQ_SP122_Range UNIQUE (ng, vg),
    CONSTRAINT CK_SP122_Range CHECK (ng <= vg)
    );
GO