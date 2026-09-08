using dizajn_Projekti.Models;

// using hsm_lab1.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGeneration.Design;
using System.Numerics;

namespace dizajn_Projekti.Database
{
    public class HospitalDbContext : IdentityDbContext<User>
    {
        public HospitalDbContext(DbContextOptions<HospitalDbContext> options)
            : base(options)
        {
        }

        public DbSet<DoktoriModel> Doktori { get; set; }

        public DbSet<PacientiModel> Pacienti { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<InfermjeriModel> Infermjeri { get; set; }

        public DbSet<RekordModel> Rekord { get; set; }
        public DbSet<ReservationModel> ReservationModel { get; set; }
        public DbSet<ContactModel> Contacts { get; set; }

        public DbSet<SherbimiModel> Sherbimi { get; set; }
        public DbSet<ReviewModel> Review { get; set; }

        public DbSet<EmergencyModel> EmergencyModel { get; set; }

        public DbSet<NurseScheduleModel> NurseSchedules { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<PacientiModel>()
                .HasKey(i => i.Id_P);

            modelBuilder.Entity<DoktoriModel>()
                .HasIndex(d => d.UserId)
                .IsUnique();


            modelBuilder.Entity<PacientiModel>()
                .HasIndex(d => d.UserId)
                .IsUnique();

            modelBuilder.Entity<InfermjeriModel>()
              .HasKey(i => i.Id_i);

            modelBuilder.Entity<RekordModel>()
                .HasKey(i => i.Id_Rek);

            modelBuilder.Entity<RekordModel>()
                .HasOne(r => r.Doktori)
                .WithMany()
                .HasForeignKey(r => r.DoctorId);

            modelBuilder.Entity<RekordModel>()
                .HasOne(r => r.Pacienti)
                .WithMany()
                .HasForeignKey(r => r.Id_P);
            modelBuilder.Entity<ReservationModel>()
                .HasKey(i => i.ReservationId);

            modelBuilder.Entity<ReservationModel>()
                .HasOne(r => r.DoctorNavigation)
                .WithMany()
                .HasForeignKey(r => r.Doctor)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReservationModel>()
                .HasOne(r => r.PatientNavigation)
                .WithMany()
                .HasForeignKey(r => r.Patient)
                .OnDelete(DeleteBehavior.Restrict);

            // Existing rows (created before this column existed) get backfilled to
            // Scheduled by the column's DB-side default - see Scripts/AddAppointmentStatusAndNursePosition.sql
            modelBuilder.Entity<ReservationModel>()
                .Property(r => r.Status)
                .HasDefaultValue(ReservationStatus.Scheduled);

            modelBuilder.Entity<SherbimiModel>()
                .HasKey(i => i.Id_S);

            modelBuilder.Entity<ReviewModel>()
      .HasKey(i => i.Id_R);

            modelBuilder.Entity<ReviewModel>()
             .HasOne(r => r.Pacienti)
             .WithMany()
             .HasForeignKey(r => r.Id_P)
             .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmergencyModel>()
    .HasKey(i => i.Id_E);

            modelBuilder.Entity<EmergencyModel>()
               .HasOne(r => r.DoctorNavigation)
               .WithMany()
               .HasForeignKey(r => r.Doctor)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EmergencyModel>()
                .HasOne(r => r.PatientNavigation)
                .WithMany()
                .HasForeignKey(r => r.Patient)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NurseScheduleModel>()
                .HasOne(s => s.Nurse)
                .WithMany()
                .HasForeignKey(s => s.NurseId)
                .OnDelete(DeleteBehavior.Cascade);

            // A nurse can't have two rows for the same day+shift (the service layer also
            // checks this up front for a friendly error message; this is the DB-level backstop).
            modelBuilder.Entity<NurseScheduleModel>()
                .HasIndex(s => new { s.NurseId, s.DayOfWeek, s.Shift })
                .IsUnique();

        }
    }
}