# SubZen (Archived Prototype)

SubZen is an early full-stack prototype for uploading PDF/CSV bank statements, identifying recurring subscriptions, and presenting spending insights.

## Status

This repository is preserved as an **incomplete prototype**, not presented as a working financial product. It contains useful UI, parsing, authentication, and billing experiments, but the frontend and backend were developed across multiple iterations and their current routes and module formats are not fully integrated.

Known gaps include:

- Frontend API paths do not consistently match the checked-in Express routes.
- Stripe code contains overlapping experimental implementations.
- AI responses are not validated against a strict schema.
- The parser recognizes only a narrow set of merchants.
- There is no automated test suite or reproducible end-to-end verification.
- Financial documents require stronger privacy, retention, and access controls than this prototype provides.

Checked-in frontend Supabase configuration uses placeholders. Use only a dedicated development project and review Row Level Security policies before supplying an anonymous browser key.

## Preserved architecture

```text
Static HTML/CSS/JavaScript frontend
        │
        ├── Supabase authentication
        │
        └── Express API
              ├── PDF/CSV parsing
              ├── OpenAI analysis experiment
              ├── Supabase persistence
              └── Stripe billing experiment
```

## Why it is archived

The product idea remains useful, but publishing partially connected financial and billing code as a finished application would be misleading. The repository is retained as development history while active portfolio projects focus on reproducible builds, automated tests, and explicit security boundaries.
