import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface DataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  fill?: string;
  name?: string;
  stackId?: string;
  radius?: [number, number, number, number];
}

interface BarChartProps {
  data: DataPoint[];
  bars: BarConfig[];
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
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
  barSize?: number;
  barGap?: number;
  barCategoryGap?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
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
  layout = 'horizontal',
  stacked = false,
  barSize,
  barGap = 4,
  barCategoryGap = '20%',
}) => {
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
                  className="w-3 h-3 rounded"
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

  // Custom label for bars
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    if (layout === 'vertical') {
      return (
        <text
          x={x + width + 5}
          y={y + height / 2}
          fill="currentColor"
          className="text-gray-600 dark:text-gray-400"
          fontSize={12}
          textAnchor="start"
          dominantBaseline="middle"
        >
          {tooltipFormatter ? tooltipFormatter(value) : value}
        </text>
      );
    }

    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="currentColor"
        className="text-gray-600 dark:text-gray-400"
        fontSize={12}
        textAnchor="middle"
      >
        {tooltipFormatter ? tooltipFormatter(value) : value}
      </text>
    );
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

  const stackId = stacked ? 'stack' : undefined;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={barGap}
          barCategoryGap={barCategoryGap}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              opacity={0.5}
              horizontal={layout === 'horizontal'}
              vertical={layout === 'vertical'}
            />
          )}
          {layout === 'horizontal' ? (
            <>
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
            </>
          ) : (
            <>
              <XAxis
                type="number"
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
                type="category"
                dataKey={xAxisKey}
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
            </>
          )}
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill || colors[index % colors.length]}
              name={bar.name || bar.dataKey}
              stackId={bar.stackId || stackId}
              radius={bar.radius || [4, 4, 0, 0]}
              maxBarSize={barSize}
              animationBegin={0}
              animationDuration={800}
            >
              {/* Gradient effect for single bar */}
              {bars.length === 1 && data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={bar.fill || colors[idx % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
