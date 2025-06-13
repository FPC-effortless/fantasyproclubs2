# 🚨 URGENT: Database Migration Required

## Problem
Your fantasy page is showing error messages because the `competition_teams` table is missing required columns.

## Solution
You need to run the SQL migration script in your Supabase dashboard.

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Login to your account
- Select your project

### 2. Open SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New Query" to create a new query

### 3. Run Migration Script
- Copy the **entire contents** of the `fix_database.sql` file
- Paste it into the SQL Editor
- Click the "Run" button (play icon)

### 4. Verify Success
- You should see success messages in the output
- The script will add all missing columns
- It will also populate sample data for testing

### 5. Refresh Your App
- Go back to your fantasy page
- Refresh the browser
- The error messages should be gone
- You should see actual league standings

## What the Migration Does

The script adds these missing columns to `competition_teams`:
- `points` - Team points in the competition
- `matches_played` - Number of matches played
- `wins` - Number of wins
- `draws` - Number of draws  
- `losses` - Number of losses
- `goals_for` - Goals scored
- `goals_against` - Goals conceded
- `goal_difference` - Goal difference
- `position` - Team position in table

## After Migration

Once the migration is complete:
✅ Fantasy page will load properly
✅ League standings will show real data
✅ No more database errors
✅ All fantasy features will work

## If You Still Have Issues

1. Check the Supabase SQL Editor output for any error messages
2. Make sure you copied the **entire** `fix_database.sql` file
3. Verify you're running the script in the correct project
4. Check the browser console for any remaining errors

The fantasy page has been updated to show helpful messages if the migration hasn't been run yet, so you'll know exactly what to do. 