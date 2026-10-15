/* =====================================================================
   SP-122 — stored procedure-ები
   გაშვება შეიძლება რამდენჯერმე (CREATE OR ALTER).

   SP-122-ის წესი (დადასტურებულია რეალურ მონაცემებზე, 3267 ჩანაწერი):
   ჩანაწერი ვაგონებს ნომრის ციფრების მიხედვით აღწერს, არა უბრალო რიცხვითი შუალედით.
   ნომერი 8-ნიშნაა: [1-3][4][5][6][7][8]. ვაგონი ეკუთვნის ჩანაწერს, თუ
     პირველი 3 ციფრი  ∈ [ng-ის, vg-ის პირველი 3 ციფრი]
     მე-4 ციფრი       ∈ [ng-ის მე-4, vg-ის მე-4]   … და ასე მე-7-მდე
   მე-8 ციფრი საკონტროლოა და არ მოწმდება.
   მაგ.: 20000000–20999989 (მე-7 ციფრი 0–8) და 20000090–20999999 (მე-7 ციფრი 9)
   რიცხვით ერთმანეთს კვეთს, მაგრამ ერთ ვაგონსაც არ იზიარებს.

   შეცდომების ერთიანი წესი (API მათ HTTP კოდად გადათარგმნის):
     50001 → 400  არასწორი მონაცემი
     50002 → 409  კონფლიქტი (დუბლიკატი ან დიაპაზონების გადაფარვა)
     50004 → 404  ჩანაწერი ვერ მოიძებნა
   ===================================================================== */
USE NSI;
GO

/* ---------------------------------------------------------------------
   სია: ძებნა ნებისმიერი პარამეტრით + გვერდებად დაყოფა.
   8-ნიშნა ნომრით ძებნისას პოულობს იმ ჩანაწერს, რომელსაც ეს ვაგონი ეკუთვნის.
   @PageSize = 0 → ყველა ჩანაწერი (Excel-ში ექსპორტისთვის).
   TotalCount — ფილტრის შემდეგ ჩანაწერების საერთო რაოდენობა.
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.SP122_GetList
    @Search   NVARCHAR(100) = NULL,
    @Page     INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    SET @Search = NULLIF(LTRIM(RTRIM(@Search)), N'');
    DECLARE @Number INT = TRY_CAST(@Search AS INT);
    DECLARE @Like NVARCHAR(102) = N'%' + @Search + N'%';

    IF @Page < 1 SET @Page = 1;
    IF @PageSize <= 0
    BEGIN
        SET @Page = 1;
        SET @PageSize = 2147483647;
    END

    SELECT  s.prkey, s.ng, s.vg, s.kol, s.ves, s.udl, s.dm, s.prg, s.utv,
            s.rod, s.spec, s.negab, s.n_slujb, s.naz_gr, s.naz_rus,
            COUNT(*) OVER () AS TotalCount
    FROM    dbo.[SP-122] AS s
    WHERE   @Search IS NULL
         OR (    @Number BETWEEN 10000000 AND 99999999
             AND @Number / 100000     BETWEEN s.ng / 100000     AND s.vg / 100000
             AND @Number / 10000 % 10 BETWEEN s.ng / 10000 % 10 AND s.vg / 10000 % 10
             AND @Number / 1000 % 10  BETWEEN s.ng / 1000 % 10  AND s.vg / 1000 % 10
             AND @Number / 100 % 10   BETWEEN s.ng / 100 % 10   AND s.vg / 100 % 10
             AND @Number / 10 % 10    BETWEEN s.ng / 10 % 10    AND s.vg / 10 % 10)
         OR CAST(s.ng AS NVARCHAR(20)) LIKE @Like
         OR CAST(s.vg AS NVARCHAR(20)) LIKE @Like
         OR s.kol LIKE @Like OR s.udl LIKE @Like OR s.dm  LIKE @Like
         OR s.prg LIKE @Like OR s.utv LIKE @Like OR s.rod LIKE @Like
         OR CAST(s.ves     AS NVARCHAR(30)) LIKE @Like
         OR CAST(s.spec    AS NVARCHAR(30)) LIKE @Like
         OR CAST(s.negab   AS NVARCHAR(30)) LIKE @Like
         OR CAST(s.n_slujb AS NVARCHAR(30)) LIKE @Like
         OR s.naz_gr LIKE @Like OR s.naz_rus LIKE @Like
    ORDER BY s.ng, s.vg
    OFFSET (@Page - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

/* ---------------------------------------------------------------------
   ერთი ჩანაწერი
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.SP122_GetById
    @prkey INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT  prkey, ng, vg, kol, ves, udl, dm, prg, utv,
            rod, spec, negab, n_slujb, naz_gr, naz_rus
    FROM    dbo.[SP-122]
    WHERE   prkey = @prkey;
END
GO

/* ---------------------------------------------------------------------
   დიაპაზონის შემოწმება (Insert-ი და Update-ი ორივე იყენებს)
   @prkey — Update-ისას თავად ჩანაწერი შემოწმებიდან გამოირიცხება.
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.SP122_ValidateRange
    @prkey INT = NULL,
    @ng    INT,
    @vg    INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @ng IS NULL OR @vg IS NULL
    BEGIN
        THROW 50001, N'ვაგონის ნომრის ქვედა და ზედა ზღვარი სავალდებულოა', 1;
    END

    IF @ng NOT BETWEEN 10000000 AND 99999999 OR @vg NOT BETWEEN 10000000 AND 99999999
    BEGIN
        THROW 50001, N'ვაგონის ნომერი უნდა იყოს 8-ნიშნა', 1;
    END

    IF @ng > @vg
    BEGIN
        THROW 50001, N'ქვედა ზღვარი არ შეიძლება აღემატებოდეს ზედა ზღვარს', 1;
    END

    -- თითოეული ციფრი ქვედა ზღვარში არ უნდა აღემატებოდეს ზედა ზღვრის შესაბამის ციფრს
    IF @ng / 10000 % 10 > @vg / 10000 % 10
       OR @ng / 1000 % 10 > @vg / 1000 % 10
       OR @ng / 100 % 10  > @vg / 100 % 10
       OR @ng / 10 % 10   > @vg / 10 % 10
    BEGIN
        THROW 50001, N'ქვედა ზღვრის თითოეული ციფრი (მე-4–მე-7) არ უნდა აღემატებოდეს ზედა ზღვრის შესაბამის ციფრს', 1;
    END

    -- გადაფარვა: არსებობს თუ არა ჩანაწერი, რომელიც ერთ ვაგონს მაინც იზიარებს
    DECLARE @msg NVARCHAR(400);

    SELECT TOP (1)
           @msg = CONCAT(N'დიაპაზონი ფარავს იმავე ვაგონებს, რასაც არსებული ჩანაწერი: ', ng, N' – ', vg)
    FROM   dbo.[SP-122] WITH (UPDLOCK, HOLDLOCK)
    WHERE  (@prkey IS NULL OR prkey <> @prkey)
      AND  ng <= @vg AND vg >= @ng                     -- სწრაფი წინასწარი ფილტრი
      AND  ng / 100000      <= @vg / 100000      AND @ng / 100000      <= vg / 100000
      AND  ng / 10000 % 10  <= @vg / 10000 % 10  AND @ng / 10000 % 10  <= vg / 10000 % 10
      AND  ng / 1000 % 10   <= @vg / 1000 % 10   AND @ng / 1000 % 10   <= vg / 1000 % 10
      AND  ng / 100 % 10    <= @vg / 100 % 10    AND @ng / 100 % 10    <= vg / 100 % 10
      AND  ng / 10 % 10     <= @vg / 10 % 10     AND @ng / 10 % 10     <= vg / 10 % 10
    ORDER BY ng;

    IF @msg IS NOT NULL
    BEGIN
        THROW 50002, @msg, 1;
    END
END
GO

/* ---------------------------------------------------------------------
   დამატება — აბრუნებს ახალ ჩანაწერს
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.SP122_Insert
    @ng      INT,
    @vg      INT,
    @kol     NVARCHAR(10)  = NULL,
    @ves     DECIMAL(10,2) = NULL,
    @udl     NVARCHAR(10)  = NULL,
    @dm      NVARCHAR(10)  = NULL,
    @prg     NVARCHAR(10)  = NULL,
    @utv     NVARCHAR(10)  = NULL,
    @rod     NVARCHAR(10)  = NULL,
    @spec    DECIMAL(10,0) = NULL,
    @negab   DECIMAL(10,0) = NULL,
    @n_slujb DECIMAL(10,0) = NULL,
    @naz_gr  NVARCHAR(500) = NULL,
    @naz_rus NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @prkey INT;

    BEGIN TRANSACTION;

        EXEC dbo.SP122_ValidateRange @prkey = NULL, @ng = @ng, @vg = @vg;

        INSERT INTO dbo.[SP-122]
               (ng, vg, kol, ves, udl, dm, prg, utv, rod, spec, negab, n_slujb, naz_gr, naz_rus)
        VALUES (@ng, @vg,
                NULLIF(LTRIM(RTRIM(@kol)), N''),
                @ves,
                NULLIF(LTRIM(RTRIM(@udl)), N''),
                NULLIF(LTRIM(RTRIM(@dm)),  N''),
                NULLIF(LTRIM(RTRIM(@prg)), N''),
                NULLIF(LTRIM(RTRIM(@utv)), N''),
                NULLIF(LTRIM(RTRIM(@rod)), N''),
                @spec, @negab, @n_slujb,
                NULLIF(LTRIM(RTRIM(@naz_gr)),  N''),
                NULLIF(LTRIM(RTRIM(@naz_rus)), N''));

        SET @prkey = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    EXEC dbo.SP122_GetById @prkey = @prkey;
END
GO

/* ---------------------------------------------------------------------
   რედაქტირება — აბრუნებს განახლებულ ჩანაწერს
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.SP122_Update
    @prkey   INT,
    @ng      INT,
    @vg      INT,
    @kol     NVARCHAR(10)  = NULL,
    @ves     DECIMAL(10,2) = NULL,
    @udl     NVARCHAR(10)  = NULL,
    @dm      NVARCHAR(10)  = NULL,
    @prg     NVARCHAR(10)  = NULL,
    @utv     NVARCHAR(10)  = NULL,
    @rod     NVARCHAR(10)  = NULL,
    @spec    DECIMAL(10,0) = NULL,
    @negab   DECIMAL(10,0) = NULL,
    @n_slujb DECIMAL(10,0) = NULL,
    @naz_gr  NVARCHAR(500) = NULL,
    @naz_rus NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.[SP-122] WITH (UPDLOCK) WHERE prkey = @prkey)
        BEGIN
            THROW 50004, N'ჩანაწერი ვერ მოიძებნა', 1;
        END

        EXEC dbo.SP122_ValidateRange @prkey = @prkey, @ng = @ng, @vg = @vg;

        UPDATE dbo.[SP-122]
        SET    ng      = @ng,
               vg      = @vg,
               kol     = NULLIF(LTRIM(RTRIM(@kol)), N''),
               ves     = @ves,
               udl     = NULLIF(LTRIM(RTRIM(@udl)), N''),
               dm      = NULLIF(LTRIM(RTRIM(@dm)),  N''),
               prg     = NULLIF(LTRIM(RTRIM(@prg)), N''),
               utv     = NULLIF(LTRIM(RTRIM(@utv)), N''),
               rod     = NULLIF(LTRIM(RTRIM(@rod)), N''),
               spec    = @spec,
               negab   = @negab,
               n_slujb = @n_slujb,
               naz_gr  = NULLIF(LTRIM(RTRIM(@naz_gr)),  N''),
               naz_rus = NULLIF(LTRIM(RTRIM(@naz_rus)), N'')
        WHERE  prkey = @prkey;

    COMMIT TRANSACTION;

    EXEC dbo.SP122_GetById @prkey = @prkey;
END
GO

/* ---------------------------------------------------------------------
   წაშლა
   --------------------------------------------------------------------- */
CREATE OR ALTER PROCEDURE dbo.SP122_Delete
    @prkey INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.[SP-122] WHERE prkey = @prkey;

    IF @@ROWCOUNT = 0
    BEGIN
        THROW 50004, N'ჩანაწერი ვერ მოიძებნა', 1;
    END
END
GO
