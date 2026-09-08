-- This project does not use EF Core migrations (see the note in
-- AddAppointmentStatusAndNursePosition.sql), so schema changes are applied by hand.
-- Creates the table behind server/Models/NurseScheduleModel.cs - the Admin-managed weekly
-- nurse schedule that replaces the old fake "Id_i % 7" grouping.
--
-- No existing data is migrated into this table: the previous "schedule" shown in the app
-- was never a real, admin-entered schedule - it was a placeholder heuristic (the code
-- literally commented "Assuming nurses are assigned to days in a cyclic manner"), so there
-- is nothing genuine to preserve. The table starts empty; Admin populates it going forward.

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'NurseSchedules' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.NurseSchedules (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        NurseId INT NOT NULL,
        DayOfWeek INT NOT NULL,
        Shift INT NOT NULL,
        StartTime TIME NULL,
        EndTime TIME NULL,
        CONSTRAINT FK_NurseSchedules_Infermjeri FOREIGN KEY (NurseId)
            REFERENCES dbo.Infermjeri (Id_i) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IX_NurseSchedules_Nurse_Day_Shift
        ON dbo.NurseSchedules (NurseId, DayOfWeek, Shift);
END
GO
