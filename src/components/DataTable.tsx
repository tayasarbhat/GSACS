import React, { useState, useMemo } from 'react';
import { SheetRow } from '../types';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Lock, Unlock, Phone, Calendar, User, Tag, Loader2 } from 'lucide-react';

interface DataTableProps {
  data: SheetRow[];
  onStatusChange: (row: SheetRow, newStatus: 'Open' | 'Reserved') => void;
  pendingUpdates: Map<string, boolean>;
}

export function DataTable({ data, onStatusChange, pendingUpdates }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof SheetRow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const formatMsisdn = (msisdn: string | number): string => {
    const msisdnStr = String(msisdn);
    if (msisdnStr.startsWith('971')) {
      return '0' + msisdnStr.slice(3);
    }
    return msisdnStr;
  };

  const handleSort = (field: keyof SheetRow) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = (row: SheetRow, newStatus: 'Open' | 'Reserved') => {
    if (newStatus === 'Reserved') {
      const confirmed = window.confirm(`Are you sure you want to change the status to Reserved?`);
      if (!confirmed) return;
    }
    onStatusChange(row, newStatus);
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    
    return data.filter((row) => {
      return searchTerms.every(term => {
        // Check for "end" search pattern
        if (searchTerms.length >= 2 && searchTerms[searchTerms.length - 1] === 'end') {
          const searchNumber = searchTerms.slice(0, -1).join('');
          if (/^\d+$/.test(searchNumber)) {
            const formattedMsisdn = formatMsisdn(row.msisdn);
            return formattedMsisdn.endsWith(searchNumber);
          }
        }

        // Regular search patterns
        if (term.includes(':')) {
          const [categorySearch, numberSearch] = term.split(':').map(s => s.trim());
          if (!categorySearch || !numberSearch) return false;
          
          const categoryMatch = row.category.toLowerCase().includes(categorySearch);
          const numberMatch = String(row.msisdn).includes(numberSearch);
          return categoryMatch && numberMatch;
        }

        if (/^\d+$/.test(term)) {
          const msisdnStr = String(row.msisdn);
          if (msisdnStr.includes(term)) return true;
        }

        if (row.category.toLowerCase().includes(term)) return true;
        if (String(row.msisdn).includes(term)) return true;

        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(term)
        );
      });
    });
  }, [data, search]);

  const displayData = useMemo(() => {
    if (!sortField) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = String(a[sortField]);
      const bValue = String(b[sortField]);
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(displayData.length / pageSize);
  const paginatedData = pageSize === -1 
    ? displayData 
    : displayData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-grow max-w-md space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            <input
              type="text"
              placeholder="Search by number, category... (Add 'end' to search numbers ending with digits)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-20 py-3 bg-white/10 border border-white/20 rounded-lg 
                focus:ring-2 focus:ring-white/30 focus:border-transparent text-white 
                placeholder-white/60 text-lg"
            />
            {search && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                {filteredData.length} results
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-white font-medium">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-lg font-medium
              focus:ring-2 focus:ring-white/30 hover:bg-white/20 transition-all duration-300"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="-1">All</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg glass">
        <table className="w-full text-base lg:text-lg">
          <thead className="text-base uppercase bg-white/10 font-bold">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-6 py-4 cursor-pointer hover:bg-white/5 text-white"
                  onClick={() => handleSort(key as keyof SheetRow)}
                >
                  <div className="flex items-center gap-2">
                    {key === 'msisdn' && <Phone size={18} />}
                    {key === 'assignDate' && <Calendar size={18} />}
                    {key === 'category' && <Tag size={18} />}
                    {key === 'owner' && <User size={18} />}
                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {sortField === key && (
                      <ArrowUpDown size={16} className={`text-white/60 transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedData.map((row) => {
              const isUpdating = pendingUpdates.get(row.msisdn);

              return (
                <tr key={row.msisdn} className="hover:bg-white/5 transition-colors duration-200">
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {key === 'statusByCallCenter' ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={value}
                            onChange={(e) => handleStatusChange(row, e.target.value as 'Open' | 'Reserved')}
                            disabled={isUpdating}
                            className={`flex-1 px-4 py-2 rounded-md border text-base font-bold focus:ring-2 
                              focus:ring-white/30 transition-colors ${
                              value === 'Open' 
                                ? 'bg-green-400/20 border-green-400/30 text-green-400' 
                                : 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400'
                            } ${isUpdating ? 'opacity-50' : ''}`}
                          >
                            <option value="Open">Open</option>
                            <option value="Reserved">Reserved</option>
                          </select>
                          {isUpdating ? (
                            <Loader2 size={20} className="text-white animate-spin" />
                          ) : value === 'Open' ? (
                            <Unlock size={20} className="text-green-400" />
                          ) : (
                            <Lock size={20} className="text-yellow-400" />
                          )}
                        </div>
                      ) : key === 'msisdn' ? (
                        <span className="font-semibold">{formatMsisdn(String(value))}</span>
                      ) : (
                        <span className="font-semibold">{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageSize !== -1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white font-medium">
          <div className="text-base">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, displayData.length)} of {displayData.length} entries
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 glass rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-lg font-bold">{currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 glass rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}