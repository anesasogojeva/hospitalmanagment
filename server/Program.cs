using dizajn_Projekti.Adapters;
using dizajn_Projekti.Adapters.Interfaces;
using dizajn_Projekti.DataAccess.Interfaces;
using dizajn_Projekti.DataAccess.Repositories;
using dizajn_Projekti.Database;
using dizajn_Projekti.Factories.Interfaces;
using dizajn_Projekti.Factories;
using dizajn_Projekti.Models;
using dizajn_Projekti.Services;
using dizajn_Projekti.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Text;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                // Serialize enums (e.g. ReservationStatus) as their string name rather than a
                // raw numeric code, so API responses stay self-describing for API consumers.
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddScoped<IDoktoriRepository, DoktoriRepository>();
        builder.Services.AddScoped<IDoktoriService, DoktoriService>();

        builder.Services.AddScoped<IPacientiRepository, PacientiRepository>();
        builder.Services.AddScoped<IPacientiService, PacientiService>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddScoped<IRekordRepository, RekordRepository>();
        builder.Services.AddScoped<IRekordService, RekordService>();
        builder.Services.AddScoped<IRekordAdapter, RekordAdapter>();

        builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
        builder.Services.AddScoped<IReservationService, ReservationService>();

        builder.Services.AddScoped<IInfermjeriRepository, InfermjeriRepository>();
        builder.Services.AddScoped<IInfermjeriService, InfermjeriService>();

        builder.Services.AddScoped<INurseScheduleRepository, NurseScheduleRepository>();
        builder.Services.AddScoped<INurseScheduleService, NurseScheduleService>();

        builder.Services.AddScoped<IContactRepository, ContactRepository>();
        builder.Services.AddScoped<IContactService, ContactService>();

        builder.Services.AddScoped<ISherbimiRepository, SherbimiRepository>();
        builder.Services.AddScoped<ISherbimiService, SherbimiService>();

        builder.Services.AddScoped<IReservationFactory, ReservationFactory>();

        builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
        builder.Services.AddScoped<IReviewService, ReviewService>();

        builder.Services.AddScoped<IEmergencyRepository, EmergencyRepository>();
        builder.Services.AddScoped<IEmergencyService, EmergencyService>();


        builder.Services.AddDbContext<HospitalDbContext>(options =>
        {
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultDBConnection"));
        });

        builder.Services.AddIdentity<User, IdentityRole>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireDigit = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredUniqueChars = 1;
        })
            .AddEntityFrameworkStores<HospitalDbContext>()
            .AddSignInManager()
            .AddRoles<IdentityRole>()
            .AddDefaultTokenProviders();

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
            };
        });

        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
            {
                Description = "Standard authorization header using Bearer scheme (\"bearer {token}\")",
                In = ParameterLocation.Header,
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey
            });
            options.OperationFilter<SecurityRequirementsOperationFilter>();
        });

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigin",
                builder => builder
                    .WithOrigins("http://localhost:3000")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
        });

        var app = builder.Build();

        // Create roles
        using (var scope = app.Services.CreateScope())
        {
            var serviceProvider = scope.ServiceProvider;

            // Resolve the adapter
            var rekordAdapter = serviceProvider.GetService<IRekordAdapter>();
            if (rekordAdapter != null)
            {
                // Test the adapter
                Console.WriteLine("Testing RekordAdapter...");
                var allRekords = await rekordAdapter.GetAllRekordsAsync();

                foreach (var rekord in allRekords)
                {
                    Console.WriteLine($"Id: {rekord.Id_Rek}, Diagnoza: {rekord.Diagnoza}");
                }
            }
            else
            {
                Console.WriteLine("Failed to resolve RekordAdapter.");
            }
            // Resolve the factory
          /*  var factory = new ReservationFactory();

            var reservationDate = DateTime.Now;
            var reservationTime = "10:30 AM";
            int patientId = 4;
            int doctorId = 4;

            var reservation = factory.CreateReservation(reservationDate, reservationTime, patientId, doctorId);

            Console.WriteLine($"Reservation created: {reservation.ReservationDate}, {reservation.ReservationTime}, Patient: {reservation.Patient}, Doctor: {reservation.Doctor}");

            // Persist the reservation
            var dbContext = serviceProvider.GetRequiredService<HospitalDbContext>();
            await dbContext.ReservationModel.AddAsync(reservation);
            await dbContext.SaveChangesAsync();*/

            // Ensure roles exist
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            await EnsureRolesAsync(roleManager);

            // Seed a handful of realistic mock nurses (directory data only - nurses have no
            // login/role in this system, same as the rest of the Infermjeri roster).
            var dbContext = serviceProvider.GetRequiredService<HospitalDbContext>();
            await EnsureNursesSeededAsync(dbContext);
        }

        // Configure the HTTP request pipeline
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowSpecificOrigin");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }

    private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roleNames = { "admin", "patient", "doktor" };

        foreach (var roleName in roleNames)
        {
            var roleExists = await roleManager.RoleExistsAsync(roleName);
            if (!roleExists)
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }

    // Nurses have no login/role in this system (InfermjeriModel is a directory record only,
    // same as the rest of the Infermjeri roster), so this only ever inserts plain rows -
    // it can't grant anyone permissions. Runs once: no-ops once any nurse row exists.
    private static async Task EnsureNursesSeededAsync(HospitalDbContext context)
    {
        if (await context.Infermjeri.AnyAsync())
        {
            return;
        }

        var nurses = new[]
        {
            new InfermjeriModel
            {
                Emri = "Sarah",
                Mbiemri = "Johnson",
                DataELindjes = new DateTime(1990, 3, 14),
                Email = "sarah.johnson@hms-hospital.com",
                NumriTel = "555-0101",
                Gjinia = "Female",
                Departamenti = "Emergency",
                Pozita = "Registered Nurse",
                VitetPune = 6
            },
            new InfermjeriModel
            {
                Emri = "Emily",
                Mbiemri = "Wilson",
                DataELindjes = new DateTime(1985, 7, 22),
                Email = "emily.wilson@hms-hospital.com",
                NumriTel = "555-0102",
                Gjinia = "Female",
                Departamenti = "Intensive Care",
                Pozita = "Senior Nurse",
                VitetPune = 12
            },
            new InfermjeriModel
            {
                Emri = "Jessica",
                Mbiemri = "Brown",
                DataELindjes = new DateTime(1994, 11, 5),
                Email = "jessica.brown@hms-hospital.com",
                NumriTel = "555-0103",
                Gjinia = "Female",
                Departamenti = "Pediatrics",
                Pozita = "Registered Nurse",
                VitetPune = 4
            },
            new InfermjeriModel
            {
                Emri = "Michael",
                Mbiemri = "Davis",
                DataELindjes = new DateTime(1980, 1, 30),
                Email = "michael.davis@hms-hospital.com",
                NumriTel = "555-0104",
                Gjinia = "Male",
                Departamenti = "General Surgery",
                Pozita = "Head Nurse",
                VitetPune = 18
            },
            new InfermjeriModel
            {
                Emri = "Olivia",
                Mbiemri = "Miller",
                DataELindjes = new DateTime(1996, 9, 18),
                Email = "olivia.miller@hms-hospital.com",
                NumriTel = "555-0105",
                Gjinia = "Female",
                Departamenti = "Cardiology",
                Pozita = "Registered Nurse",
                VitetPune = 2
            }
        };

        await context.Infermjeri.AddRangeAsync(nurses);
        await context.SaveChangesAsync();
    }
}
