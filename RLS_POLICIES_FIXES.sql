-- Teams, competitions, and competition_teams tables
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Competitions are viewable by everyone" ON competitions FOR SELECT USING (true);  
CREATE POLICY "Competition teams are viewable by everyone" ON competition_teams FOR SELECT USING (true);

-- Matches table policies (CRITICAL - this was missing!)
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Matches can be inserted by everyone" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Matches can be updated by everyone" ON matches FOR UPDATE USING (true);
CREATE POLICY "Matches can be deleted by everyone" ON matches FOR DELETE USING (true);

-- Additional policies that might be needed
CREATE POLICY "Teams can be updated by everyone" ON teams FOR UPDATE USING (true);
CREATE POLICY "Competitions can be updated by everyone" ON competitions FOR UPDATE USING (true);
CREATE POLICY "Competition teams can be inserted by everyone" ON competition_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Competition teams can be updated by everyone" ON competition_teams FOR UPDATE USING (true);
CREATE POLICY "Competition teams can be deleted by everyone" ON competition_teams FOR DELETE USING (true); 