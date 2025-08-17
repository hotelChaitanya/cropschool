# Copilot Instructions for CropSchool

## Project Overview

- **CropSchool** is a monorepo for an educational gaming platform, featuring:
  - Next.js 14 PWA web app (`packages/web`)
  - TypeScript Canvas game engine (`packages/game-engine`)
  - React/React Native UI library (`packages/ui`)
  - Mobile app (`packages/mobile`)
  - Shared utilities/components (`packages/shared`)

## Architecture & Patterns

- **Monorepo**: All packages are in `packages/`. Use local imports (e.g., `@cropschool/game-engine`).
- **Game Engine**: Uses ECS (Entity-Component-System) pattern. Key files: `src/core/`, `src/systems/`, `src/managers/`.
- **UI Library**: Prioritizes accessibility, large touch targets, and child-friendly design. See `src/components/` in `ui`.
- **Web App**: Next.js App Router, Tailwind CSS, PWA via Workbox. Key config: `next.config.js`, `tailwind.config.js`, `public/manifest.json`.
- **Accessibility**: All UIs must meet WCAG AA. Use ARIA, keyboard navigation, and high-contrast modes.

## Developer Workflows

- **Install**: `npm install` at root, then per-package as needed.
- **Build**: `npm run build` in each package or use Nx for orchestration.
- **Dev Servers**:
  - Web: `cd packages/web && npm run dev`
  - Game Engine: `cd packages/game-engine && npm run dev`
  - UI: `cd packages/ui && npm run storybook`
- **Testing**:
  - Game Engine/UI: `npm test` or `npm run test:watch`
  - Type checking: `npm run type-check`
- **Linting**: `npm run lint` (per package)
- **Example Games**: See `packages/game-engine/examples/` for reference implementations.

## Conventions

- **TypeScript strict mode** everywhere.
- **Component-first**: Prefer reusable components/hooks.
- **Accessibility**: Always test with keyboard and screen reader.
- **Commit messages**: Use Conventional Commits.
- **Styling**: Use Tailwind CSS tokens and design system.
- **Testing**: Add/maintain tests for all new features.

## Integration Points

- **Web ↔ Game Engine**: Web app loads games via the engine API.
- **UI Library**: Used by both web and mobile for consistent look/feel.
- **Shared**: Utilities, types, and constants for all packages.

## Key Files/Dirs

- `packages/web/src/app/` – Next.js routes/pages
- `packages/game-engine/src/` – Core engine logic
- `packages/ui/src/components/` – UI components
- `packages/shared/src/` – Shared logic

## Examples

- See `packages/game-engine/examples/MathGame.ts` for a full-featured educational game.
- UI usage: `import { Button, Progress } from '@cropschool/ui'`

---

For more, see each package's `README.md`.
