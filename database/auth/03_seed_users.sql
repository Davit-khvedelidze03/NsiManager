/* =====================================================================
   სატესტო მომხმარებლები — მხოლოდ ლოკალური დეველოპმენტისთვის!
     admin / Admin123!   (Admin)
     user  / User123!    (User)
   რეალურ სერვერზე ეს სკრიპტი არ გაუშვათ.
   ===================================================================== */
USE NSI;
GO

IF NOT EXISTS (SELECT 1 FROM auth.Users WHERE UserName = N'admin')
    INSERT INTO auth.Users (UserName, FullName, PasswordHash, Role)
    VALUES (N'admin', N'ადმინისტრატორი',
            N'AQAAAAIAAYagAAAAED9GI0s6pt16B+iZAtdJAfubP8p1kfHaxOk2LK/G6jxIw7hTuSoaoposqpmCWgVoYg==',
            N'Admin');

IF NOT EXISTS (SELECT 1 FROM auth.Users WHERE UserName = N'user')
    INSERT INTO auth.Users (UserName, FullName, PasswordHash, Role)
    VALUES (N'user', N'მომხმარებელი',
            N'AQAAAAIAAYagAAAAELcWvQdXEl32dCXiGmB9Ga/pZiFWLEpQRWAnYNFkhyRyy1ynh8RsbtIJxS4AwWySJA==',
            N'User');
GO
