import React from 'react';
import {
  PieChart as RechartsPieChart,
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

interface PieChartProps {
  data: DataPoint[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
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
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  innerRadius = 0,
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
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
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].payload.total || 0;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

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
          {total > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share:{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {percentage}%
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label
  const renderLabel = (entry: any) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((entry.value / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / total) * 100).toFixed(1);
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {entry.value}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Add total to each data point for percentage calculation
  const enrichedData = data.map((item) => ({
    ...item,
    total: data.reduce((sum, d) => sum + d.value, 0),
  }));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={enrichedData}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={showLabels ? renderLabel : false}
              outerRadius={outerRadius || Math.min(height / 2.5, 120)}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {enrichedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={renderLegend} />}
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* Center label for donut charts */}
        {centerLabel && innerRadius > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {centerLabel.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {centerLabel.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;
