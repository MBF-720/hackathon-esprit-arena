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

interface Developer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mainSpecialty: string;
  skillTags: string[];
  totalChallenges: number;
  totalWins: number;
  winRate: number;
  avgScore: number;
  cvUrl?: string;
}

// Mock developers for fallback
const MOCK_DEVELOPERS: Developer[] = [
  { id: "1", firstName: "Ahmed", lastName: "Mohammed", email: "ahmed@example.com", mainSpecialty: "FULLSTACK", skillTags: ["React", "Node.js", "PostgreSQL", "Docker"], totalChallenges: 45, totalWins: 32, winRate: 71, avgScore: 8.7 },
  { id: "2", firstName: "Fatima", lastName: "Al-Zahra", email: "fatima@example.com", mainSpecialty: "FRONTEND", skillTags: ["Vue.js", "Tailwind CSS", "TypeScript", "Figma"], totalChallenges: 38, totalWins: 28, winRate: 74, avgScore: 8.4 },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tier = searchParams.get("tier") || "PRO";
  const specialty = searchParams.get("specialty");

  try {
    const bigquery = await initBigQuery();

    if (!bigquery) {
      console.warn("⚠️ BigQuery not available, using mock data");
      return NextResponse.json({
        tier,
        developers: MOCK_DEVELOPERS,
        total: MOCK_DEVELOPERS.length,
        _source: "mock",
      });
    }

    // BASIC tier: 10 developers, limited fields
    // PRO tier: 100 developers, full data + filters
    const limit = tier === "BASIC" ? 10 : 100;

    // Build WHERE clause
    let whereClause = "";
    if (specialty) {
      whereClause += `WHERE main_specialty = '${specialty}'`;
    }

    const selectClause = tier === "BASIC" 
      ? "developer_id, main_specialty, skill_tags, total_challenges, total_wins, win_rate, avg_score"
      : "developer_id, first_name, last_name, email, main_specialty, skill_tags, total_challenges, total_wins, win_rate, avg_score, cv_url";

    const query = `
      SELECT ${selectClause}
      FROM \`${process.env.BIGQUERY_PROJECT_ID}.${DATASET}.staging_developers\`
      ${whereClause}
      ORDER BY win_rate DESC, avg_score DESC
      LIMIT ${limit}
    `;

    console.log("🔍 Fetching developers...");
    const [rows] = await bigquery.query({ query });

    if (rows.length === 0) {
      console.log("ℹ️  No developers found in BigQuery, using mock data");
      return NextResponse.json({
        tier,
        developers: MOCK_DEVELOPERS,
        total: MOCK_DEVELOPERS.length,
        _source: "mock",
      });
    }

    const developers: Developer[] = (rows as any[]).map((row: any) => {
      let skillTags = [];
      
      // Parse skill_tags (could be JSON string or array)
      if (typeof row.skill_tags === "string") {
        try {
          skillTags = JSON.parse(row.skill_tags);
        } catch (e) {
          skillTags = row.skill_tags.split(",").map((s: string) => s.trim());
        }
      } else if (Array.isArray(row.skill_tags)) {
        skillTags = row.skill_tags;
      }

      return {
        id: row.developer_id,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        email: row.email || "",
        mainSpecialty: row.main_specialty,
        skillTags,
        totalChallenges: row.total_challenges,
        totalWins: row.total_wins,
        winRate: row.win_rate,
        avgScore: row.avg_score,
        cvUrl: row.cv_url,
      };
    });

    console.log(`✅ Fetched ${developers.length} developers from BigQuery`);
    return NextResponse.json({
      tier,
      developers,
      total: developers.length,
      _source: "bigquery",
    });
  } catch (error) {
    console.log("ℹ️  Using mock data for developers");
    return NextResponse.json(
      {
        tier,
        developers: MOCK_DEVELOPERS,
        total: MOCK_DEVELOPERS.length,
        _source: "mock",
      },
      { status: 200 }
    );
  }
}
