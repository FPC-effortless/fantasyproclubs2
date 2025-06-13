# Lineup Deadline & Verification System

## Overview
This implementation adds a sophisticated lineup management system with deadline enforcement and admin verification capabilities to the EA FC Pro Clubs application.

## Key Features

### 1. 3-Hour Deadline Enforcement
- **Automatic Deadline Calculation**: Lineups must be submitted 3 hours before match kickoff
- **Real-time Countdown**: Displays time remaining until deadline
- **Submission Blocking**: Prevents late submissions unless admin override is enabled

### 2. Admin Verification System
- **Verification States**: Draft → Pending → Verified/Rejected
- **Admin Review Interface**: Dedicated tools for lineup approval/rejection
- **Override Capabilities**: Admins can enable post-deadline submissions

### 3. Manager Experience
- **Clear Deadline Visibility**: Shows exact time remaining for each match
- **Submission Status Tracking**: Real-time status updates
- **Guided Formation Builder**: Interactive pitch with drag-and-drop player assignment

## Database Schema Changes

### New Columns Added to `lineups` Table:
```sql
submitted_at TIMESTAMPTZ              -- When lineup was submitted
submission_deadline TIMESTAMPTZ       -- Auto-calculated 3 hours before kickoff
verification_status VARCHAR(20)       -- draft/pending/verified/rejected
verified_by UUID                      -- Admin who verified the lineup
verified_at TIMESTAMPTZ              -- When verification occurred
admin_override_allowed BOOLEAN        -- Allows post-deadline submissions
kickoff_time TIMESTAMPTZ             -- Match kickoff time
match_name VARCHAR(255)              -- Descriptive match name
```

## Components Updated

### 1. Admin Lineup Management (`components/admin/lineup-management.tsx`)
**New Features:**
- Verification status badges with color coding
- Deadline countdown display
- Verification action buttons (Approve/Reject)
- Admin override toggle
- Enhanced table with deadline and verification columns

**Functions Added:**
- `verifyLineup()` - Approve or reject lineup submissions
- `toggleAdminOverride()` - Enable/disable post-deadline submissions
- `getTimeUntilDeadline()` - Calculate and format remaining time
- `getVerificationBadge()` - Display status with appropriate styling

### 2. Manager Lineup Submission (`components/manager/lineup-submission.tsx`)
**Features:**
- Match listing with deadline information
- Submission status tracking
- Formation builder interface
- Deadline enforcement with clear messaging
- Override status display when enabled

## Workflow

### Manager Workflow:
1. **View Upcoming Matches**: See all matches requiring lineups
2. **Check Deadlines**: Real-time countdown to submission deadline
3. **Create/Edit Lineup**: Interactive formation builder
4. **Submit for Review**: Lineup moves to "pending" status
5. **Track Status**: Monitor admin verification progress

### Admin Workflow:
1. **Review Submitted Lineups**: See all pending lineups in admin dashboard
2. **Verify Lineups**: Approve or reject with single click
3. **Manage Overrides**: Enable post-deadline submissions when needed
4. **Monitor Compliance**: Track submission patterns and deadlines

## Business Rules

### Submission Rules:
- Lineups must be submitted ≥3 hours before kickoff
- Only team managers can submit lineups
- Players can view but not modify lineups
- Admins have unrestricted access

### Deadline Override Rules:
- Only admins can enable overrides
- Overrides are lineup-specific, not global
- Override status is clearly indicated to managers
- Override permissions reset for each new submission

### Verification Rules:
- All submitted lineups require admin verification
- Rejected lineups can be resubmitted (if deadline allows)
- Verified lineups are locked until admin enables modifications
- Verification history is tracked for audit purposes

## Security Implementation

### Row Level Security (RLS) Policies:
```sql
-- Managers can only access their team's lineups
-- Players can view their team's lineups (read-only)
-- Admins have full access to all lineups
-- Deadline restrictions enforced at database level
```

### Deadline Enforcement:
- Database trigger automatically calculates submission deadlines
- Client-side validation prevents UI abuse
- Server-side verification ensures data integrity

## Migration Guide

### To Apply:
```bash
# Apply the new migration
supabase db push

# Verify migration applied successfully
supabase db diff
```

### Database Changes:
1. **New Columns**: Added to existing `lineups` table
2. **New Indexes**: For efficient deadline and verification queries
3. **Updated RLS**: Enhanced security policies with deadline logic
4. **New Triggers**: Automatic deadline calculation

## Usage Examples

### Admin Actions:
```typescript
// Verify a lineup
await verifyLineup(lineupId, 'verified')

// Enable override for late submission
await toggleAdminOverride(lineupId, false) // enable override

// View verification status
const badge = getVerificationBadge(lineup.verification_status)
```

### Manager Actions:
```typescript
// Check if submission is allowed
const canSubmit = isSubmissionAllowed(match, lineup)

// Get time until deadline
const timeLeft = getTimeUntilDeadline(match)

// Submit lineup
if (canSubmit) {
  await submitLineup(matchId, formation, selectedPlayers)
}
```

## Testing Scenarios

### 1. Normal Submission Flow:
1. Create match with future kickoff time
2. Manager submits lineup 4+ hours before
3. Admin verifies lineup
4. Status updates correctly

### 2. Deadline Enforcement:
1. Create match with kickoff in 2 hours
2. Manager attempts submission
3. System blocks submission
4. Admin enables override
5. Manager can now submit

### 3. Verification Workflow:
1. Manager submits lineup
2. Status shows "Pending Review"
3. Admin reviews and approves
4. Status updates to "Verified"
5. Manager sees confirmation

## Performance Considerations

### Database Optimizations:
- Indexed verification_status for fast filtering
- Indexed submission_deadline for deadline queries
- Efficient team-based RLS policies

### Client-side Optimizations:
- Real-time countdown updates every minute
- Lazy loading of match and player data
- Optimistic UI updates for better UX

## Future Enhancements

### Potential Additions:
1. **Email Notifications**: Automatic alerts for deadline reminders
2. **Lineup Templates**: Save and reuse common formations
3. **Player Availability**: Integration with injury/suspension status
4. **Analytics Dashboard**: Submission patterns and compliance metrics
5. **Mobile App Support**: Native mobile lineup submission

## Conclusion

This implementation provides a robust, secure, and user-friendly lineup management system that enforces business rules while maintaining flexibility through admin overrides. The system scales well and provides excellent visibility into the submission and verification process for all stakeholders. 