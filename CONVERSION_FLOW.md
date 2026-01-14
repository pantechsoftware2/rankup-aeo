# AEO Audit Conversion Flow Documentation

## Overview
This document describes the "Teaser → Conversion → Onboarding" flow implemented in the AEO Tool.

## Architecture

### Core Component: `AuditConversionFlow`
**Location:** `/components/AuditConversionFlow.tsx`

This is a self-contained wrapper component that manages the entire conversion funnel with state management.

### Flow Steps

```
┌─────────────────────┐
│  REPORT_TEASER      │  User sees AEO metrics + pricing
│  - AEOSnapshot      │
│  - CompetitorRankings│
│  - PricingTable     │
└──────────┬──────────┘
           │ Click "Start Free Trial"
           ↓
┌─────────────────────┐
│  ONBOARDING         │  User enters optimization targets
│  - Plan Summary     │
│  - OnboardingIntake │
│  - Success Message  │
└─────────────────────┘
```

## State Management

### States Tracked
- `step`: Current view ('REPORT_TEASER' | 'ONBOARDING')
- `selectedPlan`: Selected pricing plan info (id, name, price)
- `isSubmitting`: Loading state during form submission
- `showSuccess`: Success confirmation display

### Flow Logic

#### 1. Initial State (REPORT_TEASER)
- Shows `AEOSnapshot` with 4 metric cards
- Shows `CompetitorRankings` with circular score and top 5 competitors
- Shows `PricingTable` with 3 plans (Lite, Standard, Growth)

#### 2. Plan Selection
```typescript
handlePlanSelection(planId: string)
```
- Triggered when user clicks "Start Free Trial" on any plan
- Stores selected plan metadata
- Transitions to ONBOARDING view
- Scrolls to top smoothly

#### 3. Onboarding Submission
```typescript
handleOnboardingSubmit(keywords: string[])
```
- Validates at least one keyword is entered
- Creates payload with plan + keywords + timestamp
- Sends POST request to `/api/project-intake`
- Shows success message
- Logs payload to console for debugging

## API Integration

### Endpoint: `/api/project-intake`
**Location:** `/app/api/project-intake/route.ts`

#### Request Format
```json
POST /api/project-intake
{
  "plan": "standard",
  "planName": "Standard",
  "planPrice": 119,
  "keywords": ["keyword1", "keyword2", ...],
  "submittedAt": "2026-01-12T10:30:00.000Z"
}
```

#### Response Format
```json
{
  "success": true,
  "message": "Project intake received successfully",
  "data": {
    "plan": "standard",
    "keywordsCount": 5
  }
}
```

#### Current Behavior
- ✅ Validates payload
- ✅ Logs to console
- ✅ Sends admin notification email via Brevo (if configured)
- ⏳ **TODO:** Save to database (see comments in code)

## Database Integration (TODO)

### Recommended Schema: `project_intake`
```sql
CREATE TABLE project_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100),
  plan_price INTEGER,
  keywords TEXT[] NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Integration Steps
1. Choose your database (Supabase, Firebase, Prisma, etc.)
2. Create the `project_intake` table
3. Uncomment and adapt the database code in `/app/api/project-intake/route.ts`
4. Add database credentials to `.env.local`

## Component Props

### PricingTable
```typescript
interface PricingTableProps {
  onPlanSelect?: (planId: string) => void;
}
```
- **Dual Mode:** Works standalone (with router) or with callback (in flow)
- When `onPlanSelect` is provided, uses callback instead of routing

### OnboardingIntake
```typescript
interface OnboardingIntakeProps {
  onSubmit?: (prompts: string[]) => void | Promise<void>;
  isSubmitting?: boolean;
}
```
- **Dual Mode:** Works standalone or with parent state
- When `onSubmit` is provided, delegates submission logic to parent
- When `isSubmitting` is provided, uses external loading state

## Usage

### Option 1: Use the Complete Flow (Recommended)
```tsx
import AuditConversionFlow from '@/components/AuditConversionFlow';

export default function Page() {
  return <AuditConversionFlow />;
}
```

**Test URL:** `/audit-flow`

### Option 2: Use Components Individually
```tsx
// Existing standalone routes still work:
// - /report-preview (standalone report + pricing)
// - /onboarding?plan=standard (standalone onboarding form)
```

## Testing

### Test the Complete Flow
1. Visit: `http://localhost:3000/audit-flow`
2. View the teaser report (AEOSnapshot + CompetitorRankings)
3. Scroll down to pricing
4. Click "Start Free Trial" on any plan
5. Fill out 10 keywords/prompts
6. Click "Start Optimization"
7. Check console for payload
8. Verify success message appears

### Console Output
```javascript
📊 Project Intake Payload: {
  plan: 'standard',
  planName: 'Standard',
  planPrice: 119,
  keywords: ['keyword1', 'keyword2', ...],
  submittedAt: '2026-01-12T10:30:00.000Z'
}

✅ Saved successfully: { success: true, ... }
```

## Styling
All components use your existing design system:
- Dark theme with `bg-[#0A0A0A]` and `bg-[#050505]`
- Tailwind CSS utility classes
- Custom fonts: `font-space` for headings, `font-sans` for body
- Green gradient accents: `from-green-500 to-green-600`
- Framer Motion animations with staggered reveals
- Lucide React icons

## Next Steps

### 1. Add Database Persistence
- Set up your preferred database
- Implement save logic in `/app/api/project-intake/route.ts`

### 2. Add Payment Integration
- Install Stripe SDK: `npm install stripe @stripe/stripe-js`
- Create checkout session before onboarding
- Update flow to include payment step

### 3. Add Email Confirmation
- Send welcome email to user after submission
- Include trial start date and next steps

### 4. Add Dashboard
- Create user dashboard to track optimization progress
- Show submitted keywords and their performance

### 5. Add Authentication
- Implement user accounts (NextAuth, Clerk, Supabase Auth, etc.)
- Link project intakes to user accounts

## File Structure
```
/app
  /audit-flow
    page.tsx                    # Test page using AuditConversionFlow
  /report-preview
    page.tsx                    # Standalone report page (legacy)
  /onboarding
    page.tsx                    # Standalone onboarding page (legacy)
  /api
    /project-intake
      route.ts                  # API endpoint for saving intake data

/components
  AuditConversionFlow.tsx       # Main flow wrapper with state management
  AEOSnapshot.tsx               # 4-card metrics dashboard
  CompetitorRankings.tsx        # Circular score + top 5 competitors
  PricingTable.tsx              # 3-column pricing cards
  OnboardingIntake.tsx          # 10-field keyword intake form
```

## Environment Variables
```bash
# Required for email notifications
BREVO_API_KEY=your_brevo_api_key

# Optional: Admin email for notifications
ADMIN_EMAIL=admin@yourapp.com

# TODO: Add database credentials when ready
# DATABASE_URL=your_database_url
```

## Support
For questions or issues with the conversion flow, check:
1. Console logs for payload and API responses
2. Network tab for API call status
3. This documentation for expected behavior
