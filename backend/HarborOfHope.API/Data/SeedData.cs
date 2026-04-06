using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using Microsoft.EntityFrameworkCore;
using HarborOfHope.API.Data.Entities;

namespace HarborOfHope.API.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Skip if already seeded
        if (await context.Safehouses.AnyAsync())
        {
            Console.WriteLine("Database already seeded. Skipping.");
            return;
        }

        var csvPath = ResolveCsvPath();
        if (csvPath == null)
        {
            Console.WriteLine("WARNING: CSV data directory not found. Skipping seed.");
            return;
        }

        Console.WriteLine($"Seeding from: {csvPath}");

        // Seed in dependency order
        await SeedTable<Safehouse>(context, csvPath, "safehouses.csv", context.Safehouses);
        await SeedTable<Resident>(context, csvPath, "residents.csv", context.Residents);
        await SeedTable<Supporter>(context, csvPath, "supporters.csv", context.Supporters);
        await SeedTable<Partner>(context, csvPath, "partners.csv", context.Partners);
        await SeedTable<Donation>(context, csvPath, "donations.csv", context.Donations);
        await SeedTable<DonationAllocation>(context, csvPath, "donation_allocations.csv", context.DonationAllocations);
        await SeedTable<InKindDonationItem>(context, csvPath, "in_kind_donation_items.csv", context.InKindDonationItems);
        await SeedTable<EducationRecord>(context, csvPath, "education_records.csv", context.EducationRecords);
        await SeedTable<HealthWellbeingRecord>(context, csvPath, "health_wellbeing_records.csv", context.HealthWellbeingRecords);
        await SeedTable<ProcessRecording>(context, csvPath, "process_recordings.csv", context.ProcessRecordings);
        await SeedTable<HomeVisitation>(context, csvPath, "home_visitations.csv", context.HomeVisitations);
        await SeedTable<IncidentReport>(context, csvPath, "incident_reports.csv", context.IncidentReports);
        await SeedTable<InterventionPlan>(context, csvPath, "intervention_plans.csv", context.InterventionPlans);
        await SeedPartnerAssignments(context, csvPath);
        await SeedTable<SocialMediaPost>(context, csvPath, "social_media_posts.csv", context.SocialMediaPosts);
        await SeedTable<SafehouseMonthlyMetric>(context, csvPath, "safehouse_monthly_metrics.csv", context.SafehouseMonthlyMetrics);
        await SeedTable<PublicImpactSnapshot>(context, csvPath, "public_impact_snapshots.csv", context.PublicImpactSnapshots);

        Console.WriteLine("Seeding complete!");
    }

    private static string? ResolveCsvPath()
    {
        // Development path: navigate up from bin output to project root, then to data folder
        var devPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "data", "lighthouse_csv_v7");
        if (Directory.Exists(devPath))
            return Path.GetFullPath(devPath);

        // Production path: data bundled alongside the binary
        var prodPath = Path.Combine(AppContext.BaseDirectory, "data", "lighthouse_csv_v7");
        if (Directory.Exists(prodPath))
            return Path.GetFullPath(prodPath);

        return null;
    }

    private static CsvConfiguration CreateCsvConfig()
    {
        return new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            PrepareHeaderForMatch = args => args.Header.Replace("_", "").ToLower(),
            MissingFieldFound = null,
            HeaderValidated = null,
            BadDataFound = null,
        };
    }

    /// <summary>
    /// Register global type converters that handle CSV quirks (e.g., "3313.0" for int columns)
    /// </summary>
    private static void RegisterGlobalConverters(CsvReader csv)
    {
        csv.Context.TypeConverterCache.AddConverter<int>(new FlexibleIntConverter());
        csv.Context.TypeConverterCache.AddConverter<int?>(new FlexibleNullableIntConverter());
    }

    private static async Task SeedTable<T>(AppDbContext context, string csvPath, string fileName, DbSet<T> dbSet) where T : class
    {
        var filePath = Path.Combine(csvPath, fileName);
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"WARNING: {fileName} not found. Skipping.");
            return;
        }

        using var reader = new StreamReader(filePath);
        using var csv = new CsvReader(reader, CreateCsvConfig());
        RegisterGlobalConverters(csv);
        var records = csv.GetRecords<T>().ToList();

        // Get table name for identity insert
        var entityType = context.Model.FindEntityType(typeof(T));
        var tableName = entityType?.GetTableName() ?? typeof(T).Name + "s";
        var schema = entityType?.GetSchema() ?? "public";
        var fullTable = string.IsNullOrEmpty(schema) ? $"\"{tableName}\"" : $"\"{schema}\".\"{tableName}\"";

        // Enable explicit ID insertion for PostgreSQL SERIAL columns
        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE {fullTable} DISABLE TRIGGER ALL;");

        foreach (var record in records)
        {
            context.Entry(record).State = EntityState.Added;
        }
        await context.SaveChangesAsync();

        // Reset sequence to max ID + 1
        var pk = entityType?.FindPrimaryKey()?.Properties.FirstOrDefault()?.GetColumnName();
        if (pk != null)
        {
            await context.Database.ExecuteSqlRawAsync(
                $"SELECT setval(pg_get_serial_sequence('{schema}.{tableName}', '{pk}'), COALESCE(MAX(\"{pk}\"), 0) + 1, false) FROM {fullTable};");
        }

        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE {fullTable} ENABLE TRIGGER ALL;");

        // Detach all tracked entities to avoid conflicts with next table
        context.ChangeTracker.Clear();

        Console.WriteLine($"Seeded {records.Count} {typeof(T).Name} records from {fileName}");
    }

    /// <summary>
    /// Special handler for partner_assignments where safehouse_id has "8.0" format in CSV
    /// </summary>
    private static async Task SeedPartnerAssignments(AppDbContext context, string csvPath)
    {
        var filePath = Path.Combine(csvPath, "partner_assignments.csv");
        if (!File.Exists(filePath))
        {
            Console.WriteLine("WARNING: partner_assignments.csv not found. Skipping.");
            return;
        }

        using var reader = new StreamReader(filePath);
        using var csv = new CsvReader(reader, CreateCsvConfig());
        csv.Context.RegisterClassMap<PartnerAssignmentMap>();
        var records = csv.GetRecords<PartnerAssignment>().ToList();

        var entityType = context.Model.FindEntityType(typeof(PartnerAssignment));
        var tableName = entityType?.GetTableName() ?? "partner_assignments";
        var schema = entityType?.GetSchema() ?? "public";
        var fullTable = $"\"{schema}\".\"{tableName}\"";

        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE {fullTable} DISABLE TRIGGER ALL;");
        foreach (var record in records)
            context.Entry(record).State = EntityState.Added;
        await context.SaveChangesAsync();

        var pk = entityType?.FindPrimaryKey()?.Properties.FirstOrDefault()?.GetColumnName();
        if (pk != null)
            await context.Database.ExecuteSqlRawAsync(
                $"SELECT setval(pg_get_serial_sequence('{schema}.{tableName}', '{pk}'), COALESCE(MAX(\"{pk}\"), 0) + 1, false) FROM {fullTable};");

        await context.Database.ExecuteSqlRawAsync($"ALTER TABLE {fullTable} ENABLE TRIGGER ALL;");
        context.ChangeTracker.Clear();
        Console.WriteLine($"Seeded {records.Count} PartnerAssignment records from partner_assignments.csv");
    }
}

/// <summary>
/// ClassMap to handle the "8.0" format for safehouse_id in partner_assignments CSV
/// </summary>
public class PartnerAssignmentMap : ClassMap<PartnerAssignment>
{
    public PartnerAssignmentMap()
    {
        Map(m => m.AssignmentId).Name("assignment_id");
        Map(m => m.PartnerId).Name("partner_id");
        Map(m => m.SafehouseId).Name("safehouse_id").TypeConverter<DoubleToIntConverter>();
        Map(m => m.ProgramArea).Name("program_area");
        Map(m => m.AssignmentStart).Name("assignment_start");
        Map(m => m.AssignmentEnd).Name("assignment_end");
        Map(m => m.ResponsibilityNotes).Name("responsibility_notes");
        Map(m => m.IsPrimary).Name("is_primary");
        Map(m => m.Status).Name("status");
        Map(m => m.Safehouse).Ignore();
        Map(m => m.Partner).Ignore();
    }
}

public class FlexibleIntConverter : DefaultTypeConverter
{
    public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
    {
        if (string.IsNullOrWhiteSpace(text)) return 0;
        if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
            return (int)d;
        return 0;
    }
}

public class FlexibleNullableIntConverter : DefaultTypeConverter
{
    public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
            return (int)d;
        return null;
    }
}

public class DoubleToIntConverter : DefaultTypeConverter
{
    public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
    {
        if (string.IsNullOrWhiteSpace(text))
            return 0;

        if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
            return (int)d;

        if (int.TryParse(text, out var i))
            return i;

        return 0;
    }
}
