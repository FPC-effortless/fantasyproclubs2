import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PerformanceChartProps {
  data: {
    gameweek: number
    points: number
    rank: number
  }[]
  type: "points" | "rank"
}

export function PerformanceChart({ data, type }: PerformanceChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="gameweek" 
            stroke="#9CA3AF"
            tick={{ fill: "#9CA3AF" }}
            label={{ value: "Gameweek", position: "insideBottom", offset: -5, fill: "#9CA3AF" }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: "#9CA3AF" }}
            label={{ 
              value: type === "points" ? "Points" : "Rank", 
              angle: -90, 
              position: "insideLeft",
              fill: "#9CA3AF"
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ color: "#9CA3AF" }}
            itemStyle={{ color: "#00ff87" }}
          />
          <Line
            type="monotone"
            dataKey={type === "points" ? "points" : "rank"}
            stroke="#00ff87"
            strokeWidth={2}
            dot={{ fill: "#00ff87", strokeWidth: 2 }}
            activeDot={{ r: 8, fill: "#00ff87" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 
