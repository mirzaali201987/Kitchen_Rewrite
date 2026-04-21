// source_handbook: week11-hackathon-preparation
// Quick sanity test for retrieval logic. No LLM call needed.
// Run with: npx tsx scripts/test-retrieval.ts
// (or paste into a route if you don't want to install tsx)

import { retrieveSwaps, formatSwapContext } from "../lib/rag";
import { Constraint } from "../data/knowledge";

const cases: { name: string; recipe: string; constraints: Constraint[] }[] = [
  {
    name: "Cookies with vegan constraint",
    recipe: "butter, milk, eggs, flour, sugar, chocolate chips",
    constraints: ["vegan"],
  },
  {
    name: "Pesto with nut-free",
    recipe: "basil, pine nuts, parmesan, olive oil, garlic",
    constraints: ["nut_free"],
  },
  {
    name: "Cookies with vegan AND nut-free (stacked)",
    recipe: "butter, eggs, flour, walnuts, almond flour",
    constraints: ["vegan", "nut_free"],
  },
  {
    name: "No constraints (edge case)",
    recipe: "butter, milk, eggs",
    constraints: [],
  },
];

for (const c of cases) {
  console.log(`\n=== ${c.name} ===`);
  const swaps = retrieveSwaps(c.recipe, c.constraints);
  console.log(`Retrieved ${swaps.length} swaps. First 3 IDs:`, swaps.slice(0, 3).map((s) => s.id));
}
