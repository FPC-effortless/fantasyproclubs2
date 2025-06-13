import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

// Add type for Swiss model configuration
export interface SwissModelConfig {
  numberOfTeams: number;
  matchesPerTeam: number;
  sameCountryRestriction: boolean;
  homeAwayBalance: boolean;
  directQualifiers: number;
  playoffQualifiers: number;
  tiebreakers: string[];
  exclusions: Array<{
    teamA: string;
    teamB: string;
    reason: string;
  }>;
}

// Add validation function
const validateSwissConfig = (config: SwissModelConfig): string | null => {
  if (config.numberOfTeams < 4 || config.numberOfTeams > 64) {
    return 'Number of teams must be between 4 and 64';
  }
  if (config.matchesPerTeam < 3 || config.matchesPerTeam > 10) {
    return 'Matches per team must be between 3 and 10';
  }
  if (config.directQualifiers < 0 || config.directQualifiers > config.numberOfTeams) {
    return 'Direct qualifiers cannot exceed total teams';
  }
  if (config.playoffQualifiers < 0 || config.playoffQualifiers > config.numberOfTeams) {
    return 'Playoff qualifiers cannot exceed total teams';
  }
  if (config.directQualifiers + config.playoffQualifiers > config.numberOfTeams) {
    return 'Total qualifiers cannot exceed number of teams';
  }
  return null;
};

export function SwissModelConfigForm({ 
  onSubmit,
  competitionId 
}: { 
  onSubmit: (config: SwissModelConfig) => void;
  competitionId: string;
}) {
  const [config, setConfig] = useState<SwissModelConfig>({
    numberOfTeams: 24,
    matchesPerTeam: 8,
    sameCountryRestriction: true,
    homeAwayBalance: true,
    directQualifiers: 8,
    playoffQualifiers: 16,
    tiebreakers: ['points', 'goal difference', 'goals for', 'head to head', 'initial seed'],
    exclusions: []
  });

  const handleNumberChange = (field: keyof SwissModelConfig, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      setConfig(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers
    const formattedConfig = {
      ...config,
      numberOfTeams: parseInt(String(config.numberOfTeams), 10),
      matchesPerTeam: parseInt(String(config.matchesPerTeam), 10),
      directQualifiers: parseInt(String(config.directQualifiers), 10),
      playoffQualifiers: parseInt(String(config.playoffQualifiers), 10)
    };

    const error = validateSwissConfig(formattedConfig);
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    onSubmit(formattedConfig);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Distribution, Qualification Rules, and Match Constraints</h3>
        
        {/* Number of Teams */}
        <div className="space-y-2">
          <Label htmlFor="numberOfTeams">Number of Teams</Label>
          <Input
            id="numberOfTeams"
            type="number"
            min={4}
            max={64}
            value={config.numberOfTeams}
            onChange={(e) => handleNumberChange('numberOfTeams', e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground">Enter the total number of teams (4-64)</p>
        </div>

        {/* Matches Per Team */}
        <div className="space-y-2">
          <Label htmlFor="matchesPerTeam">Matches Per Team</Label>
          <Input
            id="matchesPerTeam"
            type="number"
            min={3}
            max={10}
            value={config.matchesPerTeam}
            onChange={(e) => handleNumberChange('matchesPerTeam', e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground">Number of matches each team will play (3-10)</p>
        </div>

        {/* Rules & Restrictions */}
        <div className="space-y-4">
          <h4 className="font-medium">Rules & Restrictions</h4>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameCountryRestriction"
              checked={config.sameCountryRestriction}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, sameCountryRestriction: !!checked }))
              }
            />
            <Label htmlFor="sameCountryRestriction">Same Country Restriction</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="homeAwayBalance"
              checked={config.homeAwayBalance}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, homeAwayBalance: !!checked }))
              }
            />
            <Label htmlFor="homeAwayBalance">Home/Away Balance</Label>
          </div>
        </div>

        {/* Qualification Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Qualification Settings</h4>
          
          <div className="space-y-2">
            <Label htmlFor="directQualifiers">Direct Qualifiers</Label>
            <Input
              id="directQualifiers"
              type="number"
              min={0}
              max={config.numberOfTeams}
              value={config.directQualifiers}
              onChange={(e) => handleNumberChange('directQualifiers', e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">Number of teams that qualify directly</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playoffQualifiers">Playoff Qualifiers</Label>
            <Input
              id="playoffQualifiers"
              type="number"
              min={0}
              max={config.numberOfTeams}
              value={config.playoffQualifiers}
              onChange={(e) => handleNumberChange('playoffQualifiers', e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">Number of teams that qualify for playoffs</p>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Save Swiss Model Configuration
        </Button>
      </div>
    </form>
  );
} 
