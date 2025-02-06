import React from 'react';
import { SheetRow } from '../types';
import { Hash, PhoneCall, Lock, Unlock, ChevronRight } from 'lucide-react';

interface StatsProps {
  data: SheetRow[];
  onCategoryClick: (category: string) => void;
  selectedCategory: string | null;
}

export function Stats({ data, onCategoryClick, selectedCategory }: StatsProps) {
  const stats = React.useMemo(() => {
    const categoryStats = data.reduce((acc, row) => {
      const category = row.category;
      const status = row.statusByCallCenter;
      
      if (!acc[category]) {
        acc[category] = { total: 0, open: 0, reserved: 0 };
      }
      
      acc[category].total++;
      acc[category][status.toLowerCase()]++;
      
      return acc;
    }, {} as Record<string, { total: number; open: number; reserved: number }>);

    const totalNumbers = data.length;
    const totalOpen = data.filter(row => row.statusByCallCenter === 'Open').length;
    const totalReserved = data.filter(row => row.statusByCallCenter === 'Reserved').length;

    return {
      categories: categoryStats,
      totals: { total: totalNumbers, open: totalOpen, reserved: totalReserved }
    };
  }, [data]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* Summary Cards */}
      <div className="col-span-2 sm:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Numbers Card */}
        <div className="glass p-3 rounded-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs font-medium">Total Numbers</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{stats.totals.total}</h3>
            </div>
            <div className="p-2 glass rounded-lg">
              <Hash className="text-white" size={18} />
            </div>
          </div>
        </div>

        {/* Open Numbers Card */}
        <div className="glass p-3 rounded-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs font-medium">Open Numbers</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{stats.totals.open}</h3>
            </div>
            <div className="p-2 glass rounded-lg">
              <Unlock className="text-green-400" size={18} />
            </div>
          </div>
        </div>

        {/* Reserved Numbers Card */}
        <div className="glass p-3 rounded-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs font-medium">Reserved Numbers</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{stats.totals.reserved}</h3>
            </div>
            <div className="p-2 glass rounded-lg">
              <Lock className="text-yellow-400" size={18} />
            </div>
          </div>
        </div>

        {/* Active Categories Card */}
        <div className="glass p-3 rounded-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs font-medium">Categories</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{Object.keys(stats.categories).length}</h3>
            </div>
            <div className="p-2 glass rounded-lg">
              <PhoneCall className="text-blue-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Details */}
      <div className="col-span-2 sm:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(stats.categories).map(([category, { total, open, reserved }]) => (
          <button
            key={category}
            onClick={() => onCategoryClick(category)}
            className={`glass p-3 rounded-lg hover:bg-white/20 transition-all duration-300 text-left transform hover:scale-105 ${
              selectedCategory === category ? 'ring-2 ring-white/50 bg-white/20 scale-105' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-xs font-medium truncate">Category: {category}</p>
                <h3 className="text-lg font-bold text-white mt-0.5 truncate">
                  {total}
                </h3>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs font-medium text-green-400">
                    <Unlock size={12} className="inline mr-1" />
                    {open}
                  </span>
                  <span className="text-xs font-medium text-yellow-400">
                    <Lock size={12} className="inline mr-1" />
                    {reserved}
                  </span>
                </div>
              </div>
              <ChevronRight className={`text-white/60 transition-transform ${
                selectedCategory === category ? 'rotate-90' : ''
              }`} size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}