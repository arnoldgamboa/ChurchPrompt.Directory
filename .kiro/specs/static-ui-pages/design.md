# Design Document

## Overview

The static UI pages feature establishes the visual foundation for the Church Prompt Directory Platform. This design focuses on creating a comprehensive set of responsive, accessible page layouts and reusable components using modern web technologies. The implementation will use Astro for static site generation with React components for interactivity, shadcn/ui for the component library, and Tailwind CSS for styling. All pages will be populated with mock data to demonstrate user flows and interactions without requiring backend integration.

The design follows the aesthetic of cursor.directory with a light theme—featuring a clean, modern interface with subtle gradients, generous whitespace, and a focus on content readability. The interface should feel professional yet approachable, reducing cognitive load for church leaders who may not be technically sophisticated, while providing efficient workflows for power users and administrators.

## Architecture

### Technology Stack

- **Framework**: Astro 4.x for static site generation with partial hydration
- **UI Library**: React 18 with TypeScript for interactive components (islands architecture)
- **Component Library**: shadcn/ui for accessible, customizable components built on Radix UI
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **Mock Data**: JSON files in `/src/data` directory for static content
- **Type Safety**: TypeScript strict mode throughout

### Project Structure

```
/src
  /pages
    /index.astro              # Homepage
    /directory
      /index.astro            # Prompt directory listing
      /[id].astro             # Prompt detail page
    /subscribe.astro          # Subscription pricing page
    /profile.astro            # User profile page
    /submit.astro             # Prompt submission form
    /admin.astro              # Admin moderation dashboard
    /404.astro                # 404 error page
  /components
    /ui                       # shadcn/ui components
      /button.tsx
      /card.tsx
      /input.tsx
      /dialog.tsx
      /tabs.tsx
      /badge.tsx
      /skeleton.tsx
    /prompts
      /PromptCard.tsx         # Interactive prompt card
      /PromptGrid.tsx         # Grid layout for prompts
      /PromptDetail.tsx       # Detailed prompt view
    /layout
      /Header.tsx             # Global navigation header
      /Footer.tsx             # Global footer
      /Sidebar.tsx            # Filter sidebar
  /data
    /prompts.json             # Mock prompt data
    /users.json               # Mock user data
    /categories.json          # Category definitions
  /lib
    /mockData.ts              # Helper functions for mock data
    /utils.ts                 # Utility functions (cn, etc.)
  /styles
    /globals.css              # Global styles and Tailwind imports
/public
  /images                     # Static images and assets
```

### Routing Strategy

The application uses Astro's file-based routing with static page generation:
- All pages are pre-rendered at build time as static HTML
- Interactive components (filters, modals, forms) use React islands with `client:load` or `client:visible` directives
- Authentication state is simulated with client-side state management
- Dynamic routes use Astro's `[id].astro` pattern for prompt detail pages

### Islands Architecture

Astro's islands architecture allows selective hydration of interactive components:
- **Static by default**: Most content renders as static HTML
- **Interactive islands**: Only components needing interactivity (filters, modals, forms) are hydrated
- **Performance benefit**: Minimal JavaScript shipped to the client
- **Hydration strategies**:
  - `client:load` - Hydrate immediately on page load (critical interactions)
  - `client:visible` - Hydrate when component enters viewport (below-fold content)
  - `client:idle` - Hydrate when browser is idle (non-critical features)

## Components and Interfaces

### Design System Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

Provides consistent button styling across the application with variants for different contexts (CTAs, secondary actions, subtle interactions).

#### Card Component
```typescript
interface CardProps {
  children: React.ReactNode;
  variant: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}
```

Container component for grouping related content with consistent spacing and elevation.

#### Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'textarea';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
}
```

Form input with built-in label, validation state, and error messaging.

#### Modal Component
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

Accessible modal dialog for execution interface, confirmations, and forms.

### Prompt Components

#### PromptCard Component
```typescript
interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    usageCount: number;
    executionCount: number;
    isFavorite: boolean;
  };
  onCopy: (id: string) => void;
  onSave: (id: string) => void;
  onView: (id: string) => void;
}
```

Displays prompt summary in grid layouts with quick actions.

#### PromptDetail Component
```typescript
interface PromptDetailProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    author: string;
    authorId: string;
    usageCount: number;
    executionCount: number;
    createdAt: string;
    isFavorite: boolean;
  };
  onCopy: () => void;
  onSave: () => void;
  onRun: () => void;
  isSubscribed: boolean;
}
```

Full prompt display with metadata and action buttons.

#### PromptGrid Component
```typescript
interface PromptGridProps {
  prompts: PromptCardProps['prompt'][];
  isLoading?: boolean;
  emptyMessage?: string;
}
```

Responsive grid layout for prompt cards with loading and empty states.

### Layout Components

#### Header Component
```typescript
interface HeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userName?: string;
  onLogin: () => void;
  onLogout: () => void;
}
```

Global navigation header with responsive menu and authentication state.

#### Sidebar Component
```typescript
interface SidebarProps {
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}
```

Filter sidebar for directory page with category selection.

## Data Models

### Mock Data Structures

#### Prompt
```typescript
interface Prompt {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: 'pending' | 'approved' | 'rejected';
  usageCount: number;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isSubscribed: boolean;
  joinedAt: string;
  promptViewCount: number;
}
```

#### Category
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  promptCount: number;
}
```

#### Execution (for history display)
```typescript
interface Execution {
  id: string;
  promptId: string;
  promptTitle: string;
  userContext: string;
  result: string;
  executedAt: string;
}
```

### Mock Data Files

Mock data will be stored in JSON files and imported into components:

- `prompts.json` - 50+ sample prompts across all categories
- `users.json` - Sample user profiles including admin accounts
- `categories.json` - All 6 category definitions
- `executions.json` - Sample execution history entries

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Design system consistency
*For any* page in the Platform, all typography, colors, and spacing should conform to the defined design system tokens
**Validates: Requirements 1.1**

### Property 2: Interactive element feedback
*For any* interactive element (button, input, link, filter), user interaction should provide consistent visual feedback through state changes
**Validates: Requirements 1.2, 3.3, 7.4, 12.1**

### Property 3: Component reusability
*For any* component instance rendered in different contexts, the styling and behavior should remain identical
**Validates: Requirements 1.4**

### Property 4: Responsive layout adaptation
*For any* page or component, rendering at different viewport widths (mobile, tablet, desktop) should adapt the layout appropriately without breaking visual hierarchy
**Validates: Requirements 1.3, 2.5, 3.4, 4.5, 5.5, 6.4, 8.4, 9.4, 10.5**

### Property 5: Navigation functionality
*For any* navigation link, clicking it should navigate to the corresponding page
**Validates: Requirements 2.4**

### Property 6: Data field rendering
*For any* data object (prompt, user, submission), all required fields should be rendered when the object is displayed
**Validates: Requirements 4.1, 4.3, 5.1, 7.3**

### Property 7: Text formatting preservation
*For any* prompt content with line breaks and formatting, the rendered output should preserve the original formatting
**Validates: Requirements 4.4**

### Property 8: Status indicator visibility
*For any* prompt with a status (pending, approved, rejected), the status indicator should be visible in the UI
**Validates: Requirements 5.3**

### Property 9: Form validation feedback
*For any* required form field that is invalid or empty, real-time validation feedback should be displayed
**Validates: Requirements 6.2**

### Property 10: Form field helper text
*For any* form field, helper text or placeholder examples should be present
**Validates: Requirements 6.5**

### Property 11: Admin action button presence
*For any* pending prompt in the admin dashboard, approve and reject action buttons should be visible
**Validates: Requirements 7.2**

### Property 12: Pricing tier CTA buttons
*For any* pricing tier on the subscription page, a call-to-action button should be present
**Validates: Requirements 8.2**

### Property 13: Global navigation presence
*For any* page, the header should contain navigation links to home, directory, profile, and submit prompt
**Validates: Requirements 9.1**

### Property 14: Active page highlighting
*For any* page being viewed, the corresponding navigation link should be highlighted as active
**Validates: Requirements 9.5**

### Property 15: Empty state consistency
*For any* empty list or collection, a consistent empty state pattern with icon and actionable message should be displayed
**Validates: Requirements 11.1, 11.5**

### Property 16: Save button state toggling
*For any* save/favorite button, clicking it should toggle the visual state between saved and unsaved
**Validates: Requirements 12.2**

### Property 17: Saved prompt visual indication
*For any* prompt that is saved, the save icon should display in the filled state
**Validates: Requirements 12.3**

### Property 18: Action button tooltips
*For any* action button, hovering over it should display a tooltip explaining the action
**Validates: Requirements 12.4**

### Property 19: Keyboard accessibility
*For any* interactive element (button, link, input), it should be accessible and operable via keyboard navigation
**Validates: Requirements 12.5**

## Error Handling

### Client-Side Error Handling

Since this is a static UI implementation without backend integration, error handling focuses on user input validation and graceful degradation:

**Form Validation Errors**
- Display inline error messages below invalid fields
- Prevent form submission until all required fields are valid
- Show field-level errors in red with descriptive messages
- Maintain error state until user corrects the input

**Navigation Errors**
- Display custom 404 page for invalid routes
- Provide navigation options to return to valid pages
- Include search functionality on error pages

**Loading States**
- Show skeleton loaders while mock data is being "fetched"
- Simulate network delays with setTimeout for realistic UX
- Provide loading indicators for async operations (copy, save actions)

**Empty States**
- Display helpful messages when no data is available
- Provide actionable next steps (e.g., "Submit your first prompt")
- Include relevant icons to make empty states visually clear

### User Feedback

**Success States**
- Show confirmation messages for successful actions (form submission, copy, save)
- Use toast notifications for non-blocking feedback
- Provide visual state changes (button text changes, icon fills)

**Interactive Feedback**
- Hover states for all clickable elements
- Focus states for keyboard navigation
- Active states for button presses
- Disabled states for unavailable actions

## Testing Strategy

### Unit Testing

Unit tests will verify individual component rendering and behavior using Vitest and React Testing Library:

**Component Rendering Tests**
- Test that components render with correct props
- Verify conditional rendering based on props
- Check that event handlers are called correctly
- Validate accessibility attributes (ARIA labels, roles)

**Example Unit Tests**
- Button component renders with correct variant classes
- PromptCard displays all required fields
- Modal opens and closes correctly
- Form inputs update state on change
- Navigation highlights active page

**Interaction Tests**
- Copy button changes text to "Copied!" on click
- Save button toggles between saved/unsaved states
- Filter checkboxes update selected state
- Form validation shows errors for invalid inputs

### Property-Based Testing

Property-based tests will verify universal behaviors across all component instances using fast-check library:

**Test Configuration**
- Minimum 100 iterations per property test
- Generate random component props within valid ranges
- Test edge cases (empty strings, maximum lengths, special characters)

**Property Test Categories**

1. **Design System Properties**
   - Generate random pages and verify design token consistency
   - Test that all interactive elements have required feedback states
   - Verify component styling remains consistent across contexts

2. **Data Rendering Properties**
   - Generate random data objects and verify all fields render
   - Test that text formatting is preserved for any content
   - Verify status indicators appear for any status value

3. **Responsive Properties**
   - Generate random viewport widths and verify layout adaptation
   - Test that no content overflows or breaks at any viewport size
   - Verify touch targets meet minimum size requirements on mobile

4. **Accessibility Properties**
   - Generate random components and verify keyboard navigation works
   - Test that all interactive elements have focus indicators
   - Verify ARIA attributes are present for any component type

5. **Form Validation Properties**
   - Generate random invalid inputs and verify validation feedback
   - Test that any required field shows error when empty
   - Verify helper text is present for any form field

6. **Empty State Properties**
   - Generate random empty collections and verify consistent empty states
   - Test that empty states always include actionable messages

### Visual Regression Testing

While not automated in the initial implementation, visual regression testing should be considered for:
- Screenshot comparison across viewport sizes
- Component visual consistency across pages
- Design system token application

### Accessibility Testing

Automated accessibility testing using vitest-axe:
- Run axe checks on all page renders
- Verify WCAG 2.1 AA compliance
- Test keyboard navigation flows
- Validate color contrast ratios
- shadcn/ui components provide baseline accessibility

### Manual Testing Checklist

- [ ] Test all pages on Chrome, Firefox, Safari
- [ ] Verify responsive behavior on actual mobile devices
- [ ] Test keyboard navigation through all interactive flows
- [ ] Verify screen reader compatibility
- [ ] Check color contrast in light/dark modes (if applicable)
- [ ] Test with browser zoom at 200%
- [ ] Verify touch interactions on tablet devices

## Implementation Notes

### Visual Design System (cursor.directory inspired)

The design follows cursor.directory's aesthetic with these key characteristics:

**Color Palette**
- Light theme with subtle gradients
- Neutral grays for text and backgrounds
- Accent colors for CTAs and interactive elements
- Soft shadows for depth and elevation

**Typography**
- Clean, modern sans-serif font (Inter or similar)
- Clear hierarchy with varied font weights
- Generous line height for readability
- Subtle text colors (not pure black)

**Layout**
- Generous whitespace and padding
- Card-based design with subtle borders
- Grid layouts with consistent gaps
- Centered content with max-width containers

**Interactive Elements**
- Subtle hover effects with transitions
- Rounded corners on buttons and cards
- Soft shadows that lift on hover
- Clear focus states for accessibility

**Visual Hierarchy**
- Large, bold headings for sections
- Subtle dividers between content areas
- Icon usage for visual interest
- Consistent spacing rhythm

### Mock Data Strategy

Mock data should be realistic and comprehensive:
- Include edge cases (long titles, special characters, empty fields)
- Provide sufficient variety across categories (50+ prompts)
- Include different user roles and subscription states
- Simulate realistic usage statistics
- Use church-specific content (sermon prep, pastoral care, etc.)

### State Management

For interactive islands, use React's built-in state management:
- `useState` for component-level state (modals, forms, filters)
- Props for passing data from Astro to React components
- Local storage for persisting user preferences (filter selections)
- Simulated authentication state with localStorage

### Performance Considerations

- Astro generates static HTML for optimal performance
- Only interactive components ship JavaScript (islands)
- Optimize images with Astro's Image component
- Minimize bundle size with selective hydration
- Use `client:visible` for below-fold interactive content
- Lazy load images and defer non-critical resources

### Accessibility Requirements

- All interactive elements must have visible focus indicators
- Color cannot be the only means of conveying information
- All images must have alt text
- Form inputs must have associated labels
- Heading hierarchy must be logical (h1 → h2 → h3)
- Skip navigation link for keyboard users
- ARIA landmarks for page regions
- shadcn/ui components provide built-in accessibility

### Design Tokens

Define consistent design tokens in Tailwind config following cursor.directory style:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

### shadcn/ui Integration

1. **Installation**: Initialize shadcn/ui in the Astro project
2. **Component selection**: Install only needed components (button, card, input, dialog, tabs, badge, skeleton)
3. **Customization**: Modify component styles to match cursor.directory aesthetic
4. **React islands**: Use shadcn components within React islands for interactivity
5. **Theming**: Configure light theme with CSS variables

### Component Development Guidelines

1. **Astro-first** - Use Astro components for static content, React only for interactivity
2. **Islands architecture** - Minimize JavaScript by using appropriate hydration strategies
3. **shadcn/ui components** - Leverage pre-built accessible components, customize as needed
4. **Mobile-first** - Design and develop for mobile viewports first, then enhance for larger screens
5. **TypeScript strict mode** - Use strict TypeScript to catch errors early
6. **Consistent naming** - Use clear, descriptive names for components, props, and functions
7. **Documentation** - Add JSDoc comments for complex components and functions
