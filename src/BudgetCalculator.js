import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetCalculator() {
  const [grossIncome, setGrossIncome] = useState('');
  const [afterTaxIncome, setAfterTaxIncome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    primary: '#003366',
    accent: '#00a3e0',
    background: '#0f172a',
    glass: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#f1f5f9',
    error: '#f87171',
    success: '#4ade80',
  };

  const handleReset = () => {
    setGrossIncome('');
    setAfterTaxIncome(null);
    setError('');
  };

  const calculateAfterTaxIncome = async () => {
    if (!grossIncome || isNaN(parseFloat(grossIncome)) || parseFloat(grossIncome) <= 0) {
      setError('Please enter a valid income greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://sars-tax-backend.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gross_monthly_income: parseFloat(grossIncome) }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setAfterTaxIncome(data.result);
    } catch (err) {
      setError(err.message || 'Unable to fetch tax data');
    } finally {
      setLoading(false);
    }
  };

  const taxAmount = afterTaxIncome !== null ? parseFloat(grossIncome) - afterTaxIncome : 0;

  const chartData = {
    labels: ['Take-Home Pay', 'Tax Deducted'],
    datasets: [
      {
        data: [afterTaxIncome || 0, taxAmount],
        backgroundColor: [colors.success, '#facc15'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.text,
        },
      },
    },
  };

  return (
    React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center px-4 py-10',
      style: {
        background: 'radial-gradient(circle at top, #001f3f, #0f172a)',
        color: colors.text,
        fontFamily: 'Inter, sans-serif',
      }
    },
      React.createElement('div', {
        className: 'w-full max-w-md p-6 rounded-2xl shadow-xl backdrop-blur-lg',
        style: {
          background: colors.glass,
          border: `1px solid ${colors.border}`,
        }
      },
        React.createElement('h1', {
          className: 'text-3xl font-bold text-center mb-2',
          style: { color: colors.accent }
        }, 'SARS Tax Calculator'),

        React.createElement('p', {
          className: 'text-sm text-center mb-6 text-slate-300'
        }, 'See how much take-home you actually keep 💸'),

        React.createElement('label', {
          htmlFor: 'grossIncome',
          className: 'block text-sm mb-1 text-slate-200'
        }, 'Gross Monthly Income (ZAR)'),

        React.createElement('div', { className: 'relative mb-4' },
          React.createElement('span', {
            className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          }, 'R'),
          React.createElement('input', {
            id: 'grossIncome',
            type: 'number',
            value: grossIncome,
            onChange: (e) => setGrossIncome(e.target.value),
            placeholder: 'e.g. 35000',
            className: 'pl-7 pr-4 py-3 w-full rounded-md text-base bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
          }),
          error && React.createElement('p', {
            className: 'mt-2 text-sm',
            style: { color: colors.error }
          }, error)
        ),

        React.createElement('div', { className: 'flex space-x-3 mb-2' },
          React.createElement('button', {
            onClick: calculateAfterTaxIncome,
            disabled: loading,
            className: 'flex-1 py-3 rounded-md font-semibold transition',
            style: {
              backgroundColor: colors.primary,
              color: 'white',
              opacity: loading ? 0.6 : 1,
            }
          }, loading ? 'Calculating...' : 'Calculate'),

          React.createElement('button', {
            onClick: handleReset,
            className: 'flex-1 py-3 border border-slate-600 rounded-md text-sm text-slate-200 hover:bg-slate-800 transition'
          }, 'Reset')
        ),

        afterTaxIncome !== null && React.createElement('div', {
          className: 'mt-6 p-5 rounded-xl border backdrop-blur-lg transition-all duration-500',
          style: {
            borderColor: colors.border,
            background: 'rgba(255,255,255,0.03)'
          }
        },
          React.createElement('h2', {
            className: 'text-lg font-semibold mb-4',
            style: { color: colors.accent }
          }, '💰 Your Take-Home Breakdown'),

          React.createElement('div', { className: 'flex justify-between text-sm border-b border-slate-700 pb-2 mb-2' },
            React.createElement('span', null, 'Gross Income:'),
            React.createElement('span', null, `R ${parseFloat(grossIncome).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`)
          ),

          React.createElement('div', { className: 'flex justify-between text-sm border-b border-slate-700 pb-2 mb-2' },
            React.createElement('span', null, 'Tax Deducted:'),
            React.createElement('span', null, `R ${(parseFloat(grossIncome) - afterTaxIncome).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`)
          ),

          React.createElement('div', {
            className: 'flex justify-between text-base font-bold',
            style: { color: colors.success }
          },
            React.createElement('span', null, 'Take-Home:'),
            React.createElement('span', null, `R ${afterTaxIncome.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`)
          )
        ),

        afterTaxIncome !== null && React.createElement('div', {
          className: 'mt-6 mb-2 flex justify-center'
        },
          React.createElement(Doughnut, {
            data: chartData,
            options: {
              ...chartOptions,
              responsive: false,
              animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutBounce'
              },
              cutout: '65%', // makes it a bit thinner
            },
            width: 180,
            height: 180
          })
        ),
        

        React.createElement('p', {
          className: 'text-xs text-center mt-6 text-slate-500'
        }, `© ${new Date().getFullYear()} SARS Estimator using 2024 SARS tax table (unchanges in 2025)`)
      )
    )
  );
}
