import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiPieChart,
  FiInfo,
  FiTrendingDown,
} from 'react-icons/fi';

interface EMICalculation {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
  principalAmount: number;
  schedule: EMIScheduleItem[];
}

interface EMIScheduleItem {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

interface EMICalculatorProps {
  propertyPrice?: number;
  className?: string;
}

const EMICalculator: React.FC<EMICalculatorProps> = ({
  propertyPrice = 5000000,
  className = '',
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(propertyPrice * 0.8); // 80% LTV
  const [interestRate, setInterestRate] = useState<number>(8.5); // Annual %
  const [loanTenure, setLoanTenure] = useState<number>(20); // Years
  const [downPayment, setDownPayment] = useState<number>(propertyPrice * 0.20);
  const [calculation, setCalculation] = useState<EMICalculation | null>(null);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, loanTenure]);

  useEffect(() => {
    const newLoanAmount = propertyPrice - downPayment;
    setLoanAmount(newLoanAmount > 0 ? newLoanAmount : 0);
  }, [propertyPrice, downPayment]);

  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;

    if (monthlyRate === 0) {
      const emi = principal / totalMonths;
      const totalPayment = principal;
      const totalInterest = 0;

      setCalculation({
        monthlyEMI: emi,
        totalPayment,
        totalInterest,
        principalAmount: principal,
        schedule: generateSchedule(principal, 0, totalMonths, emi),
      });
      return;
    }

    // EMI Formula: [P × r × (1 + r)^n] / [(1 + r)^n - 1]
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - principal;

    setCalculation({
      monthlyEMI: emi,
      totalPayment,
      totalInterest,
      principalAmount: principal,
      schedule: generateSchedule(principal, monthlyRate, totalMonths, emi),
    });
  };

  const generateSchedule = (
    principal: number,
    monthlyRate: number,
    totalMonths: number,
    emi: number
  ): EMIScheduleItem[] => {
    const schedule: EMIScheduleItem[] = [];
    let balance = principal;

    for (let month = 1; month <= Math.min(totalMonths, 60); month++) {
      const interest = balance * monthlyRate;
      const principalPaid = emi - interest;
      balance -= principalPaid;

      schedule.push({
        month,
        emi,
        principal: principalPaid,
        interest,
        balance: Math.max(balance, 0),
      });
    }

    return schedule;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateLTV = (): number => {
    return (loanAmount / (loanAmount + downPayment)) * 100;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
            <FiPieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              EMI Calculator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate your monthly loan installments
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Price */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiDollarSign className="inline w-4 h-4 mr-1" />
              Property Price
            </label>
            <input
              type="number"
              value={propertyPrice}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          {/* Down Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiTrendingDown className="inline w-4 h-4 mr-1" />
              Down Payment
            </label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min={0}
              max={propertyPrice}
              step={100000}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <input
              type="range"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min={0}
              max={propertyPrice}
              step={100000}
              className="w-full mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {((downPayment / propertyPrice) * 100).toFixed(1)}% of property price
            </p>
          </div>

          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiDollarSign className="inline w-4 h-4 mr-1" />
              Loan Amount
            </label>
            <input
              type="number"
              value={loanAmount}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              LTV: {calculateLTV().toFixed(1)}%
            </p>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiPercent className="inline w-4 h-4 mr-1" />
              Interest Rate (Annual %)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min={6}
              max={15}
              step={0.1}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <input
              type="range"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min={6}
              max={15}
              step={0.1}
              className="w-full mt-2"
            />
          </div>

          {/* Loan Tenure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              Loan Tenure (Years)
            </label>
            <input
              type="number"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              min={5}
              max={30}
              step={1}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <input
              type="range"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              min={5}
              max={30}
              step={1}
              className="w-full mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {loanTenure * 12} monthly installments
            </p>
          </div>
        </div>

        {/* Results */}
        {calculation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* EMI Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Your Monthly EMI</p>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(calculation.monthlyEMI)}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Principal: {formatCurrency(calculation.principalAmount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span>Interest: {formatCurrency(calculation.totalInterest)}</span>
                </div>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Payment</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(calculation.totalPayment)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Principal Amount</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(calculation.principalAmount)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {formatCurrency(calculation.totalInterest)}
                </p>
              </div>
            </div>

            {/* Principal vs Interest Chart */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Breakdown</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Principal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {((calculation.principalAmount / calculation.totalPayment) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(calculation.principalAmount / calculation.totalPayment) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Interest</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {((calculation.totalInterest / calculation.totalPayment) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(calculation.totalInterest / calculation.totalPayment) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Schedule Toggle */}
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium rounded-lg transition-all"
            >
              {showSchedule ? 'Hide' : 'View'} Amortization Schedule (First 60 Months)
            </button>

            {/* Amortization Schedule */}
            {showSchedule && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-900/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Month</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">EMI</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Principal</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Interest</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {calculation.schedule.map((item) => (
                        <tr key={item.month} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-gray-900 dark:text-white">{item.month}</td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(item.emi)}</td>
                          <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(item.principal)}</td>
                          <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">{formatCurrency(item.interest)}</td>
                          <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(item.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Info Banner */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
              <div className="flex gap-3">
                <FiInfo className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-800 dark:text-indigo-300">
                  <p className="font-semibold mb-1">Note</p>
                  <p>
                    The EMI calculations are indicative and may vary based on the actual loan terms, processing fees,
                    and other charges levied by the lender. Please check with your financial institution for exact details.
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

export default EMICalculator;
