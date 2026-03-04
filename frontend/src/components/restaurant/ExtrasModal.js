import React, { useMemo } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function ExtrasModal({ isOpen, onClose, addedItem, instanceId, extras, drinkRecommendations, allItems }) {
  const { t, language, getItemName } = useLanguage();
  const { addItem, addExtra, items: cartItems } = useCart();
  const [addedExtras, setAddedExtras] = React.useState({});

  // Get relevant extras for the added item's category
  const relevantExtras = useMemo(() => {
    if (!addedItem || !extras) return [];
    return extras.filter(e => e.applies_to && e.applies_to.includes(addedItem.category));
  }, [addedItem, extras]);

  // Get recommended drinks
  const recommendedDrinks = useMemo(() => {
    if (!addedItem || !drinkRecommendations || !allItems) return [];
    const drinkIds = drinkRecommendations[addedItem.category] || [];
    return drinkIds
      .map(id => allItems.find(item => item.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [addedItem, drinkRecommendations, allItems]);

  if (!isOpen || !addedItem) return null;

  const handleAddExtra = (item) => {
    // Extras/sauces get linked to the parent food item using instanceId
    if (item.category === 'extra' && instanceId) {
      addExtra(item, instanceId);
    } else {
      // Drinks are standalone items
      addItem(item);
    }
    setAddedExtras(prev => ({ ...prev, [item.id]: true }));
    toast.success(`${getItemName(item)} +1`, { duration: 1200 });
    setTimeout(() => setAddedExtras(prev => ({ ...prev, [item.id]: false })), 1000);
  };

  const hasRecommendations = relevantExtras.length > 0 || recommendedDrinks.length > 0;

  if (!hasRecommendations) {
    // No recommendations for this category, just close
    onClose();
    return null;
  }

  // Group extras by type
  const sauces = relevantExtras.filter(e => e.extra_type === 'sauce');
  const ingredients = relevantExtras.filter(e => e.extra_type === 'ingredient');

  const getQty = (itemId) => {
    const c = cartItems.find(i => i.id === itemId);
    return c ? c.quantity : 0;
  };

  const labelMap = {
    ro: { extras: "Extra?", sauces: "Sosuri", ingredients: "Ingrediente Extra", drinks: "Adaugă o Băutură?", skip: "Nu, mulțumesc", added: "Adăugat în coș" },
    en: { extras: "Extras?", sauces: "Sauces", ingredients: "Extra Ingredients", drinks: "Add a Drink?", skip: "No, thanks", added: "Added to cart" },
    hu: { extras: "Extrák?", sauces: "Szószok", ingredients: "Extra Összetevők", drinks: "Adj hozzá egy italt?", skip: "Nem, köszönöm", added: "Kosárhoz adva" },
  };
  const labels = labelMap[language] || labelMap.en;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" data-testid="extras-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#1A1714] border border-[#332C22] rounded-t-lg sm:rounded-lg w-full sm:max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" data-testid="extras-modal-content">
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1714] border-b border-[#332C22] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-[#C8572D] uppercase tracking-[0.2em] font-['Oswald',sans-serif] font-bold">{labels.extras}</p>
            <p className="text-sm text-[#8B7D6B] font-['Source_Sans_3',sans-serif] mt-0.5">
              {getItemName(addedItem)} — {labels.added}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8B7D6B] hover:text-[#E8DDD0] transition-colors" data-testid="extras-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Extra Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-[#E8DDD0] mb-3 font-['Oswald',sans-serif]">{labels.ingredients}</h4>
              <div className="grid grid-cols-2 gap-2">
                {ingredients.map(extra => {
                  const qty = getQty(extra.id);
                  const justAdded = addedExtras[extra.id];
                  return (
                    <button
                      key={extra.id}
                      onClick={() => handleAddExtra(extra)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-sm border transition-all text-left ${justAdded ? 'bg-green-700/20 border-green-700 text-green-400' : 'bg-[#252019] border-[#332C22] hover:border-[#C8572D]'}`}
                      data-testid={`add-extra-${extra.id}`}
                    >
                      <div className="min-w-0 mr-2">
                        <p className="text-xs text-[#E8DDD0] font-['Source_Sans_3',sans-serif] truncate">{getItemName(extra)}</p>
                        <p className="text-[10px] text-[#5C5347] font-['Source_Sans_3',sans-serif]">{extra.weight}</p>
                        <p className="text-xs text-[#C8572D] font-['Bebas_Neue',sans-serif]">+{extra.price} RON</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {qty > 0 && <span className="text-xs text-[#C8572D] font-bold">x{qty}</span>}
                        {justAdded ? <Check size={12} className="text-green-400" /> : <Plus size={12} className="text-[#C8572D]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sauces */}
          {sauces.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-[#E8DDD0] mb-3 font-['Oswald',sans-serif]">{labels.sauces}</h4>
              <div className="grid grid-cols-2 gap-2">
                {sauces.map(sauce => {
                  const qty = getQty(sauce.id);
                  const justAdded = addedExtras[sauce.id];
                  return (
                    <button
                      key={sauce.id}
                      onClick={() => handleAddExtra(sauce)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-sm border transition-all text-left ${justAdded ? 'bg-green-700/20 border-green-700 text-green-400' : 'bg-[#252019] border-[#332C22] hover:border-[#C8572D]'}`}
                      data-testid={`add-extra-${sauce.id}`}
                    >
                      <div className="min-w-0 mr-2">
                        <p className="text-xs text-[#E8DDD0] font-['Source_Sans_3',sans-serif] truncate">{getItemName(sauce)}</p>
                        <p className="text-xs text-[#C8572D] font-['Bebas_Neue',sans-serif]">+{sauce.price} RON</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {qty > 0 && <span className="text-xs text-[#C8572D] font-bold">x{qty}</span>}
                        {justAdded ? <Check size={12} className="text-green-400" /> : <Plus size={12} className="text-[#C8572D]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommended Drinks */}
          {recommendedDrinks.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-[#E8DDD0] mb-3 font-['Oswald',sans-serif]">{labels.drinks}</h4>
              <div className="grid grid-cols-2 gap-2">
                {recommendedDrinks.map(drink => {
                  const qty = getQty(drink.id);
                  const justAdded = addedExtras[drink.id];
                  return (
                    <div
                      key={drink.id}
                      className="bg-[#252019] border border-[#332C22] rounded-sm overflow-hidden group"
                      data-testid={`drink-rec-${drink.id}`}
                    >
                      {drink.image && (
                        <div className="h-20 overflow-hidden relative">
                          <img src={drink.image} alt={getItemName(drink)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#252019] via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="px-3 py-2">
                        <p className="text-xs text-[#E8DDD0] font-['Source_Sans_3',sans-serif] truncate">{getItemName(drink)}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold text-[#C8572D] font-['Bebas_Neue',sans-serif]">{drink.price} RON</span>
                          <button
                            onClick={() => handleAddExtra(drink)}
                            className={`w-7 h-7 flex items-center justify-center rounded-sm transition-all ${justAdded ? 'bg-green-700 text-white' : 'border border-[#C8572D] text-[#C8572D] hover:bg-[#C8572D] hover:text-white'}`}
                            data-testid={`add-drink-${drink.id}`}
                          >
                            {justAdded ? <Check size={12} /> : <Plus size={12} />}
                          </button>
                        </div>
                        {qty > 0 && <span className="text-xs text-[#C8572D] font-bold">x{qty}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1A1714] border-t border-[#332C22] px-5 py-3">
          <button onClick={onClose} className="w-full py-3 text-center text-sm text-[#8B7D6B] hover:text-[#E8DDD0] uppercase tracking-[0.15em] font-['Oswald',sans-serif] transition-colors" data-testid="extras-skip-btn">
            {labels.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
