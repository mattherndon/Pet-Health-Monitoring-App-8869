import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePets } from '../context/PetContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiDollarSign, FiCalendar, FiPieChart } = FiIcons;

const CostSummary = ({ petId = null }) => {
  const { getHealthCosts, pets } = usePets();
  const [timeRange, setTimeRange] = useState('all-time');
  const [category, setCategory] = useState('all');
  const [costData, setCostData] = useState({ total: 0, byCategory: {}, logs: [] });
  
  const costCategories = [
    { id: 'all', name: 'All Categories' },
    { id: 'medical', name: 'Medical' },
    { id: 'medication', name: 'Medication' },
    { id: 'food', name: 'Food' },
    { id: 'supplies', name: 'Supplies' },
    { id: 'grooming', name: 'Grooming' },
    { id: 'training', name: 'Training' },
    { id: 'boarding', name: 'Boarding' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'other', name: 'Other' }
  ];
  
  const timeRanges = [
    { id: 'all-time', name: 'All Time' },
    { id: 'this-month', name: 'This Month' },
    { id: 'last-month', name: 'Last Month' },
    { id: 'this-year', name: 'This Year' },
    { id: 'last-year', name: 'Last Year' }
  ];
  
  useEffect(() => {
    // Calculate date range based on selected time range
    let startDate = null;
    let endDate = null;
    
    const now = new Date();
    
    if (timeRange === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeRange === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (timeRange === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else if (timeRange === 'last-year') {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
    }
    
    // Get cost data
    const costs = getHealthCosts(
      petId, 
      category === 'all' ? null : category,
      startDate,
      endDate
    );
    
    setCostData(costs);
  }, [timeRange, category, petId, getHealthCosts]);
  
  // Function to get color for category
  const getCategoryColor = (categoryId) => {
    const colors = {
      'medical': 'bg-blue-500',
      'medication': 'bg-purple-500',
      'food': 'bg-yellow-500',
      'supplies': 'bg-green-500',
      'grooming': 'bg-pink-500',
      'training': 'bg-indigo-500',
      'boarding': 'bg-orange-500',
      'insurance': 'bg-teal-500',
      'other': 'bg-gray-500'
    };
    
    return colors[categoryId] || 'bg-gray-500';
  };
  
  // Calculate percentage for each category
  const calculatePercentage = (value) => {
    return costData.total > 0 ? (value / costData.total * 100).toFixed(1) : 0;
  };
  
  // Get pet name if petId is provided
  const petName = petId ? pets.find(p => p.id === petId)?.name : 'All Pets';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
          <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-green-500" />
          Cost Summary
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.id} value={range.id}>{range.name}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {costCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-6 p-6 bg-green-50 rounded-lg border border-green-100 text-center">
        <div className="text-sm text-green-700 mb-2 flex items-center justify-center gap-1">
          <SafeIcon icon={FiCalendar} className="w-4 h-4" />
          {petName} • {timeRanges.find(r => r.id === timeRange)?.name}
        </div>
        <div className="text-4xl font-bold text-green-800">
          ${costData.total.toFixed(2)}
        </div>
        <div className="text-sm text-green-700 mt-1">
          Total {category !== 'all' ? costCategories.find(c => c.id === category)?.name : ''} Expenses
        </div>
      </div>
      
      {/* Category Breakdown */}
      {costData.total > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SafeIcon icon={FiPieChart} className="w-4 h-4 text-gray-700" />
            <h4 className="font-medium text-gray-800">Expense Breakdown</h4>
          </div>
          
          <div className="space-y-3">
            {Object.entries(costData.byCategory)
              .sort(([, a], [, b]) => b - a) // Sort by amount (highest first)
              .map(([categoryId, amount]) => (
                <div key={categoryId} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {categoryId}
                    </span>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">${amount.toFixed(2)}</span>
                      <span className="text-gray-500 ml-1">
                        ({calculatePercentage(amount)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculatePercentage(amount)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full ${getCategoryColor(categoryId)}`}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {costData.logs.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No expenses recorded for the selected time period
        </div>
      )}
    </div>
  );
};

export default CostSummary;