import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Search, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MenuSection() {
  const { t, language, getItemName, getItemDesc, getCategoryName } = useLanguage();
  const { addItem, items: cartItems } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    axios.get(`${API}/menu`).then(res => {
      setMenuItems(res.data.items);
      setCategories(res.data.categories);
    }).catch(() => {});
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = menuItems;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(i => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        getItemName(i).toLowerCase().includes(q) ||
        getItemDesc(i).toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [menuItems, activeCategory, search, language, getItemName, getItemDesc]);

  const handleAddToCart = (item) => {
    addItem(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    toast.success(`${getItemName(item)} +1`, { duration: 1500 });
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1000);
  };

  const getCartQuantity = (itemId) => {
    const cartItem = cartItems.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <section id="menu" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto" data-testid="menu-section">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-wide text-center mb-4 font-['Oswald',sans-serif]" data-testid="menu-title">
        {t('menu.title')}
      </h2>
      <div className="w-16 h-[2px] bg-[#C8572D] mx-auto mb-12" />

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7D6B]" strokeWidth={1.5} />
        <input
          type="text"
          placeholder={t('menu.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#252019] border border-[#332C22] rounded-sm pl-11 pr-4 py-3 text-[#E8DDD0] placeholder:text-[#5C5347] focus:border-[#C8572D] focus:outline-none transition-colors font-['Source_Sans_3',sans-serif]"
          data-testid="menu-search-input"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide" data-testid="category-filters">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
            activeCategory === 'all'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
              : 'bg-transparent text-[#A1A1AA] border-[#2E2E30] hover:border-[#D4AF37] hover:text-[#D4AF37]'
          }`}
          data-testid="category-all"
        >
          {t('menu.all')}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              activeCategory === cat.id
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'bg-transparent text-[#A1A1AA] border-[#2E2E30] hover:border-[#D4AF37] hover:text-[#D4AF37]'
            }`}
            data-testid={`category-${cat.id}`}
          >
            {getCategoryName(cat)}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" data-testid="menu-items-grid">
        {filteredItems.map((item, index) => {
          const qty = getCartQuantity(item.id);
          const justAdded = addedItems[item.id];
          return (
            <div
              key={item.id}
              className="bg-[#18181B] border border-[#2E2E30] hover:border-[#D4AF37]/50 rounded-sm p-5 flex flex-col justify-between transition-all duration-300 group"
              style={{ animationDelay: `${index * 30}ms` }}
              data-testid={`menu-item-${item.id}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#EDEDED] font-['Playfair_Display',serif] leading-tight">
                    {getItemName(item)}
                  </h3>
                  <span className="text-[#D4AF37] font-bold text-lg whitespace-nowrap font-['Manrope',sans-serif]">
                    {item.price} <span className="text-xs">RON</span>
                  </span>
                </div>
                {getItemDesc(item) && (
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-2 font-['Manrope',sans-serif]">
                    {getItemDesc(item)}
                  </p>
                )}
                {item.weight && (
                  <span className="text-xs text-[#555] font-['Manrope',sans-serif]">{item.weight}</span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                {qty > 0 && (
                  <span className="text-xs text-[#D4AF37] font-bold" data-testid={`item-qty-${item.id}`}>
                    x{qty}
                  </span>
                )}
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    justAdded
                      ? 'bg-green-600 text-white'
                      : 'bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                  }`}
                  data-testid={`add-to-cart-${item.id}`}
                >
                  {justAdded ? <Check size={14} /> : <Plus size={14} />}
                  {justAdded ? '' : t('menu.addToCart')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-[#A1A1AA] text-lg mt-12 font-['Manrope',sans-serif]" data-testid="no-items-found">
          {search ? 'No items found' : ''}
        </p>
      )}
    </section>
  );
}
