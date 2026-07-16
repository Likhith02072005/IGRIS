# Contributing Guidelines

## Branching & Workflow Model

1. **Fork the Repository**: Clone a local fork and configure standard upstream pointers.
2. **Feature Branches**: Branches should be created off `main` and follow naming conventions:
   - `feat/feature-name`
   - `fix/bug-fix-name`
   - `refactor/change-name`

## Commit Format Specification

We enforce Conventional Commits patterns:
```
<type>(<scope>): <short description>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

## Code Quality Standards

- **TypeScript**: Strict type assertions. Do not use `any`. Always resolve warnings.
- **Python**: Enforce PEP 8 style formatting. Use explicit typing (`List`, `Dict`, `Any`).
- **SQL**: Database migrations must go through Prisma. Do not write raw structural drop scripts.

## Pull Request Checklist

Before submitting a PR, verify:
- [ ] TypeScript compiler checks compile cleanly: `npm run build` or `npx tsc --noEmit`.
- [ ] Python unit tests run successfully: `python -m unittest`.
- [ ] Environment changes are mapped inside `.env.example`.
