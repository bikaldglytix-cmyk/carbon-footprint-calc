# Paper Plane "Help the Cause" Link Design

## Purpose
Introduce a creative, non-intrusive UI element on the main calculator screens that allows users to access the "Help the Cause" donation modal. 

## Component Architecture
- **Name:** `PaperPlane`
- **Files:** `src/components/PaperPlane.js`, `src/components/PaperPlane.module.css`
- **Content:** An embedded SVG paper plane, optimized for scaling.
- **Props:** `onClick` (function) triggered when the plane is clicked.

## Integration
- **Placement:** The `PaperPlane` will be imported and mounted in `src/app/page.js`.
- **Visibility Condition:** It will render as soon as the intro finishes (`appStep !== 'intro'`), ensuring it is present during the profile setup, quiz, and subsequent phases.
- **Action:** Clicking the plane will invoke `setHelpOpen(true)` to trigger the existing `HelpTheCause` component.

## Styling & Animation
- **Animation:** Continuous slow drifting animation across the screen with gentle vertical oscillation to mimic flight. Uses CSS `@keyframes`.
- **Interaction:** On hover, the plane pauses its animation (`animation-play-state: paused`), scales up (`transform: scale(1.1)`), and displays a pointer cursor to afford clickability.
- **Tooltip:** A small text label reading "Help the Cause" will fade in underneath or alongside the plane on hover to clarify its purpose.

## Dependencies
- Does not require new NPM packages.
- Hooks into existing `appStep` state and `setHelpOpen` in `page.js`.
