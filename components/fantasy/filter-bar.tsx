import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"

interface FilterBarProps {
  onSearch: (value: string) => void
  onPositionFilter: (value: string) => void
  onTeamFilter: (value: string) => void
  onSort: (value: string) => void
  positions: string[]
  teams: string[]
}

export function FilterBar({
  onSearch,
  onPositionFilter,
  onTeamFilter,
  onSort,
  positions,
  teams,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-800/50 rounded-lg">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search players..."
            className="pl-10 bg-gray-900 border-gray-700"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Select onValueChange={onPositionFilter}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Positions</SelectItem>
            {positions.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={onTeamFilter}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={onSort}>
          <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="points">Points</SelectItem>
            <SelectItem value="form">Form</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="selected">Selected By</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 
