# Admin Dashboard Refactor Summary

## Overview

The admin dashboard has been refactored to align with the new product direction:
**TheMuslimMan website is the school, the teacher, and the platform.**

All organization and teacher-centered logic has been removed or hidden from the UI while keeping the database structure intact for stability.

---

## Sidebar Changes

### New Admin Navigation Structure

1. **Dashboard** - Platform overview and KPIs
2. **Students** - All student accounts and management
3. **Courses** - Platform-owned curriculum products
4. **Content Library** - Lesson asset management
5. **Programs** - Platform-run student experiences (formerly "Classes")
6. **Analytics** - Student engagement and performance metrics
7. **Orders** - Payments and subscriptions (placeholder)
8. **R2 Storage** - Cloudflare R2 management
9. **Settings** - Platform configuration

### Removed Items

- ❌ **Course Templates** (consolidated into "Courses")
- ❌ **Classes** (renamed to "Programs")
- ❌ Any teacher-specific navigation

---

## Dashboard Metric Changes

### Before (Old Metrics)

- Total users
- Teachers ❌
- Students
- Classes
- Active classes
- Enrollments

### After (New Metrics)

- Total students ⭐
- Active students ⭐ (logged in within 30 days)
- Programs
- Active programs
- Enrollments
- Completions ⭐

### Quick Actions Updated

**Before:**
- Manage content
- Course templates ❌
- Teachers ❌
- Classes ❌

**After:**
- Students ⭐
- Courses ⭐
- Content ⭐
- Programs ⭐

---

## Page Changes

### Created Pages

1. **`/admin/programs`** - Replaces `/admin/classes`
   - Lists platform-run student experiences
   - Shows enrollments, status, and dates
   - Emphasizes self-paced and cohort-based programs

2. **`/admin/courses`** - Replaces `/admin/course-templates`
   - Platform-owned curriculum products
   - "Full Seerah — All 100 Parts" and future courses
   - Shows lesson counts and program usage

3. **`/admin/orders`** - New placeholder page
   - Revenue overview
   - Order management
   - Stripe integration (coming soon)

### Updated Pages

1. **`/admin/dashboard`**
   - Removed teacher metrics
   - Removed organization-specific wording
   - Added active student tracking
   - Updated quick actions
   - Shows only student signups (not all users)

2. **`/admin/students`**
   - Column header changed from "Classes" to "Programs"

3. **`/admin/analytics`**
   - Updated description: removed teacher activity mentions
   - Focus on student engagement and revenue

4. **`/student/classes`** (Student-facing)
   - Renamed to "My Programs" in UI
   - Removed "Taught by [Teacher]" display
   - Updated messaging to be platform-centric

5. **`/student/dashboard`** (Student-facing)
   - Changed "Enrolled classes" to "Programs"
   - Updated "Your classes" section to "Your programs"
   - Removed teacher references from announcements
   - Updated empty states to be platform-centric

---

## New Meaning of "Programs"

### Before: "Classes"
- Teacher-led
- School/organization workspace
- Teacher assigned courses
- Teacher managed enrollments

### After: "Programs"
- **Platform-run student experiences**
- Direct-to-student delivery
- No teacher assignment
- Platform controls curriculum

### Program Examples:
- Self-Paced Full Seerah
- Ramadan Seerah Challenge 2026
- Spring 2026 Seerah Cohort
- Beta Tester Group
- VIP Student Group

### Program Features:
- Course ID (curriculum)
- Start/end dates
- Release schedule
- Enrollment rules
- Student list
- Price/access rules

---

## Database Model Guidance

### ✅ **Kept Intact** (No Breaking Changes)

- `Class` model (now represents "Programs" conceptually)
- `Teacher` model and relations
- `Organization` model (if exists)
- `ClassEnrollment` model
- `TeacherProfile` model (if exists)

**Reason:** Avoiding destructive migrations. Database structure remains backward-compatible.

### 🔒 **Hidden from UI**

- Teacher metrics on dashboard
- Teacher quick actions
- Organization-specific wording
- "Taught by" display on student pages
- Teacher-related empty state messages

---

## Authentication & Roles

### ✅ **No Changes**

- Platform admin role remains
- Student role remains
- Individual learner flow remains
- All existing authentication logic preserved

---

## Terminology Changes

| Old Term | New Term | Context |
|----------|----------|---------|
| Classes | Programs | Admin and student UI |
| Course Templates | Courses | Admin sidebar and pages |
| Taught by [Teacher] | _(removed)_ | Student program cards |
| My Classes | My Programs | Student navigation |
| Enrolled classes | Programs | Dashboard metrics |
| Ask your teacher | Join a program | Empty states |

---

## Files Modified

### Core Navigation & Data
- `lib/nav-items.ts` - Updated admin/student navigation
- `lib/queries/admin.ts` - Removed teacher metrics, added student-focused metrics

### Admin Pages
- `app/admin/dashboard/page.tsx` - Refactored metrics and quick actions
- `app/admin/students/page.tsx` - Updated column header
- `app/admin/analytics/page.tsx` - Updated description
- `app/admin/programs/page.tsx` - **NEW** (renamed from classes concept)
- `app/admin/courses/page.tsx` - **NEW** (renamed from course-templates concept)
- `app/admin/orders/page.tsx` - **NEW** (placeholder for payments)

### Student Pages
- `app/student/classes/page.tsx` - Updated to "My Programs"
- `app/student/dashboard/page.tsx` - Removed teacher references

---

## What Was NOT Changed

### Database Tables
- All tables remain intact
- No destructive migrations
- Backward compatibility maintained

### Underlying Logic
- Teacher relations still exist in database
- Organization model (if exists) remains
- Class model still called "Class" in code
- Enrollment logic unchanged

### URLs
- `/student/classes` URL remains (no redirect needed)
- `/admin/classes` still works (data shown in `/admin/programs`)

---

## Next Steps (Optional Future Work)

1. **Database Renaming** (if desired)
   - Rename `Class` model to `Program`
   - Rename `ClassEnrollment` to `ProgramEnrollment`
   - Requires careful migration

2. **Feature Removals** (if desired)
   - Completely remove teacher-related database tables
   - Remove organization models
   - Requires impact analysis

3. **New Features**
   - Implement Orders/Payments with Stripe
   - Add program creation UI
   - Add course creation/editing UI
   - Build out analytics dashboard

---

## Summary

✅ **Sidebar** - Updated to new 9-item structure
✅ **Dashboard** - Removed teachers, added student-focused KPIs
✅ **Programs** - Renamed from classes, platform-centric messaging
✅ **Courses** - Renamed from course templates
✅ **Orders** - New placeholder page for payments
✅ **Student UI** - Updated to "Programs" terminology
✅ **Database** - Left intact, no breaking changes
✅ **Auth** - No changes, all roles preserved

The platform now presents as **TheMuslimMan.com = the school**, with direct-to-student programs and no external teacher/organization dependencies in the UI.
