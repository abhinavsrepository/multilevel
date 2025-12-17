import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DataPoint[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  loading?: boolean;
  error?: string;
  className?: string;
  title?: string;
  valueFormatter?: (value: number) => string;
  colors?: string[];
  centerLabel?: {
    value: string | number;
    label: string;
  };
  showPercentages?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  innerRadius,
  outerRadius,
  loading = false,
  error,
  className = '',
  title,
  valueFormatter,
  colors = [
    '#2563eb',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#06b6d4',
    '#f97316',
    '#ec4899',
  ],
  centerLabel,
  showPercentages = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages
  const dataWithPercentages = data.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    total,
  }));

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {data.name}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Value:{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {valueFormatter ? valueFormatter(data.value) : data.value}
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share:{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {data.percentage}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend with enhanced styling
  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="mt-6 space-y-2">
        {payload.map((entry: any, index: number) => {
          const percentage = entry.payload.percentage;
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
                  {entry.value}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {showPercentages && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {percentage}%
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {valueFormatter
                    ? valueFormatter(entry.payload.value)
                    : entry.payload.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
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

  // Default radii for donut chart
  const chartInnerRadius = innerRadius !== undefined ? innerRadius : 60;
  const chartOuterRadius = outerRadius || Math.min(height / 2.5, 100);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              innerRadius={chartInnerRadius}
              outerRadius={chartOuterRadius}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              paddingAngle={2}
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  stroke="transparent"
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={renderLegend} />}
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {centerLabel && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {centerLabel.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {centerLabel.label}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary stats (optional) */}
      {!showLegend && total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {valueFormatter ? valueFormatter(total) : total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
