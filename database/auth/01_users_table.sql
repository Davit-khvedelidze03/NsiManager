/* =====================================================================
   მომხმარებლები და როლები
   Role: 'Admin' — მონაცემების მართვა, 'User' — მხოლოდ ნახვა
   ===================================================================== */
USE NSI;
GO

IF SCHEMA_ID(N'auth') IS NULL
    EXEC (N'CREATE SCHEMA auth');
GO

IF OBJECT_ID(N'auth.Users', N'U') IS NULL
BEGIN
    CREATE TABLE auth.Users (
        Id           INT IDENTITY(1,1) NOT NULL,
        UserName     NVARCHAR(50)  NOT NULL,
        FullName     NVARCHAR(100) NULL,
        PasswordHash NVARCHAR(200) NOT NULL,   -- ASP.NET PasswordHasher (PBKDF2), არასოდეს ღია პაროლი
        Role         NVARCHAR(20)  NOT NULL,
        IsActive     BIT           NOT NULL CONSTRAINT DF_Users_IsActive  DEFAULT (1),
        CreatedAt    DATETIME2(0)  NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_Users          PRIMARY KEY (Id),
        CONSTRAINT UQ_Users_UserName UNIQUE (UserName),
        CONSTRAINT CK_Users_Role     CHECK (Role IN (N'Admin', N'User'))
    );
END
GO
