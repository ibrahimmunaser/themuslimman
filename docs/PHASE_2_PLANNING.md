# Phase 2: Guardian Portal & Enhanced Family Features

**Status:** Planning / Future Enhancement  
**Depends On:** Phase 1 (Flexible Participant Registration) ✅ Complete  
**Estimated Scope:** Medium to Large

---

## Overview

Build on the flexible participant registration system to create enhanced family and guardian experiences, including a dedicated guardian portal, waitlist management, and advanced family features.

---

## Feature Roadmap

### 1. Guardian Portal 🎯 **Priority: High**

**Goal:** Give parents/guardians a centralized dashboard to manage their children's Islamic education.

#### Features

**Dashboard View:**
- See all enrolled children in one place
- Quick overview of each child's classes
- Combined family calendar view
- Recent activity across all children

**Per-Child Views:**
- Individual child's class enrollments
- Progress tracking per class
- Upcoming assignments and deadlines
- Teacher communications
- Attendance records

**Family Management:**
- Add/edit children profiles
- Update guardian contact information
- Link multiple guardians to same children (divorced parents, grandparents)
- Sibling management interface

**Communications:**
- Message threads with teachers per child
- Class announcements filtered by child
- Bulk notifications from administrators
- Email/SMS preferences

**Progress & Reports:**
- Weekly/monthly progress summaries
- Certificate downloads
- Attendance reports
- Performance insights

#### Technical Approach

```typescript
// New models needed
model GuardianPortalAccess {
  id         String   @id @default(cuid())
  guardianId String   
  email      String   @unique
  passwordHash String
  lastLoginAt DateTime?
  createdAt  DateTime @default(now())
  
  guardian Guardian @relation(fields: [guardianId], references: [id])
}

model GuardianChildLink {
  id           String   @id @default(cuid())
  guardianId   String
  studentProfileId String
  relationship String   // mother, father, legal_guardian, etc.
  isPrimary    Boolean  @default(false)
  canReceiveEmails Boolean @default(true)
  canReceiveSMS    Boolean @default(true)
  createdAt    DateTime @default(now())
  
  guardian Guardian @relation(fields: [guardianId], references: [id])
  student  StudentProfile @relation(fields: [studentProfileId], references: [id])
  
  @@unique([guardianId, studentProfileId])
}
```

#### UI Requirements

- Separate guardian authentication flow
- Responsive mobile-first design (parents check on phones)
- Push notification support
- Downloadable progress reports (PDF)
- Print-friendly views for offline records

---

### 2. Waitlist Management 🎯 **Priority: High**

**Goal:** Handle capacity-limited classes gracefully with automated waitlist management.

#### Features

**Waitlist Enrollment:**
- When class reaches capacity, show "Join Waitlist" option
- Collect same information as regular enrollment
- Position in queue displayed to user
- Estimated notification date

**Admin Management:**
- View waitlist for each class
- Manually promote from waitlist to enrolled
- Adjust waitlist order if needed
- Send custom messages to waitlisted families
- Bulk promote top N students

**Automated Promotions:**
- When student drops/is removed, automatically offer spot to next in line
- Email/SMS notification with time-limited acceptance window (e.g., 48 hours)
- If declined or timeout, move to next person
- Track acceptance/decline reasons

**Waitlist Analytics:**
- Average wait time
- Conversion rate (waitlist → enrolled)
- Drop-off points
- Demand forecasting for future classes

#### Technical Approach

```typescript
model Waitlist {
  id        String   @id @default(cuid())
  classId   String
  studentId String
  guardianId String?
  position  Int      // Auto-calculated queue position
  joinedAt  DateTime @default(now())
  status    String   // waiting, offered, accepted, declined, expired
  offeredAt DateTime?
  expiresAt DateTime?
  
  class    Class @relation(fields: [classId], references: [id])
  student  StudentProfile @relation(fields: [studentId], references: [id])
  guardian Guardian? @relation(fields: [guardianId], references: [id])
  
  @@unique([classId, studentId])
  @@index([classId, position])
}
```

---

### 3. Advanced Family Features 🎯 **Priority: Medium**

**Goal:** Make family enrollment and management seamless and intuitive.

#### Features

**Multi-Child Discounts:**
- Configurable discount rules per organization
- "2nd child 20% off, 3rd+ 30% off" type rules
- Automatic calculation at registration
- Family discount codes
- Scholarship/financial aid tracking

**Family Scheduling:**
- View all family members' schedules in one calendar
- Conflict detection (overlapping classes for siblings)
- Carpool coordination features
- Sync to Google Calendar / iCal

**Sibling Class Preferences:**
- "Enroll both siblings together" option
- Auto-suggest classes at same time/location
- Bulk enrollment for multiple children
- Package deals (e.g., "Quran + Islamic Studies combo")

**Household Dashboard:**
- Combined view for both parents
- Each parent can have their own login
- Shared notes and reminders
- Family communication preferences

#### Technical Approach

```typescript
model Household {
  id        String   @id @default(cuid())
  name      String
  address   String?
  phone     String?
  createdAt DateTime @default(now())
  
  guardians Guardian[]
  students  StudentProfile[]
  discounts HouseholdDiscount[]
}

model HouseholdDiscount {
  id          String   @id @default(cuid())
  householdId String
  discountType String  // sibling, scholarship, financial_aid
  percentage  Int
  startDate   DateTime
  endDate     DateTime?
  approvedBy  String?
  
  household Household @relation(fields: [householdId], references: [id])
}
```

---

### 4. Enhanced Demographics & Special Needs 🎯 **Priority: Low**

**Goal:** Collect and use demographic information to better serve students.

#### Features

**Optional Demographics:**
- Gender (if not inferred from class restrictions)
- Spoken languages
- Cultural background
- Prior Islamic education level

**Special Needs & Accommodations:**
- Medical conditions (allergies, etc.)
- Learning differences (ADHD, autism, dyslexia)
- Physical disabilities
- Dietary restrictions
- Prayer accommodations needed

**Privacy Controls:**
- Opt-in per field (nothing mandatory)
- Visibility controls (teacher-only, admin-only, etc.)
- GDPR/privacy compliance
- Data retention policies

---

### 5. Age-Based Automation 🎯 **Priority: Low**

**Goal:** Use age data to improve user experience and administrative efficiency.

#### Features

**Auto-Suggest Appropriate Classes:**
- Based on student's age and DOB
- "Recommended for your child" sections
- Age-appropriate course filtering
- Graduated difficulty levels

**Age Verification:**
- Automatic age calculation from DOB
- Enforce age restrictions at enrollment
- Warning if age outside recommended range
- Age-up notifications (child now qualifies for older class)

**Class Progression Paths:**
- Define prerequisite courses
- Suggested next class after completion
- Multi-year curriculum planning
- Graduation ceremonies / milestones

---

## Implementation Phases

### Phase 2A: Guardian Portal MVP (6-8 weeks)
1. Guardian authentication system
2. Basic dashboard (view enrolled children)
3. Per-child class list and progress
4. Guardian profile management
5. Mobile-responsive design

### Phase 2B: Waitlist System (3-4 weeks)
1. Waitlist enrollment flow
2. Admin waitlist management
3. Automated promotion system
4. Email/SMS notifications
5. Analytics dashboard

### Phase 2C: Family Features (4-6 weeks)
1. Household model and linking
2. Multi-child discounts
3. Family calendar view
4. Sibling preferences
5. Bulk enrollment

### Phase 2D: Enhanced Data & Automation (4-5 weeks)
1. Demographics collection (opt-in)
2. Special needs tracking
3. Age-based class suggestions
4. Progression paths
5. Privacy controls

---

## Success Metrics

### Guardian Portal
- **Engagement:** 70%+ guardians create portal account
- **Usage:** Average 2+ logins per month
- **Satisfaction:** 4.5+ / 5 rating on guardian surveys

### Waitlist
- **Conversion:** 60%+ waitlist → enrolled conversion
- **Response Time:** < 24hr average acceptance time
- **Utilization:** 80%+ of capacity-limited classes use waitlist

### Family Features
- **Adoption:** 40%+ families with 2+ children enrolled
- **Efficiency:** 50% reduction in admin time for family enrollment
- **Revenue:** 15% increase from multi-child discounts attracting more families

---

## Technical Considerations

### Database Performance
- Index optimization for guardian queries
- Efficient household aggregation queries
- Caching for family dashboards
- Pagination for large families

### Security & Privacy
- Separate authentication realm for guardians
- Role-based access control (RBAC)
- Audit logs for data access
- GDPR compliance (right to deletion, data export)

### Notifications
- Email service integration (SendGrid, AWS SES)
- SMS gateway (Twilio, AWS SNS)
- Push notifications (Firebase, OneSignal)
- Notification preferences management

### Mobile Experience
- PWA support for mobile browsers
- Potential native app (iOS/Android)
- Offline capabilities
- Touch-optimized UI

---

## Dependencies

### External Services
- **Email:** SendGrid, AWS SES, or Resend (already using)
- **SMS:** Twilio or AWS SNS
- **Push:** Firebase Cloud Messaging or OneSignal
- **Calendar Sync:** Google Calendar API, iCal generation
- **Payments (for discounts):** Stripe integration

### Internal Dependencies
- Phase 1 flexible registration (✅ complete)
- User authentication system (✅ exists)
- Email notification system (✅ exists via Resend)
- Class capacity tracking (✅ exists)

---

## User Stories

### Guardian Portal
> "As a parent of 3 children, I want to see all their classes in one place so I don't have to log in separately for each child."

> "As a guardian, I want to receive weekly progress updates for all my enrolled children so I can stay informed about their Islamic education."

### Waitlist
> "As an administrator, I want to automatically notify the next family when a spot opens up so I don't have to manually track and email people."

> "As a parent, I want to know my child's position on the waitlist and estimated wait time so I can plan accordingly."

### Family Features
> "As a parent enrolling 4 children, I want to get a family discount and enroll them all at once so I save money and time."

> "As a mom, I want to see all my kids' schedules in one calendar view so I can plan our family week and avoid conflicts."

---

## Open Questions

1. **Multi-Guardian Access:** Should both parents automatically get portal access, or is it opt-in?
2. **Waitlist Expiration:** How long should families have to accept a waitlist offer? 24hr? 48hr? 72hr?
3. **Discount Structure:** Should discounts be per-org configurable or platform-wide defaults?
4. **Mobile App:** Is a native mobile app needed, or is PWA sufficient?
5. **Language Support:** Should guardian portal support multiple languages (Arabic, Urdu, etc.)?

---

## Next Steps

1. **Gather Feedback:** Survey mosque administrators about priority features
2. **User Research:** Interview parents about guardian portal needs
3. **Technical Spike:** Evaluate SMS/push notification providers
4. **Design Mockups:** Create guardian portal wireframes and designs
5. **Prioritize:** Finalize which Phase 2 features to build first

---

## Conclusion

Phase 2 transforms the Seerah LMS from a class management system into a comprehensive family Islamic education platform. By focusing on guardian engagement, efficient waitlist handling, and family-friendly features, we create a complete ecosystem that mosques and Islamic schools can rely on for all their educational needs.

**Estimated Total Effort:** 17-23 weeks (with single developer)  
**Recommended Approach:** Incremental rollout (2A → 2B → 2C → 2D)  
**Business Impact:** Significant - enables larger organizations, improves retention, increases family enrollment
