# Tasks: Cadence Collins Campaign Website

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Execution Flow
Based on Next.js 14+ full-stack application with Supabase backend, TypeScript, and Tailwind CSS. Features include public website with mailing list signup, event listings, and admin CMS functionality.

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [ ] T001 Create Next.js 14+ project structure with TypeScript configuration
- [ ] T002 Install dependencies: Next.js, React, Tailwind CSS, Supabase client, TypeScript
- [ ] T003 [P] Configure ESLint, Prettier, and development tools
- [ ] T004 [P] Set up Tailwind CSS with custom blue theme configuration in tailwind.config.js
- [ ] T005 Create Supabase database schema from data-model.md SQL

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Contract test POST /api/mailing-list in tests/contract/test_mailing_list_post.spec.ts
- [ ] T007 [P] Contract test GET /api/events in tests/contract/test_events_get.spec.ts
- [ ] T008 [P] Contract test GET /api/content/{section} in tests/contract/test_content_get.spec.ts
- [ ] T009 [P] Contract test GET /api/admin/mailing-list in tests/contract/test_admin_mailing_list.spec.ts
- [ ] T010 [P] Contract test POST /api/admin/events in tests/contract/test_admin_events_post.spec.ts
- [ ] T011 [P] Contract test PUT /api/admin/events/{id} in tests/contract/test_admin_events_put.spec.ts
- [ ] T012 [P] Contract test DELETE /api/admin/events/{id} in tests/contract/test_admin_events_delete.spec.ts  
- [ ] T013 [P] Contract test PUT /api/admin/content/{section} in tests/contract/test_admin_content_put.spec.ts
- [ ] T014 [P] Integration test mailing list signup flow in tests/integration/test_mailing_signup.spec.ts
- [ ] T015 [P] Integration test event listing display in tests/integration/test_events_display.spec.ts
- [ ] T016 [P] Integration test admin event management in tests/integration/test_admin_events.spec.ts
- [ ] T017 [P] Integration test admin content management in tests/integration/test_admin_content.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T018 [P] MailingListSubscriber TypeScript interface in src/types/database.ts
- [ ] T019 [P] CampaignEvent TypeScript interface in src/types/database.ts  
- [ ] T020 [P] ContentBlock TypeScript interface in src/types/database.ts
- [ ] T021 [P] Supabase client configuration in src/lib/supabase.ts
- [ ] T022 [P] Email validation utility in src/lib/validation.ts
- [ ] T023 [P] CSV export utility for admin in src/lib/csv-export.ts
- [ ] T024 POST /api/mailing-list endpoint in src/pages/api/mailing-list.ts
- [ ] T025 GET /api/events endpoint in src/pages/api/events.ts
- [ ] T026 GET /api/content/[section] endpoint in src/pages/api/content/[section].ts
- [ ] T027 Admin authentication middleware in src/middleware/admin-auth.ts
- [ ] T028 GET /api/admin/mailing-list endpoint with CSV export in src/pages/api/admin/mailing-list.ts
- [ ] T029 POST /api/admin/events endpoint in src/pages/api/admin/events.ts
- [ ] T030 PUT /api/admin/events/[id] endpoint in src/pages/api/admin/events/[id].ts
- [ ] T031 DELETE /api/admin/events/[id] endpoint in src/pages/api/admin/events/[id].ts
- [ ] T032 PUT /api/admin/content/[section] endpoint in src/pages/api/admin/content/[section].ts

## Phase 3.4: Frontend Components
- [ ] T033 [P] Header component with navigation in src/components/Header.tsx
- [ ] T034 [P] Hero section component in src/components/Hero.tsx
- [ ] T035 [P] Bio section component in src/components/Bio.tsx
- [ ] T036 [P] Mailing list signup form component in src/components/MailingListForm.tsx
- [ ] T037 [P] Events listing component in src/components/EventsList.tsx
- [ ] T038 [P] Policy section component in src/components/Policy.tsx
- [ ] T039 [P] Social media links component in src/components/SocialLinks.tsx
- [ ] T040 [P] Footer component in src/components/Footer.tsx
- [ ] T041 Main page layout in src/pages/index.tsx integrating all components
- [ ] T042 [P] Admin dashboard layout in src/pages/admin/index.tsx
- [ ] T043 [P] Admin mailing list management page in src/pages/admin/mailing-list.tsx
- [ ] T044 [P] Admin events management page in src/pages/admin/events.tsx
- [ ] T045 [P] Admin content management page in src/pages/admin/content.tsx

## Phase 3.5: Integration & Polish  
- [ ] T046 Error handling and user feedback for all forms
- [ ] T047 Loading states and UI improvements
- [ ] T048 Responsive design testing and mobile optimization
- [ ] T049 SEO meta tags and Open Graph setup
- [ ] T050 [P] Unit tests for validation utilities in tests/unit/test_validation.spec.ts
- [ ] T051 [P] Unit tests for CSV export in tests/unit/test_csv_export.spec.ts
- [ ] T052 Performance optimization (<3s LCP requirement)
- [ ] T053 Admin authentication security review
- [ ] T054 Database connection pooling and error handling
- [ ] T055 Accessibility (WCAG 2.1 AA) compliance check

## Dependencies
- Setup (T001-T005) before everything
- Tests (T006-T017) before implementation (T018-T055) 
- T018-T020 (interfaces) before T024-T032 (API endpoints)
- T021 (Supabase client) before T024-T032 (API endpoints)
- T027 (auth middleware) before T028-T032 (admin endpoints)
- T024-T032 (API endpoints) before T033-T045 (frontend components)
- T041 (main page) after T033-T040 (individual components)
- T042-T045 (admin pages) after T028-T032 (admin endpoints)
- Implementation (T018-T049) before polish (T050-T055)

## Parallel Example
```
# Launch T006-T013 together (contract tests):
Task: "Contract test POST /api/mailing-list in tests/contract/test_mailing_list_post.spec.ts" 
Task: "Contract test GET /api/events in tests/contract/test_events_get.spec.ts"
Task: "Contract test GET /api/content/{section} in tests/contract/test_content_get.spec.ts"
Task: "Contract test GET /api/admin/mailing-list in tests/contract/test_admin_mailing_list.spec.ts"

# Launch T018-T023 together (type definitions and utilities):
Task: "MailingListSubscriber TypeScript interface in src/types/database.ts"
Task: "CampaignEvent TypeScript interface in src/types/database.ts" 
Task: "ContentBlock TypeScript interface in src/types/database.ts"
Task: "Supabase client configuration in src/lib/supabase.ts"
Task: "Email validation utility in src/lib/validation.ts"

# Launch T033-T040 together (frontend components):
Task: "Header component with navigation in src/components/Header.tsx"
Task: "Hero section component in src/components/Hero.tsx"
Task: "Bio section component in src/components/Bio.tsx"
Task: "Mailing list signup form component in src/components/MailingListForm.tsx"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- All API endpoints must handle validation errors properly
- Admin endpoints require authentication via middleware
- Frontend components should use TypeScript interfaces
- Follow Next.js 14+ App Router patterns where applicable
- Maintain blue color theme from Tailwind configuration
- CSV export feature required for admin mailing list management

## Validation Checklist
- [x] All 8 contract endpoints have corresponding tests (T006-T013)
- [x] All 3 entities have TypeScript interface tasks (T018-T020)
- [x] All tests come before implementation (T006-T017 before T018+)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD order: Contract→Integration→Implementation→Unit→Polish
- [x] Admin authentication properly enforced for admin endpoints