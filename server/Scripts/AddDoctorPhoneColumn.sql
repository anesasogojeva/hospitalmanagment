-- This project does not use EF Core migrations (see the note in
-- AddAppointmentStatusAndNursePosition.sql), so schema changes are applied by hand.
-- Adds DoktoriModel.NumriTel (server/Models/DoktoriModel.cs), needed for the admin
-- "Add Doctor" form's phone field and the Doctor Dashboard's own-profile view.
-- Idempotent - safe to run more than once. Existing doctors get NULL (no phone on file yet).

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Doktori') AND name = 'NumriTel'
)
BEGIN
    ALTER TABLE dbo.Doktori
        ADD NumriTel NVARCHAR(MAX) NULL;
END
GO
