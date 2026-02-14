# DealFinder Project Guide

This file provides context and guidelines for working on the DealFinder project with Claude Code.

## Project Overview

DealFinder is a Next.js 15 deal aggregation platform that scrapes and displays deals from multiple retailers (Amazon, Walmart, Newegg). The application features a modern UI, comprehensive filtering, admin panel, and automated deal tracking with expiration management.

**Tech Stack:**
- **Framework:** Next.js 15 App Router with React 19
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **Auth:** Clerk with role-based access
- **Styling:** Tailwind CSS + shadcn/ui components
- **Scraping:** Cheerio + Axios with anti-blocking measures
- **Testing:** Vitest

## Active Session Summary
- **Current Task**: Saved deals functionality fully implemented and working
- **Recent Work**:
  - Fixed saved deals foreign key constraint error by auto-creating users from Clerk
  - Added save/unsave functionality to product detail pages
  - Implemented real-time UI updates (router.refresh) after save/unsave
  - Added saved deal state tracking across entire site (homepage, filtered deals, product pages)
  - Compiled comprehensive backlog of future enhancements and bug fixes
- **What Works**:
  - Users auto-sync from Clerk to database when saving deals
  - Save/unsave from deal cards (homepage, filtered views)
  - Save/unsave from product detail pages
  - Saved deals page with working unsave (immediate refresh)
  - Heart icon properly shows saved state across all pages
  - Save button hidden for non-authenticated users
- **Known Issues**: None - all critical features working
- **Next Steps**: Choose and implement next priority item from backlog (infinite scroll, dark mode, or branding)

### Summary Workflow
- Before finishing any task or using `/clear`, update the "Active Session Summary" above.
- Record what worked, what failed, and any new patterns discovered.
- Keep this section under 20 lines to preserve context space.

## Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin route group - requires admin role
│   ├── (main)/           # Public route group - homepage, deals, saved
│   ├── api/              # API routes with proper auth checks
│   └── globals.css       # Global styles with custom animations
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── admin/            # Admin panel components
│   └── deals/            # Deal display and filtering components
├── lib/
│   ├── db/               # Drizzle schema and connection
│   ├── scrapers/         # Web scraping system (coordinator + individual scrapers)
│   ├── validations/      # Zod schemas for all forms and API validation
│   └── services/         # External service integrations (YouTube)
└── __tests__/            # Vitest test suites
```

## Key Architectural Patterns

### 1. Component Strategy

**Server Components (Default):**
- All pages and layouts unless interactivity is needed
- Use `export const dynamic = "force-dynamic"` for pages needing real-time data
- Fetch data directly in component (no useEffect)

**Client Components:**
- Mark with `"use client"` at top of file
- Used for: forms, interactive UI, hooks (useState, useEffect, useRouter)
- Examples: DealCard, FilterBar, DealForm, AdminNav

**Component Structure:**
```typescript
"use client"; // Only if needed

// 1. Imports (external → UI → custom → types)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/deals/DealCard";

// 2. Type/Interface definitions
interface ComponentProps {
  prop: string;
}

// 3. Component function
export function Component({ prop }: ComponentProps) {
  // Implementation
}
```

### 2. Database Operations (Drizzle ORM)

**Query Patterns:**
```typescript
// Relational queries with relations
const deals = await db.query.deals.findMany({
  with: {
    store: true,
    category: true,
  },
  where: eq(deals.isActive, true),
  orderBy: [desc(deals.createdAt)],
});

// Insert with returning
const [newDeal] = await db.insert(deals).values(data).returning();

// Update with conditions
await db.update(deals).set(data).where(eq(deals.id, id));
```

**Schema Conventions:**
- Tables: snake_case plural (e.g., `deals`, `scraper_logs`)
- Columns: snake_case (e.g., `current_price`, `created_at`)
- Export: camelCase (e.g., `export const deals = pgTable(...)`)
- Always include timestamps: `createdAt`, `updatedAt`
- Use indexes for frequently queried fields

### 3. API Routes

**Pattern:**
```typescript
export async function POST(request: NextRequest) {
  // 1. Auth check (for protected routes)
  const authCheck = await checkAdminAccess();
  if (!authCheck.authorized) {
    return NextResponse.json(authCheck.error, { status: authCheck.status });
  }

  // 2. Parse and validate input
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    // 3. Database operations
    const result = await db.query...

    // 4. Return response with proper status
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    // 5. Error handling
    console.error("[Context] Error description:", error);
    return NextResponse.json(
      { error: "User-friendly message" },
      { status: 500 }
    );
  }
}
```

**Status Codes:**
- 200: Success (GET, PUT)
- 201: Created (POST)
- 400: Bad Request (validation errors)
- 401: Unauthorized (not signed in)
- 403: Forbidden (not admin)
- 404: Not Found
- 500: Server Error

### 4. Form Handling

**Always use react-hook-form + Zod:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/lib/validations/schema";

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... },
});

const onSubmit = async (data: FormData) => {
  // Submit logic
};
```

**Validation:**
- All schemas in `src/lib/validations/`
- Export both schema and inferred type
- Use `safeParse()` for graceful error handling
- Validate on both client (form) and server (API route)

### 5. Authentication & Authorization

**Admin Access:**
- Middleware protects `/admin` routes (see `src/middleware.ts`)
- API routes use `checkAdminAccess()` helper
- Admin role stored in Clerk `publicMetadata.role = "admin"`
- Set in Clerk Dashboard → Users → Public Metadata

**Patterns:**
```typescript
// Server Component
import { checkAdminAccess } from "@/lib/auth-helpers";
const authCheck = await checkAdminAccess();
if (!authCheck.authorized) redirect("/");

// Client Component
import { useUser } from "@clerk/nextjs";
const { isSignedIn, user } = useUser();
const isAdmin = user?.publicMetadata?.role === "admin";
```

### 6. Scraping System

**Architecture:**
- **Coordinator** (`src/lib/scrapers/coordinator.ts`): Orchestrates scrapers, handles upserts, marks expired deals
- **Individual Scrapers**: Walmart, Newegg, Amazon (stub)
- **Utilities**: Price parsing, URL sanitization, user-agent rotation
- **Types**: Shared interfaces for scrapers

**Key Features:**
- Random user-agent rotation (anti-blocking)
- Request delays (1-2 seconds between requests)
- Duplicate detection (by externalId + storeId)
- Deal expiration tracking (missing deals marked inactive)
- Deal reactivation (if deals reappear in scrape)
- Featured threshold (≥20% discount → isFeatured = true)

**Scraper Pattern:**
```typescript
export async function scrapeSite(): Promise<ScraperResult> {
  const startTime = Date.now();
  const deals: ScrapedDeal[] = [];

  try {
    // Fetch with proper headers
    const response = await axios.get(url, {
      headers: { "User-Agent": getRandomUserAgent() },
      timeout: 30000,
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Extract deals
    $(selector).each((_, element) => {
      const deal = extractDeal($, element);
      if (deal) deals.push(deal);
    });

    return {
      source: "site-name",
      status: deals.length > 0 ? "success" : "partial",
      deals,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`[Site Scraper] Error:`, error);
    return { source: "site-name", status: "error", deals: [], error: String(error), duration: Date.now() - startTime };
  }
}
```

## Code Conventions

### TypeScript

**Strict Mode:**
- Always maintain type safety
- Explicit return types for exported functions
- Use `interface` for object types, `type` for unions/intersections
- Avoid `any` - use `unknown` if type is truly unknown

**Path Aliases:**
- Always use `@/` imports (e.g., `@/components/ui/button`)
- Never use relative imports like `../../lib/utils`

### Naming Conventions

**Files:**
- Components: PascalCase (`DealCard.tsx`, `FilterBar.tsx`)
- Pages: lowercase (`page.tsx`, `layout.tsx`)
- API routes: lowercase (`route.ts`)
- Utils: kebab-case (`auth-helpers.ts`, `price-utils.ts`)
- Tests: Match filename with `.test.ts` suffix

**Code:**
- Variables/Functions: camelCase
- Components: PascalCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase

### Import Order

```typescript
// 1. External libraries
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. UI components
import { Button } from "@/components/ui/button";

// 3. Custom components
import { DealCard } from "@/components/deals/DealCard";

// 4. Utils and libraries
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

// 5. Types
import type { Deal } from "@/lib/types";
```

### Error Handling

**Frontend:**
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch");
  const data = await response.json();
} catch (error) {
  console.error("Context:", error);
  // Show user-friendly message
}
```

**Backend:**
```typescript
try {
  // Database operation
} catch (error) {
  console.error("[API Context] Error:", error);
  return NextResponse.json(
    { error: "User-friendly message" },
    { status: 500 }
  );
}
```

### Styling

**Tailwind Patterns:**
- Use utility classes directly in JSX
- Use `cn()` helper for conditional classes
- Follow existing spacing patterns (px-4, py-2, gap-2, etc.)
- Rounded corners: `rounded-xl` for cards/inputs, `rounded-full` for badges/pills
- Shadows: `shadow-md`, `shadow-lg` with color variants (e.g., `shadow-blue-500/20`)

**Custom Animations:**
- Defined in `src/app/globals.css`
- Current animations: `gradient-shift`, `pulse-soft`, `slide-up`, `float`
- Use existing animations before creating new ones

**Component Patterns:**
- Use shadcn/ui components as base
- Compose custom components from ui primitives
- Maintain consistent design language (blues/purples for brand colors)

## Testing

**Structure:**
```typescript
import { describe, it, expect } from "vitest";

describe("Feature/Component", () => {
  it("describes expected behavior", () => {
    // Arrange
    const input = ...;

    // Act
    const result = ...;

    // Assert
    expect(result).toBe(expected);
  });
});
```

**Guidelines:**
- Test files in `src/__tests__/` mirroring src structure
- Focus on critical logic: validations, utilities, scraper functions
- Use `safeParse()` for Zod validation tests
- Mock external dependencies (axios, database)

## Security, Performance & Testing Standards

### Security-First Development

**CRITICAL: Always prioritize security and privacy when implementing features.**

**Before Writing Code:**
1. **Identify Security Risks**: Consider authentication, authorization, data validation, injection attacks, XSS, CSRF
2. **Plan Security Measures**: How will this feature protect user data and prevent abuse?
3. **Review Access Control**: Who should access this feature? What permissions are required?

**During Implementation:**
- **Input Validation**: Always validate and sanitize user input (use Zod schemas)
- **SQL Injection Prevention**: Use parameterized queries (Drizzle ORM handles this)
- **XSS Prevention**: Sanitize output, use React's built-in escaping, avoid `dangerouslySetInnerHTML`
- **Authentication Checks**: Verify user identity before sensitive operations
- **Authorization Checks**: Ensure user has proper permissions (admin checks, ownership checks)
- **Rate Limiting**: Consider rate limits for API endpoints to prevent abuse
- **Error Messages**: Don't expose sensitive information in error messages
- **Secrets Management**: Never commit secrets, use environment variables
- **HTTPS Only**: All external API calls must use HTTPS
- **Content Security Policy**: Follow Next.js security best practices

**Common Security Patterns:**
```typescript
// ✅ Good - Validate input
const validatedData = schema.safeParse(input);
if (!validatedData.success) {
  return { error: "Invalid input" };
}

// ✅ Good - Check authorization
const { userId } = await auth();
if (!userId) return unauthorized();
const resource = await db.query.resources.findFirst({ where: eq(resources.userId, userId) });
if (!resource) return forbidden();

// ❌ Bad - No validation
const data = await request.json();
await db.insert(table).values(data); // Unsafe!

// ❌ Bad - No auth check
const data = await db.query.resources.findFirst({ where: eq(resources.id, id) });
// Anyone can access any resource!
```

### Performance & Architecture Best Practices

**Performance is a Priority:**
- Write efficient queries (use indexes, limit results, avoid N+1 queries)
- Implement pagination for large datasets
- Cache frequently accessed data (Redis, in-memory, React Query)
- Optimize images (Next.js Image component, proper sizing)
- Minimize client-side JavaScript bundle size
- Use server components by default (faster initial load)
- Implement lazy loading for non-critical content

**Architecture Principles:**
- **Single Responsibility**: Each function/component does one thing well
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into utilities
- **Separation of Concerns**: Keep business logic separate from UI
- **Consistent Patterns**: Follow existing patterns in the codebase
- **Type Safety**: Leverage TypeScript for compile-time safety
- **Error Boundaries**: Handle errors gracefully at appropriate levels
- **Scalability**: Design with growth in mind (pagination, caching, indexes)

**File Organization:**
- Group related files by feature (colocation)
- Keep components small and focused (< 300 lines)
- Extract complex logic to custom hooks or utilities
- Use barrel exports (`index.ts`) for cleaner imports

### Test-Driven Feature Development

**Before Implementing a Major Feature:**

1. **Assess Testing Needs**:
   - Is this a critical feature (authentication, payments, data integrity)?
   - Are there edge cases that could cause bugs?
   - Does this involve security-sensitive operations?
   - Will this be hard to manually test?

2. **Design Test Cases**:
   - **Happy Path**: Feature works as expected with valid input
   - **Edge Cases**: Boundary conditions, empty states, null/undefined
   - **Error Handling**: Invalid input, network failures, permission denied
   - **Security Tests**: Unauthorized access, injection attempts, XSS
   - **Performance Tests**: Large datasets, concurrent requests

3. **Write Tests First (TDD approach for critical features)**:
   ```typescript
   // Example: Testing user authentication
   describe("User Authentication", () => {
     it("allows authorized user to access protected resource", async () => {
       // Test implementation
     });

     it("denies unauthorized user access", async () => {
       // Test implementation
     });

     it("handles expired session gracefully", async () => {
       // Test implementation
     });
   });
   ```

**After Implementing a Feature:**

1. **Reevaluate Test Coverage**:
   - Did implementation reveal new edge cases?
   - Are all code paths covered?
   - Are security measures properly tested?
   - Do tests cover real-world usage scenarios?

2. **Add Missing Tests**:
   - Integration tests for critical flows
   - Unit tests for complex utilities
   - Security tests for sensitive operations
   - Performance tests for data-heavy operations

3. **Manual Testing Checklist**:
   - Test in different browsers (Chrome, Firefox, Safari)
   - Test responsive design (mobile, tablet, desktop)
   - Test with slow network (throttle in DevTools)
   - Test error states (disconnect network, invalid data)
   - Test as different user roles (admin, regular user, guest)

**When to Write Tests:**
- **Always**: Authentication/Authorization, Data validation, Payment processing
- **Recommended**: API endpoints, Complex utilities, Scrapers, Database operations
- **Optional**: Simple UI components, One-off scripts, Styling-only changes

**Testing Priority:**
1. **Critical** (must have tests): Security, data integrity, payment flows
2. **High** (should have tests): Core features, API endpoints, business logic
3. **Medium** (nice to have): Complex UI components, utilities
4. **Low** (optional): Simple components, styling, static content

## Development Workflow

### Running the App

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm test             # Run tests
npm run db:studio    # Open Drizzle Studio
```

**Port Management:**
- Dev server runs on port 3000
- `predev` hook automatically kills processes on port 3000
- Script: `scripts/kill-port.js`

### Database Changes

```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Browse database
```

**Schema Location:** `src/lib/db/schema.ts`

### Environment Variables

**Required:**
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

**Optional:**
- `YOUTUBE_API_KEY` - YouTube Data API v3 (for video search)
- `CRON_SECRET` - For cron job authentication

## Context Window Management

**Token Limit:** 200,000 tokens per session

**Proactive Monitoring:**
- Monitor token usage throughout the session
- Notify user when reaching specific thresholds
- Offer to create continuation summaries before hitting limits

**At 180k tokens (90% usage):**
- **IMMEDIATELY notify the user** that context is running low
- Offer to create a continuation summary before proceeding
- Pause work and wait for user decision

**At 100k tokens (50% usage):**
- Proactively mention token usage if working on complex multi-step task
- Ask if summary is needed for reference

**At 150k tokens (75% usage):**
- Strongly recommend creating continuation summary
- Suggest wrapping up current feature before continuing

**Continuation Summary Format:**
Write summary to `.claude/CONTEXT.md` with:
```markdown
# Session Summary - [Date]

## Goal
[Primary objective of this session]

## Completed Work
- [Feature/Fix 1] - Files: path/to/file1.ts, path/to/file2.tsx
- [Feature/Fix 2] - Files: path/to/file3.ts
- [Configuration/Update] - Files: path/to/config.ts

## Current State
- [What's working]
- [What's been tested]
- [Any known issues]

## Next Steps
1. [Next immediate task]
2. [Follow-up work]
3. [Testing needed]

## Important Context
- [Key architectural decisions made]
- [Patterns established]
- [Dependencies added]
```

## Project-Specific Preferences

### When Making Changes

1. **Preserve Existing Patterns:** Follow established conventions in the codebase
2. **Type Safety First:** Maintain strict TypeScript, add proper types
3. **Server Components by Default:** Only use client components when necessary
4. **Validate Everything:** Use Zod schemas for all inputs
5. **Test Critical Logic:** Add tests for utilities, validations, scrapers
6. **Security First:** Always check auth for protected routes
7. **Error Handling:** Add try-catch with context logging
8. **UI Consistency:** Follow existing Tailwind patterns and component structure

### When Adding Features

1. **Check for Existing Utilities:** Reuse functions from `src/lib/utils/` and `src/lib/scrapers/utils.ts`
2. **Follow Database Patterns:** Use Drizzle relations, proper indexes
3. **Create Validation Schema:** Add to `src/lib/validations/`
4. **Consider Scraping Impact:** Will this affect deal data structure?
5. **Update Tests:** Add coverage for new functionality
6. **Document Complex Logic:** Add comments for non-obvious code

### When Debugging

1. **Check Console Logs:** Scrapers and API routes log context
2. **Use Drizzle Studio:** Browse database state (`npm run db:studio`)
3. **Verify Auth:** Check Clerk Dashboard for user metadata
4. **Test Scraper:** Run coordinator manually via admin panel
5. **Review Type Errors:** TypeScript strict mode catches many issues

## Common Tasks

### Adding a New Scraper

1. Create `src/lib/scrapers/site-scraper.ts`
2. Follow existing scraper pattern (see Walmart/Newegg)
3. Add to coordinator in `src/lib/scrapers/coordinator.ts`
4. Create tests in `src/__tests__/scrapers/site.test.ts`
5. Update store in database with correct externalIdPrefix

### Adding a New Admin Feature

1. Create page in `src/app/(admin)/admin/feature/page.tsx`
2. Create API route in `src/app/api/admin/feature/route.ts`
3. Add validation schema in `src/lib/validations/feature.ts`
4. Create admin component in `src/components/admin/FeatureComponent.tsx`
5. Add navigation link in `src/components/admin/AdminNav.tsx`
6. Ensure `checkAdminAccess()` is used in API routes

### Adding a Public Feature

1. Create page in `src/app/(main)/feature/page.tsx`
2. Create API route in `src/app/api/feature/route.ts` (if needed)
3. Create component in `src/components/feature/`
4. Add to main navigation if needed (SiteHeader)
5. Consider authentication needs (public vs. signed-in users)

## Git Workflow

### Commit Guidelines

**Always commit code after completing a feature or significant change.**

**When to Commit:**
- After implementing a new feature (complete and tested)
- After fixing a bug
- After refactoring or optimization work
- After updating documentation or configuration
- When code is in a working, stable state

**Commit Message Format:**
- Use imperative mood: "Add", "Fix", "Update", "Refactor"
- Be descriptive and specific about what changed
- Prefix with "Fix:" for bug fixes
- Include scope when helpful: "Add YouTube integration to deal pages"
- Always include Co-Authored-By line for Claude assistance

**Example:**
```bash
git add <files>
git commit -m "Add user favorites functionality

- Create saved_deals table with user associations
- Add save/unsave API endpoints with auth
- Implement heart icon toggle in DealCard
- Add /saved page to display user's saved deals

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**What NOT to Commit:**
- Incomplete features (unless explicitly requested)
- Code that breaks existing functionality
- Uncommitted .env files or secrets
- node_modules or build artifacts (already in .gitignore)
- Experimental code that hasn't been tested

**Before Committing:**
- Verify TypeScript compiles (`npx tsc --noEmit`)
- Test the feature manually
- Review changed files with `git status` and `git diff`
- Stage only relevant files (avoid `git add -A` unless intentional)

## Known Limitations & Future Enhancements

**Current:**
- Walmart: Only ~20% of deals have original prices (dynamic pricing)
- Amazon: No scraper (requires PA-API integration)
- Deal history: Limited to 200 results (pagination needed)
- YouTube quota: 10,000 units/day (100 units per search)

**Planned:**
- Automated cron job setup (Vercel Cron)
- Email notifications for featured deals
- Price history charts
- Amazon PA-API integration
- Deal scoring/ranking algorithm

## Backlog / To-Do Items

### 🔴 High Priority

**1. Infinite Scroll / Pagination for Deals**
- **Issue**: Main deals page loads all deals at once - will become problematic with thousands of items
- **Solution**: Implement infinite scroll with pre-loading (load items just out of view)
- **Goal**: Smooth, uninterrupted UX similar to Steam's game list
- **Files**: `src/components/deals/FilteredDeals.tsx`, `src/app/api/deals/route.ts`

**2. Dark/Light Mode Toggle**
- **Features**:
  - User preference toggle on main page (accessible header/navigation)
  - Save preference to user profile if authenticated
  - Default to light mode for unauthenticated users
  - Persist across sessions for authenticated users
- **Files**: `src/components/`, `src/lib/db/schema.ts` (user preferences), `src/app/globals.css`

**3. Site Branding**
- **Task**: Decide on final site name and rebrand entire site
- **Scope**: Update all references, logo, meta tags, SEO, documentation
- **Files**: Multiple (site-wide)

### 🟡 Medium Priority

**4. Admin Deal Management Enhancements**
- **Toggle Active/Inactive**: Click active/inactive button to toggle deal state directly
- **Deal History Tracking**:
  - Add "View History" column on admin deals page
  - Track: creation, modifications, activation/deactivation, deletion
  - Show: who made changes and when (timestamps with timezone)
- **Files**: `src/app/(admin)/admin/deals/`, new history table in schema

**5. Timezone-Aware Timestamps**
- **Issue**: Admin timestamps don't show timezone context
- **Solution**: Display timestamps in user's timezone (MST for admin, detected from profile or browser)
- **Files**: Admin components, utility functions for timestamp formatting

**6. Popular Deals Section**
- **Feature**: Homepage section highlighting popular/trending deals
- **Metrics**: Track saved count and click count to determine trending
- **Implementation**:
  - Add `saved_count` and `click_count` columns to deals table
  - Create aggregation logic for "Popular" deals
  - Add dedicated homepage section
- **Files**: `src/app/(main)/page.tsx`, `src/lib/db/schema.ts`, API routes

**7. Error Logging & Monitoring**
- **Requirement**: Admin-accessible error log with timestamps and actions
- **Features**:
  - Track errors throughout site navigation
  - Periodic review capability for admins
  - Error details: timestamp, user action, stack trace, user ID
- **Tools**: Consider Sentry, LogRocket, or custom logging table
- **Files**: Error boundary components, logging utility, admin log viewer page

### 🟢 Low Priority / Polish

**8. Banner Redesign**
- **Issue**: Current homepage banner needs visual improvement
- **Task**: Redesign with better aesthetics and branding
- **Files**: `src/app/(main)/page.tsx`, `src/components/LightningStrikes.tsx`

**9. Product Page Layout Fix**
- **Issue**: "View Deal" button text wraps unnecessarily
- **Solution**: Ensure button text stays on one line when space allows (responsive)
- **Files**: `src/app/(main)/deals/[id]/page.tsx`

**10. Filter Clear Behavior**
- **Issue**: Clearing all filters doesn't immediately refresh to show unfiltered deals
- **Solution**: Trigger immediate refresh/refetch when filters are cleared
- **Files**: `src/components/deals/FilterBar.tsx`, `src/components/deals/FilteredDeals.tsx`

**11. Sitemap Page**
- **Feature**: Add sitemap page with footer link (standard website practice)
- **Content**: Links to all major pages, categories, stores
- **Files**: New `src/app/(main)/sitemap/page.tsx`, footer component

### 📊 Analytics & Tracking

**12. Deal Engagement Metrics**
- **Track**:
  - Number of saves per deal
  - Click-through count per deal
  - Use data to identify trending/popular deals
- **Schema Changes**: Add `saved_count`, `click_count`, `last_clicked_at` to deals table
- **Implementation**: Increment counters via API on save/click actions
- **Files**: `src/lib/db/schema.ts`, `src/app/api/deals/`, deal components

---

**Last Updated:** 2026-02-14
**Project Version:** 0.1.0
**Next.js:** 15.5.12
**React:** 19.1.0
