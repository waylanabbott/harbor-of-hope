using Microsoft.EntityFrameworkCore;
using HarborOfHope.API.Data.Entities;

namespace HarborOfHope.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // 17 domain tables
    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<InKindDonationItem> InKindDonationItems => Set<InKindDonationItem>();
    public DbSet<EducationRecord> EducationRecords => Set<EducationRecord>();
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords => Set<HealthWellbeingRecord>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PartnerAssignment> PartnerAssignments => Set<PartnerAssignment>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics => Set<SafehouseMonthlyMetric>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();

    // ML prediction tables (pre-computed by Python jobs/)
    public DbSet<DonorChurnPrediction> DonorChurnPredictions => Set<DonorChurnPrediction>();
    public DbSet<SocialMediaPrediction> SocialMediaPredictions => Set<SocialMediaPrediction>();
    public DbSet<ReintegrationPrediction> ReintegrationPredictions => Set<ReintegrationPrediction>();
    public DbSet<CounselingPrediction> CounselingPredictions => Set<CounselingPrediction>();
    public DbSet<IncidentRiskPrediction> IncidentRiskPredictions => Set<IncidentRiskPrediction>();
    public DbSet<EducationPrediction> EducationPredictions => Set<EducationPrediction>();
    public DbSet<DonationForecastPrediction> DonationForecastPredictions => Set<DonationForecastPrediction>();
    public DbSet<SafehousePrediction> SafehousePredictions => Set<SafehousePrediction>();
    public DbSet<CampaignPrediction> CampaignPredictions => Set<CampaignPrediction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== Relationships =====

        // Resident -> Safehouse
        modelBuilder.Entity<Resident>()
            .HasOne(r => r.Safehouse)
            .WithMany(s => s.Residents)
            .HasForeignKey(r => r.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Donation -> Supporter
        modelBuilder.Entity<Donation>()
            .HasOne(d => d.Supporter)
            .WithMany(s => s.Donations)
            .HasForeignKey(d => d.SupporterId)
            .OnDelete(DeleteBehavior.Restrict);

        // DonationAllocation -> Donation
        modelBuilder.Entity<DonationAllocation>()
            .HasOne(da => da.Donation)
            .WithMany(d => d.DonationAllocations)
            .HasForeignKey(da => da.DonationId)
            .OnDelete(DeleteBehavior.Cascade);

        // DonationAllocation -> Safehouse
        modelBuilder.Entity<DonationAllocation>()
            .HasOne(da => da.Safehouse)
            .WithMany(s => s.DonationAllocations)
            .HasForeignKey(da => da.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // InKindDonationItem -> Donation
        modelBuilder.Entity<InKindDonationItem>()
            .HasOne(i => i.Donation)
            .WithMany(d => d.InKindDonationItems)
            .HasForeignKey(i => i.DonationId)
            .OnDelete(DeleteBehavior.Cascade);

        // EducationRecord -> Resident
        modelBuilder.Entity<EducationRecord>()
            .HasOne(e => e.Resident)
            .WithMany(r => r.EducationRecords)
            .HasForeignKey(e => e.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // HealthWellbeingRecord -> Resident
        modelBuilder.Entity<HealthWellbeingRecord>()
            .HasOne(h => h.Resident)
            .WithMany(r => r.HealthWellbeingRecords)
            .HasForeignKey(h => h.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // ProcessRecording -> Resident
        modelBuilder.Entity<ProcessRecording>()
            .HasOne(p => p.Resident)
            .WithMany(r => r.ProcessRecordings)
            .HasForeignKey(p => p.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // HomeVisitation -> Resident
        modelBuilder.Entity<HomeVisitation>()
            .HasOne(h => h.Resident)
            .WithMany(r => r.HomeVisitations)
            .HasForeignKey(h => h.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // IncidentReport -> Resident
        modelBuilder.Entity<IncidentReport>()
            .HasOne(i => i.Resident)
            .WithMany(r => r.IncidentReports)
            .HasForeignKey(i => i.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // IncidentReport -> Safehouse
        modelBuilder.Entity<IncidentReport>()
            .HasOne(i => i.Safehouse)
            .WithMany(s => s.IncidentReports)
            .HasForeignKey(i => i.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // InterventionPlan -> Resident
        modelBuilder.Entity<InterventionPlan>()
            .HasOne(ip => ip.Resident)
            .WithMany(r => r.InterventionPlans)
            .HasForeignKey(ip => ip.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        // PartnerAssignment -> Partner
        modelBuilder.Entity<PartnerAssignment>()
            .HasOne(pa => pa.Partner)
            .WithMany(p => p.PartnerAssignments)
            .HasForeignKey(pa => pa.PartnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // PartnerAssignment -> Safehouse
        modelBuilder.Entity<PartnerAssignment>()
            .HasOne(pa => pa.Safehouse)
            .WithMany(s => s.PartnerAssignments)
            .HasForeignKey(pa => pa.SafehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        // SafehouseMonthlyMetric -> Safehouse
        modelBuilder.Entity<SafehouseMonthlyMetric>()
            .HasOne(m => m.Safehouse)
            .WithMany(s => s.MonthlyMetrics)
            .HasForeignKey(m => m.SafehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        // ===== Indexes =====

        // Resident indexes
        modelBuilder.Entity<Resident>().HasIndex(r => r.SafehouseId);
        modelBuilder.Entity<Resident>().HasIndex(r => r.CaseStatus);
        modelBuilder.Entity<Resident>().HasIndex(r => r.CurrentRiskLevel);

        // Donation indexes
        modelBuilder.Entity<Donation>().HasIndex(d => d.SupporterId);
        modelBuilder.Entity<Donation>().HasIndex(d => d.DonationDate);

        // ProcessRecording indexes
        modelBuilder.Entity<ProcessRecording>().HasIndex(p => p.ResidentId);
        modelBuilder.Entity<ProcessRecording>().HasIndex(p => p.SessionDate);

        // HomeVisitation indexes
        modelBuilder.Entity<HomeVisitation>().HasIndex(h => h.ResidentId);

        // DonationAllocation indexes
        modelBuilder.Entity<DonationAllocation>().HasIndex(da => da.DonationId);
        modelBuilder.Entity<DonationAllocation>().HasIndex(da => da.SafehouseId);

        // ===== Decimal Precision =====

        // Currency columns (18,2)
        modelBuilder.Entity<Donation>().Property(d => d.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<Donation>().Property(d => d.EstimatedValue).HasPrecision(18, 2);
        modelBuilder.Entity<DonationAllocation>().Property(da => da.AmountAllocated).HasPrecision(18, 2);
        modelBuilder.Entity<InKindDonationItem>().Property(i => i.EstimatedUnitValue).HasPrecision(18, 2);
        modelBuilder.Entity<SocialMediaPost>().Property(s => s.BoostBudgetPhp).HasPrecision(18, 2);
        modelBuilder.Entity<SocialMediaPost>().Property(s => s.EstimatedDonationValuePhp).HasPrecision(18, 2);
        modelBuilder.Entity<SocialMediaPost>().Property(s => s.Forwards).HasPrecision(18, 2);

        // Rate/percentage columns (10,4)
        modelBuilder.Entity<SocialMediaPost>().Property(s => s.EngagementRate).HasPrecision(10, 4);
        modelBuilder.Entity<EducationRecord>().Property(e => e.AttendanceRate).HasPrecision(10, 4);
        modelBuilder.Entity<EducationRecord>().Property(e => e.ProgressPercent).HasPrecision(10, 4);

        // Health/wellbeing scores (10,4)
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.GeneralHealthScore).HasPrecision(10, 4);
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.NutritionScore).HasPrecision(10, 4);
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.SleepQualityScore).HasPrecision(10, 4);
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.EnergyLevelScore).HasPrecision(10, 4);
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.HeightCm).HasPrecision(10, 2);
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.WeightKg).HasPrecision(10, 2);
        modelBuilder.Entity<HealthWellbeingRecord>().Property(h => h.Bmi).HasPrecision(10, 2);

        // Intervention plan target value
        modelBuilder.Entity<InterventionPlan>().Property(ip => ip.TargetValue).HasPrecision(10, 2);

        // Safehouse monthly metric averages
        modelBuilder.Entity<SafehouseMonthlyMetric>().Property(m => m.AvgEducationProgress).HasPrecision(10, 4);
        modelBuilder.Entity<SafehouseMonthlyMetric>().Property(m => m.AvgHealthScore).HasPrecision(10, 4);
    }
}
