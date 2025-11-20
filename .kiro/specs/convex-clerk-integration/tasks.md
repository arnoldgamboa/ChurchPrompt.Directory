# Implementation Plan

- [x] 1. Set up Convex project structure and schema
  - Initialize Convex in the project with `npx convex dev`
  - Create Convex schema file with all tables (users, prompts, categories, favorites, promptExecutions)
  - Define indexes for efficient querying
  - Configure search indexes for prompt title and content
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Create Convex query functions for data retrieval
  - Implement `getApprovedPrompts` query with category and search filtering
  - Implement `getPromptById` query for single prompt retrieval
  - Implement `getPromptsByAuthor` query for user's submitted prompts
  - Implement `getUserByClerkId` query for user lookup
  - Implement `getCurrentUser` query using Clerk authentication
  - Implement `getCategories` query for category listing
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 3.1, 3.4_

- [x]* 2.1 Write property tests for query functions
  - **Property 19: Approved prompts query filtering** - **Validates: Requirements 7.1**
  - **Property 20: Category filtering accuracy** - **Validates: Requirements 7.2**
  - **Property 21: Search term matching** - **Validates: Requirements 7.3**
  - **Property 22: Prompt ID query accuracy** - **Validates: Requirements 7.4**
  - **Property 23: Prompt display field completeness** - **Validates: Requirements 7.5**

- [x] 3. Create Convex mutation functions for data updates
  - Implement `incrementUsageCount` mutation for tracking prompt copies
  - Implement `incrementExecutionCount` mutation for tracking AI executions
  - Implement internal `createUser` mutation for webhook processing
  - Implement internal `updateUser` mutation for webhook processing
  - Implement internal `deleteUser` mutation for webhook processing
  - _Requirements: 8.1, 8.2, 2.2, 3.2, 3.3_

- [ ]* 3.1 Write property tests for mutation functions
  - **Property 24: Usage count increment on copy** - **Validates: Requirements 8.1**
  - **Property 25: Execution count increment on AI run** - **Validates: Requirements 8.2**
  - **Property 26: Usage statistics display accuracy** - **Validates: Requirements 8.4**

- [x] 4. Implement Clerk webhook handler in Convex
  - Create HTTP router for webhook endpoint
  - Implement webhook signature validation using svix library
  - Handle `user.created` event to create Convex user record
  - Handle `user.updated` event to update Convex user record
  - Handle `user.deleted` event to remove Convex user record
  - Add error handling and logging for webhook failures
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 4.1 Write property tests for webhook processing
  - **Property 4: Clerk user creation syncs to Convex** - **Validates: Requirements 2.2, 9.1**
  - **Property 6: Clerk profile updates sync to Convex** - **Validates: Requirements 3.2, 9.2**
  - **Property 7: Clerk user deletion syncs to Convex** - **Validates: Requirements 3.3, 9.3**
  - **Property 28: Webhook signature validation** - **Validates: Requirements 9.4**

- [x] 5. Create data migration script
  - Write script to read prompts from `src/data/prompts.json`
  - Write script to read categories from `src/data/categories.json`
  - Write script to read users from `src/data/users.json`
  - Implement batch insertion to Convex for each data type
  - Add error handling and progress logging
  - Generate migration summary report
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 5.1 Write property tests for data migration
  - **Property 16: Prompt migration completeness** - **Validates: Requirements 6.2**
  - **Property 17: Category migration completeness** - **Validates: Requirements 6.3**
  - **Property 18: User migration completeness** - **Validates: Requirements 6.4**

- [x] 6. Install and configure Clerk in Astro project
  - [x] Install `@clerk/astro` package
  - [x] Add Clerk environment variables to `.env` file
  - [x] Create Clerk provider in root layout
  - [x] Configure Clerk publishable key
  - [ ] Set up Clerk middleware for route protection
  - _Requirements: 2.1, 2.3, 10.1, 10.2, 11.1, 11.2_

- [x] 7. Implement Clerk authentication middleware
  - [x] Create middleware file to protect routes
  - [x] Define protected route matchers (profile, submit, admin)
  - [x] Define admin route matchers
  - [x] Implement authentication check and redirect logic
  - [x] Implement role-based access control for admin routes
  - [x] Add user context to request for downstream use
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 4.3, 4.4_

- [ ]* 7.1 Write property tests for access control
  - **Property 11: Admin access control** - **Validates: Requirements 4.3**
  - **Property 12: Non-admin access denial** - **Validates: Requirements 4.4, 10.3**
  - **Property 29: Protected route authentication requirement** - **Validates: Requirements 10.2**

- [x] 8. Install and configure Convex in Astro project
  - [x] Install `convex` package
  - [x] Add Convex environment variables to `.env` file
  - [x] Create Convex provider in root layout
  - [x] Configure Convex client with deployment URL
  - [x] Set up Convex React provider for client components
  - _Requirements: 11.1, 11.5_

- [x] 9. Implement anonymous user tracking utilities
  - [x] Create `anonymousTracking.ts` utility file
  - [x] Implement `getAnonymousViewCount` function using localStorage
  - [x] Implement `incrementAnonymousViewCount` function
  - [x] Implement `resetAnonymousViewCount` function for post-registration
  - [x] Implement `hasReachedViewLimit` function (10 view check)
  - [x] Implement `canViewPrompt` function combining auth and limit checks
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 9.1 Write property tests for anonymous tracking
  - **Property 1: Anonymous view count persistence** - **Validates: Requirements 1.1, 1.4**
  - **Property 2: Anonymous view count increment** - **Validates: Requirements 1.2**
  - **Property 3: Anonymous to authenticated transition resets count** - **Validates: Requirements 1.5**

- [x] 10. Create AnonymousViewGuard React component
  - [x] Implement component to wrap prompt viewing
  - [x] Check authentication status using Clerk
  - [x] Check anonymous view limit using tracking utilities
  - [x] Increment view count on prompt view
  - [x] Display sign-up modal when limit reached
  - [x] Reset count when user authenticates
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 11. Update PromptGrid component to use Convex
  - [x] Replace static JSON import with Convex `useQuery` hook
  - [x] Query approved prompts using `getApprovedPrompts`
  - [x] Implement category filtering
  - [x] Implement search functionality
  - [x] Add loading states for query results
  - [x] Add error handling for failed queries
  - _Requirements: 7.1, 7.2, 7.3, 13.1_

- [x] 12. Update PromptDetail component to use Convex
  - [x] Replace static JSON import with Convex `useQuery` hook
  - [x] Query single prompt using `getPromptById`
  - [x] Display all prompt fields (title, content, excerpt, category, author, counts)
  - [x] Implement copy to clipboard with usage tracking
  - [x] Call `incrementUsageCount` mutation on copy
  - [x] Add loading and error states
  - _Requirements: 7.4, 7.5, 8.1, 8.4_

- [ ] 13. Create user profile page with Convex integration
  - Query current user data using `getCurrentUser`
  - Display user information (name, email, role, join date)
  - Query user's submitted prompts using `getPromptsByAuthor`
  - Display submission history with status
  - Add loading and error states
  - Integrate with Clerk user profile component
  - _Requirements: 3.1, 3.4, 3.5_

- [ ]* 13.1 Write property tests for profile data
  - **Property 5: Profile data completeness** - **Validates: Requirements 3.1**
  - **Property 8: User submission history retrieval** - **Validates: Requirements 3.4**

- [ ] 14. Implement role-based UI rendering
  - Check user role from Clerk session
  - Conditionally render admin navigation links
  - Show/hide admin features based on role
  - Display role badge on user profile
  - Implement role update UI for admins (future feature)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 14.1 Write property tests for role management
  - **Property 9: Default role assignment** - **Validates: Requirements 4.1**
  - **Property 10: Role synchronization across systems** - **Validates: Requirements 4.2**

- [ ] 15. Create environment configuration validation
  - Check for required Convex environment variables on startup
  - Check for required Clerk environment variables on startup
  - Display clear error messages for missing variables
  - Create `.env.example` file with all required variables
  - Update README with environment setup instructions
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 16. Run data migration and verify
  - Execute migration script to seed Convex database
  - Verify all prompts migrated correctly in Convex dashboard
  - Verify all categories migrated correctly
  - Verify all users migrated correctly
  - Check for any migration errors in logs
  - Update prompt counts for categories
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 17. Configure Clerk webhook in dashboard
  - Log in to Clerk dashboard
  - Navigate to webhooks section
  - Add new webhook endpoint with Convex HTTP action URL
  - Select user events to subscribe to (created, updated, deleted)
  - Copy webhook signing secret to environment variables
  - Test webhook delivery with test event
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 18. Implement error boundaries and fallbacks
  - Create error boundary component for React islands
  - Add error handling to all Convex queries
  - Display user-friendly error messages
  - Log technical errors to console
  - Add retry mechanisms for failed operations
  - Implement offline detection and messaging
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 19. Add loading states and skeletons
  - Create skeleton components for prompt cards
  - Create skeleton for prompt detail page
  - Create skeleton for user profile
  - Show loading states during Convex queries
  - Add loading indicators for mutations
  - Implement optimistic updates where appropriate
  - _Requirements: 7.1, 7.4, 3.1_

- [x] 20. Update authentication UI components
  - [x] Create sign-in page with Clerk SignIn component
  - [x] Create sign-up page with Clerk SignUp component
  - [x] Add sign-out button to navigation
  - [x] Display user avatar and name when authenticated
  - [x] Add authentication status indicators
  - [ ] Style Clerk components to match app design
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 21. Implement prompt sorting by popularity
  - Add sort parameter to `getApprovedPrompts` query
  - Implement sorting by usageCount descending
  - Add UI controls for sort selection
  - Update PromptGrid to use sort parameter
  - Display sort indicator in UI
  - _Requirements: 8.5_

- [ ]* 21.1 Write property test for sorting
  - **Property 27: Popularity sorting order** - **Validates: Requirements 8.5**

- [ ] 22. Create comprehensive field validation tests
  - **Property 13: Prompt creation field completeness** - **Validates: Requirements 5.2**
  - **Property 14: Category query field completeness** - **Validates: Requirements 5.3**
  - **Property 15: User record field completeness** - **Validates: Requirements 5.4**

- [ ] 23. Final integration testing and verification
  - Test complete anonymous user flow (view 10 prompts, register)
  - Test complete authenticated user flow (sign in, browse, copy prompts)
  - Test admin user flow (sign in, access admin dashboard)
  - Verify webhook synchronization (create user in Clerk, check Convex)
  - Test real-time updates across multiple browser tabs
  - Verify all environment variables are properly configured
  - Check error handling for various failure scenarios
  - _Requirements: All_

- [ ] 24. Documentation and deployment preparation
  - Update README with setup instructions
  - Document environment variables
  - Document Convex deployment process
  - Document Clerk configuration steps
  - Document migration process
  - Create troubleshooting guide
  - Prepare deployment checklist
  - _Requirements: 11.1, 11.2, 11.3_
