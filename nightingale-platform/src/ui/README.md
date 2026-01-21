# Nightingale UI Component Library

## 📋 Overview

Nightingale is a unified, AI-powered health companion that transforms fragmented healthcare and insurance experiences into a cohesive, patient‑centric ecosystem. This UI component library provides the foundation for building the Nightingale patient-facing application, following Google's Material Design 3 principles and accessibility best practices.

**UI/UX Prototype:** [Figma Prototype](https://www.figma.com/make/ZE9lCLysV1oNQ7T9eSsjY1/Integrated-Health-Companion?t=QhrOPWcjreubBu17-1)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- React 19.2+

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd src/ui

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 🏗 Project Structure

```
src/
├── components/         # Reusable UI components (organized by priority)
├── design-system/      # Design tokens, themes, and hooks
├── pages/             # Page-level components
├── layouts/           # Layout components
├── hooks/             # Custom React hooks
├── services/          # API and integration services
├── store/             # State management (Redux slices)
├── utils/             # Utility functions
└── styles/            # Global styles and animations
```

### Key Organizational Principles

1. **Priority-Based Development**: Components are organized by implementation priority (P0-P4)
2. **Atomic Design Influence**: Primitives → Features → Pages progression
3. **Feature-Based Grouping**: Components grouped by Nightingale's 7 core features
4. **TypeScript-First**: Full TypeScript support with strict type checking

## 🎨 Design System

### Design Tokens

All design tokens are centralized in `design-system/tokens/`:

```typescript
// Example token usage
import { colors, spacing, typography } from "@/design-system/tokens";

// Colors: Primary (#1A73E8), Secondary (#34A853), Error (#EA4335), etc.
// Typography: Roboto font with consistent hierarchy
// Spacing: 8px base unit grid system
```

### Material Design 3 Compliance

The UI strictly follows [Material Design 3](https://m3.material.io/) guidelines:

- 8px grid system for all spacing
- Consistent elevation levels (1-5)
- Accessibility-first color palette (4.5:1 minimum contrast ratio)
- Touch targets minimum 48x48px

## ⚙️ Component Development

### Creating a New Component

1. **Determine Priority Level**
   - P0: Foundation (layout, primitives, typography)
   - P1: Core pages and features
   - P2: Complex features and data visualization
   - P3/P4: Polish and advanced features

2. **Follow Component Template**

```typescript
// components/core/ExampleComponent/ExampleComponent.tsx
import React from 'react';
import { ExampleComponentProps } from './ExampleComponent.types';
import styles from './ExampleComponent.module.css';

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  children,
  variant = 'default',
  ...props
}) => {
  return (
    <div
      className={`${styles.container} ${styles[variant]}`}
      role="region"
      aria-label="Example component"
      {...props}
    >
      {children}
    </div>
  );
};

// Always include an index.ts for clean imports
export * from './ExampleComponent';
```

3. **Add to Storybook**

```typescript
// ExampleComponent.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ExampleComponent } from "./ExampleComponent";

const meta: Meta<typeof ExampleComponent> = {
  title: "Core/ExampleComponent",
  component: ExampleComponent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ExampleComponent>;

export const Default: Story = {
  args: {
    children: "Example Content",
  },
};
```

### Accessibility Requirements

All components must meet WCAG 2.1 AA standards:

1. **ARIA Attributes**: Proper roles, labels, and states
2. **Keyboard Navigation**: Full tab navigation support
3. **Focus Management**: Visible focus indicators
4. **Screen Reader Compatibility**: Semantic HTML and proper labeling
5. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components

## 📱 Core Features Implementation

### 1. Unified Health Timeline

- **Components**: `MedicalTimeline`, `TimelineEventCard`, `TimelineFilter`
- **Key Functionality**: Longitudinal care journey visualization with AI-highlighted events
- **Data Integration**: FHIR API for health records, DICOM for imaging

### 2. Health Check-In & Triage

- **Components**: `CheckInStepper`, `SymptomInput`, `RiskAssessment`
- **AI Integration**: MedSigLIP for cross-modal symptom correlation
- **Output**: Risk assessments with insurance-aware recommendations

### 3. Cost Transparency Dashboard

- **Components**: `CostTransparencyChart`, `OutOfPocketEstimator`
- **Real-time Data**: Payer API integration for coverage status
- **Workflow**: Prior authorization tracking and appeals management

### 4. Explain This Feature

- **Components**: `ExplainThisButton`, `ExplanationModal`
- **3-Tier Explanations**: Simple, Detailed, Clinical views
- **AI Backend**: MedGemma 27B for medical translation

## 🔗 State Management

### Redux Slices Structure

```typescript
store/slices/
├── authSlice.ts      # Authentication state
├── userSlice.ts      # User profile and preferences
├── healthDataSlice.ts # Health records and timeline
├── insuranceSlice.ts # Coverage and cost data
└── index.ts          # Root reducer
```

### Usage Example

```typescript
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchHealthData } from '@/store/slices/healthDataSlice';

const MyComponent = () => {
  const healthData = useAppSelector(state => state.healthData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchHealthData());
  }, [dispatch]);

  return <div>{/* Component JSX */}</div>;
};
```

## 🔌 API Integration

### Backend Services

```typescript
services/api/
├── healthData.ts     # FHIR API for health records
├── insuranceApi.ts   # Payer API for coverage data
├── aiModels.ts       # MedGemma, LangExtract integration
└── index.ts
```

### AI Model Integration

The UI integrates with HAI‑DEF model suite:

- **MedGemma (27B)**: Medical translation and explanation
- **LangExtract**: Document parsing and structuring
- **MedASR**: Visit transcription
- **CXR/Derm/Path Models**: Image-based triage

## 🧪 Testing Strategy

### Unit Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Component Testing

- **React Testing Library**: For component behavior
- **Jest**: For unit tests and snapshots
- **Storybook**: For visual testing and documentation

### Accessibility Testing

```bash
# Run automated accessibility tests
npm run test:a11y

# Manual testing tools
# - axe DevTools
# - Lighthouse
# - Screen readers (VoiceOver, NVDA, TalkBack)
```

### Cross-Platform Testing Matrix

```
├── Mobile (iOS Safari, Android Chrome)
├── Tablet (iPadOS, Android tablets)
├── Desktop (Chrome, Safari, Firefox, Edge)
└── Screen Readers (VoiceOver, TalkBack, NVDA, JAWS)
```

## ⚡ Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for heavy components
const HeavyComponent = React.lazy(() => import("./HeavyComponent"));

// Route-based code splitting
const HomePage = React.lazy(() => import("@/pages/HomePage"));
```

### Image Optimization

- Lazy loading for below-the-fold images
- WebP format with fallbacks
- Responsive images with srcset

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check performance with Lighthouse
npm run lighthouse
```

## 📊 Quality Assurance

### Success Metrics

- **Performance**: Page load < 3s, Time to Interactive < 5s
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Usability**: User testing success rate > 85%
- **Consistency**: Design system adherence > 95%
- **Responsiveness**: Works on 99% of target devices

### Code Quality Standards

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run type-check

# Run Prettier formatting
npm run format
```

## 🔄 Development Workflow

### Git Branch Strategy

```
main (protected)
├── develop
│   ├── feature/timeline-enhancements
│   ├── feature/cost-dashboard
│   └── bugfix/accessibility-issues
└── release/v1.0.0
```

### Commit Convention

```
feat: add medical timeline component
fix: resolve keyboard navigation in timeline
docs: update component documentation
style: adjust spacing in cost dashboard
refactor: improve form validation logic
test: add unit tests for risk assessment
chore: update dependencies
```

## 🚨 Error Handling

### API Error States

```typescript
// services/api/errorHandler.ts
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

// UI Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState />;
    }
    return this.props.children;
  }
}
```

### Offline Support

- Service Worker for offline caching
- Local storage for critical data
- Graceful degradation of features

## 📖 Documentation

### Live Documentation

```bash
# Start Storybook
npm run storybook

# Build Storybook for deployment
npm run build:storybook
```

### Component Documentation Requirements

Each component must include:

1. **Props interface** with TypeScript types
2. **Usage examples** in Storybook
3. **Accessibility notes**
4. **Testing guidelines**
5. **Performance considerations**

## 🤝 Contributing

### Development Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Develop** with TDD approach
4. **Test** thoroughly (unit, integration, accessibility)
5. **Document** changes
6. **Submit** pull request

### Code Review Checklist

- [ ] Accessibility requirements met
- [ ] TypeScript types are correct
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Mobile responsiveness verified

## 📞 Support

### Getting Help

- **Documentation**: [Storybook](http://localhost:6006)
- **Design System**: [Figma](https://www.figma.com/make/ZE9lCLysV1oNQ7T9eSsjY1/Integrated-Health-Companion)
- **Issue Tracking**: GitHub Issues

### Common Issues

- **Build issues**: Clear node_modules and run `npm install`
- **Type errors**: Run `npm run type-check` for detailed output
- **Storybook**: Ensure all dependencies are installed

## 📄 License

Proprietary - © Nightingale Health 2024

## 🏆 Credits

Built with ❤️ by the Nightingale UI Team, following Google's Material Design 3 and accessibility-first principles.

---

_Last Updated: October 2024_  
_Version: 1.0.0_  
_React: 19.2_  
_TypeScript: 5.0+_
