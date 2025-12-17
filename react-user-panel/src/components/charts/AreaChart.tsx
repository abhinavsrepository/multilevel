import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
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

interface AreaConfig {
  dataKey: string;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  name?: string;
  stackId?: string;
  fillOpacity?: number;
}

interface AreaChartProps {
  data: DataPoint[];
  areas: AreaConfig[];
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
  stacked?: boolean;
  curved?: boolean;
  gradient?: boolean;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  areas,
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
  stacked = false,
  curved = true,
  gradient = true,
}) => {
  // Generate gradient IDs
  const gradientIds = areas.map((_, index) => `gradient-${index}`);

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
                  style={{ backgroundColor: entry.stroke }}
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
  if (!data || data.length === 0) {
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
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
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

  const stackId = stacked ? 'stack' : undefined;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* Define gradients */}
          {gradient && (
            <defs>
              {areas.map((area, index) => {
                const color = area.stroke || colors[index % colors.length];
                return (
                  <linearGradient
                    key={gradientIds[index]}
                    id={gradientIds[index]}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                );
              })}
            </defs>
          )}

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
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0, 0, 0, 0.1)' }} />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {value}
                </span>
              )}
            />
          )}
          {areas.map((area, index) => {
            const color = area.stroke || colors[index % colors.length];
            return (
              <Area
                key={area.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={area.dataKey}
                stroke={color}
                strokeWidth={area.strokeWidth || 2}
                fill={
                  gradient
                    ? `url(#${gradientIds[index]})`
                    : area.fill || color
                }
                fillOpacity={area.fillOpacity !== undefined ? area.fillOpacity : 1}
                name={area.name || area.dataKey}
                stackId={area.stackId || stackId}
                animationBegin={0}
                animationDuration={800}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 0,
                }}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
