import { useState, useEffect } from 'react';
import Button from '../ui/Button';

export interface FilterState {
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  categoryId?: string;
  brandId?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: Category[];
  brands: Brand[];
}

const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];

export default function ProductFilters({ filters, onChange, categories, brands }: ProductFiltersProps) {
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  function apply() {
    onChange(local);
  }

  function clear() {
    const cleared: FilterState = {};
    setLocal(cleared);
    onChange(cleared);
  }

  return (
    <div className="bg-white p-4 rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">FILTERS</h3>
        <button onClick={clear} className="text-xs text-primary hover:underline">
          Clear All
        </button>
      </div>

      {/* Gender */}
      <div className="mb-5 border-b border-gray-100 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">GENDER</h4>
        <div className="flex flex-col gap-2">
          {GENDERS.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={g.toLowerCase()}
                checked={local.gender === g.toLowerCase()}
                onChange={() => setLocal({ ...local, gender: g.toLowerCase() })}
                className="accent-primary"
              />
              <span className="text-sm text-gray-600">{g}</span>
            </label>
          ))}
          {local.gender && (
            <button
              onClick={() => setLocal({ ...local, gender: undefined })}
              className="text-xs text-gray-400 hover:text-primary text-left"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5 border-b border-gray-100 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">PRICE RANGE</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={local.minPrice || ''}
            onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={local.maxPrice || ''}
            onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">CATEGORIES</h4>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.categoryId === cat._id}
                  onChange={() =>
                    setLocal({
                      ...local,
                      categoryId: local.categoryId === cat._id ? undefined : cat._id,
                    })
                  }
                  className="accent-primary"
                />
                <span className="text-sm text-gray-600">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-5 border-b border-gray-100 pb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">BRANDS</h4>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.brandId === brand._id}
                  onChange={() =>
                    setLocal({
                      ...local,
                      brandId: local.brandId === brand._id ? undefined : brand._id,
                    })
                  }
                  className="accent-primary"
                />
                <span className="text-sm text-gray-600">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Button onClick={apply} className="w-full" size="md">
        Apply Filters
      </Button>
    </div>
  );
}
