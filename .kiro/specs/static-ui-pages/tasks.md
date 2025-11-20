# Implementation Plan

- [x] 1. Initialize Astro project with TypeScript and Tailwind CSS
  - Create new Astro project with TypeScript template
  - Install and configure Tailwind CSS
  - Set up project structure with src/pages, src/components, src/data directories
  - Configure TypeScript strict mode
  - Install React integration for Astro
  - _Requirements: 1.1, 1.5_

- [x] 2. Set up shadcn/ui component library
  - Initialize shadcn/ui in the Astro project
  - Install core components: button, card, input, dialog, tabs, badge, skeleton
  - Configure theme with cursor.directory-inspired light theme colors
  - Set up CSS variables for design tokens
  - Create utils.ts with cn() helper function
  - _Requirements: 1.1, 1.5_

- [x] 3. Create mock data files
  - Create prompts.json with 50+ sample prompts across all 6 categories
  - Create users.json with sample user profiles (regular users and admins)
  - Create categories.json with category definitions and descriptions
  - Create executions.json with sample execution history
  - Create mockData.ts helper functions to load and filter data
  - _Requirements: 2.3, 3.1, 4.1_

- [ ] 4. Build design system foundation
  - [x] 4.1 Configure global styles and typography
    - Set up globals.css with Tailwind imports and custom styles
    - Define typography scale and font families (Inter)
    - Configure color palette with HSL variables
    - Set up spacing and border radius tokens
    - _Requirements: 1.1_

  - [ ]* 4.2 Write property test for design system consistency
    - **Property 1: Design system consistency**
    - **Validates: Requirements 1.1**

  - [x] 4.3 Create reusable layout components
    - Build Header.tsx with navigation and authentication states
    - Build Footer.tsx with links and branding
    - Build Sidebar.tsx for filters
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 4.4 Write property test for component reusability
    - **Property 3: Component reusability**
    - **Validates: Requirements 1.4**

  - [ ]* 4.5 Write property test for interactive feedback
    - **Property 2: Interactive element feedback**
    - **Validates: Requirements 1.2, 3.3, 7.4, 12.1**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Build prompt-related components
  - [x] 6.1 Create PromptCard component
    - Build card component with title, excerpt, category, author, usage stats
    - Add copy and save action buttons with state management
    - Implement hover effects and responsive layout
    - _Requirements: 3.1, 12.1, 12.2_

  - [ ]* 6.2 Write property test for action button feedback
    - **Property 16: Save button state toggling**
    - **Validates: Requirements 12.2**

  - [x] 6.3 Create PromptGrid component
    - Build responsive grid layout for prompt cards
    - Add loading skeleton states
    - Implement empty state display
    - _Requirements: 3.1, 3.5_

  - [ ]* 6.4 Write property test for empty states
    - **Property 15: Empty state consistency**
    - **Validates: Requirements 11.1, 11.5**

  - [x] 6.5 Create PromptDetail component
    - Build detailed prompt view with full content
    - Display metadata (category, tags, author, stats)
    - Add action buttons (copy, save, run)
    - Format prompt content with line breaks
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 6.6 Write property test for data field rendering
    - **Property 6: Data field rendering**
    - **Validates: Requirements 4.1, 4.3, 5.1, 7.3**

  - [ ]* 6.7 Write property test for text formatting
    - **Property 7: Text formatting preservation**
    - **Validates: Requirements 4.4**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build homepage (index.astro)
  - [x] 8.1 Create hero section with value proposition
    - Build hero with headline, description, and CTA buttons
    - Add subtle gradient background
    - Make responsive for mobile, tablet, desktop
    - _Requirements: 2.1, 2.5_

  - [x] 8.2 Create featured categories section
    - Display all 6 categories with icons and descriptions
    - Add navigation links to filtered directory views
    - _Requirements: 2.2_

  - [x] 8.3 Add sample prompts section
    - Display 6-8 featured prompt cards
    - Use PromptGrid component with mock data
    - _Requirements: 2.3_

  - [ ]* 8.4 Write unit test for homepage structure
    - Test hero section renders with CTA buttons
    - Test categories section displays all 6 categories
    - Test sample prompts render
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 8.5 Write property test for navigation functionality
    - **Property 5: Navigation functionality**
    - **Validates: Requirements 2.4**

- [ ] 9. Build directory page (directory/index.astro)
  - [ ] 9.1 Create directory layout with sidebar and grid
    - Build page layout with filter sidebar and prompt grid
    - Integrate Sidebar component with category filters
    - Integrate PromptGrid component with mock prompts
    - _Requirements: 3.1, 3.2_

  - [ ] 9.2 Implement search and filter functionality
    - Add search bar with real-time filtering (React island)
    - Add category filter checkboxes with state management
    - Display active filters with remove buttons
    - Show result count
    - _Requirements: 3.2, 3.3_

  - [ ]* 9.3 Write unit test for directory structure
    - Test search bar and filters render
    - Test prompt grid displays cards
    - Test loading skeleton states
    - _Requirements: 3.1, 3.2, 3.5_

- [ ] 10. Build prompt detail page (directory/[id].astro)
  - [ ] 10.1 Create dynamic route for prompt details
    - Set up [id].astro with getStaticPaths for all prompts
    - Load prompt data from mock data by ID
    - Handle 404 for invalid IDs
    - _Requirements: 4.1_

  - [ ] 10.2 Integrate PromptDetail component
    - Display full prompt with PromptDetail component
    - Wire up copy, save, and run actions
    - Show usage statistics
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 10.3 Write unit test for detail page
    - Test all required fields render
    - Test action buttons present
    - Test statistics display
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Build AI execution modal
  - [ ] 12.1 Create ExecutionModal component
    - Build dialog component with input field for context
    - Add run and cancel buttons
    - Implement loading state during "execution"
    - Display mock results with formatted output
    - Add copy results button
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 12.2 Integrate modal with PromptDetail
    - Wire up "Run Prompt" button to open modal
    - Pass prompt content to modal
    - Simulate AI execution with setTimeout and mock response
    - _Requirements: 10.1, 10.3_

  - [ ]* 12.3 Write unit test for execution modal
    - Test modal opens with input field
    - Test run and cancel buttons present
    - Test loading state displays
    - Test results render with copy button
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 13. Build user profile page (profile.astro)
  - [ ] 13.1 Create profile layout with tabs
    - Display user information (name, email, join date)
    - Create tabs for submitted prompts, favorites, execution history
    - Use shadcn/ui Tabs component
    - _Requirements: 5.1, 5.2_

  - [ ] 13.2 Build submitted prompts tab
    - Display user's submitted prompts with PromptCard
    - Show status badges (pending, approved, rejected)
    - Handle empty state
    - _Requirements: 5.3_

  - [ ]* 13.3 Write property test for status indicators
    - **Property 8: Status indicator visibility**
    - **Validates: Requirements 5.3**

  - [ ] 13.4 Build favorites tab
    - Display saved prompts with PromptCard
    - Add quick access links
    - Handle empty state
    - _Requirements: 5.4_

  - [ ] 13.5 Build execution history tab
    - Display past executions with timestamps
    - Show prompt title, user context, and results
    - Handle empty state
    - _Requirements: 5.2_

  - [ ]* 13.6 Write unit test for profile tabs
    - Test all three tabs render
    - Test empty states for each tab
    - _Requirements: 5.2, 5.4_

- [ ] 14. Build prompt submission form (submit.astro)
  - [ ] 14.1 Create submission form component
    - Build form with fields: title, content, category, tags
    - Add helper text and placeholders for each field
    - Implement form validation with error messages
    - Add submit button with loading state
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ]* 14.2 Write property test for form validation
    - **Property 9: Form validation feedback**
    - **Validates: Requirements 6.2**

  - [ ]* 14.3 Write property test for helper text
    - **Property 10: Form field helper text**
    - **Validates: Requirements 6.5**

  - [ ] 14.4 Implement form submission flow
    - Handle form submit with mock API call
    - Display success confirmation message
    - Reset form after successful submission
    - _Requirements: 6.3_

  - [ ]* 14.5 Write unit test for submission form
    - Test all form fields render
    - Test validation errors display
    - Test success message shows after submit
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Build admin dashboard (admin.astro)
  - [ ] 16.1 Create admin layout and pending queue
    - Build admin-specific layout with distinct styling
    - Display pending prompts in a queue/list
    - Show submission metadata (author, date, category)
    - _Requirements: 7.1, 7.3_

  - [ ] 16.2 Create prompt review component
    - Display full prompt content for review
    - Add approve and reject action buttons
    - Implement visual confirmation on action
    - _Requirements: 7.2, 7.4_

  - [ ]* 16.3 Write property test for admin action buttons
    - **Property 11: Admin action button presence**
    - **Validates: Requirements 7.2**

  - [ ]* 16.4 Write unit test for admin dashboard
    - Test pending queue renders
    - Test approve/reject buttons present
    - Test metadata displays
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 17. Build subscription page (subscribe.astro)
  - [ ] 17.1 Create pricing tiers layout
    - Display free and subscribed pricing tiers
    - Show feature comparison table
    - Highlight differences between tiers
    - _Requirements: 8.1, 8.3_

  - [ ] 17.2 Add CTA buttons for each tier
    - Add prominent CTA button for each pricing tier
    - Style buttons to match cursor.directory aesthetic
    - _Requirements: 8.2_

  - [ ]* 17.3 Write property test for tier CTA buttons
    - **Property 12: Pricing tier CTA buttons**
    - **Validates: Requirements 8.2**

  - [ ] 17.4 Display subscription benefits
    - List all benefits: AI execution, favorites, execution history
    - Use icons and clear descriptions
    - _Requirements: 8.5_

  - [ ]* 17.5 Write unit test for subscription page
    - Test pricing tiers render
    - Test feature comparison displays
    - Test benefits list shows
    - _Requirements: 8.1, 8.3, 8.5_

- [ ] 18. Implement responsive design and mobile optimization
  - [ ] 18.1 Add responsive breakpoints to all pages
    - Test and adjust layouts for mobile (320px-768px)
    - Test and adjust layouts for tablet (768px-1024px)
    - Test and adjust layouts for desktop (1024px+)
    - _Requirements: 1.3, 2.5, 3.4, 4.5, 5.5, 6.4, 8.4, 9.4, 10.5_

  - [ ]* 18.2 Write property test for responsive adaptation
    - **Property 4: Responsive layout adaptation**
    - **Validates: Requirements 1.3, 2.5, 3.4, 4.5, 5.5, 6.4, 8.4, 9.4, 10.5**

  - [ ] 18.3 Implement mobile navigation
    - Add hamburger menu for mobile
    - Make navigation collapsible
    - Ensure touch-friendly tap targets
    - _Requirements: 9.4_

  - [ ] 18.4 Optimize forms for mobile
    - Stack form fields vertically on mobile
    - Increase input sizes for touch
    - Adjust modal sizes for small screens
    - _Requirements: 6.4, 10.5_

- [ ] 19. Implement navigation and routing
  - [ ] 19.1 Complete Header component with all states
    - Show login/signup buttons when not authenticated
    - Show user menu when authenticated
    - Highlight active page in navigation
    - _Requirements: 9.2, 9.3, 9.5_

  - [ ]* 19.2 Write property test for global navigation
    - **Property 13: Global navigation presence**
    - **Validates: Requirements 9.1**

  - [ ]* 19.3 Write property test for active page highlighting
    - **Property 14: Active page highlighting**
    - **Validates: Requirements 9.5**

  - [ ]* 19.4 Write unit test for header states
    - Test unauthenticated state shows login/signup
    - Test authenticated state shows user menu
    - _Requirements: 9.2, 9.3_

- [ ] 20. Add empty states and error pages
  - [ ] 20.1 Create 404 error page
    - Build custom 404 page with helpful message
    - Add navigation options to return to valid pages
    - Include search functionality
    - _Requirements: 11.4_

  - [ ] 20.2 Implement empty states for all lists
    - Add empty state to directory when no prompts match filters
    - Add empty state to favorites tab
    - Add empty state to submission history
    - Ensure consistent pattern with icons and messages
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [ ]* 20.3 Write unit test for error pages and empty states
    - Test 404 page renders with navigation
    - Test empty states for favorites
    - Test empty states for submission history
    - _Requirements: 11.2, 11.3, 11.4_

- [ ] 21. Implement interactive features and state management
  - [ ] 21.1 Add copy to clipboard functionality
    - Implement copy action for prompt cards and detail view
    - Show "Copied!" feedback on button
    - Reset button text after 2 seconds
    - _Requirements: 12.1_

  - [ ] 21.2 Implement save/favorite functionality
    - Add save button state toggling
    - Show filled icon for saved prompts
    - Persist saved state to localStorage
    - _Requirements: 12.2, 12.3_

  - [ ]* 21.3 Write property test for saved prompt indication
    - **Property 17: Saved prompt visual indication**
    - **Validates: Requirements 12.3**

  - [ ] 21.4 Add tooltips to action buttons
    - Implement tooltip component or use shadcn/ui tooltip
    - Add tooltips to all action buttons (copy, save, run)
    - _Requirements: 12.4_

  - [ ]* 21.5 Write property test for tooltips
    - **Property 18: Action button tooltips**
    - **Validates: Requirements 12.4**

- [ ] 22. Ensure accessibility compliance
  - [ ] 22.1 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Test tab order is logical
    - _Requirements: 12.5_

  - [ ]* 22.2 Write property test for keyboard accessibility
    - **Property 19: Keyboard accessibility**
    - **Validates: Requirements 12.5**

  - [ ] 22.3 Add ARIA labels and semantic HTML
    - Add ARIA labels to interactive elements
    - Use semantic HTML elements (nav, main, article, etc.)
    - Add skip navigation link
    - _Requirements: 12.5_

  - [ ]* 22.4 Run accessibility audit
    - Use vitest-axe to check all pages
    - Fix any WCAG 2.1 AA violations
    - Test with screen reader (manual)
    - _Requirements: 12.5_

- [ ] 23. Final polish and optimization
  - [ ] 23.1 Optimize images and assets
    - Use Astro Image component for all images
    - Add appropriate alt text
    - Optimize image sizes for different viewports
    - _Requirements: 1.1_

  - [ ] 23.2 Review and refine cursor.directory aesthetic
    - Ensure consistent spacing and whitespace
    - Verify subtle gradients and shadows
    - Check color palette consistency
    - Refine hover and transition effects
    - _Requirements: 1.1_

  - [ ] 23.3 Test cross-browser compatibility
    - Test on Chrome, Firefox, Safari
    - Fix any browser-specific issues
    - Verify all interactive features work
    - _Requirements: 1.1_

- [ ] 24. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
