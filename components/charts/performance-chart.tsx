import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceData {
  match: string;
  goalsFor: number;
  goalsAgainst: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="match" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#F3F4F6',
          }}
        />
        <Legend />
        <Bar dataKey="goalsFor" fill="#00ff87" name="Goals For" />
        <Bar dataKey="goalsAgainst" fill="#EF4444" name="Goals Against" />
      </BarChart>
    </ResponsiveContainer>
  );
} 