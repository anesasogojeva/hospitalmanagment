-- This project does not use EF Core migrations (see the note in
-- AddAppointmentStatusAndNursePosition.sql), so schema changes are applied by hand.
-- Drops PacientiModel.Ankesa (removed from server/Models/PacientiModel.cs) now that the
-- "Complaint" field has been retired from the Admin Add/Edit Patient flow.
--
-- WARNING: unlike the ADD COLUMN scripts elsewhere in this folder, this is destructive -
-- any Ankesa values already stored on existing patients are permanently deleted. Take a
-- backup first if you want to keep that data around. Idempotent otherwise (safe to run
-- more than once - a no-op if the column is already gone).

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Pacienti') AND name = 'Ankesa'
)
BEGIN
    ALTER TABLE dbo.Pacienti DROP COLUMN Ankesa;
END
GO
