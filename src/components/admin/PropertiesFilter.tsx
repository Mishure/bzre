'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FormEvent, useState } from 'react';

interface FilterProps {
  defaultValues: {
    search?: string;
    status?: string;
    type?: string;
    operation?: string;
  };
}

export default function PropertiesFilter({ defaultValues }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(defaultValues);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.operation) params.set('operation', filters.operation);
    
    router.push(`/admin/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Căutare</label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nume, stradă, zonă..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="">Toate</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Arhivate</option>
          <option value="SOLD">Vândute</option>
          <option value="RENTED">Închiriat</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tip proprietate</label>
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="">Toate</option>
          <option value="APARTAMENT">Apartamente</option>
          <option value="CASA">Case</option>
          <option value="TEREN">Terenuri</option>
          <option value="SPATIU_COMERCIAL">Spații comerciale</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Operație</label>
        <select
          value={filters.operation || ''}
          onChange={(e) => setFilters({ ...filters, operation: e.target.value })}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="">Toate</option>
          <option value="VANZARE">Vânzare</option>
          <option value="INCHIRIERE">Închiriere</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Filtrează
        </button>
      </div>
    </form>
  );
}