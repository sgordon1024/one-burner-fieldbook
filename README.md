# One Burner Fieldbook

A public recipe journal for small kitchens. **Field Notes** are reusable seven-day issues; the **Recipe Shelf** is the evergreen, searchable collection; **Groceries** turns each issue into a deduplicated aisle checklist.

## Run it
Requires Node 22 or a recent Node 20. No dependency install or credentials.

    node build.mjs
    node --test tests/*.test.mjs
    python3 -m http.server 8080 -d _site

Open http://localhost:8080.

## Publish another week
1. Add any new groceries to content/ingredients.mjs. Values are name, aisle index, shopping pack size, Walmart item ID (or null), fallback search phrase, and optional pantry flag.
2. Add new recipe cards in content/recipes.mjs. Reuse existing ingredient IDs. Keep ingredient portions distinct from the shopping pack sizes. Set a realistic time, number of servings, steps, art and colors.
3. Add an issue to the weeks list with a stable slug, issue number, dinner IDs in order, and extras. Put the current issue first to feature it. Optional bench IDs add snacks or pantry staples without adding a formal recipe. Set issue-specific routeNote and leftoverNote. Override quantities per week with a packs object (ingredient ID to pack-size text) if the defaults do not fit.
4. Run the tests, run `node build.mjs docs`, inspect the issue and grocery list, and commit the updated source and docs directory together. GitHub Pages publishes docs from main. Recipe URLs stay stable across issues.

The Walmart links are public and non-affiliate. Where there isn't a pinned product, we link a specific Walmart search. The copied list is only handed off to Walmart by the shopper. Direct cart additions require a supported Walmart integration; the site does not use private endpoints or request Walmart sign-in. No backend, tracking or checkout.
