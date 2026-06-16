# Reusable Component Standards

## Core UI Components
These are generic, reusable building blocks.

- **Button**: variants (primary, secondary, outline, ghost), sizes (sm, md, lg), states (loading, disabled).
- **Input**: variants (text, password, number), labels, error messages, prefix/suffix icons.
- **Modal**: customizable headers, footers, and sizes.
- **Card**: generic container with padding and elevation.
- **Table**: sortable headers, pagination, and row actions.
- **Badge**: status indicators (Success, Pending, Failed).
- **Avatar**: user images with initials fallback.

## Domain Components
These are specific to the Somlance marketplace logic.

- **FreelancerCard**: Displays bio, skills, rating, and rate.
- **ProjectCard**: Displays budget, timeline, and proposal count.
- **AnalyticsCard**: Summarizes metrics with sparkline charts.
- **NotificationCard**: Displays event type and timestamp.
- **ReviewItem**: Displays reviewer, rating, and comment.

## Implementation Guidelines
- **Mobile**: Use NativeWind components in `mobile-somlance/src/components`.
- **Admin**: Use Tailwind CSS components in `admin/src/components`.
- **Props**: Every component must have a clearly defined TypeScript interface.
