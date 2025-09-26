# V2: AI Use Cases & Roadmap

This branch introduces an informational "AI Use Cases" page to the Sakai template that lists practical AI-driven features restaurants can use to increase sales and revenue (upselling, personalized offers, demand forecasting, chatbots, delivery optimization, and more).

Files added/modified for this change:

- `src/views/AIUseCases.vue` — informational page listing AI use cases.
- `src/layout/AppMenu.vue` — sidebar menu updated with an "AI" section linking to the page.
- `src/router/index.js` — route `/ai-usecases` added.

Notes & next steps:
- This is a non-breaking, informational addition. No backend services are required.
- Before creating a public `V2` branch, we curated these changes only and avoided committing unrelated workspace edits.
- Follow-up work planned: lint/format cleanup across the repo, implement Delivery & Multi-branch modules, and finalize comprehensive README with installation and feature docs.
