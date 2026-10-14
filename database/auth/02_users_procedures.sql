/* =====================================================================
   მომხმარებლების stored procedure-ები
   პაროლის შემოწმება C#-ში ხდება (PasswordHasher), აქ მხოლოდ ჰეში ბრუნდება.
   ===================================================================== */
USE NSI;
GO

CREATE OR ALTER PROCEDURE auth.User_GetByUserName
    @UserName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, UserName, FullName, PasswordHash, Role, IsActive
    FROM   auth.Users
    WHERE  UserName = @UserName;
END
GO
