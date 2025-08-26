# Git Workflow Instructions

## Commit Format

Use Angular format: `type(scope): description`

## Allowed Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## Branch Naming

Format: `type/issue-number/description`
Example: `feat/50/user-authentication`

## Commit Process

1. Check current branch: `git branch --show-current`
2. Stage all files: `git add --all`
3. Remove console.log statements before commit
4. Commit with structured message using multiple `-m` flags
5. Reference issues with `Close #number`

## Commit Rules

- Write commit messages in English
- Keep first line under 72 characters
- Use multiple `-m` flags for multi-line (not `\n`)
- Never commit directly to `main`
- Don't mention translations if other changes exist
- Create changeset when needed: `pnpm changeset`
