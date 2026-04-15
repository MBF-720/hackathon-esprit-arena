import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

// Initialize BigQuery client (server-side only)
async function initBigQuery() {
  try {
    const credentialsStr = process.env.BIGQUERY_CREDENTIALS;
    
    if (!credentialsStr) {
      console.warn("⚠️ BIGQUERY_CREDENTIALS not configured");
      return null;
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsStr);
    } catch (parseError) {
      console.warn("⚠️ Failed to parse BIGQUERY_CREDENTIALS:", parseError);
      return null;
    }

    // Validate credentials have required fields
    if (!credentials.client_email || !credentials.private_key) {
      console.warn("⚠️ BIGQUERY_CREDENTIALS missing required fields (client_email, private_key)");
      return null;
    }

    return new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT_ID || "arena-of-coders",
      credentials,
    });
  } catch (error) {
    console.warn("⚠️ Failed to initialize BigQuery:", error);
    return null;
  }
}

const DATASET = process.env.BIGQUERY_DATASET || "arenaofcoders";

// Mock data for fallback
const MOCK_STATS = {
  totalDevelopers: 1250,
  avgPlatformScore: 7.8,
  totalSubmissions: 9820,
  totalCompleted: 8920,
  highestScoreEver: 9.8,
  mostCommonSpecialty: "FULLSTACK",
  mostCommonSkill: "React",
  activeLast30Days: 420,
  newDevsThisMonth: 85,
  snapshotDate: new Date().toISOString(),
  specialtyBreakdown: [
    { name: "FRONTEND", value: 320 },
    { name: "BACKEND", value: 280 },
    { name: "FULLSTACK", value: 380 },
    { name: "DEVOPS", value: 120 },
    { name: "MOBILE", value: 95 },
    { name: "DATASCIENCE", value: 55 },
  ],
};

const MOCK_SKILLS = [
  { skillName: "React", developerCount: 380, usageFrequency: 0.82, avgProficiency: 8.2 },
  { skillName: "TypeScript", developerCount: 320, usageFrequency: 0.75, avgProficiency: 8.0 },
  { skillName: "Node.js", developerCount: 295, usageFrequency: 0.68, avgProficiency: 7.9 },
  { skillName: "PostgreSQL", developerCount: 245, usageFrequency: 0.65, avgProficiency: 7.8 },
  { skillName: "Docker", developerCount: 210, usageFrequency: 0.58, avgProficiency: 7.6 },
  { skillName: "Next.js", developerCount: 180, usageFrequency: 0.52, avgProficiency: 8.1 },
  { skillName: "Python", developerCount: 165, usageFrequency: 0.48, avgProficiency: 7.7 },
  { skillName: "Tailwind CSS", developerCount: 150, usageFrequency: 0.42, avgProficiency: 8.0 },
  { skillName: "GraphQL", developerCount: 135, usageFrequency: 0.38, avgProficiency: 7.6 },
  { skillName: "Vue.js", developerCount: 120, usageFrequency: 0.35, avgProficiency: 7.8 },
  { skillName: "AWS", developerCount: 110, usageFrequency: 0.32, avgProficiency: 7.5 },
  { skillName: "MongoDB", developerCount: 95, usageFrequency: 0.28, avgProficiency: 7.4 },
  { skillName: "Redis", developerCount: 85, usageFrequency: 0.25, avgProficiency: 7.3 },
  { skillName: "Kubernetes", developerCount: 75, usageFrequency: 0.22, avgProficiency: 7.2 },
  { skillName: "Java", developerCount: 65, usageFrequency: 0.18, avgProficiency: 7.8 },
];

export async function GET() {
  try {
    const bigquery = await initBigQuery();
    
    if (!bigquery) {
      console.warn("⚠️ BigQuery not available, using mock data");
      return NextResponse.json({
        tier: "PRO",
        stats: MOCK_STATS,
        skills: MOCK_SKILLS,
        _source: "mock",
      });
    }

    const query = `
      SELECT 
        total_developers,
        avg_platform_score,
        total_submissions,
        total_completed,
        highest_score_ever,
        specialty_breakdown,
        most_common_specialty,
        most_common_skill,
        active_last_30_days,
        new_devs_this_month,
        snapshot_date
      FROM \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.agg_platform_stats\`
      ORDER BY snapshot_date DESC
      LIMIT 1
    `;

    console.log("🔍 Fetching platform stats...");
    const [rows] = await bigquery.query({ query });

    if (rows.length === 0) {
      console.log("ℹ️  No data found in BigQuery, using mock data");
      return NextResponse.json({
        tier: "PRO",
        stats: MOCK_STATS,
        skills: MOCK_SKILLS,
        _source: "mock",
      });
    }

    const statsRow = rows[0] as any;
    let specialtyBreakdown = MOCK_STATS.specialtyBreakdown;

    // Parse specialty_breakdown if it's a JSON string
    if (typeof statsRow.specialty_breakdown === "string") {
      try {
        specialtyBreakdown = JSON.parse(statsRow.specialty_breakdown);
      } catch (e) {
        console.warn("Could not parse specialty_breakdown:", e);
      }
    } else if (Array.isArray(statsRow.specialty_breakdown)) {
      specialtyBreakdown = statsRow.specialty_breakdown;
    }

    // Query top skills
    const skillsQuery = `
      SELECT 
        skill_name,
        developer_count,
        pct_of_platform as usage_frequency,
        avg_score_of_users_with_skill as avg_proficiency
      FROM \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.agg_skills_frequency\`
      WHERE snapshot_date = (
        SELECT MAX(snapshot_date) 
        FROM \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.agg_skills_frequency\`
      )
      ORDER BY developer_count DESC
      LIMIT 15
    `;

    const [skillRows] = await bigquery.query({ query: skillsQuery });

    const skills = skillRows.length > 0 ? skillRows : MOCK_SKILLS;

    console.log(`✅ Fetched ${skills.length} skills from BigQuery`);
    return NextResponse.json({
      tier: "PRO",
      stats: {
        totalDevelopers: statsRow.total_developers,
        avgPlatformScore: statsRow.avg_platform_score,
        totalSubmissions: statsRow.total_submissions,
        totalCompleted: statsRow.total_completed,
        highestScoreEver: statsRow.highest_score_ever,
        mostCommonSpecialty: statsRow.most_common_specialty,
        mostCommonSkill: statsRow.most_common_skill,
        activeLast30Days: statsRow.active_last_30_days,
        newDevsThisMonth: statsRow.new_devs_this_month,
        snapshotDate: statsRow.snapshot_date,
        specialtyBreakdown,
      },
      skills: (skills as any[]).map((s) => ({
        name: s.skill_name,
        count: s.developer_count,
        frequency: s.usage_frequency,
        proficiency: s.avg_proficiency,
      })),
      _source: "bigquery",
    });
  } catch (error) {
    console.log("ℹ️  Using mock data for platform stats");
    return NextResponse.json(
      {
        tier: "PRO",
        stats: MOCK_STATS,
        skills: MOCK_SKILLS,
        _source: "mock",
      },
      { status: 200 }
    );
  }
}
