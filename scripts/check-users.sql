-- Check both auth.users and user_profiles tables
-- Run this in your Supabase SQL Editor

-- 1. Check all authenticated users (including unverified)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Not Verified'
        ELSE '✅ Verified'
    END as verification_status
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check user profiles (only verified users should be here)
SELECT 
    id,
    email,
    username,
    user_type,
    status,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- 3. Compare - Users in auth but NOT in profiles (these need profile creation)
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    CASE 
        WHEN up.id IS NULL THEN '❌ Missing Profile'
        ELSE '✅ Has Profile'
    END as profile_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 4. Count summary
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as verified_users,
    (SELECT COUNT(*) FROM public.user_profiles) as users_with_profiles; 