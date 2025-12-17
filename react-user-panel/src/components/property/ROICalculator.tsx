import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiPercent,
  FiPieChart,
  FiBarChart2,
  FiInfo,
} from 'react-icons/fi';

interface ROICalculation {
  totalInvestment: number;
  expectedReturns: number;
  roiPercentage: number;
  annualReturns: number;
  monthlyReturns: number;
  appreciationGains: number;
  rentalIncome: number;
  netReturns: number;
  breakEvenPeriod: number;
}

interface ROICalculatorProps {
  propertyPrice?: number;
  minimumInvestment?: number;
  expectedROI?: number;
  tenure?: number;
  appreciationRate?: number;
  rentalYield?: number;
  className?: string;
}

const ROICalculator: React.FC<ROICalculatorProps> = ({
  propertyPrice = 0,
  minimumInvestment = 50000,
  expectedROI = 15,
  tenure = 36,
  appreciationRate = 8,
  rentalYield = 0,
  className = '',
}) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(minimumInvestment);
  const [investmentTenure, setInvestmentTenure] = useState<number>(tenure);
  const [roiRate, setRoiRate] = useState<number>(expectedROI);
  const [appreciationRateValue, setAppreciationRateValue] = useState<number>(appreciationRate);
  const [rentalYieldValue, setRentalYieldValue] = useState<number>(rentalYield);
  const [taxRate, setTaxRate] = useState<number>(10); // TDS %
  const [calculation, setCalculation] = useState<ROICalculation | null>(null);

  useEffect(() => {
    calculateROI();
  }, [investmentAmount, investmentTenure, roiRate, appreciationRateValue, rentalYieldValue, taxRate]);

  const calculateROI = () => {
    const years = investmentTenure / 12;

    // ROI Calculation
    const totalROI = (investmentAmount * roiRate * years) / 100;

    // Appreciation Calculation (Compound Interest)
    const appreciationGains = investmentAmount * (Math.pow(1 + appreciationRateValue / 100, years) - 1);

    // Rental Income Calculation
    const annualRentalIncome = (investmentAmount * rentalYieldValue) / 100;
    const totalRentalIncome = annualRentalIncome * years;

    // Total Returns
    const grossReturns = totalROI + appreciationGains + totalRentalIncome;
    const taxAmount = (grossReturns * taxRate) / 100;
    const netReturns = grossReturns - taxAmount;

    // ROI Percentage
    const totalROIPercentage = ((netReturns / investmentAmount) * 100);

    // Break Even Period (months)
    const monthlyReturn = netReturns / investmentTenure;
    const breakEven = investmentAmount / monthlyReturn;

    setCalculation({
      totalInvestment: investmentAmount,
      expectedReturns: grossReturns,
      roiPercentage: totalROIPercentage,
      annualReturns: netReturns / years,
      monthlyReturns: netReturns / investmentTenure,
      appreciationGains,
      rentalIncome: totalRentalIncome,
      netReturns,
      breakEvenPeriod: breakEven,
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <FiBarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              ROI Calculator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate your investment returns with advanced analytics
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiDollarSign className="inline w-4 h-4 mr-1" />
              Investment Amount
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              min={minimumInvestment}
              step={10000}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum: {formatCurrency(minimumInvestment)}
            </p>
          </div>

          {/* Investment Tenure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              Investment Period (Months)
            </label>
            <input
              type="number"
              value={investmentTenure}
              onChange={(e) => setInvestmentTenure(Number(e.target.value))}
              min={12}
              max={120}
              step={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              type="range"
              value={investmentTenure}
              onChange={(e) => setInvestmentTenure(Number(e.target.value))}
              min={12}
              max={120}
              step={6}
              className="w-full mt-2"
            />
          </div>

          {/* ROI Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiTrendingUp className="inline w-4 h-4 mr-1" />
              Expected ROI (%)
            </label>
            <input
              type="number"
              value={roiRate}
              onChange={(e) => setRoiRate(Number(e.target.value))}
              min={5}
              max={30}
              step={0.5}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Appreciation Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiPercent className="inline w-4 h-4 mr-1" />
              Annual Appreciation (%)
            </label>
            <input
              type="number"
              value={appreciationRateValue}
              onChange={(e) => setAppreciationRateValue(Number(e.target.value))}
              min={0}
              max={20}
              step={0.5}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Rental Yield */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiPieChart className="inline w-4 h-4 mr-1" />
              Rental Yield (%)
            </label>
            <input
              type="number"
              value={rentalYieldValue}
              onChange={(e) => setRentalYieldValue(Number(e.target.value))}
              min={0}
              max={15}
              step={0.5}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiPercent className="inline w-4 h-4 mr-1" />
              Tax Rate (TDS %)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min={0}
              max={30}
              step={0.5}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Results */}
        {calculation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">Total Returns</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
                  {formatCurrency(calculation.netReturns)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  {formatPercentage(calculation.roiPercentage)} Total ROI
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Monthly Returns</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                  {formatCurrency(calculation.monthlyReturns)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  Annual: {formatCurrency(calculation.annualReturns)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">Break Even</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
                  {Math.ceil(calculation.breakEvenPeriod)} Months
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                  ~{Math.ceil(calculation.breakEvenPeriod / 12)} Years
                </p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiInfo className="w-5 h-5 text-blue-500" />
                Detailed Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Investment Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculation.totalInvestment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ROI Returns</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency((investmentAmount * roiRate * (investmentTenure / 12)) / 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Appreciation Gains</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculation.appreciationGains)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Rental Income</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(calculation.rentalIncome)}
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Gross Returns</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculation.expectedReturns)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Tax Deduction ({taxRate}%)</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    - {formatCurrency((calculation.expectedReturns * taxRate) / 100)}
                  </span>
                </div>
                <div className="border-t-2 border-green-500 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Net Returns</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(calculation.netReturns)}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex gap-3">
                <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Disclaimer</p>
                  <p>
                    These calculations are estimates based on the parameters provided. Actual returns may vary depending on
                    market conditions, property performance, and other factors. Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ROICalculator;
