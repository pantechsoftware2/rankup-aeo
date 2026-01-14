# Audit Conversion Flow - Visual Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER LANDS ON PAGE                          │
│                     /audit-flow                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 1: REPORT_TEASER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │           📊 AEO Snapshot Component                   │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │     │
│  │  │Visibility│ │Sentiment │ │Citation  │ │Content   │ │     │
│  │  │  7.4%    │ │   45%    │ │  4.3%    │ │   N/A 🔒 │ │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │        🏆 Competitor Rankings Component               │     │
│  │  ┌─────────────┐  ┌──────────────────────────────┐   │     │
│  │  │   ⭕ 55     │  │ #1 Teladoc       ████████ 82 │   │     │
│  │  │ Your Score  │  │ #2 Amwell        ███████ 76  │   │     │
│  │  │             │  │ #3 Doctor On...  ██████ 71   │   │     │
│  │  │ Medium      │  │ #4 PlushCare     █████ 68    │   │     │
│  │  │ Confidence  │  │ #5 MDLive        ████ 64     │   │     │
│  │  └─────────────┘  └──────────────────────────────────┘   │     │
│  │                                                           │     │
│  │  📈 Strategic Analysis: Focus on visibility...           │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                 │
│                      ↓ Scroll Down ↓                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │            💰 Pricing Table Component                 │     │
│  │  ┌──────┐    ┌──────────┐    ┌──────┐                │     │
│  │  │ Lite │    │ Standard │    │Growth│                │     │
│  │  │ $29  │    │🔥 $119   │    │ $189 │                │     │
│  │  │      │    │Most Popular   │      │                │     │
│  │  │[Start]│   │  [Start]  │   │[Start]│                │     │
│  │  │ Trial│    │   Trial   │   │Trial │                │     │
│  │  └───┬──┘    └─────┬─────┘    └──┬───┘                │     │
│  └──────┼─────────────┼─────────────┼────────────────────┘     │
│         │             │             │                          │
└─────────┼─────────────┼─────────────┼──────────────────────────┘
          │             │             │
          └─────────────┴─────────────┘
                        │
          ┌─────────────▼─────────────┐
          │  handlePlanSelection()    │
          │  - Store plan metadata    │
          │  - setStep('ONBOARDING')  │
          │  - Scroll to top          │
          └─────────────┬─────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 2: ONBOARDING                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  🎉 Welcome to Standard! ($119/mo)                    │     │
│  │  14-day free trial • No charge • Cancel anytime       │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │        📝 Onboarding Intake Component                 │     │
│  │                                                        │     │
│  │  Let's Optimize Your Visibility                       │     │
│  │                                                        │     │
│  │  ┌─────────────────────────────────────────────┐     │     │
│  │  │ 1️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 2️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 3️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 4️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 5️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 6️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 7️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 8️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 9️⃣  [Enter keyword/prompt]                 │     │     │
│  │  │ 🔟  [Enter keyword/prompt]                 │     │     │
│  │  └─────────────────────────────────────────────┘     │     │
│  │                                                        │     │
│  │  [✨ Start Optimization (2 Week Project) →]          │     │
│  │                                                        │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
          ┌─────────────▼─────────────┐
          │ handleOnboardingSubmit()  │
          │ - Validate keywords       │
          │ - Create payload          │
          │ - POST /api/project-intake│
          │ - Show success message    │
          └─────────────┬─────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                  SUCCESS STATE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐     │
│  │              ✅ You're All Set! 🚀                     │     │
│  │                                                        │     │
│  │  We've received your optimization targets and will    │     │
│  │  begin analysis within 24 hours.                      │     │
│  │                                                        │     │
│  │  Check your email for next steps and dashboard access.│     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  AuditConversionFlow State                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  step: 'REPORT_TEASER' ────────────────► 'ONBOARDING'       │
│                                                              │
│  selectedPlan: null ───────────────► { id, name, price }    │
│                                                              │
│  isSubmitting: false ──────────────► true ──► false         │
│                                                              │
│  showSuccess: false ───────────────────────────► true       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ User clicks "Start Free Trial"
       ↓
┌──────────────────────────┐
│  handlePlanSelection()   │
│  - selectedPlan = {...}  │
│  - step = 'ONBOARDING'   │
└──────┬───────────────────┘
       │
       │ User enters keywords and submits
       ↓
┌──────────────────────────┐
│ handleOnboardingSubmit() │
│  - Filter keywords       │
│  - Build payload         │
└──────┬───────────────────┘
       │
       │ POST request
       ↓
┌──────────────────────────┐
│ /api/project-intake      │
│  - Validate payload      │
│  - Log to console        │
│  - Send email (optional) │
│  - TODO: Save to DB      │
└──────┬───────────────────┘
       │
       │ Response
       ↓
┌──────────────────────────┐
│   Success Message        │
│   showSuccess = true     │
└──────────────────────────┘
```

## Payload Structure

```json
{
  "plan": "standard",           // Selected plan ID
  "planName": "Standard",       // Display name
  "planPrice": 119,             // Monthly price
  "keywords": [                 // User-entered keywords
    "best telemedicine platform",
    "virtual healthcare for seniors",
    "telehealth vs in-person",
    ...
  ],
  "submittedAt": "2026-01-12T10:30:00.000Z"  // ISO timestamp
}
```

## API Response

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

## Component Communication

```
AuditConversionFlow (Parent)
    │
    ├─► PricingTable
    │     └─► onPlanSelect(planId) ──► handlePlanSelection()
    │
    └─► OnboardingIntake
          └─► onSubmit(keywords) ──► handleOnboardingSubmit()
                                          │
                                          └─► fetch('/api/project-intake')
```

## Animation Flow

```
REPORT_TEASER View:
  ├─ Header: opacity 0→1, y 20→0 (delay 0)
  ├─ AEOSnapshot: opacity 0→1, y 30→0 (delay 0.2s)
  ├─ CompetitorRankings: opacity 0→1, y 30→0 (delay 0.4s)
  ├─ Divider: opacity 0→1 (delay 0.6s)
  └─ PricingTable: opacity 0→1, y 30→0 (delay 0.8s)

ONBOARDING View:
  ├─ Plan Summary: opacity 0→1, y -20→0
  ├─ OnboardingIntake: opacity 0→1, y 30→0 (delay 0.2s)
  └─ Trust Badges: opacity 0→1 (delay 0.5s)

Page Transitions:
  REPORT_TEASER → ONBOARDING: 
    exit: opacity 1→0, x 0→-100
    enter: opacity 0→1, x 100→0
```

## Testing Checklist

- [ ] Visit `/audit-flow`
- [ ] View AEOSnapshot metrics (4 cards)
- [ ] View CompetitorRankings (circular score + top 5)
- [ ] Scroll to pricing section
- [ ] Click "Start Free Trial" on Lite plan
- [ ] Verify plan summary shows "Lite - $29"
- [ ] Enter at least 1 keyword
- [ ] Click "Start Optimization"
- [ ] Check console for payload log
- [ ] Verify success message appears
- [ ] Check Network tab for API call
- [ ] Click "Back to Report" button
- [ ] Verify return to REPORT_TEASER view
- [ ] Try different plan (Standard, Growth)
- [ ] Test with 10 keywords filled
- [ ] Test with 0 keywords (should show error)

## Notes

- **No database required** to test the flow - everything logs to console
- **No payment integration** yet - this is purely the conversion funnel
- **Dual-mode components** - PricingTable and OnboardingIntake work standalone or in flow
- **Type-safe** - Full TypeScript interfaces for all props and state
- **Responsive** - Mobile-friendly layouts with Tailwind breakpoints
