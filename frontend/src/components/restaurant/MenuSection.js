import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Search, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ExtrasModal from './ExtrasModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MenuSection() {
  const { t, language, getItemName, getItemDesc, getCategoryName } = useLanguage();
  const { addItem, items: cartItems } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [extras, setExtras] = useState([]);
  const [drinkRecommendations, setDrinkRecommendations] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const [extrasModal, setExtrasModal] = useState({ open: false, item: null, instanceId: null });

  useEffect(() => {
    axios.get(`${API}/menu`).then(res => {
      setMenuItems(res.data.items);
      setCategories(res.data.categories);
      setExtras(res.data.extras || []);
      setDrinkRecommendations(res.data.drink_recommendations || {});
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems, activeCategory, search, language, getItemName, getItemDesc]);

  const handleAddToCart = (item) => {
    const instanceId = addItem(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    toast.success(`${getItemName(item)} +1`, { duration: 1500 });
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1000);
    // Show extras modal for food categories
    const foodCategories = ['burger', 'pizza', 'appetizer', 'salad', 'pasta', 'main', 'snack', 'dessert'];
    if (foodCategories.includes(item.category)) {
      setExtrasModal({ open: true, item, instanceId });
    }
  };

  const getCartQuantity = (itemId) => {
    return cartItems.filter(i => i.id === itemId && !i.parentInstanceId).reduce((sum, i) => sum + i.quantity, 0);
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
          className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border font-['Oswald',sans-serif] ${
            activeCategory === 'all'
              ? 'bg-[#C8572D] text-white border-[#C8572D]'
              : 'bg-transparent text-[#8B7D6B] border-[#332C22] hover:border-[#C8572D] hover:text-[#C8572D]'
          }`}
          data-testid="category-all"
        >
          {t('menu.all')}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border font-['Oswald',sans-serif] ${
              activeCategory === cat.id
                ? 'bg-[#C8572D] text-white border-[#C8572D]'
                : 'bg-transparent text-[#8B7D6B] border-[#332C22] hover:border-[#C8572D] hover:text-[#C8572D]'
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
              className="bg-[#252019] border border-[#332C22] hover:border-[#C8572D]/40 rounded-sm overflow-hidden flex flex-col transition-all duration-300 group"
              style={{ animationDelay: `${index * 30}ms` }}
              data-testid={`menu-item-${item.id}`}
            >
              {/* Image */}
              {item.image && (
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={getItemName(item)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#252019] via-transparent to-transparent" />
                  {/* Price badge */}
                  <span className="absolute top-3 right-3 bg-[#C8572D] text-white px-3 py-1 text-sm font-bold font-['Bebas_Neue',sans-serif] tracking-wide rounded-sm">
                    {item.price} RON
                  </span>
                  {qty > 0 && (
                    <span className="absolute top-3 left-3 bg-[#E8DDD0] text-[#1A1714] px-2 py-0.5 text-xs font-bold font-['Oswald',sans-serif] rounded-sm" data-testid={`item-qty-${item.id}`}>
                      x{qty}
                    </span>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-base font-semibold text-[#E8DDD0] font-['Oswald',sans-serif] leading-tight uppercase">
                    {getItemName(item)}
                  </h3>
                  {!item.image && (
                    <span className="text-[#C8572D] font-bold text-lg whitespace-nowrap font-['Bebas_Neue',sans-serif] tracking-wide">
                      {item.price} <span className="text-xs font-['Source_Sans_3',sans-serif]">RON</span>
                    </span>
                  )}
                </div>
                {getItemDesc(item) && (
                  <p className="text-[#8B7D6B] text-sm leading-relaxed mb-1 font-['Source_Sans_3',sans-serif] line-clamp-2">
                    {getItemDesc(item)}
                  </p>
                )}
                {item.weight && (
                  <span className="text-xs text-[#5C5347] font-['Source_Sans_3',sans-serif]">{item.weight}</span>
                )}

                <div className="mt-auto pt-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-300 font-['Oswald',sans-serif] ${
                      justAdded
                        ? 'bg-green-700 text-white'
                        : 'bg-transparent border border-[#C8572D] text-[#C8572D] hover:bg-[#C8572D] hover:text-white'
                    }`}
                    data-testid={`add-to-cart-${item.id}`}
                  >
                    {justAdded ? <Check size={14} /> : <Plus size={14} />}
                    {justAdded ? '' : t('menu.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-[#8B7D6B] text-lg mt-12 font-['Source_Sans_3',sans-serif]" data-testid="no-items-found">
          {search ? 'No items found' : ''}
        </p>
      )}

      {/* Extras Recommendation Modal */}
      <ExtrasModal
        isOpen={extrasModal.open}
        onClose={() => setExtrasModal({ open: false, item: null, instanceId: null })}
        addedItem={extrasModal.item}
        instanceId={extrasModal.instanceId}
        extras={extras}
        drinkRecommendations={drinkRecommendations}
        allItems={menuItems}
      />
    </section>
  );
}