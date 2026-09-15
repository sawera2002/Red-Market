import React from 'react';
import {
  LayoutGrid,
  Apple,
  Carrot,
  Milk,
  Croissant,
  Beef,
  Package,
  Coffee,
  Fish
} from 'lucide-react';

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  productCounts: Record<string, number>;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'all aisles':
        return <LayoutGrid className="w-3.5 h-3.5" />;
      case 'fresh fruits':
        return <Apple className="w-3.5 h-3.5" />;
      case 'farm veggies':
        return <Carrot className="w-3.5 h-3.5" />;
      case 'dairy & eggs':
        return <Milk className="w-3.5 h-3.5" />;
      case 'artisan bakery':
        return <Croissant className="w-3.5 h-3.5" />;
      case 'prime meats':
        return <Beef className="w-3.5 h-3.5" />;
      case 'pantry staples':
        return <Package className="w-3.5 h-3.5" />;
      case 'drinks & brews':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'seafood & fish':
        return <Fish className="w-3.5 h-3.5" />;
      default:
        return <Package className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div id="category-aisles-bar" className="w-full pb-4 pt-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = productCounts[cat];

            return (
              <button
                key={cat}
                id={`category-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                    : 'bg-[#151720] text-zinc-400 hover:text-white hover:bg-[#1c1f2b] border border-white/6'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-zinc-400'}>
                  {getCategoryIcon(cat)}
                </span>
                <span>{cat}</span>
                {count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
