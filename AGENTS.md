# AGENTS.md

This project is a production-oriented native WeChat Mini Program for AI fridge inventory, calorie tracking, recipe recommendation, and weekly meal planning.

## Tech Stack

- Use native WeChat Mini Program only.
- Use WXML + WXSS + TypeScript.
- Use WeChat CloudBase for backend, database, storage, and cloud functions.
- Do not use uni-app, Taro, React, Vue, Vite, Next.js, Express, Spring Boot, MySQL, Redis, Docker, or Nginx unless explicitly requested.
- Do not add a custom backend server unless explicitly requested.

## Product Scope

Current target version is V1 unless the task explicitly says otherwise.

V1 includes:
- AI inventory entry.
- Receipt image parsing.
- Shopping list text parsing.
- Natural language food entry.
- AI-generated inventory draft.
- User confirmation before saving.
- Inventory batch management.
- Expiry reminders.
- Basic inventory operations: edit, consume, discard.

V1.5 includes:
- Calorie dashboard.
- User body profile.
- Daily calorie target calculation.
- Meal logs.
- Exercise logs.
- Nutrition database matching.

V2 includes:
- User recipe upload.
- AI recipe parsing.
- Recipe library.
- Recipe recommendation based on inventory and calorie target.

V3 includes:
- Weekly meal planning.
- Shopping list generation.
- Meal prep suggestions.

Do not implement V1.5, V2, or V3 features unless explicitly requested.

## UI Rules

- Keep UI clean, minimal, and premium.
- Use soft mint and white visual style.
- Primary color: #32CBA3.
- Background color: #F7F8FA or soft mint gradient.
- Card background: #FFFFFF.
- Main text: #1F2937.
- Secondary text: #8A949E.
- Warning color only for expiring items.
- Danger color only for expired or destructive actions.
- Do not use thick borders.
- Do not use heavy shadows.
- Do not use too many colors on one screen.
- Do not crowd cards with many buttons.
- Inventory list cards should only show core information.
- Complex actions must be placed on detail pages, popups, or swipe actions.
- Do not add membership center, payment, points, ads, or community features.

## AI Rules

- AI must only generate drafts, suggestions, or structured JSON.
- AI must never directly write business data into the database.
- All AI outputs must be validated before use.
- AI inventory results must go to a confirmation page before saving.
- AI may parse food names, quantities, and units.
- AI must not be the final source of calorie calculation.
- Calories and nutrients must be calculated from the nutrition database.
- Store raw AI result and normalized result in ai_parse_tasks.

## Data Rules

- Inventory must be stored by batch.
- Do not merge different purchase batches into a single inventory record.
- Every inventory batch must include:
  - user_id
  - food_name
  - original_name
  - category
  - quantity
  - unit
  - storage_location
  - purchase_date
  - expire_date
  - expire_source
  - source_type
  - status
  - created_at
  - updated_at

- Expiry display should be calculated from expire_date.
- Do not automatically change normal items to expired in the database.
- Use status changes such as consumed or discarded instead of hard delete by default.
- Every user-owned record must include user_id from openid.
- Never trust user_id passed from the client.

## Security Rules

- Never expose API keys in Mini Program frontend code.
- Never hardcode AI keys, OCR keys, or cloud secrets in frontend files.
- All third-party API calls must happen inside cloud functions.
- Cloud functions must obtain openid using cloud.getWXContext().
- Validate all input before database writes.
- Check ownership before update, consume, discard, or delete operations.
- Do not use open database permissions in production.

## Code Style

- Keep code simple and readable.
- Prefer small functions.
- Avoid over-engineering.
- Avoid excessive fallback logic.
- Avoid generic framework-style abstractions.
- Avoid files over 300 lines when practical.
- Do not rewrite unrelated files.
- Do not rename existing files unless necessary.
- Do not change public interfaces without explaining the impact.
- Use TypeScript types for service inputs and outputs.

## Workflow

- Inspect the existing file structure before coding.
- Before changing code, identify the files that need modification.
- Make the smallest possible change that satisfies the task.
- Do not perform broad refactors unless explicitly requested.
- After changes, summarize modified files and key decisions.
- If there are tests or type checks, run them.
- If no tests exist, explain what was manually checked.