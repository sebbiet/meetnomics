# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meetnomics is a satirical web application that calculates the real-time cost of meetings to help teams make more conscious decisions about their time. It features an enterprise-grade design with a humorous twist, showing the financial impact of adding attendees to meetings.

## Development Commands

Since this is a simple static site with no build process:
- **Run locally**: Open `index.html` directly in a web browser or use a simple HTTP server:
  ```bash
  python -m http.server 8000
  # or
  npx http-server
  ```
- **No build/lint/test commands** - This is vanilla HTML/CSS/JavaScript with no tooling

## Architecture

### Core Functionality (script.js)
- **Attendee Management**: Add attendees by name (or get random names from predefined list)
- **Cost Calculation**: Random rate between $47-$245/hour per person
- **Meeting Duration**: Selectable duration from 30 minutes to 3 hours
- **Custom Drawer UI**: Bottom drawer with cost warning instead of browser alerts
- **Video Tools Suggestion**: Recommends Loom, Vidyard, CloudApp, and Bubbles as alternatives
- **FAQ Accordions**: Interactive FAQ section with expand/collapse functionality
- **Toast Notifications**: 
  - Shows +$XXX when adding attendees (green)
  - Shows -$XXX when removing attendees (red)
  - Milestone notifications every $500 with random exclamations (Ouch!, Oomph!, Oh my lawd!, etc.)
  - Auto-dismiss after 3-3.5 seconds with fade animations

### Design Features
- **Modern Enterprise Aesthetic**: Blue color scheme with glassmorphism effects
- **Sticky Navigation**: Header with Meetnomics branding and smooth scroll navigation (logo scrolls to top)
- **Responsive Design**: Mobile-friendly layout with hamburger menu
- **Witty Copy**: Balance of professional appearance with humorous messaging
- **Interactive Elements**: Hover effects, smooth transitions, and animations
- **Toast System**: Fixed position notifications in top-right corner with slide-in animations
- **Enhanced Footer**: Three-column layout with company info, resources, social links, animated stats counter, and CTA button

### Key Implementation Details
1. **No backend**: All functionality is client-side
2. **No external dependencies**: Uses only vanilla web technologies
3. **Random Name Generator**: 100 predefined names for quick testing
4. **Real-time Updates**: Cost calculations update instantly as attendees are added/removed
5. **Meeting Alternatives**: Suggests video recording tools when users reconsider
6. **Milestone Tracking**: Remembers last milestone to avoid duplicate notifications
7. **Toast Stacking**: Multiple notifications stack vertically with proper spacing

### File Structure
```
/
├── index.html    # Main entry point with header, calculator, integrations, FAQ
├── script.js     # Business logic, drawer functionality, accordion behavior
├── style.css     # Enterprise design with blue theme and glassmorphism
└── README.md     # Project concept description
```

## Important Notes
- The "send invite" functionality is a mockup - no actual calendar invites are sent
- Hourly rates are randomly generated between $47-$245 per person
- All integrations listed are for demonstration purposes only
- The site is intentionally satirical while maintaining a professional appearance
- Favicon uses an inline SVG data URI with 💰 emoji