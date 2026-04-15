import { NextRequest, NextResponse } from "next/server";
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

// Mock skills for fallback
const MOCK_SKILLS = [
  { name: "React", count: 380, frequency: 0.82, proficiency: 8.2 },
  { name: "TypeScript", count: 320, frequency: 0.75, proficiency: 8.0 },
  { name: "Node.js", count: 295, frequency: 0.68, proficiency: 7.9 },
  { name: "PostgreSQL", count: 245, frequency: 0.65, proficiency: 7.8 },
  { name: "Docker", count: 210, frequency: 0.58, proficiency: 7.6 },
  { name: "Next.js", count: 180, frequency: 0.52, proficiency: 8.1 },
  { name: "Python", count: 165, frequency: 0.48, proficiency: 7.7 },
  { name: "Tailwind CSS", count: 150, frequency: 0.42, proficiency: 8.0 },
  { name: "GraphQL", count: 135, frequency: 0.38, proficiency: 7.6 },
  { name: "Vue.js", count: 120, frequency: 0.35, proficiency: 7.8 },
];

function generateMockTrends() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    count: Math.floor(200 + Math.random() * 100 + i * 5),
  }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tier = searchParams.get("tier") || "PRO";

  try {
    const bigquery = await initBigQuery();

    if (!bigquery) {
      console.warn("⚠️ BigQuery not available, using mock data");
      const mockSkills = tier === "BASIC" ? MOCK_SKILLS.slice(0, 10) : MOCK_SKILLS;
      return NextResponse.json({
        tier,
        skills: mockSkills,
        trending: tier === "PRO" ? generateMockTrends() : undefined,
        _source: "mock",
      });
    }

    const limit = tier === "BASIC" ? 10 : 30;

    const query = `
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
      LIMIT ${limit}
    `;

    console.log("🔍 Fetching skills...");
    const [rows] = await bigquery.query({ query });

    let skills = [];

    if (rows.length === 0) {
      console.log("ℹ️  No skills found in BigQuery, using mock data");
      skills = tier === "BASIC" ? MOCK_SKILLS.slice(0, 10) : MOCK_SKILLS;
    } else {
      skills = (rows as any[]).map((row: any) => ({
        name: row.skill_name,
        count: row.developer_count,
        frequency: row.usage_frequency,
        proficiency: row.avg_proficiency,
      }));
    }

    let trending: any[] | undefined;

    // Only include trending data for PRO tier
    if (tier === "PRO" && rows.length > 0) {
      try {
        const topSkillNames = skills
          .slice(0, 5)
          .map((s: any) => `'${s.name}'`)
          .join(",");

        const trendQuery = `
          SELECT 
            FORMAT_TIMESTAMP('%b', snapshot_date) as month,
            AVG(developer_count) as count
          FROM \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.agg_skills_frequency\`
          WHERE skill_name IN (${topSkillNames})
            AND snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
          GROUP BY FORMAT_TIMESTAMP('%b', snapshot_date)
          ORDER BY snapshot_date ASC
        `;

        const [trendRows] = await bigquery.query({ query: trendQuery, location: "US" });

        if (trendRows.length > 0) {
          trending = (trendRows as any[]).map((row: any) => ({
            month: row.month || "unknown",
            count: Math.floor(row.count),
          }));
        }
      } catch (error) {
        console.warn("Failed to fetch trends from BigQuery:", error);
      }
    }

    console.log(`✅ Fetched ${skills.length} skills from BigQuery`);
    return NextResponse.json({
      tier,
      skills,
      ...(tier === "PRO" && { trending }),
      _source: "bigquery",
    });
  } catch (error) {
    console.log("ℹ️  Using mock data for skills");

    const mockSkills = tier === "BASIC" ? MOCK_SKILLS.slice(0, 10) : MOCK_SKILLS;

    return NextResponse.json(
      {
        tier,
        skills: mockSkills,
        trending: tier === "PRO" ? generateMockTrends() : undefined,
        _source: "mock",
      },
      { status: 200 }
    );
  }
}
