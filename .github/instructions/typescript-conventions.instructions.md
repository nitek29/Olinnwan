# TypeScript Conventions

## File Naming

All files use `snake_case` format.

## Import Pattern

Use `@/folder/file.extension` format.

Examples:

```typescript
import { getUserData } from '@/services/user.service.ts';
import UserCard from '@/components/user_card.tsx';
import { GameData } from '@/types/game_data.types.ts';
```

## File Examples

- `user_profile.tsx` (component)
- `auth.service.ts` (service)
- `game_data.types.ts` (types)

## Code Standards

- Use React 19 features
- Prefer functional components with hooks
- Use TypeScript strict mode
- Follow SOLID principles
