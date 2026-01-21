Detailed static UI/UX mockup specifications for the **Nightingale** platform, adhering to **Google’s Material Design 3** language.

---

### 1. **Platform Goals & Context**

- **Purpose:** A unified, AI-powered health companion that integrates clinical data, insurance navigation, and daily health management into a single patient-centric interface.
- **Objectives:**
  - Bridge clinical care, financial clarity, and daily life.
  - Improve health literacy through AI-powered explanations.
  - Enable proactive health monitoring and triage.
  - Simplify insurance navigation and cost transparency.
- **Constraints:**
  - Does not provide diagnosis or treatment.
  - Dependent on external data sources (EHRs, payer APIs).
  - Requires user consent for data sharing and recording.
- **Assumptions:**
  - Adequate AI model performance across diverse populations.
  - Clinician and patient adoption.
  - Regulatory and payer cooperation.

---

### 2. **Page Inventory**

| Page / Screen                    | Subpages / Modals                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Home / Dashboard**             | -                                                                                                                                 |
| **My Health Timeline**           | - Document Detail View (with “Explain This” modal)                                                                                |
| **Check-In & Triage**            | - New Health Check-In (symptoms, audio, image upload) <br> - Check-In History & Results                                           |
| **Costs & Coverage**             | - Cost Transparency Dashboard <br> - Coverage Details <br> - Prior Authorization Status & Drafts <br> - Appeals & Claims Tracking |
| **Prepare for Visits**           | - Upcoming Appointments <br> - Aggregated Records for Visit <br> - My Questions List <br> - Cost Estimates                        |
| **Visit Summaries & Follow-Ups** | - Past Visit Summaries <br> - Medication Instructions & Reminders <br> - Recommended Next Steps                                   |
| **Whole Person View**            | - My Health Factors Dashboard <br> - Community Resources & Booking                                                                |
| **Profile & Settings**           | - Data Sources & Connections <br> - Consent Management <br> - Notification Preferences <br> - Help & Glossary                     |

---

### 3. **Mockup Specifications**

#### **Design System Foundation**

- **Typography:**
  - Primary Font: **Roboto** (Google system font)
  - Headings: Roboto Bold (32px, 24px, 20px)
  - Body: Roboto Regular (16px)
  - Labels & Captions: Roboto Medium (14px, 12px)
- **Color Palette (Material Design 3):**
  - Primary: `#1A73E8` (Google Blue)
  - Secondary: `#34A853` (Google Green)
  - Surface: `#FFFFFF`
  - Background: `#F8F9FA`
  - Error: `#EA4335`
  - Warning: `#FBBC04`
  - Text: `#202124` (High Emphasis), `#5F6368` (Medium), `#9AA0A6` (Disabled)
- **Spacing & Grid:**
  - Base Unit: **8px**
  - Layout Grid: 12-column, 16px gutters
  - Card Padding: 16px
  - Section Margins: 24px

#### **Page-Specific Layouts**

| Page                   | Layout Structure                                                                                                                                                 | Key Components                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Home / Dashboard**   | - App Bar (Title, Notifications, Profile) <br> - Quick Access Cards (Timeline, Check-In, Costs) <br> - Unified Inbox & Task List <br> - Proactive Alerts Section | - Metric Cards <br> - Floating Action Button (New Check-In) <br> - Material Chips (Filter by status)           |
| **My Health Timeline** | - App Bar with Filter Chips (Date, Type, Urgency) <br> - Vertical Timeline (Cards for each event) <br> - “Explain This” FAB on Doc View                          | - Timeline Cards (Icon, Title, Date, Snippet) <br> - Filter Sheet Modal <br> - Explanation Bottom Sheet        |
| **Check-In & Triage**  | - Stepper Progress Bar <br> - Symptom Input (Text, Voice, Image Upload) <br> - Risk Assessment Card <br> - Next Steps Panel                                      | - Voice Input FAB <br> - Image Upload Card <br> - Risk Badge (Low/Med/High) <br> - Recommendation Buttons      |
| **Costs & Coverage**   | - Cost Dashboard (Chart, Estimated Out-of-Pocket) <br> - Coverage Summary Cards <br> - Prior Auth Tracker (List View)                                            | - Data Visualization (Bar/Line Chart) <br> - Cost Alert Badges <br> - Status Chips (Pending, Approved, Denied) |
| **Whole Person View**  | - Dashboard with Health Score <br> - SDoH Factors Cards <br> - Resource Recommendations List <br> - Booking CTA                                                  | - Progress Circular <br> - Resource Cards (Icon, Title, Action Button) <br> - Map Integration (TBD)            |

---

### 4. **Interactive Elements (Static Representation)**

| Element             | Default State                             | Hover / Focus                       | Active / Pressed                    | Disabled State              |
| ------------------- | ----------------------------------------- | ----------------------------------- | ----------------------------------- | --------------------------- |
| **Primary Button**  | Blue (`#1A73E8`), Rounded 20px, 16px text | Elevated (shadow +2px), opacity 90% | Depressed (shadow inset), `#0D62C9` | Gray (`#DADCE0`), no shadow |
| **Text Field**      | Outline: `#DADCE0`, 16px padding          | Outline: `#1A73E8`                  | Outline: `#0D62C9`                  | Gray fill, light text       |
| **Chip**            | Fill: `#E8F0FE`, Text: `#1A73E8`          | Slightly darker fill                | Fill: `#1A73E8`, Text: White        | Gray fill, light text       |
| **Card**            | White, shadow 1, rounded 12px             | Shadow 2                            | Shadow 1 (no change)                | Opacity 60%                 |
| **Error Message**   | Red background (`#FCE8E6`), red text      | -                                   | -                                   | -                           |
| **Success Message** | Green background (`#E6F4EA`), green text  | -                                   | -                                   | -                           |

---

### 5. **Navigation & Flow**

- **Primary Navigation:** Bottom Navigation Bar (Mobile) / Navigation Rail (Tablet & Desktop)
  - Icons + Labels: Timeline, Check-In, Costs, Visits, Whole Person
- **Secondary Navigation:** App Bar with:
  - Back Button (contextual)
  - Page Title
  - Notification Bell
  - Profile Menu
- **Consistent Patterns:**
  - “Explain This” FAB appears on all document detail views.
  - “New Check-In” FAB on Home and Timeline.
  - Filtering via Chips in list views (Timeline, Costs, Tasks).
  - Bottom Sheets for explanations, filters, and quick actions.

---

### 6. **Accessibility Considerations**

- **Contrast Ratios:** Minimum 4.5:1 for text, 3:1 for UI components.
- **Touch Targets:** Minimum 48px × 48px for all interactive elements.
- **Keyboard Navigation:** Full support for tab, enter, space, arrow keys.
- **Screen Reader:** All images have alt text, cards are labeled semantically.
- **Dynamic Type:** Supports system font scaling.
- **TBD:** Offline mode behavior, detailed voice interaction specs, low-bandfallback UI.

---

### 7. **Open Questions / TBD Areas**

| Area                        | Question / Gap                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Clinician Interface**     | No detailed specs for clinician-facing screens (reviewing AI summaries, co-signing prior auths).         |
| **Consent Flows**           | Detailed UI for audio recording consent during visits and data sharing permissions.                      |
| **Offline Mode**            | How should UI adapt in low/no connectivity? Which data is cached?                                        |
| **Urgent Finding Protocol** | UI for alerting users to urgent findings from uploaded images/audio—modal, full-screen, or notification? |
| **Payer API Integration**   | How are real-time coverage updates displayed? Error states for failed API calls?                         |
| **Multi-Profile Switching** | UI pattern for caregivers switching between profiles—dropdown, side menu, or separate login?             |
| **Quantitative Metrics**    | No UI specs for displaying AI confidence scores, error rates, or model version info.                     |

---

This specification is derived **solely** from the provided documents and adheres to **Google Material Design 3**. All visual and interactive decisions are based on documented features, user flows, and design principles from the resource files.
