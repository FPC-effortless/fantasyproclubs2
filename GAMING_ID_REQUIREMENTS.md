# Gaming ID Requirements for Fantasy Pro Clubs

## Overview

As of the latest update, **Xbox Gamertag** and **PlayStation Network ID** are now **required fields** for player and manager accounts in Fantasy Pro Clubs. This ensures proper identification and enables cross-platform gaming features.

## Requirements by User Type

### 🎮 Player Accounts
- **Must provide** at least one gaming ID (Xbox or PSN)
- Both IDs can be provided for cross-platform players
- IDs are validated during registration

### 👔 Manager Accounts
- **Must provide** at least one gaming ID (Xbox or PSN)
- Both IDs can be provided for cross-platform managers
- IDs are validated during registration

### 🎯 Fan Accounts
- Gaming IDs are **optional**
- Can be added later through profile settings

## Gaming ID Format Requirements

### Xbox Gamertag
- **Length**: 3-12 characters
- **Allowed characters**: 
  - Letters (a-z, A-Z)
  - Numbers (0-9)
  - Spaces
- **Examples**: `ProGamer123`, `FC Legend`, `xXBossXx`

### PlayStation Network ID
- **Length**: 3-16 characters
- **Allowed characters**:
  - Letters (a-z, A-Z)
  - Numbers (0-9)
  - Hyphens (-)
  - Underscores (_)
- **Examples**: `ProGamer_123`, `FC-Legend`, `Boss_Player`

## Database Schema

The following fields have been added to the `user_profiles` table:

```sql
xbox_gamertag TEXT UNIQUE,
psn_id TEXT UNIQUE,
preferred_platform TEXT CHECK (preferred_platform IN ('xbox', 'playstation', 'both'))
```

## Registration Process

1. User selects account type (Fan, Player, or Manager)
2. If Player or Manager is selected:
   - Gaming ID section appears
   - At least one ID must be provided
   - Validation occurs on form submission
3. IDs are stored securely in the database
4. Duplicate IDs are prevented by unique constraints

## Validation Rules

### Frontend Validation
- Real-time format checking
- Clear error messages
- Visual indicators for required fields

### Backend Validation
- Unique constraint prevents duplicate gamertags
- Format validation in database
- Secure storage of gaming IDs

## Migration Guide

For existing users who need to add gaming IDs:

1. **Via Profile Settings**
   - Navigate to Profile > Gaming Settings
   - Add Xbox Gamertag and/or PSN ID
   - Save changes

2. **Via Account Upgrade**
   - Fans upgrading to Player/Manager must provide gaming IDs
   - IDs are validated during the upgrade process

## API Integration

The gaming IDs enable future features such as:
- Cross-platform matchmaking
- Gaming statistics tracking
- Platform-specific leaderboards
- Social features integration

## Security Considerations

- Gaming IDs are stored securely in the database
- Unique constraints prevent impersonation
- IDs are never exposed in public APIs without permission
- Users can update their IDs through verified account access only

## Support

If users encounter issues with gaming IDs:
1. Verify the format matches requirements
2. Check for existing accounts with the same ID
3. Contact support for ID conflicts or special cases

---

This update ensures a more connected and authentic gaming experience for all Fantasy Pro Clubs players and managers! 