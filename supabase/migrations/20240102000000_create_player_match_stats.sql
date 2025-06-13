-- Create player_match_stats table
CREATE TABLE IF NOT EXISTS player_match_stats (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id BIGINT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    goals INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    shots_on_target INTEGER NOT NULL DEFAULT 0,
    passes_completed INTEGER NOT NULL DEFAULT 0,
    tackles INTEGER NOT NULL DEFAULT 0,
    interceptions INTEGER NOT NULL DEFAULT 0,
    saves INTEGER,
    clean_sheet BOOLEAN,
    minutes_played INTEGER NOT NULL DEFAULT 0,
    yellow_cards INTEGER NOT NULL DEFAULT 0,
    red_cards INTEGER NOT NULL DEFAULT 0,
    fantasy_points INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(match_id, player_id)
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_player_match_stats_updated_at
    BEFORE UPDATE ON player_match_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE player_match_stats ENABLE ROW LEVEL SECURITY;

-- Allow players to submit their own stats
CREATE POLICY "Allow players to submit their own stats"
    ON player_match_stats
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = player_id AND
        status = 'pending'
    );

-- Allow players to view their own stats
CREATE POLICY "Allow players to view their own stats"
    ON player_match_stats
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = player_id OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type IN ('admin', 'manager')
        )
    );

-- Allow admins and managers to update stats
CREATE POLICY "Allow admins and managers to update stats"
    ON player_match_stats
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.user_type IN ('admin', 'manager')
        )
    ); 