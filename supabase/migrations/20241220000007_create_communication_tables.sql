-- Create communication and social feature tables

-- Team announcements table
CREATE TABLE IF NOT EXISTS public.team_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    pinned BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Match discussions/comments table
CREATE TABLE IF NOT EXISTS public.match_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.match_discussions(id) ON DELETE CASCADE, -- For replies
    content TEXT NOT NULL,
    is_tactical_analysis BOOLEAN DEFAULT FALSE,
    is_post_match BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Player ratings by fans/users table
CREATE TABLE IF NOT EXISTS public.fan_player_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    rater_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    rating DECIMAL(3,1) CHECK (rating >= 1.0 AND rating <= 10.0),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(match_id, player_id, rater_id)
);

-- Team chat/messaging table
CREATE TABLE IF NOT EXISTS public.team_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'announcement')),
    content TEXT NOT NULL,
    file_url TEXT,
    is_tactical BOOLEAN DEFAULT FALSE,
    reply_to UUID REFERENCES public.team_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User follow/friend system
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    is_mutual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'goal_scored', 'assist_made', 'match_played', 'team_joined', 
        'trophy_won', 'achievement_unlocked', 'fantasy_team_updated',
        'transfer_completed', 'team_announcement'
    )),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Related entities
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
    
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    match_reminders BOOLEAN DEFAULT TRUE,
    team_announcements BOOLEAN DEFAULT TRUE,
    fantasy_reminders BOOLEAN DEFAULT TRUE,
    
    -- Privacy preferences
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    activity_visibility TEXT DEFAULT 'public' CHECK (activity_visibility IN ('public', 'friends', 'private')),
    stats_visibility TEXT DEFAULT 'public' CHECK (stats_visibility IN ('public', 'friends', 'private')),
    
    -- Display preferences
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_team_announcements_team_id ON public.team_announcements(team_id);
CREATE INDEX idx_team_announcements_published ON public.team_announcements(published);
CREATE INDEX idx_team_announcements_pinned ON public.team_announcements(pinned);
CREATE INDEX idx_match_discussions_match_id ON public.match_discussions(match_id);
CREATE INDEX idx_match_discussions_user_id ON public.match_discussions(user_id);
CREATE INDEX idx_match_discussions_parent_id ON public.match_discussions(parent_id);
CREATE INDEX idx_fan_player_ratings_match_id ON public.fan_player_ratings(match_id);
CREATE INDEX idx_fan_player_ratings_player_id ON public.fan_player_ratings(player_id);
CREATE INDEX idx_team_messages_team_id ON public.team_messages(team_id);
CREATE INDEX idx_team_messages_created_at ON public.team_messages(created_at);
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at);
CREATE INDEX idx_activity_feed_public ON public.activity_feed(is_public);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Team announcements - team members can read, managers can manage
CREATE POLICY "team_announcements_team_read" ON public.team_announcements
    FOR SELECT USING (
        published = true AND (
            team_id IN (
                SELECT p.team_id FROM public.players p
                WHERE p.user_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_profiles.id = auth.uid() 
                AND user_profiles.role = 'admin'
            )
        )
    );

-- Match discussions - public read, authenticated write
CREATE POLICY "match_discussions_public_read" ON public.match_discussions
    FOR SELECT USING (true);

CREATE POLICY "match_discussions_auth_write" ON public.match_discussions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fan ratings - public read, authenticated users can rate
CREATE POLICY "fan_ratings_public_read" ON public.fan_player_ratings
    FOR SELECT USING (true);

CREATE POLICY "fan_ratings_auth_rate" ON public.fan_player_ratings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Team messages - team members only
CREATE POLICY "team_messages_team_only" ON public.team_messages
    FOR SELECT USING (
        team_id IN (
            SELECT p.team_id FROM public.players p
            WHERE p.user_id = auth.uid()
        )
    );

-- User follows - users can manage their own follows
CREATE POLICY "user_follows_own_manage" ON public.user_follows
    FOR ALL USING (
        follower_id = auth.uid() OR following_id = auth.uid()
    );

-- Activity feed - based on user privacy settings
CREATE POLICY "activity_feed_visibility" ON public.activity_feed
    FOR SELECT USING (
        is_public = true OR
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_follows uf
            WHERE uf.follower_id = auth.uid() 
            AND uf.following_id = activity_feed.user_id
            AND uf.status = 'accepted'
        )
    );

-- User preferences - users can only access their own
CREATE POLICY "user_preferences_own_only" ON public.user_preferences
    FOR ALL USING (user_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER set_team_announcements_updated_at
    BEFORE UPDATE ON public.team_announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_match_discussions_updated_at
    BEFORE UPDATE ON public.match_discussions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_fan_player_ratings_updated_at
    BEFORE UPDATE ON public.fan_player_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_team_messages_updated_at
    BEFORE UPDATE ON public.team_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_user_follows_updated_at
    BEFORE UPDATE ON public.user_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 