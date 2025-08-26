# Olinnwan

Modern web application for Dofus ([Ankama Games](https://www.dofus.com/fr)).

> ⚠️ This application is independent from the official Dofus client.

## Stack

- Next.js (React 19)
- TypeScript (strict mode)
- Turbo (monorepo)
- pnpm
- ESLint + Prettier
- i18next

## Architecture

```
apps/web/     # Next.js app
apps/api/     # NestJS API
packages/ui/  # Shared components
```

## Quick Start

```bash
pnpm dev      # Development
pnpm build    # Production build
pnpm lint     # Code linting
```

## Instructions

See specialized instruction files in `.github/instructions/`:

- `typescript-conventions.instructions.md`
- `git-workflow.instructions.md`
- `i18n.instructions.md`
- `commands.instructions.md`
- `quality.instructions.md`
- `checklist.instructions.md`
