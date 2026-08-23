# AI UNIVERSITY AFRICA

## Webflow Specification (Mobile-First) — Phase 2 Platform

| | |
|---|---|
| **To:** | Build (Claude Code) + Design |
| **From:** | COO / Project Manager, AIUA |
| **Re:** | Screen-by-screen flow, routes, and mobile-first layout rules |
| **Date:** | August 2026 |

This document maps the Phase 2 platform screen by screen, with the Next.js route for each and the mobile-first layout intent. **Mobile-first means every screen is designed for a narrow phone viewport first**, then allowed to expand to tablet and desktop. Routes here align with the TRD route groups and the PRD's functional requirements.

## 1. Mobile-First Layout Rules

- Design at ~360–390px width first; single-column by default. Expand to multi-column only at tablet/desktop breakpoints.
- Primary action (Enroll, Continue, Submit) is thumb-reachable — bottom or center, full-width on mobile.
- Navigation collapses to a bottom tab bar or hamburger on mobile; expands to a top/side nav on desktop.
- Tap targets ≥ 44px. No hover-only interactions — everything works on touch.
- Images and video embeds are fluid; content never forces horizontal scroll.
- Text remains legible without zoom; forms are single-column with large inputs.

## 2. Route Map

| Route | Access | Screen |
|---|---|---|
| / | Public | Home / landing |
| /about | Public | About |
| /courses | Public | Course catalog (filter by school) |
| /courses/[slug] | Public | Course detail |
| /verify | Public | Certificate verification |
| /login /signup /reset | Public | Auth screens |
| /dashboard | Student | Student home |
| /learn/[course] | Student | Learning experience |
| /certificates | Student | My certificates |
| /purchases | Student | Purchase history |
| /instructor | Instructor | Instructor dashboard |
| /instructor/courses/[id] | Instructor | Course editor + grading |
| /admin | Admin | Admin dashboard |

## 3. Public Screens

### 3.1 Home — /

- Hero: tagline "Learn. Build. Earn with AI." + primary CTA (Browse courses) + secondary (Sign up).
- Below: schools strip, featured courses, trust/verification mention. Single column on mobile, stacked sections.

### 3.2 Course Catalog — /courses

- Filter by school as a horizontal scrollable chip row on mobile (tag filter only).
- Course cards stack one-per-row on mobile, grid on desktop. Each card: title, school, price, CTA.

### 3.3 Course Detail — /courses/[slug]

- Order on mobile: title → price + Enroll CTA (sticky) → description → modules list → outcomes → instructor.
- Enroll CTA routes to checkout (auth required; prompts login/signup if needed).

### 3.4 Certificate Verification — /verify

- Single input for a verification ID + Verify button. **No login.**
- Result states: VALID (holder, course, issue date), REVOKED (invalid), NOT FOUND (invalid). Clear color-free status text.

## 4. Auth Screens

- /signup: name, email, password; single column, large fields; role defaults to student.
- /login: email, password, link to reset. /reset: email → sent-confirmation state.
- After auth, route by role: student → /dashboard, instructor → /instructor, admin → /admin.

## 5. Student Screens

### 5.1 Dashboard — /dashboard

- Top: continue-learning card (most recent course + progress bar).
- Enrolled courses list (progress each). Quick links: certificates, purchases.

### 5.2 Learning Experience — /learn/[course]

- Mobile: module list collapses into a drawer; the active module fills the screen.
- Active module: video embed → PDF download → quiz. Progress bar pinned at top.
- "Mark complete / Next" as a full-width bottom action. Live-class link shown if a cohort exists.

### 5.3 Certificates — /certificates

- List of earned certificates; each: course, issue date, verification ID, Download PDF.

### 5.4 Purchases — /purchases

- Transaction list: course, amount, status, date, receipt link. Failed items show a Retry action.

## 6. Instructor Screens

### 6.1 Instructor Dashboard — /instructor

- Own courses (draft/published), quick create-course action, students-count and grading-queue summary.

### 6.2 Course Editor + Grading — /instructor/courses/[id]

- Edit course meta; add/reorder modules; attach video URL, PDF, and quiz per module.
- Grading queue: short-answer and file-upload submissions with a mark + pass/fail control.
- Own-students progress view. Instructor sees only their own courses and students.

## 7. Admin Screens — /admin

- Courses: all courses across instructors; publish/unpublish/archive.
- Users: list, search, change role (approve instructors), deactivate.
- Payments: transactions, statuses, receipts; issue refunds where applicable.
- Certificates: issue/revoke; revocation reflects on the public verify page.
- Reporting: basic revenue and enrollment figures (no advanced analytics in Phase 2).
- Mobile: admin tables become stacked cards with key fields; actions in an overflow menu.

## 8. Global Patterns

- Empty states for every list (no courses yet, no certificates yet, no submissions to grade).
- Loading and error states on every data screen; never a blank page on failure.
- Naira pricing displayed with ₦ and thousands separators; amounts come from integer kobo.
- One consistent component set (buttons, inputs, cards) across all roles for a coherent custom UI.

*End of Webflow. Reads alongside the PRD, TRD, and Database Schema.*
