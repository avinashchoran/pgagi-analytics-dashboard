
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import WidgetCard from "./WidgetCard";

interface BarChartWidgetProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  isLoading?: boolean;
  className?: string;
}

const BarChartWidget = ({
  title,
  data,
  dataKey,
  xAxisKey = "name",
  color = "hsl(var(--dashboard-500))",
  isLoading = false,
  className
}: BarChartWidgetProps) => {
  return (
    <WidgetCard title={title} isLoading={isLoading} className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={xAxisKey} fontSize={12} tickMargin={10} />
            <YAxis fontSize={12} tickMargin={10} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              barSize={30}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
};

export default BarChartWidget;
