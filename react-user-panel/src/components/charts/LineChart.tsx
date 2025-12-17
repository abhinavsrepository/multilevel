import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface DataPoint {
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  stroke?: string;
  strokeWidth?: number;
  name?: string;
  dot?: boolean;
  activeDot?: boolean | { r: number };
}

interface LineChartProps {
  data: DataPoint[];
  lines: LineConfig[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
  colors?: string[];
  curved?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  loading = false,
  error,
  className = '',
  title,
  xAxisLabel,
  yAxisLabel,
  tooltipFormatter,
  colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
  curved = true,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div
          className="w-full bg-gray-200 dark:bg-gray-700 skeleton animate-pulse rounded-lg"
          style={{ height }}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div
          className="w-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          style={{ height }}
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div
          className="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          style={{ height }}
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No data available
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {tooltipFormatter
                  ? tooltipFormatter(entry.value as number)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              opacity={0.5}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            label={
              xAxisLabel
                ? {
                  value: xAxisLabel,
                  position: 'insideBottom',
                  offset: -5,
                  className: 'text-gray-600 dark:text-gray-400',
                }
                : undefined
            }
          />
          <YAxis
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            fontSize={12}
            tickLine={false}
            label={
              yAxisLabel
                ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  className: 'text-gray-600 dark:text-gray-400',
                }
                : undefined
            }
          />
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="line"
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {value}
                </span>
              )}
            />
          )}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type={curved ? 'monotone' : 'linear'}
              dataKey={line.dataKey}
              stroke={line.stroke || colors[index % colors.length]}
              strokeWidth={line.strokeWidth || 2}
              name={line.name || line.dataKey}
              dot={line.dot !== undefined ? line.dot : { r: 3 }}
              activeDot={
                line.activeDot !== undefined
                  ? line.activeDot
                  : { r: 5, strokeWidth: 0 }
              }
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
