// source_handbook: week11-hackathon-preparation
// Retrieval for the recipe adapter.
// Instead of keyword search, we pull all substitutions that match the
// user's selected constraints. The recipe text is scanned for ingredient
// mentions to prioritize relevant swaps at the top of the context window.

import { SUBSTITUTIONS, Substitution, Constraint } from "@/data/knowledge";

export function retrieveSwaps(
  recipeText: string,
  constraints: Constraint[]
): Substitution[] {
  if (constraints.length === 0) return [];

  const recipeLower = recipeText.toLowerCase();

  const relevant = SUBSTITUTIONS.filter((s) =>
    s.satisfies.some((tag) => constraints.includes(tag))
  );

  // Rank: swaps whose "original" ingredient appears in the recipe come first.
  const ranked = relevant
    .map((s) => {
      const firstWord = s.original.split(" ")[0].toLowerCase();
      const appears = recipeLower.includes(firstWord);
      return { swap: s, appears };
    })
    .sort((a, b) => Number(b.appears) - Number(a.appears))
    .map((x) => x.swap);

  return ranked;
}

export function formatSwapContext(swaps: Substitution[]): string {
  if (swaps.length === 0) {
    return "No relevant substitutions in the database for the selected constraints.";
  }
  return swaps
    .map(
      (s, i) =>
        `[Swap ${i + 1}] id=${s.id}\n` +
        `  original: ${s.original}\n` +
        `  replacement: ${s.replacement}\n` +
        `  ratio: ${s.ratio}\n` +
        `  satisfies: ${s.satisfies.join(", ")}\n` +
        `  notes: ${s.notes}`
    )
    .join("\n\n");
}

// Constraints that trigger a safety warning in the output.
export const HIGH_STAKES_CONSTRAINTS: Constraint[] = [
  "nut_free",
  "gluten_free",
  "dairy_free",
  "egg_free",
  "low_sodium",
];

export function hasHighStakesConstraint(constraints: Constraint[]): boolean {
  return constraints.some((c) => HIGH_STAKES_CONSTRAINTS.includes(c));
}
