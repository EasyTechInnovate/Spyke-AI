'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Package, Tag, ShoppingCart, Clock, Lock } from 'lucide-react';
const initialProgressData = [
  {
    id: 'cart-1',
    feature: 'Cart Model & Schema',
    category: 'cart',
    description: 'MongoDB model for cart with item management',
    backend: true,
    frontend: false
  },
  {
    id: 'cart-2',
    feature: 'Cart API Endpoints',
    category: 'cart',
    description: 'GET/POST/DELETE endpoints for cart operations',
    backend: true,
    frontend: false
  },
  {
    id: 'cart-3',
    feature: 'Cart UI Page',
    category: 'cart',
    description: 'Shopping cart page with item display',
    backend: false,
    frontend: true
  },
  {
    id: 'cart-4',
    feature: 'useCart Hook',
    category: 'cart',
    description: 'React hook for cart state management',
    backend: false,
    frontend: true
  },
  {
    id: 'cart-5',
    feature: 'Cart Persistence',
    category: 'cart',
    description: 'Server-side cart storage for users',
    backend: true,
    frontend: false
  },
  {
    id: 'promo-1',
    feature: 'Promocode Model',
    category: 'promocode',
    description: 'Complete promocode schema with validation',
    backend: true,
    frontend: false
  },
  {
    id: 'promo-2',
    feature: 'Promocode CRUD APIs',
    category: 'promocode',
    description: 'Create, read, update, delete promocodes',
    backend: true,
    frontend: false
  },
  {
    id: 'promo-3',
    feature: 'Promocode Validation',
    category: 'promocode',
    description: 'Business logic for code validation',
    backend: true,
    frontend: false
  },
  {
    id: 'promo-4',
    feature: 'Promocode UI Integration',
    category: 'promocode',
    description: 'Connect UI to promocode APIs',
    backend: false,
    frontend: false
  },
  {
    id: 'promo-5',
    feature: 'Promocode Management Dashboard',
    category: 'promocode',
    description: 'Seller/admin promocode creation UI',
    backend: false,
    frontend: false
  },
  {
    id: 'purchase-1',
    feature: 'Purchase Model',
    category: 'purchase',
    description: 'Multi-item purchase with status tracking',
    backend: true,
    frontend: false
  },
  {
    id: 'purchase-2',
    feature: 'Purchase Creation API',
    category: 'purchase',
    description: 'Convert cart to purchase order',
    backend: true,
    frontend: false
  },
  {
    id: 'purchase-3',
    feature: 'Checkout Page',
    category: 'purchase',
    description: 'Complete checkout flow UI',
    backend: false,
    frontend: false
  },
  {
    id: 'purchase-4',
    feature: 'Payment Gateway Integration',
    category: 'purchase',
    description: 'Stripe/Razorpay payment processing',
    backend: false,
    frontend: false
  },
  {
    id: 'purchase-5',
    feature: 'Order Confirmation',
    category: 'purchase',
    description: 'Success page after payment',
    backend: false,
    frontend: false
  },
  {
    id: 'history-1',
    feature: 'Purchase History API',
    category: 'history',
    description: 'Get user purchases with filtering',
    backend: true,
    frontend: false
  },
  {
    id: 'history-2',
    feature: 'Categorized History API',
    category: 'history',
    description: 'Group purchases by product type',
    backend: true,
    frontend: false
  },
  {
    id: 'history-3',
    feature: 'Purchase History Page',
    category: 'history',
    description: 'User account purchases page',
    backend: false,
    frontend: false
  },
  {
    id: 'history-4',
    feature: 'Purchase Cards UI',
    category: 'history',
    description: 'Visual display of purchased items',
    backend: false,
    frontend: false
  },
  {
    id: 'premium-1',
    feature: 'Premium Content Fields',
    category: 'premium',
    description: 'Model fields for gated content',
    backend: true,
    frontend: false
  },
  {
    id: 'premium-2',
    feature: 'Access Control Logic',
    category: 'premium',
    description: 'Purchase verification for content',
    backend: true,
    frontend: false
  },
  {
    id: 'premium-3',
    feature: 'Content Gating UI',
    category: 'premium',
    description: 'Lock/unlock UI components',
    backend: false,
    frontend: false
  },
  {
    id: 'premium-4',
    feature: 'Purchase Status Check',
    category: 'premium',
    description: 'API calls to verify ownership',
    backend: false,
    frontend: false
  },
  {
    id: 'premium-5',
    feature: 'Download System',
    category: 'premium',
    description: 'Download purchased digital content',
    backend: false,
    frontend: false
  }
];
const categoryIcons = {
  cart: ShoppingCart,
  promocode: Tag,
  purchase: Package,
  history: Clock,
  premium: Lock
};
const categoryColors = {
  cart: 'blue',
  promocode: 'purple',
  purchase: 'green',
  history: 'orange',
  premium: 'pink'
};
export default function ProgressTracker() {
  const [progressData, setProgressData] = useState(initialProgressData);
  useEffect(() => {
    const savedProgress = localStorage.getItem('spyke_progress_tracker');
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Failed to load saved progress');
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('spyke_progress_tracker', JSON.stringify(progressData));
  }, [progressData]);
  const updateProgress = (itemId, type, value) => {
    setProgressData(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, [type]: value }
          : item
      )
    );
  };
  const calculateStats = () => {
    const stats = {
      total: progressData.length,
      byCategory: {},
      overall: {
        frontend: { implemented: 0, pending: 0, percentage: 0 },
        backend: { implemented: 0, pending: 0, percentage: 0 }
      }
    };
    progressData.forEach(item => {
      if (!stats.byCategory[item.category]) {
        stats.byCategory[item.category] = {
          total: 0,
          frontend: { implemented: 0, pending: 0 },
          backend: { implemented: 0, pending: 0 }
        };
      }
      stats.byCategory[item.category].total++;
      if (item.frontend) {
        stats.byCategory[item.category].frontend.implemented++;
        stats.overall.frontend.implemented++;
      } else {
        stats.byCategory[item.category].frontend.pending++;
        stats.overall.frontend.pending++;
      }
      if (item.backend) {
        stats.byCategory[item.category].backend.implemented++;
        stats.overall.backend.implemented++;
      } else {
        stats.byCategory[item.category].backend.pending++;
        stats.overall.backend.pending++;
      }
    });
    stats.overall.frontend.percentage = Math.round(
      (stats.overall.frontend.implemented / stats.total) * 100
    );
    stats.overall.backend.percentage = Math.round(
      (stats.overall.backend.implemented / stats.total) * 100
    );
    Object.keys(stats.byCategory).forEach(category => {
      const cat = stats.byCategory[category];
      cat.frontend.percentage = Math.round(
        (cat.frontend.implemented / cat.total) * 100
      );
      cat.backend.percentage = Math.round(
        (cat.backend.implemented / cat.total) * 100
      );
    });
    return stats;
  };
  const stats = calculateStats();
  const groupedItems = progressData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product System Enhancement - Progress Tracker
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track implementation progress for frontend and backend features (Stored locally)
          </p>
        </div>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Frontend Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Implemented</span>
                <span className="font-medium text-green-600">{stats.overall.frontend.implemented}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium text-yellow-600">{stats.overall.frontend.pending}</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.overall.frontend.percentage}%` }}
                  ></div>
                </div>
                <p className="text-center mt-1 text-sm font-medium">{stats.overall.frontend.percentage}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Backend Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Implemented</span>
                <span className="font-medium text-green-600">{stats.overall.backend.implemented}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium text-yellow-600">{stats.overall.backend.pending}</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.overall.backend.percentage}%` }}
                  ></div>
                </div>
                <p className="text-center mt-1 text-sm font-medium">{stats.overall.backend.percentage}%</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => {
            const Icon = categoryIcons[category] || Package;
            const color = categoryColors[category] || 'gray';
            return (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                    <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">
                      {category.replace('_', ' ')} System
                    </h2>
                    <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                      Frontend: {stats.byCategory[category].frontend.percentage}% | 
                      Backend: {stats.byCategory[category].backend.percentage}%
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        <th className="pb-4 pr-4 w-2/5">Feature</th>
                        <th className="pb-4 pr-4 w-2/5">Description</th>
                        <th className="pb-4 text-center w-1/10">Frontend</th>
                        <th className="pb-4 text-center w-1/10">Backend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="py-4 pr-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.feature}
                            </p>
                          </td>
                          <td className="py-4 pr-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => updateProgress(item.id, 'frontend', !item.frontend)}
                              className="inline-flex items-center justify-center w-8 h-8 transition-colors"
                            >
                              {item.frontend ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => updateProgress(item.id, 'backend', !item.backend)}
                              className="inline-flex items-center justify-center w-8 h-8 transition-colors"
                            >
                              {item.backend ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (confirm('Reset all progress to initial state?')) {
                setProgressData(initialProgressData);
              }
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}