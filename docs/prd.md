# Church Prompt Directory Platform - MVP

## Overview

A specialized prompt directory platform designed for churches, church leaders, and staff to share, discover, and utilize AI prompts for various ministry tasks. The platform enables community-driven content creation while maintaining quality through admin moderation, with subscription-based access powered by Polar.


## MVP Scope

The Minimum Viable Product focuses on core functionality to validate the platform concept with real church users. The MVP enables the complete user journey from registration to prompt discovery and usage, with essential community contribution features.

### MVP Includes

**Core User Journey:**
- Anonymous users can view up to 10 prompts without account
- After 10 prompts, users must create free account via Clerk
- Free account users: Browse all prompts, copy to clipboard
- Subscribed users: All free features PLUS run prompts in-app with AI
- Browse prompts by category (all 6 categories)
- Search prompts by title and content
- Copy prompts to clipboard with usage tracking
- Save favorite prompts for quick access (subscribed users)
- View user profile with submission history

**Community Contribution:**
- Submit new prompts with title, content, category, and tags
- Track submission status (pending/approved/rejected)
- Edit own approved prompts (triggers re-approval)

**Admin Moderation:**
- Admin dashboard with pending submissions queue
- Approve or reject submitted prompts
- Basic content moderation tools

**Essential Features:**
- Responsive design (desktop, tablet, mobile)
- Basic usage analytics (copy count, execution count per prompt)
- Email notifications for submission status
- Role-based access control (User, Admin)
- AI prompt execution via OpenRouter (Perplexity Sonar) for subscribed users
- Execution history tracking

### MVP Excludes (Post-Launch)

**Deferred to validate core value first:**
- User ratings and reviews for prompts
- Comments and discussions on prompts
- Advanced analytics dashboard
- Prompt versioning and edit history
- Prompt collections or bundles
- AI-powered recommendations
- Multi-language support
- API access for third-party integrations
- Advanced search filters (date range, author, etc.)
- Bulk operations (bulk approve, bulk delete)
- Custom user roles beyond User/Admin
- Social sharing features
- Email digest notifications
- **Prompt generator tool** - AI-assisted prompt creation with run/copy options (post-MVP)

### MVP Success Criteria

The MVP is successful if within 3 months:
- 100+ registered users
- 50+ approved prompts across all categories
- 500+ prompt copies (usage)
- 20+ active contributors (submitted at least one prompt)
- 60%+ prompt approval rate
- Average review time under 48 hours

## Problem Statement

Church leaders and staff need effective AI prompts for their daily ministry work, but creating quality prompts from scratch is time-consuming. There's no centralized, church-focused resource where ministry professionals can discover, share, and learn from proven AI prompts tailored to their unique needs across sermon preparation, pastoral care, administration, and other church activities.

## Jobs to be Done

**When** a church leader needs to accomplish a ministry task using AI
**I want to** quickly find proven, church-specific prompts that others have successfully used
**So I can** save time, learn effective prompt patterns, and focus on ministry rather than prompt engineering

**When** I discover a useful AI prompt for church work
**I want to** share it with the broader church community
**So I can** help other ministry leaders work more effectively and contribute to collective knowledge

**When** I'm new to using AI in ministry
**I want to** explore categorized prompts and see what others find valuable
**So I can** learn best practices and standardize my AI workflows

## User Types

### Registered Users (Primary)
- Church leaders (pastors, elders, deacons)
- Church staff (administrators, communications, worship leaders)
- Ministry volunteers with staff-level responsibilities
- Can submit prompts, save favorites, view all approved content
- Require subscription for full platform access

### Administrators
- Platform moderators who review and approve submitted prompts
- Manage user accounts and content quality
- Monitor platform health and usage analytics

### Anonymous Visitors
- Can browse public landing pages and sample prompts
- Cannot access full directory or submit content
- Encouraged to register for full access

## Core Features

### Prompt Discovery & Search
- **Browse by Category**: Organized sections for each prompt type
  - Sermon Preparation & Research
  - Administrative Tasks & Communications
  - Pastoral Care & Counseling Guidance
  - Social Media & Marketing Content
  - Event Planning & Coordination
  - Teaching & Curriculum Development
- **Search Functionality**: Full-text search across prompt titles, descriptions, and tags
- **Filter Options**: By category, popularity, recent additions, user ratings
- **Copy to Clipboard**: One-click copy functionality for each prompt
- **Usage Analytics Display**: Show prompt popularity and usage statistics


### AI Prompt Execution (Subscribed Users)
- **Run Prompt in App**: Execute prompts directly within the platform using AI
- **AI Provider**: Perplexity Sonar via OpenRouter API
- **Execution Interface**: Input field for user context/variables, run button, results display
- **Execution Tracking**: Track execution count per prompt
- **Execution History**: Users can view their past prompt executions
- **Results Display**: Show AI-generated results with formatting
- **Copy Results**: One-click copy of AI-generated output
- **Execution Limits**: Rate limiting to prevent abuse (e.g., 100 executions per day)

### User Profiles
- **Profile Page**: Display user's submitted prompts and contribution history
- **Favorites/Bookmarks**: Save prompts for quick access later
- **Submission History**: Track submitted prompts and their approval status
- **Personal Dashboard**: View saved prompts, submission status, and account details

### Prompt Submission & Moderation
- **Submission Form**: Registered users can submit new prompts with:
  - Prompt title
  - Prompt text/content
  - Category selection
  - Tags for discoverability
  - Usage context/instructions
  - Example outputs (optional)
- **Pre-Approval Workflow**: All submissions enter admin review queue
- **Admin Review Interface**: Admins can approve, reject, or request edits
- **Submission Status**: Users can track their submission status (pending, approved, rejected)
- **Edit Capability**: Users can edit their own approved prompts (requires re-approval)

### Subscription & Access Control
- **Anonymous Access**: View up to 10 prompts without account, then prompted to create free account
- **Free Account**: Browse all prompts, copy to clipboard, submit prompts for approval
- **Subscription Tier**: All free features PLUS run prompts in-app with AI, save favorites, view execution history, priority support
- **Polar Integration**: Handle subscription payments, billing, and access management
- **Subscription Management**: Users can upgrade, downgrade, or cancel subscriptions

## Technical Requirements

### Authentication & Authorization (Clerk)
- **User Management**: Clerk handles all user registration, login, and profile management
- **Authentication Methods**: Email/password, social login (Google, GitHub)
- **Email Verification**: Clerk's built-in email verification for new accounts
- **Session Management**: Clerk manages secure sessions and tokens
- **Role-Based Access Control**: Custom user metadata for roles (User, Admin)
- **Subscription Status**: Store subscription status in Clerk user metadata for access control
- **Protected Routes**: Clerk middleware protects authenticated and subscription-required pages
- **Webhooks**: Clerk webhooks sync user events (signup, deletion) with Convex database

### Data Model
- **Users**: Clerk user ID (primary key), role, subscription status, prompt_views_count (for anonymous tracking), created_at, updated_at
  - Note: Clerk manages core user data (email, name, profile); Convex stores app-specific data
- **Prompts**: Title, content, category, tags, author, status (pending/approved/rejected), usage_count (copies), execution_count (AI runs), created_at, updated_at
- **PromptExecutions**: Execution ID, prompt ID, user ID, input_context, ai_response, created_at (for execution history)
- **Favorites**: User-prompt relationships for bookmarking
- **Categories**: Predefined prompt categories with descriptions
- **Subscriptions**: User subscription status, plan type, billing information (via Polar)

### API Requirements
- **Prompt Endpoints**:
  - GET /api/prompts - List approved prompts (with filters)
  - GET /api/prompts/:id - Get single prompt details
  - POST /api/prompts - Submit new prompt (authenticated)
  - PUT /api/prompts/:id - Update own prompt (authenticated)
  - DELETE /api/prompts/:id - Delete own prompt (authenticated)
  - POST /api/prompts/:id/copy - Track prompt usage
- **User Endpoints**:
  - GET /api/users/me - Get current user profile
  - PUT /api/users/me - Update profile
  - GET /api/users/:id/prompts - Get user's submitted prompts
- **Favorites Endpoints**:
  - GET /api/favorites - Get user's saved prompts
  - POST /api/favorites - Add prompt to favorites
  - DELETE /api/favorites/:id - Remove from favorites
- **Admin Endpoints**:
  - GET /api/admin/prompts/pending - Get pending submissions
  - PUT /api/admin/prompts/:id/approve - Approve prompt
  - PUT /api/admin/prompts/:id/reject - Reject prompt

- **AI Execution Endpoints**:
  - POST /api/prompts/:id/execute - Execute prompt with AI (authenticated, subscribed only)
  - GET /api/executions/history - Get user's execution history
  - GET /api/executions/:id - Get single execution result

### Performance & Scale
- Support 1,000+ concurrent users browsing prompts
- Search results return within 500ms
- Prompt copy action completes instantly
- Handle 100+ prompt submissions per day
- Analytics updates process within 5 minutes

### Security & Compliance


### AI Integration (OpenRouter)
- **API Provider**: OpenRouter for unified AI model access
- **AI Model**: Perplexity Sonar for prompt execution
- **API Key Management**: Secure storage of OpenRouter API key
- **Rate Limiting**: Prevent abuse of AI execution (100 executions/day per user)
- **Cost Tracking**: Monitor API usage and costs
- **Error Handling**: Graceful handling of API failures and timeouts
- **Response Streaming**: Stream AI responses for better UX (optional)
- Secure authentication with encrypted passwords
- HTTPS for all connections
- Content moderation to prevent inappropriate submissions
- User data privacy and GDPR compliance considerations
- Rate limiting on API endpoints to prevent abuse

## User Experience Requirements

### Prompt Display
- **Card Layout**: Grid of prompt cards showing title, category, author, usage count
- **Detail View**: Full prompt content, usage instructions, copy button, save button
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Show skeleton loaders while fetching prompts
- **Empty States**: Helpful messages when no prompts match filters

### Submission Flow
1. User clicks "Submit Prompt" from navigation
2. Form displays with required fields and category selection
3. User fills in prompt details and submits
4. Confirmation message: "Your prompt has been submitted for review"
5. User can track submission status in their profile
6. Email notification when prompt is approved or rejected

### Search & Filter Experience
- Search bar prominently displayed at top of directory
- Filter sidebar with category checkboxes
- Real-time results update as filters change
- Clear active filters with remove buttons
- Result count displayed ("Showing 45 prompts")


### AI Execution Experience (Subscribed Users)
- Prominent "Run Prompt" button on prompt detail page
- Input modal for user context/variables
- Loading state during AI execution
- Results displayed in formatted text area
- Copy results button
- Execution history accessible from user profile
- Clear error messages for API failures
- Rate limit warnings when approaching limit

### Copy Interaction
- Copy button on each prompt card and detail view
- Visual feedback on click (button changes to "Copied!")
- Prompt text copied to clipboard
- Usage count increments (visible after refresh)

## Success Metrics

### User Engagement
- Active monthly users (target: 500+ in first 6 months)
- Prompt submissions per week (target: 20+ after 3 months)
- Prompts copied per day (target: 100+ after 3 months)
- User retention rate (target: 60% monthly active users)

### Community Growth
- New user registrations per month
- Subscription conversion rate (target: 30% of registered users)
- Prompt diversity across all categories
- User-submitted prompts vs. admin-created ratio

### Content Quality
- Prompt approval rate (target: 70%+ approved)
- Average time to review submissions (target: <48 hours)
- User satisfaction with prompt quality
- Repeat usage of individual prompts

## Out of Scope (Deferred for Future Versions)

### Features Deferred
- **User ratings and reviews for prompts** - Basic usage analytics sufficient for MVP. Add when users request quality feedback mechanisms or we have 500+ prompts.
- **Advanced analytics dashboard** - Basic usage counts cover current needs. Build detailed analytics when we have 6+ months of usage data or users request custom reports.
- **Prompt versioning and history** - Edit and re-approval workflow handles current needs. Add version control when users report needing to track prompt evolution or revert changes.
- **Social features (comments, discussions)** - Focus on core directory functionality first. Add community features when we have 1,000+ active users or users request collaboration tools.
- **API access for third-party integrations** - Web interface sufficient for MVP. Provide API when external tools request integration or we have 5+ integration requests.
- **Multi-language support** - English-only for MVP. Add internationalization when 20%+ of traffic comes from non-English regions.
- **Prompt collections/bundles** - Individual prompts meet current needs. Add collections when users report organizing 50+ saved prompts or request curated sets.
- **AI-powered prompt suggestions** - Manual search and browse adequate for MVP. Add AI recommendations when catalog exceeds 500 prompts or users report discovery challenges.

### Technical Complexity Deferred
- **Real-time collaboration features** - Async submission and approval sufficient for current workflow. Add real-time updates when multiple admins report conflicts or we have 10+ concurrent moderators.
- **Advanced search with NLP** - Basic full-text search adequate for less than 1,000 prompts. Add semantic search when catalog exceeds 2,000 prompts or search satisfaction drops below 70%.
- **CDN for global performance** - Single-region deployment handles current user base. Add CDN when 30%+ of users are international or page load times exceed 3 seconds.
- **Elasticsearch for search** - Database full-text search sufficient for less than 1,000 prompts. Add Elasticsearch when catalog exceeds 5,000 prompts or search latency exceeds 1 second.
- **Microservices architecture** - Monolith appropriate for current team size and deployment cadence. Split services when we have multiple teams deploying independently or clear service boundaries emerge.

## Acceptance Criteria

### Prompt Discovery
- **Given** I am a subscribed user on the directory homepage
- **When** I browse prompts
- **Then** I see prompts organized by category with title, author, and usage count

- **Given** I am viewing the prompt directory
- **When** I enter a search term
- **Then** results filter in real-time showing matching prompts

- **Given** I am viewing a prompt detail page
- **When** I click the copy button
- **Then** the prompt text is copied to my clipboard and the button shows "Copied!"

### User Registration & Subscription
- **Given** I am a new visitor
- **When** I register and verify my email
- **Then** I can log in but see a subscription prompt to access full directory

- **Given** I am a registered user without subscription
- **When** I attempt to view prompts
- **Then** I am redirected to subscription page with Polar payment integration

- **Given** I complete subscription payment via Polar
- **When** payment is confirmed
- **Then** I gain immediate access to full prompt directory

### Prompt Submission
- **Given** I am a subscribed user
- **When** I submit a new prompt with all required fields
- **Then** the prompt enters pending status and I receive confirmation

- **Given** I have submitted a prompt
- **When** I view my profile
- **Then** I see my submission with its current status (pending/approved/rejected)

- **Given** an admin reviews my pending prompt
- **When** they approve it
- **Then** the prompt appears in the public directory and I receive email notification

### Favorites & Bookmarks
- **Given** I am viewing a prompt
- **When** I click the save/favorite button
- **Then** the prompt is added to my favorites list

- **Given** I have saved prompts
- **When** I view my favorites page
- **Then** I see all my bookmarked prompts with quick access

### Admin Moderation
- **Given** I am an admin
- **When** I access the admin panel
- **Then** I see all pending prompt submissions in a review queue

- **Given** I am reviewing a pending prompt
- **When** I approve it
- **Then** the prompt becomes publicly visible and the author is notified

- **Given** I am reviewing a pending prompt
- **When** I reject it with a reason
- **Then** the prompt remains hidden and the author receives rejection notification with feedback

### Analytics
- **Given** a prompt has been copied by users
- **When** I view the prompt details
- **Then** I see the total usage count

- **Given** I am viewing the directory
- **When** I sort by popularity
- **Then** prompts are ordered by usage count (most copied first)


### AI Prompt Execution
- **Given** I am a subscribed user viewing a prompt
- **When** I click "Run Prompt"
- **Then** I see an input modal to provide context

- **Given** I provide context and click "Execute"
- **When** the AI processes the prompt
- **Then** I see the AI-generated results with copy button

- **Given** I have executed prompts
- **When** I view my profile execution history
- **Then** I see all my past executions with timestamps and results

- **Given** I am a free user viewing a prompt
- **When** I look for the "Run Prompt" button
- **Then** I see a "Subscribe to Run Prompts" CTA instead

### Anonymous Access
- **Given** I am an anonymous visitor
- **When** I browse the directory
- **Then** I can view up to 10 prompts

- **Given** I have viewed 10 prompts as anonymous user
- **When** I try to view an 11th prompt
- **Then** I am prompted to create a free account
