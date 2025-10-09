# Admin Dashboard - Task Specification

## Overview
Create a comprehensive admin dashboard for the webnovel reading platform to manage users, content, and platform analytics.

---

## 1. Dashboard Routes Structure

```
/admin
  /dashboard (statistics overview)
  /users
    /readers
    /writers
  /novels
  /chapters
  /categories
  /comments
  /reviews
  /library
  /rankings
  /votes
  /reports (content moderation)
  /settings
```

---

## 2. Pages & Features

### 2.1 Dashboard Overview (Statistics)
**Route:** `/admin/dashboard`

**Task Description:**
Create a comprehensive statistics dashboard that displays key platform metrics with interactive charts and graphs.

**Features:**
- Total users (readers, writers, breakdown)
- Total novels (published, draft, pending review)
- Total chapters published
- Active users (daily, weekly, monthly)
- Revenue metrics (yuan purchases/usage)
- Popular novels (trending)
- Recent activity feed
- Growth charts (users, novels, engagement over time)

**Acceptance Criteria:**
- [ ] Displays 8+ key metric cards with current values and percentage change
- [ ] Shows line chart for user growth over last 30/90/365 days
- [ ] Shows bar chart for top 10 most popular novels by views/votes
- [ ] Shows pie chart for novel category distribution
- [ ] Shows line chart for daily active users
- [ ] Shows area chart for yuan transactions over time
- [ ] Displays real-time activity feed (last 20 actions)
- [ ] All data refreshes on page load
- [ ] Responsive design for mobile/tablet/desktop
- [ ] Date range filters (today, week, month, year, custom)

**API Endpoints:**
```
GET /api/admin/statistics/overview
GET /api/admin/statistics/user-growth?startDate&endDate
GET /api/admin/statistics/novel-stats?startDate&endDate
GET /api/admin/statistics/engagement?startDate&endDate
GET /api/admin/statistics/revenue?startDate&endDate
GET /api/admin/statistics/activity-feed?limit=20
```

---

### 2.2 User Management - Readers
**Route:** `/admin/users/readers`

**Task Description:**
Manage reader accounts with full CRUD operations, search, filter, and bulk actions.

**Features:**
- List all readers with pagination
- Search by username, email, ID
- Filter by registration date, status, ranking tier
- View detailed reader profile
- Edit reader information
- Suspend/ban/activate accounts
- Delete reader accounts
- View reader activity (novels read, comments, reviews)
- Bulk actions (export, suspend, delete)

**Acceptance Criteria:**
- [ ] Table displays: ID, username, email, join date, status, ranking, yuan balance
- [ ] Pagination with 25/50/100 items per page
- [ ] Search bar with debounce (300ms)
- [ ] Filters: status (active/suspended/banned), date range, ranking tier
- [ ] Click row to view detailed profile modal/page
- [ ] Edit form validates all fields
- [ ] Suspend account with reason input (required)
- [ ] Ban account with reason and duration options
- [ ] Confirmation dialogs for destructive actions
- [ ] Bulk select with actions (export CSV, bulk suspend)
- [ ] Success/error toast notifications
- [ ] Activity log shows last 50 actions by user

**API Endpoints:**
```
GET /api/admin/readers?page&limit&search&status&rankingTier&startDate&endDate
GET /api/admin/readers/:id
PUT /api/admin/readers/:id
DELETE /api/admin/readers/:id
POST /api/admin/readers/:id/suspend
POST /api/admin/readers/:id/ban
POST /api/admin/readers/:id/activate
GET /api/admin/readers/:id/activity
POST /api/admin/readers/bulk-action
```

---

### 2.3 User Management - Writers
**Route:** `/admin/users/writers`

**Task Description:**
Manage writer accounts with additional features for content moderation and earnings management.

**Features:**
- List all writers with pagination
- Search by username, email, ID
- Filter by status, verification status, novel count
- View detailed writer profile
- Edit writer information
- Verify/unverify writer accounts
- Suspend/ban/activate accounts
- View writer's novels and earnings
- Manage writer payouts
- Delete writer accounts

**Acceptance Criteria:**
- [ ] Table displays: ID, username, email, verified status, novel count, ranking, total earnings
- [ ] Pagination with 25/50/100 items per page
- [ ] Search bar with debounce
- [ ] Filters: status, verification status, novel count range
- [ ] View writer profile with novels list
- [ ] Edit form with validation
- [ ] Verify writer button (requires approval reason)
- [ ] Suspend/ban with reason
- [ ] View earnings breakdown (by novel)
- [ ] Payout management interface
- [ ] Delete account with content handling options (delete/transfer novels)
- [ ] Export writer data to CSV

**API Endpoints:**
```
GET /api/admin/writers?page&limit&search&status&verified&novelCount
GET /api/admin/writers/:id
PUT /api/admin/writers/:id
DELETE /api/admin/writers/:id
POST /api/admin/writers/:id/verify
POST /api/admin/writers/:id/unverify
POST /api/admin/writers/:id/suspend
POST /api/admin/writers/:id/ban
POST /api/admin/writers/:id/activate
GET /api/admin/writers/:id/novels
GET /api/admin/writers/:id/earnings
POST /api/admin/writers/:id/payout
```

---

### 2.4 Novel Management
**Route:** `/admin/novels`

**Task Description:**
Manage all novels with content moderation, publication control, and featured novel selection.

**Features:**
- List all novels with pagination
- Search by title, author, ID
- Filter by status, category, rating, publication date
- View novel details (chapters, stats, reviews)
- Edit novel metadata
- Change novel status (draft/published/suspended)
- Feature/unfeature novels
- Delete novels
- Bulk actions
- Content moderation flags

**Acceptance Criteria:**
- [ ] Table displays: ID, title, author, category, status, chapters, views, rating, created date
- [ ] Pagination with 25/50/100 items per page
- [ ] Search with autocomplete
- [ ] Filters: status, category, rating range, date range, featured status
- [ ] View novel detail page with all metadata
- [ ] Edit form for title, description, cover image, category, tags
- [ ] Change status dropdown (draft/published/suspended/banned)
- [ ] Feature toggle with reason/description
- [ ] Delete with confirmation (cascade delete chapters/comments)
- [ ] Bulk actions: delete, change status, export
- [ ] Moderation: view flagged content, review reports
- [ ] View associated chapters, reviews, comments

**API Endpoints:**
```
GET /api/admin/novels?page&limit&search&status&category&featured&startDate&endDate
GET /api/admin/novels/:id
PUT /api/admin/novels/:id
DELETE /api/admin/novels/:id
PATCH /api/admin/novels/:id/status
PATCH /api/admin/novels/:id/feature
GET /api/admin/novels/:id/chapters
GET /api/admin/novels/:id/reviews
GET /api/admin/novels/:id/comments
GET /api/admin/novels/:id/statistics
POST /api/admin/novels/bulk-action
```

---

### 2.5 Chapter Management
**Route:** `/admin/chapters`

**Task Description:**
Manage individual chapters with content moderation and publication control.

**Features:**
- List all chapters with novel reference
- Search by title, novel name, chapter number
- Filter by status, publication date, word count
- View chapter content
- Edit chapter metadata
- Approve/reject pending chapters
- Delete chapters
- Content moderation tools

**Acceptance Criteria:**
- [ ] Table displays: ID, novel title, chapter number, title, status, word count, views, published date
- [ ] Pagination with 50/100 items per page
- [ ] Search bar
- [ ] Filters: status, novel, word count range, date range
- [ ] View full chapter content in modal/page
- [ ] Edit chapter title, content, and metadata
- [ ] Approve/reject pending chapters (with reason)
- [ ] Delete chapter with confirmation
- [ ] Flag inappropriate content
- [ ] View chapter statistics (views, comments)
- [ ] Navigate to parent novel

**API Endpoints:**
```
GET /api/admin/chapters?page&limit&search&status&novelId&startDate&endDate
GET /api/admin/chapters/:id
PUT /api/admin/chapters/:id
DELETE /api/admin/chapters/:id
PATCH /api/admin/chapters/:id/approve
PATCH /api/admin/chapters/:id/reject
GET /api/admin/chapters/:id/statistics
```

---

### 2.6 Category Management
**Route:** `/admin/categories`

**Task Description:**
Manage novel categories/genres with CRUD operations.

**Features:**
- List all categories
- Create new categories
- Edit category names and descriptions
- Delete categories (with novel reassignment)
- Reorder categories
- View novels per category

**Acceptance Criteria:**
- [ ] Table displays: ID, name, description, novel count, order
- [ ] Create category form (name, description, icon/image)
- [ ] Edit category inline or in modal
- [ ] Delete with novel reassignment options
- [ ] Drag-and-drop reordering
- [ ] View novels in category
- [ ] Validation: unique names, required fields
- [ ] Bulk import categories (CSV)

**API Endpoints:**
```
GET /api/admin/categories
POST /api/admin/categories
GET /api/admin/categories/:id
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
PATCH /api/admin/categories/reorder
GET /api/admin/categories/:id/novels
```

---

### 2.7 Comment Management
**Route:** `/admin/comments`

**Task Description:**
Moderate and manage user comments on chapters.

**Features:**
- List all comments with pagination
- Search by content, user, novel
- Filter by status, date, flagged
- View comment context (chapter, novel)
- Edit comments
- Delete comments
- Flag/unflag comments
- Bulk moderation actions

**Acceptance Criteria:**
- [ ] Table displays: ID, user, novel/chapter, content preview, status, flags, date
- [ ] Pagination with 50/100 items per page
- [ ] Search comments
- [ ] Filters: status (active/deleted/flagged), date range, novel
- [ ] View full comment with context
- [ ] Edit comment content
- [ ] Delete comment with reason
- [ ] Flag/unflag inappropriate comments
- [ ] Bulk delete flagged comments
- [ ] Navigate to chapter/novel

**API Endpoints:**
```
GET /api/admin/comments?page&limit&search&status&flagged&novelId&startDate&endDate
GET /api/admin/comments/:id
PUT /api/admin/comments/:id
DELETE /api/admin/comments/:id
PATCH /api/admin/comments/:id/flag
PATCH /api/admin/comments/:id/unflag
POST /api/admin/comments/bulk-delete
```

---

### 2.8 Review Management
**Route:** `/admin/reviews`

**Task Description:**
Manage user reviews for novels with moderation capabilities.

**Features:**
- List all reviews with pagination
- Search by content, user, novel
- Filter by rating, status, date
- View full review
- Edit reviews
- Delete reviews
- Feature helpful reviews
- Moderate flagged reviews

**Acceptance Criteria:**
- [ ] Table displays: ID, user, novel, rating, content preview, helpful count, status, date
- [ ] Pagination with 50/100 items per page
- [ ] Search reviews
- [ ] Filters: rating (1-5 stars), status, featured, date range
- [ ] View full review with novel context
- [ ] Edit review content and rating
- [ ] Delete review with confirmation
- [ ] Feature/unfeature reviews
- [ ] Moderate flagged reviews
- [ ] Bulk actions (delete flagged)

**API Endpoints:**
```
GET /api/admin/reviews?page&limit&search&rating&status&featured&novelId&startDate&endDate
GET /api/admin/reviews/:id
PUT /api/admin/reviews/:id
DELETE /api/admin/reviews/:id
PATCH /api/admin/reviews/:id/feature
POST /api/admin/reviews/bulk-delete
```

---

### 2.9 Library Management
**Route:** `/admin/library`

**Task Description:**
View and manage user library entries (readers' saved novels).

**Features:**
- View all library entries
- Search by user or novel
- Filter by date added
- View statistics (most saved novels)
- Remove library entries (if needed)

**Acceptance Criteria:**
- [ ] Table displays: ID, reader, novel, date added, last read chapter
- [ ] Pagination with 100 items per page
- [ ] Search by reader or novel
- [ ] Filters: date range
- [ ] View statistics of most saved novels
- [ ] Remove entry with confirmation
- [ ] Export library data

**API Endpoints:**
```
GET /api/admin/library?page&limit&search&startDate&endDate
DELETE /api/admin/library/:id
GET /api/admin/library/statistics
```

---

### 2.10 Ranking Management
**Route:** `/admin/rankings`

**Task Description:**
Manage and view ranking systems for readers, writers, and novels.

**Features:**
- View all ranking types (reader, writer, novel)
- Update ranking algorithms
- Manually adjust rankings if needed
- View ranking history
- Reset rankings
- Configure ranking criteria

**Acceptance Criteria:**
- [ ] Tabs for reader/writer/novel rankings
- [ ] Table displays top 100 in each category
- [ ] Shows ranking position, entity, score, change
- [ ] View ranking calculation details
- [ ] Manually adjust ranking (admin override)
- [ ] View ranking history over time (graphs)
- [ ] Configure ranking weights and criteria
- [ ] Recalculate rankings button
- [ ] Reset rankings (with confirmation)

**API Endpoints:**
```
GET /api/admin/rankings/readers?page&limit
GET /api/admin/rankings/writers?page&limit
GET /api/admin/rankings/novels?page&limit
PATCH /api/admin/rankings/:type/:id/adjust
GET /api/admin/rankings/:type/:id/history
POST /api/admin/rankings/recalculate
PUT /api/admin/rankings/config
GET /api/admin/rankings/config
```

---

### 2.11 Vote Management (Yuan System)
**Route:** `/admin/votes`

**Task Description:**
Manage yuan voting system including transactions and distribution.

**Features:**
- View all vote transactions
- Search by user or novel
- Filter by date, amount
- View yuan distribution statistics
- Refund votes (if needed)
- Detect vote manipulation
- Configure vote settings

**Acceptance Criteria:**
- [ ] Table displays: ID, reader, novel, yuan amount, timestamp
- [ ] Pagination with 100 items per page
- [ ] Search by user or novel
- [ ] Filters: date range, amount range
- [ ] View statistics (total votes, top novels, top voters)
- [ ] Refund vote with reason
- [ ] Detect suspicious voting patterns (alerts)
- [ ] Configure yuan to vote conversion rate
- [ ] Export vote data

**API Endpoints:**
```
GET /api/admin/votes?page&limit&search&startDate&endDate&minAmount&maxAmount
GET /api/admin/votes/:id
POST /api/admin/votes/:id/refund
GET /api/admin/votes/statistics
GET /api/admin/votes/suspicious
PUT /api/admin/votes/config
GET /api/admin/votes/config
```

---

### 2.12 Content Reports & Moderation
**Route:** `/admin/reports`

**Task Description:**
Handle user-reported content including novels, chapters, comments, and reviews.

**Features:**
- View all reported content
- Search by type, reporter, reported entity
- Filter by status, severity, date
- Review reported content
- Take action (remove, warn, ban)
- Dismiss false reports
- Track moderation actions

**Acceptance Criteria:**
- [ ] Table displays: ID, type, reported entity, reporter, reason, status, severity, date
- [ ] Pagination with 50 items per page
- [ ] Search and filter by type, status
- [ ] View full report with context
- [ ] Quick view of reported content
- [ ] Actions: approve (remove content), dismiss, warn user, ban user
- [ ] Add moderation notes
- [ ] Track moderation history
- [ ] Auto-flag based on report count
- [ ] Email notifications for severe reports

**API Endpoints:**
```
GET /api/admin/reports?page&limit&type&status&severity&startDate&endDate
GET /api/admin/reports/:id
PATCH /api/admin/reports/:id/resolve
PATCH /api/admin/reports/:id/dismiss
POST /api/admin/reports/:id/action
GET /api/admin/reports/:id/history
```

---

### 2.13 Admin Settings
**Route:** `/admin/settings`

**Task Description:**
Configure platform-wide settings and administrative preferences.

**Features:**
- Platform settings (site name, description, logo)
- Email configuration
- Payment/yuan settings
- Content moderation rules
- User registration settings
- Feature flags
- API rate limits
- Backup and maintenance mode

**Acceptance Criteria:**
- [ ] Organized sections: General, Users, Content, Payments, Security, System
- [ ] Form validation for all settings
- [ ] Save button with confirmation
- [ ] Revert to defaults option
- [ ] Preview changes before saving
- [ ] Activity log for setting changes
- [ ] Export/import configuration
- [ ] Test email configuration button
- [ ] Maintenance mode toggle

**API Endpoints:**
```
GET /api/admin/settings
PUT /api/admin/settings
GET /api/admin/settings/history
POST /api/admin/settings/export
POST /api/admin/settings/import
POST /api/admin/settings/test-email
```

---

## 3. Common Features Across All Pages

### 3.1 Authentication & Authorization
- [ ] Admin login separate from user login
- [ ] Role-based access control (Super Admin, Moderator, Support)
- [ ] Session management with JWT
- [ ] 2FA support for admin accounts
- [ ] Activity logging for all admin actions

### 3.2 UI Components
- [ ] Consistent navigation sidebar
- [ ] Breadcrumb navigation
- [ ] Responsive data tables with sorting
- [ ] Advanced search with filters
- [ ] Modal dialogs for quick actions
- [ ] Toast notifications for feedback
- [ ] Loading states and skeletons
- [ ] Empty states with helpful messages
- [ ] Error boundaries

### 3.3 Data Export
- [ ] Export to CSV for all data tables
- [ ] Export to PDF for reports
- [ ] Bulk export options
- [ ] Scheduled reports via email

---

## 4. Technical Requirements

### 4.1 Frontend
- React with TypeScript
- React Router for navigation
- Chart library (Recharts/Chart.js) for analytics
- Table library (TanStack Table) for data tables
- Form library (React Hook Form) with validation
- State management (Context API/Zustand)
- Axios for API calls
- Tailwind CSS for styling

### 4.2 Backend
- RESTful API architecture
- Authentication middleware
- Role-based authorization
- Request validation
- Error handling
- Rate limiting
- Logging and monitoring
- Database indexes for performance

### 4.3 Security
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] SQL injection prevention
- [ ] Rate limiting per IP/user
- [ ] Audit logs for sensitive actions
- [ ] Data encryption at rest
- [ ] HTTPS only
- [ ] Content Security Policy

---

## 5. Implementation Priority

### Phase 1 (Core)
1. Dashboard Overview
2. User Management (Readers & Writers)
3. Novel Management
4. Content Reports

### Phase 2 (Content)
5. Chapter Management
6. Category Management
7. Comment Management
8. Review Management

### Phase 3 (Engagement)
9. Rankings Management
10. Vote Management
11. Library Management

### Phase 4 (Configuration)
12. Admin Settings
13. Advanced analytics

---

## 6. Testing Requirements

- [ ] Unit tests for all API endpoints
- [ ] Integration tests for critical workflows
- [ ] E2E tests for admin user flows
- [ ] Performance testing for data-heavy pages
- [ ] Security testing (penetration testing)
- [ ] Accessibility testing (WCAG 2.1 AA)

---

## 7. Documentation Requirements

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Admin user guide
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Security best practices guide
