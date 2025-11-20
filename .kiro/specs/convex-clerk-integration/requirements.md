# Requirements Document

## Introduction

This specification defines the integration of Convex (backend database) and Clerk (authentication) into the Church Prompt Directory platform. The integration will replace the static JSON data files with a live Convex database and implement user authentication with role-based access control. This forms the foundation for the platform's core functionality, enabling user management, data persistence, and access control.

## Glossary

- **Convex**: A backend-as-a-service platform providing real-time database, serverless functions, and file storage
- **Clerk**: An authentication and user management platform providing sign-up, sign-in, and session management
- **Anonymous User**: A visitor who has not created an account but can view up to 10 prompts
- **Registered User**: A user who has created a free account via Clerk and can browse all prompts
- **Subscribed User**: A registered user with an active subscription (future feature)
- **Admin User**: A registered user with elevated permissions for content moderation
- **Prompt**: An AI prompt template submitted by users for community use
- **Category**: A classification grouping for prompts (e.g., sermon-preparation, pastoral-care)
- **Seed Data**: Initial data loaded into Convex from existing JSON files
- **Session**: A persistent tracking mechanism for anonymous users across visits
- **Webhook**: An HTTP callback that syncs data between Clerk and Convex

## Requirements

### Requirement 1: Anonymous User Access with Persistent Tracking

**User Story:** As an anonymous visitor, I want to browse up to 10 prompts without creating an account, so that I can evaluate the platform before committing to registration.

#### Acceptance Criteria

1. WHEN an anonymous user visits the platform, THE system SHALL track their prompt views using a persistent session identifier
2. WHEN an anonymous user views a prompt, THE system SHALL increment their view count in the session
3. WHEN an anonymous user reaches 10 prompt views, THE system SHALL display a registration prompt and prevent further prompt access
4. WHEN an anonymous user returns to the platform after leaving, THE system SHALL restore their previous view count from the persistent session
5. WHEN an anonymous user creates an account, THE system SHALL reset their view count and grant full browsing access

### Requirement 2: User Authentication via Clerk

**User Story:** As a visitor, I want to create an account and sign in securely, so that I can access all platform features and save my preferences.

#### Acceptance Criteria

1. WHEN a user clicks the sign-up button, THE system SHALL display Clerk's registration interface with email and social login options
2. WHEN a user completes registration, THE system SHALL create a user record in Convex via Clerk webhook
3. WHEN a user signs in, THE system SHALL authenticate them via Clerk and establish a secure session
4. WHEN a user signs out, THE system SHALL terminate their session and redirect to the homepage
5. WHEN a user's session expires, THE system SHALL prompt them to sign in again before accessing protected features

### Requirement 3: User Profile Management

**User Story:** As a registered user, I want to view and manage my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. WHEN a registered user accesses their profile page, THE system SHALL display their name, email, role, and join date from Convex
2. WHEN a user updates their profile in Clerk, THE system SHALL sync the changes to Convex via webhook
3. WHEN a user deletes their account in Clerk, THE system SHALL remove their user record from Convex via webhook
4. WHEN a user views their profile, THE system SHALL display their submission history and account statistics
5. WHEN a user accesses profile settings, THE system SHALL provide options to update their display name and preferences

### Requirement 4: Role-Based Access Control

**User Story:** As a system administrator, I want to assign roles to users, so that I can control access to administrative features.

#### Acceptance Criteria

1. WHEN a new user registers, THE system SHALL assign them the "user" role by default
2. WHEN an admin promotes a user, THE system SHALL update their role to "admin" in both Clerk and Convex
3. WHEN a user with "admin" role accesses the admin dashboard, THE system SHALL grant access to moderation features
4. WHEN a user with "user" role attempts to access admin features, THE system SHALL deny access and display an error message
5. WHEN the system checks user permissions, THE system SHALL verify the role from Clerk's session token

### Requirement 5: Convex Database Schema and Data Storage

**User Story:** As a developer, I want a well-structured database schema in Convex, so that I can efficiently store and query application data.

#### Acceptance Criteria

1. WHEN the Convex schema is defined, THE system SHALL include tables for users, prompts, categories, favorites, and promptExecutions
2. WHEN a prompt is created, THE system SHALL store title, content, excerpt, category, tags, authorId, status, usageCount, executionCount, and timestamps
3. WHEN a category is queried, THE system SHALL return id, name, description, icon, and promptCount
4. WHEN a user record is created, THE system SHALL store clerkId, name, email, role, isSubscribed, promptViewCount, and timestamps
5. WHEN data relationships are queried, THE system SHALL efficiently join related tables using Convex indexes

### Requirement 6: Data Migration from JSON to Convex

**User Story:** As a developer, I want to migrate existing JSON data to Convex, so that the platform has initial content for users to browse.

#### Acceptance Criteria

1. WHEN the migration script runs, THE system SHALL read all prompts from src/data/prompts.json
2. WHEN the migration script processes prompts, THE system SHALL insert each prompt into the Convex prompts table
3. WHEN the migration script runs, THE system SHALL read all categories from src/data/categories.json and insert them into Convex
4. WHEN the migration script runs, THE system SHALL read all users from src/data/users.json and insert them into Convex
5. WHEN the migration completes, THE system SHALL log a summary of migrated records and any errors encountered

### Requirement 7: Prompt Browsing and Querying

**User Story:** As a registered user, I want to browse and search prompts efficiently, so that I can find relevant content quickly.

#### Acceptance Criteria

1. WHEN a user views the directory page, THE system SHALL query approved prompts from Convex and display them in a grid layout
2. WHEN a user filters by category, THE system SHALL query prompts matching the selected category from Convex
3. WHEN a user searches by keyword, THE system SHALL query prompts where title or content contains the search term
4. WHEN a user views a prompt detail page, THE system SHALL query the specific prompt by ID from Convex
5. WHEN prompts are displayed, THE system SHALL show title, excerpt, category, author name, usage count, and creation date

### Requirement 8: Prompt Usage Tracking

**User Story:** As a platform administrator, I want to track prompt usage statistics, so that I can understand which prompts are most valuable to users.

#### Acceptance Criteria

1. WHEN a user copies a prompt to clipboard, THE system SHALL increment the usageCount field in Convex
2. WHEN a user executes a prompt with AI, THE system SHALL increment the executionCount field in Convex
3. WHEN usage statistics are updated, THE system SHALL persist the changes immediately to Convex
4. WHEN a prompt is displayed, THE system SHALL show the current usageCount and executionCount from Convex
5. WHEN prompts are sorted by popularity, THE system SHALL order them by usageCount in descending order

### Requirement 9: Clerk and Convex Webhook Integration

**User Story:** As a developer, I want Clerk user events to sync with Convex automatically, so that user data remains consistent across both systems.

#### Acceptance Criteria

1. WHEN a user signs up in Clerk, THE system SHALL trigger a webhook that creates a user record in Convex
2. WHEN a user updates their profile in Clerk, THE system SHALL trigger a webhook that updates the user record in Convex
3. WHEN a user deletes their account in Clerk, THE system SHALL trigger a webhook that removes the user record from Convex
4. WHEN a webhook is received, THE system SHALL validate the webhook signature to ensure authenticity
5. WHEN a webhook fails to process, THE system SHALL log the error and retry the operation

### Requirement 10: Protected Routes and Middleware

**User Story:** As a developer, I want to protect certain routes with authentication, so that only authorized users can access restricted features.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses a protected route, THE system SHALL redirect them to the sign-in page
2. WHEN an authenticated user accesses a protected route, THE system SHALL verify their session with Clerk and grant access
3. WHEN a non-admin user accesses an admin route, THE system SHALL deny access and display an unauthorized error
4. WHEN middleware checks authentication, THE system SHALL use Clerk's session token to verify user identity
5. WHEN a user's session is valid, THE system SHALL attach user information to the request context for use in API handlers

### Requirement 11: Environment Configuration

**User Story:** As a developer, I want to configure Convex and Clerk credentials securely, so that the application can connect to both services without exposing sensitive information.

#### Acceptance Criteria

1. WHEN the application starts, THE system SHALL read Convex deployment URL from environment variables
2. WHEN the application starts, THE system SHALL read Clerk publishable key and secret key from environment variables
3. WHEN environment variables are missing, THE system SHALL display a clear error message indicating which variables are required
4. WHEN credentials are stored, THE system SHALL use .env files that are excluded from version control
5. WHEN the application connects to Convex, THE system SHALL use the configured deployment URL to establish the connection

### Requirement 12: Real-time Data Updates

**User Story:** As a user, I want to see prompt data update in real-time, so that I always have the most current information without refreshing the page.

#### Acceptance Criteria

1. WHEN a prompt is approved by an admin, THE system SHALL update the prompt list in real-time for all users viewing the directory
2. WHEN a prompt's usage count changes, THE system SHALL update the displayed count in real-time for users viewing that prompt
3. WHEN new prompts are added, THE system SHALL display them in the directory without requiring a page refresh
4. WHEN Convex data changes, THE system SHALL push updates to connected clients via Convex's reactive queries
5. WHEN a user is viewing a prompt detail page, THE system SHALL update the prompt data in real-time if it changes

### Requirement 13: Error Handling and Resilience

**User Story:** As a user, I want the application to handle errors gracefully, so that I receive helpful feedback when something goes wrong.

#### Acceptance Criteria

1. WHEN a Convex query fails, THE system SHALL display a user-friendly error message and log the technical details
2. WHEN Clerk authentication fails, THE system SHALL display an appropriate error message and prompt the user to try again
3. WHEN a webhook fails to process, THE system SHALL log the error and attempt to retry the operation
4. WHEN the network connection is lost, THE system SHALL display an offline indicator and queue operations for retry
5. WHEN an unexpected error occurs, THE system SHALL display a generic error message and provide a way to report the issue
