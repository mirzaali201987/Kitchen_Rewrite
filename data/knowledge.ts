// source_handbook: week11-hackathon-preparation
// Ingredient substitution knowledge base.
// Each entry is grounded, not LLM-guessed. Add more as needed.
// Tags tell the retriever which dietary constraints a swap satisfies.

export type Substitution = {
  id: string;
  original: string;        // ingredient being replaced
  replacement: string;     // what to use instead
  ratio: string;           // how much replacement per unit original
  satisfies: Constraint[]; // which constraints this swap helps with
  notes: string;           // texture, taste, or warning notes
};

export type Constraint =
  | "vegan"
  | "vegetarian"
  | "gluten_free"
  | "dairy_free"
  | "nut_free"
  | "egg_free"
  | "halal"
  | "kosher"
  | "low_sodium"
  | "low_sugar";

export const SUBSTITUTIONS: Substitution[] = [
  // Dairy
  {
    id: "sub-001",
    original: "butter",
    replacement: "olive oil or coconut oil",
    ratio: "3/4 cup oil per 1 cup butter",
    satisfies: ["vegan", "dairy_free"],
    notes: "Coconut oil keeps baking texture closer to butter. Olive oil is better for savory.",
  },
  {
    id: "sub-002",
    original: "milk",
    replacement: "oat milk or soy milk",
    ratio: "1:1",
    satisfies: ["vegan", "dairy_free"],
    notes: "Oat milk is closest in baking. Avoid almond milk for nut-free recipes.",
  },
  {
    id: "sub-003",
    original: "heavy cream",
    replacement: "full-fat coconut milk",
    ratio: "1:1",
    satisfies: ["vegan", "dairy_free"],
    notes: "Adds a slight coconut flavor. Fine for curries, noticeable in plain dishes.",
  },
  {
    id: "sub-004",
    original: "cheese",
    replacement: "nutritional yeast or cashew-based vegan cheese",
    ratio: "use 2 tbsp nutritional yeast per 1/4 cup grated cheese",
    satisfies: ["vegan", "dairy_free"],
    notes: "Cashew-based cheese is NOT nut-free. For nut-free vegan, use soy-based cheese.",
  },
  {
    id: "sub-005",
    original: "yogurt",
    replacement: "coconut yogurt or soy yogurt",
    ratio: "1:1",
    satisfies: ["vegan", "dairy_free"],
    notes: "For marinades in savory dishes, full-fat coconut yogurt works best.",
  },

  // Eggs
  {
    id: "sub-006",
    original: "egg (in baking)",
    replacement: "flax egg",
    ratio: "1 tbsp ground flaxseed + 3 tbsp water = 1 egg",
    satisfies: ["vegan", "egg_free"],
    notes: "Let sit 5 minutes to gel. Works for muffins and cookies, not for meringues.",
  },
  {
    id: "sub-007",
    original: "egg (in baking)",
    replacement: "mashed banana or applesauce",
    ratio: "1/4 cup per egg",
    satisfies: ["vegan", "egg_free"],
    notes: "Adds sweetness and moisture. Only use in sweet baked goods.",
  },

  // Gluten
  {
    id: "sub-008",
    original: "wheat flour",
    replacement: "1-to-1 gluten-free flour blend",
    ratio: "1:1",
    satisfies: ["gluten_free"],
    notes: "Look for blends with xanthan gum included. Single flours like rice flour alone give poor texture.",
  },
  {
    id: "sub-009",
    original: "soy sauce",
    replacement: "tamari or coconut aminos",
    ratio: "1:1",
    satisfies: ["gluten_free"],
    notes: "Regular soy sauce contains wheat. Tamari is the closest taste match.",
  },
  {
    id: "sub-010",
    original: "breadcrumbs",
    replacement: "gluten-free breadcrumbs or crushed gluten-free crackers",
    ratio: "1:1",
    satisfies: ["gluten_free"],
    notes: "Ground oats work too, but check that the oats are certified gluten-free.",
  },

  // Nuts
  {
    id: "sub-011",
    original: "almond flour",
    replacement: "sunflower seed flour",
    ratio: "1:1",
    satisfies: ["nut_free"],
    notes: "In alkaline batters (with baking soda), sunflower seed flour turns green. Harmless, but looks odd.",
  },
  {
    id: "sub-012",
    original: "peanut butter",
    replacement: "sunflower seed butter or soy butter",
    ratio: "1:1",
    satisfies: ["nut_free"],
    notes: "Sunflower seed butter is the closest taste. Confirm brand has no nut cross-contamination warnings.",
  },
  {
    id: "sub-013",
    original: "pine nuts (in pesto)",
    replacement: "pumpkin seeds or hemp seeds",
    ratio: "1:1",
    satisfies: ["nut_free"],
    notes: "Pumpkin seeds give a similar buttery texture. Toast lightly first.",
  },

  // Meat
  {
    id: "sub-014",
    original: "ground beef",
    replacement: "lentils or textured vegetable protein",
    ratio: "1 cup cooked lentils per 1/2 lb ground beef",
    satisfies: ["vegan", "vegetarian"],
    notes: "Brown lentils hold shape best. Add smoked paprika for a meatier flavor.",
  },
  {
    id: "sub-015",
    original: "chicken broth",
    replacement: "vegetable broth",
    ratio: "1:1",
    satisfies: ["vegan", "vegetarian"],
    notes: "Look for a full-bodied vegetable broth, not a light one, for soups.",
  },
  {
    id: "sub-016",
    original: "bacon",
    replacement: "smoked tempeh or coconut bacon",
    ratio: "1:1",
    satisfies: ["vegan", "vegetarian", "halal"],
    notes: "Tempeh takes marinade well. Slice thin and pan-fry crisp.",
  },
  {
    id: "sub-017",
    original: "pork",
    replacement: "beef, chicken, or jackfruit (for vegan)",
    ratio: "1:1",
    satisfies: ["halal", "kosher"],
    notes: "For halal and kosher, check that the replacement meat is certified.",
  },

  // Sodium
  {
    id: "sub-018",
    original: "table salt",
    replacement: "lemon juice, vinegar, or salt-free seasoning blend",
    ratio: "start with 1/4 the salt amount, taste, adjust",
    satisfies: ["low_sodium"],
    notes: "Acid brightens flavor and reduces perceived need for salt. Does not fully replace salt's function.",
  },
  {
    id: "sub-019",
    original: "soy sauce",
    replacement: "low-sodium soy sauce or coconut aminos",
    ratio: "1:1",
    satisfies: ["low_sodium", "gluten_free"],
    notes: "Coconut aminos have about 70% less sodium than soy sauce.",
  },

  // Sugar
  {
    id: "sub-020",
    original: "white sugar",
    replacement: "monk fruit sweetener or stevia",
    ratio: "check package, usually 1/3 to 1/2 the amount",
    satisfies: ["low_sugar"],
    notes: "Monk fruit has the least aftertaste. Do not use for recipes where sugar provides structure (like meringues).",
  },
];

// Helper: given a set of constraints, return the swaps that apply.
export function relevantSwaps(constraints: Constraint[]): Substitution[] {
  if (constraints.length === 0) return [];
  return SUBSTITUTIONS.filter((s) =>
    s.satisfies.some((tag) => constraints.includes(tag))
  );
}
