# LumoTrade Frontend Architecture

## Overview

This document describes the frontend architecture following **Atomic Design** principles and React best practices.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Market Overview (main page) - orchestration only
│   └── globals.css               # Global styles and theme variables
│
├── components/
│   └── design-system/
│       ├── atoms/                # Smallest, indivisible UI components
│       │   ├── Button.tsx
│       │   ├── Badge.tsx
│       │   ├── Input.tsx
│       │   └── ...
│       │
│       ├── molecules/            # Simple combinations of atoms
│       │   ├── MarketStatusBar.tsx    # Market indicators bar
│       │   ├── AssetCard.tsx          # Individual asset display
│       │   ├── PredictionCard.tsx     # AI prediction card
│       │   ├── ChartCard.tsx          # Chart with header
│       │   └── index.ts               # Barrel export
│       │
│       ├── organisms/            # Complex components (sections, layouts)
│       │   ├── AppShell.tsx           # Main app layout
│       │   ├── AIChatSidebar.tsx      # Chat interface
│       │   ├── AIBriefCard.tsx        # AI brief display
│       │   ├── PredictionsSection.tsx # Predictions grid
│       │   └── index.ts               # Barrel export
│       │
│       └── charts/               # Chart components
│           ├── TradingViewWidget.tsx  # TradingView integration
│           ├── EquityCurveChart.tsx
│           └── index.ts               # Barrel export
│
├── constants/                    # Application constants
│   ├── tickers.tsx               # Ticker mappings and icons
│   ├── market.ts                 # Market-related constants
│   └── index.ts                  # Barrel export
│
├── utils/                        # Utility functions
│   ├── market/
│   │   ├── tickers.ts            # Ticker helper functions
│   │   └── index.ts
│   ├── formatting/
│   │   ├── currency.ts
│   │   ├── dates.ts
│   │   └── numbers.ts
│   └── calculations/
│       └── ...
│
├── hooks/                        # Custom React hooks
│   ├── useMarketIndexes.ts
│   ├── useMarketNews.ts
│   ├── useTodayPrediction.ts
│   └── ...
│
└── lib/                          # Third-party library configs
    ├── utils.ts                  # cn() helper
    └── tanstack-query/
        └── queryClient.ts
```

## Design System Hierarchy

### 📦 Atoms

**Purpose**: Smallest, indivisible building blocks  
**Examples**: Button, Input, Badge, Card  
**Rules**:

- No business logic
- Highly reusable
- Styled with Tailwind CSS
- Accept props for customization

### 🔗 Molecules

**Purpose**: Simple combinations of atoms forming functional units  
**Examples**:

- `MarketStatusBar` - Combines icons, text, and dividers
- `AssetCard` - Combines icon, text, price, mini chart
- `PredictionCard` - Combines ticker info, sentiment badge, charts  
  **Rules**:
- Composed of atoms
- Single responsibility
- Minimal state
- Reusable across pages

### 🏗️ Organisms

**Purpose**: Complex, standalone sections  
**Examples**:

- `AIChatSidebar` - Complete chat interface
- `AIBriefCard` - Full AI insights display
- `PredictionsSection` - Grid of prediction cards with expand/collapse
  **Rules**:
- Composed of molecules and atoms
- Can manage local state
- Represent distinct UI sections
- May fetch data or use hooks

### 📊 Charts

**Purpose**: Data visualization components  
**Location**: `components/design-system/charts/`  
**Examples**: TradingViewWidget, EquityCurveChart, BarChart

## Key Principles

### 1. Separation of Concerns

- **Pages** (`app/page.tsx`): Orchestration and layout only
- **Organisms**: Complex sections with state
- **Molecules**: Reusable UI patterns
- **Atoms**: Basic building blocks

### 2. Data Flow

```
Hooks → Page → Organisms → Molecules → Atoms
        ↓
    Constants & Utils
```

### 3. Import Strategy

Use barrel exports for clean imports:

```typescript
// ❌ Bad
import { AssetCard } from "@/components/design-system/molecules/AssetCard";
import { PredictionCard } from "@/components/design-system/molecules/PredictionCard";

// ✅ Good
import {
  AssetCard,
  PredictionCard,
} from "@/components/design-system/molecules";
```

### 4. Component Documentation

Every component includes JSDoc comments:

```typescript
/**
 * Asset Card Component
 * Displays asset information with price, change, and mini chart
 *
 * @param name - Asset name
 * @param symbol - Trading symbol
 * @param price - Current price
 * @param changePercent - Percentage change
 * @param icon - Asset icon element
 */
export function AssetCard({ ... }) { ... }
```

### 5. TypeScript First

- All components are typed
- Export interfaces for props
- Use constants for type safety

### 6. Performance Optimizations

- Framer Motion for smooth animations
- Dynamic imports for code splitting (where needed)
- Memoization for expensive calculations
- React Query for data caching

## File Naming Conventions

- **Components**: PascalCase (e.g., `AssetCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useMarketIndexes.ts`)
- **Utils**: camelCase (e.g., `getTickerInfo.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAJOR_INDEXES`)
- **Types/Interfaces**: PascalCase (e.g., `AssetCardProps`)

## State Management

### Local State

- Use `useState` for component-specific state
- Keep state close to where it's used

### Global State

- React Query for server state
- Context API for theme, auth
- Props drilling avoided through composition

### Form State

- Controlled components for inputs
- React Hook Form for complex forms

## Styling Guidelines

### Tailwind CSS

- Use utility classes
- Custom classes in `globals.css` for complex animations
- CSS variables for theming
- Responsive design with breakpoints

### Theme System

```css
/* Dark mode via class strategy */
.dark {
  --background: ...;
  --foreground: ...;
}
```

## Testing Strategy (Recommended)

### Unit Tests

- Test utility functions
- Test custom hooks with React Testing Library

### Component Tests

- Test molecules and organisms
- Focus on user interactions
- Mock API calls

### Integration Tests

- Test complete user flows
- E2E with Playwright/Cypress

## Best Practices

### ✅ DO

- Keep components small and focused
- Use TypeScript for type safety
- Document complex logic
- Follow atomic design hierarchy
- Use semantic HTML
- Make components accessible
- Optimize for performance

### ❌ DON'T

- Mix business logic with presentation
- Create deeply nested components
- Duplicate code across components
- Ignore TypeScript warnings
- Hardcode values (use constants)
- Skip prop validation

## Adding New Features

1. **Identify the level**: Is it an atom, molecule, or organism?
2. **Check for reusability**: Can existing components be reused?
3. **Create types**: Define interfaces first
4. **Build component**: Follow the structure
5. **Export**: Add to index.ts barrel file
6. **Document**: Add JSDoc comments
7. **Test**: Write unit/component tests

## Migration Notes

The codebase was refactored from a monolithic `page.tsx` (1270 lines) to a modular architecture:

- **Before**: All logic in one file
- **After**: Organized into atoms, molecules, organisms

### Benefits

- 📦 **Modularity**: Easy to find and update components
- ♻️ **Reusability**: Components used across pages
- 🧪 **Testability**: Easier to test in isolation
- 📚 **Maintainability**: Clear structure and documentation
- 🚀 **Scalability**: Ready for growth
- 👥 **Developer Experience**: Faster onboarding

---

## Quick Reference

| Need to...           | Look in...        |
| -------------------- | ----------------- |
| Add a button style   | `atoms/`          |
| Create a card layout | `molecules/`      |
| Build a page section | `organisms/`      |
| Add a chart          | `charts/`         |
| Define app constants | `constants/`      |
| Add helper functions | `utils/`          |
| Fetch data           | `hooks/`          |
| Style globally       | `app/globals.css` |

---

**Last Updated**: December 2024  
**Architecture Version**: 1.0

