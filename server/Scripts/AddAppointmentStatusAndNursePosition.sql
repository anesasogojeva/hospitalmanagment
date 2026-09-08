-- This project does not currently use EF Core migrations (no Migrations/ folder,
-- no Database.Migrate() call in Program.cs), so the schema is kept in sync by hand.
-- Run this once against the HospitalMS database after pulling the appointment-status
-- and mock-nurse changes, to bring the schema in line with the updated models:
--   - ReservationModel.Status   (server/Models/ReservationModel.cs)
--   - InfermjeriModel.Pozita    (server/Models/InfermjeriModel.cs)
--
-- Both ALTERs are idempotent (safe to run more than once) and both use a DEFAULT
-- constraint, so any existing rows are backfilled automatically:
--   - existing appointments -> Status = 0 (Scheduled)
--   - existing nurses       -> Pozita = NULL (no title on record yet)

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.ReservationModel') AND name = 'Status'
)
BEGIN
    ALTER TABLE dbo.ReservationModel
        ADD Status INT NOT NULL CONSTRAINT DF_ReservationModel_Status DEFAULT (0);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Infermjeri') AND name = 'Pozita'
)
BEGIN
    ALTER TABLE dbo.Infermjeri
        ADD Pozita NVARCHAR(MAX) NULL;
END
GO
