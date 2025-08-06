# Development Rules - Recipe Sharing App

This document defines the core development principles and guidelines for the Recipe Sharing App project.

## Core Rules

- **Write simple, readable code in TypeScript**
- **Reliability first** - if unsure, don't build it
- **Keep files <200 lines** as possible
- **Test every change**
- **Use clear naming**
- **Think before coding**
- **All files must use TypeScript** (.ts/.tsx extensions)

## Error Fixing

- **Reproduce issue first**
- **Consider multiple causes**
- **Make minimal changes**
- **Always verify fixes**
- **For strange errors, ask user to search Perplexity for latest info**

## Building

- **Understand requirements fully**
- **Plan next steps**
- **Focus one step at a time**
- **Commit frequently**
- **Document changes**
- **Tell user how to test**

## Components

- **Tree structure for clarity**
- **Nest only if exclusive to parent**
- **Shared components go in main folder**
- **Consistent naming**
- **Document nesting decisions**
- **Use .tsx for React components, .ts for utilities**

## File Structure Guidelines

### Frontend (React)
```
client/src/
├── components/          # Shared components
│   ├── ui/             # Basic UI components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── services/           # API services
├── utils/              # Utility functions
└── types/              # TypeScript types
```

### Backend (Node.js)
```
server/src/
├── routes/             # API routes
├── models/             # Database models
├── middleware/         # Express middleware
├── services/           # Business logic
├── utils/              # Utility functions
└── types/              # TypeScript types
```

## Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## Testing Requirements

- **Unit tests** for all utilities and services
- **Component tests** for React components
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Minimum 80% code coverage**

## Documentation Standards

- **README.md** for each major directory
- **JSDoc comments** for all public functions
- **Type definitions** for all data structures
- **API documentation** for all endpoints
- **Deployment guides** for production setup

---

*This document should be referenced by all contributors and AI assistants working on the project.*