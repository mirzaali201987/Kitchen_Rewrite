// source_handbook: week11-hackathon-preparation
// POST /api/adapt
// body: { recipe: string, constraints: Constraint[] }
// response: AdaptResult or { error: string }
//
// v2: handles dual-variant output (primary + alternate) and richer descriptive fields.

import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { retrieveSwaps, formatSwapContext, hasHighStakesConstraint } from "@/lib/rag";
import { RECIPE_ADAPT_SYSTEM, checkRecipeInput } from "@/lib/prompts";
import { Constraint } from "@/data/knowledge";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

type Variant = {
  title: string;
  tradeoff_summary: string;
  ingredients: string[];
  steps: string[];
  changes: {
    original_ingredient: string;
    replacement: string;
    swap_id: string;
    reason: string;
  }[];
};

type AdaptResult = {
  dish_description: string;
  image_keyword: string;
  cuisine_type: string;
  primary: Variant;
  alternate: Variant;
  warnings: string[];
  unmet_constraints: string[];
};

function emptyVariant(): Variant {
  return { title: "", tradeoff_summary: "", ingredients: [], steps: [], changes: [] };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const body = await req.json();
    const recipe: string = body.recipe ?? "";
    const constraints: Constraint[] = body.constraints ?? [];

    const check = checkRecipeInput(recipe);
    if (!check.ok) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }
    if (constraints.length === 0) {
      return NextResponse.json(
        { error: "Select at least one dietary constraint." },
        { status: 400 }
      );
    }

    const swaps = retrieveSwaps(recipe, constraints);
    const context = formatSwapContext(swaps);

    const userMessage =
      `Available substitutions (use ONLY these):\n${context}\n\n` +
      `User's constraints: ${constraints.join(", ")}\n\n` +
      `Original recipe:\n${recipe}`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: RECIPE_ADAPT_SYSTEM },
        { role: "user", content: userMessage },
      ],
    });

    const rawText = response.choices[0]?.message?.content ?? "";

    let parsed: AdaptResult;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error({ event: "json_parse_failed", raw: rawText.slice(0, 500) });
      return NextResponse.json(
        { error: "Model did not return valid JSON. Try again." },
        { status: 502 }
      );
    }

    // Defensive defaults in case the model omits fields
    parsed.dish_description = parsed.dish_description || "";
    parsed.image_keyword = parsed.image_keyword || "food";
    parsed.cuisine_type = (parsed.cuisine_type || "").toLowerCase();
    parsed.primary = parsed.primary || emptyVariant();
    parsed.alternate = parsed.alternate || emptyVariant();
    parsed.primary.changes = parsed.primary.changes || [];
    parsed.alternate.changes = parsed.alternate.changes || [];
    parsed.warnings = parsed.warnings || [];
    parsed.unmet_constraints = parsed.unmet_constraints || [];

    // Safety injection for allergy constraints.
    if (hasHighStakesConstraint(constraints)) {
      const hasAllergyWarning = parsed.warnings.some((w) =>
        /check labels|cross-contamination|verify/i.test(w)
      );
      if (!hasAllergyWarning) {
        parsed.warnings.unshift(
          "Always check ingredient labels for cross-contamination warnings. This tool cannot guarantee allergen safety based on recipe text alone."
        );
      }
    }

    console.log(
      JSON.stringify({
        event: "adapt",
        ms: Date.now() - startedAt,
        constraints,
        swaps_retrieved: swaps.length,
        primary_changes: parsed.primary.changes.length,
        alternate_changes: parsed.alternate.changes.length,
        warnings_count: parsed.warnings.length,
      })
    );

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error({ event: "adapt_error", message: err?.message });
    return NextResponse.json(
      { error: "Something went wrong. Check server logs." },
      { status: 500 }
    );
  }
}
