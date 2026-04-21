# Kitchen Rewrite

Any recipe, adapted to your dietary constraints — grounded in a curated database of cook-tested substitutions, with two variants for each request.

## What's new in v2

- **Editorial cookbook UI.** Fraunces display serif + DM Sans body, warm cream/terracotta/sage palette, proper typographic hierarchy. Zero AI-slop gradients.
- **Two variants per request.** Every adapted recipe returns a Primary version and an Alternate take using different substitutions, each with a plain-English tradeoff explanation.
- **Food imagery.** Hero photo fetched from Unsplash based on the dish keyword, with a hand-drawn SVG fallback if the image fails to load.
- **Hand-drawn SVG icons** for every dietary constraint, consistent with the editorial aesthetic.
- **Richer descriptions:** a dish description, cuisine family tag, and a "what changed & why" panel with numbered annotations and source citations.

## Three-sentence pitch

1. Home cooks with dietary restrictions don't just want "can I eat this" — they want two or three credible options so they can pick based on taste, texture, or what's in their pantry.
2. Kitchen Rewrite returns two complete adapted recipes for each request, each with specific substitutions cited back to a curated swap database, a tradeoff summary, a dish description, and safety warnings for allergy constraints.
3. Try it: paste any recipe, select vegan + nut-free, and see how the Primary uses oat milk + sunflower seed flour while the Alternate uses soy milk + pumpkin seeds — with reasons for each choice.

## Quick start

```bash
npm install
cp .env.example .env.local
# paste GROQ_API_KEY from console.groq.com/keys
npm run dev
```

Open http://localhost:3000.

## Test cases

1. **Happy path:** Chocolate chip cookies + Vegan. Expect butter→oil, eggs→flax egg or banana, milk→plant milk. Two different variant choices.
2. **Allergy safety:** Same recipe + Nut-free. Expect walnuts swapped, warning about cross-contamination appears prominently.
3. **Cuisine tag:** Paste a pasta recipe → expect cuisine_type = "italian" and a pasta-appropriate hero image.
4. **Constraint conflict:** Pork recipe + Halal. Expect a Cook's Notes warning explaining the conflict.
5. **Image failure simulation:** Kill your network briefly after clicking Adapt. Expect the SVG illustration fallback to appear instead of a broken image.

## Design decisions

**Why Unsplash Source and not Google Images?** Unsplash Source has no API key, returns quickly, and is free forever. The failure mode (wrong-but-still-food image) is gracefully handled by our fallback illustration.

**Why two variants, not three?** Three options is decision paralysis. Two forces a real choice and gives the UI a clean tab structure.

**Why no nearby restaurant feature?** It would need geolocation and a paid Google Places API. Out of scope for a grounded recipe tool and adds demo risk. A cuisine type label gives the user the "this is Italian / South Asian / etc" signal without the infrastructure.

## Honest scope limits

- **No recipe URL scraping.** Paste text only.
- **No image upload.** Text input only.
- **No history / saved recipes.** Each request is stateless.
- **No PDF export.** On-screen only.

## Deployment

Same as before: push to GitHub, import to Vercel, set `GROQ_API_KEY`, click Deploy.
