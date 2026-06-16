# Design Principles & Philosophy

## Overview
Somlance follows a "Premium Modern Utility" design philosophy. The UI should be clean, high-contrast, and extremely responsive.

## Core Rules
1. **Mobile-First**: Design for mobile dimensions first, then scale to desktop.
2. **Spacing System**: Use a base 4px/8px grid system.
   - 4px (Extra Small)
   - 8px (Small)
   - 16px (Medium)
   - 24px (Large)
   - 32px (Extra Large)
3. **Layout Rules**:
   - Max-width containers for desktop (1280px).
   - Consistent padding (16px/24px) for mobile containers.
4. **Card Structure**:
   - Rounded corners (12px - 16px).
   - Subtle shadows for elevation.
   - Hover states for all interactive cards.
5. **Dashboard Standards**:
   - Sidebar-based navigation for admin.
   - Tab-based navigation for mobile.
   - Global search bar always accessible.

## Responsive Rules
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- **Fluid Typography**: Use relative units (rem) instead of fixed pixels.
