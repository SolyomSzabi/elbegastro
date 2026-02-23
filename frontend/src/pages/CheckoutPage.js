import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Minus, Plus, Trash2, CreditCard, Banknote, ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { t, language, getItemName } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ customer_name: '', phone: '', email: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    if (!formData.customer_name || !formData.phone || !formData.email) { toast.error('Please fill in all required fields'); return; }

    setLoading(true);
    try {
      const orderRes = await axios.post(`${API}/orders`, {
        ...formData,
        payment_method: paymentMethod,
        items: items.map(i => ({ item_id: i.id, quantity: i.quantity })),
        language
      });

      const order = orderRes.data;

      if (paymentMethod === 'card') {
        const checkoutRes = await axios.post(`${API}/checkout/session`, {
          order_id: order.id,
          origin_url: window.location.origin
        });
        window.location.href = checkoutRes.data.url;
      } else {
        clearCart();
        navigate(`/order-confirmation?order_id=${order.id}&payment=cash`);
      }
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-6 flex flex-col items-center justify-center" data-testid="empty-cart-page">
        <ShoppingCart size={64} className="text-[#332C22] mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-semibold text-[#E8DDD0] mb-2 font-['Oswald',sans-serif]">{t('cart.empty')}</h2>
        <Link to="/" className="mt-6 text-[#C8572D] hover:text-[#E07050] transition-colors uppercase text-sm tracking-[0.2em] font-bold font-['Oswald',sans-serif]" data-testid="back-to-menu-link">
          {t('checkout.backToMenu')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto" data-testid="checkout-page">
      <Link to="/" className="inline-flex items-center gap-2 text-[#8B7D6B] hover:text-[#C8572D] transition-colors text-sm mb-8 font-['Source_Sans_3',sans-serif]" data-testid="back-to-menu">
        <ArrowLeft size={16} strokeWidth={1.5} />
        {t('checkout.backToMenu')}
      </Link>

      <h1 className="text-4xl md:text-5xl font-semibold tracking-wide mb-8 font-['Oswald',sans-serif]" data-testid="checkout-title">
        {t('checkout.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Order Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8" data-testid="checkout-form">
          {/* Pickup notice */}
          <div className="bg-[#252019] border border-[#332C22] rounded-sm p-5">
            <p className="text-sm text-[#C8572D] uppercase tracking-[0.2em] font-bold mb-1 font-['Oswald',sans-serif]">
              {t('checkout.pickup')}
            </p>
            <p className="text-sm text-[#8B7D6B] font-['Source_Sans_3',sans-serif]">
              {t('checkout.pickupNote')}
            </p>
          </div>

          {/* Customer Info */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#8B7D6B] uppercase tracking-[0.15em] mb-2 font-['Oswald',sans-serif]">{t('checkout.name')} *</label>
              <input name="customer_name" value={formData.customer_name} onChange={handleChange} required
                className="w-full bg-transparent border-b border-[#332C22] focus:border-[#C8572D] rounded-none px-0 py-3 text-lg text-[#E8DDD0] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors font-['Source_Sans_3',sans-serif]"
                data-testid="input-name" />
            </div>
            <div>
              <label className="block text-sm text-[#8B7D6B] uppercase tracking-[0.15em] mb-2 font-['Oswald',sans-serif]">{t('checkout.phone')} *</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required
                className="w-full bg-transparent border-b border-[#332C22] focus:border-[#C8572D] rounded-none px-0 py-3 text-lg text-[#E8DDD0] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors font-['Source_Sans_3',sans-serif]"
                data-testid="input-phone" />
            </div>
            <div>
              <label className="block text-sm text-[#8B7D6B] uppercase tracking-[0.15em] mb-2 font-['Oswald',sans-serif]">{t('checkout.email')} *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required
                className="w-full bg-transparent border-b border-[#332C22] focus:border-[#C8572D] rounded-none px-0 py-3 text-lg text-[#E8DDD0] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors font-['Source_Sans_3',sans-serif]"
                data-testid="input-email" />
            </div>
            <div>
              <label className="block text-sm text-[#8B7D6B] uppercase tracking-[0.15em] mb-2 font-['Oswald',sans-serif]">{t('checkout.notes')}</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder={t('checkout.notesPlaceholder')}
                className="w-full bg-transparent border-b border-[#332C22] focus:border-[#C8572D] rounded-none px-0 py-3 text-base text-[#E8DDD0] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors resize-none font-['Source_Sans_3',sans-serif]"
                data-testid="input-notes" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm text-[#8B7D6B] uppercase tracking-[0.15em] mb-4 font-['Oswald',sans-serif]">{t('checkout.paymentMethod')}</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setPaymentMethod('card')}
                className={`flex items-center gap-3 p-4 border rounded-sm transition-all ${paymentMethod === 'card' ? 'border-[#C8572D] bg-[#C8572D]/10' : 'border-[#332C22] hover:border-[#C8572D]/50'}`}
                data-testid="payment-card">
                <CreditCard size={20} className={paymentMethod === 'card' ? 'text-[#C8572D]' : 'text-[#8B7D6B]'} strokeWidth={1.5} />
                <span className={`text-sm font-bold uppercase tracking-wider font-['Oswald',sans-serif] ${paymentMethod === 'card' ? 'text-[#C8572D]' : 'text-[#8B7D6B]'}`}>
                  {t('checkout.card')}
                </span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('cash')}
                className={`flex items-center gap-3 p-4 border rounded-sm transition-all ${paymentMethod === 'cash' ? 'border-[#C8572D] bg-[#C8572D]/10' : 'border-[#332C22] hover:border-[#C8572D]/50'}`}
                data-testid="payment-cash">
                <Banknote size={20} className={paymentMethod === 'cash' ? 'text-[#C8572D]' : 'text-[#8B7D6B]'} strokeWidth={1.5} />
                <span className={`text-sm font-bold uppercase tracking-wider font-['Oswald',sans-serif] ${paymentMethod === 'cash' ? 'text-[#C8572D]' : 'text-[#8B7D6B]'}`}>
                  {t('checkout.cash')}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#C8572D] text-white py-4 rounded-sm uppercase tracking-[0.25em] font-bold text-sm hover:bg-[#A84523] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-['Oswald',sans-serif]"
            data-testid="place-order-btn">
            {loading ? t('checkout.paying') : t('checkout.placeOrder')}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2" data-testid="order-summary">
          <div className="bg-[#252019] border border-[#332C22] rounded-sm p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-6 font-['Oswald',sans-serif]">{t('checkout.orderSummary')}</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-3" data-testid={`summary-item-${item.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E8DDD0] font-semibold font-['Oswald',sans-serif] truncate uppercase">{getItemName(item)}</p>
                    <p className="text-xs text-[#8B7D6B] font-['Source_Sans_3',sans-serif]">{item.price} RON</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-[#332C22] rounded-sm text-[#8B7D6B] hover:border-[#C8572D] hover:text-[#C8572D] transition-colors" data-testid={`qty-minus-${item.id}`}>
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-[#E8DDD0] w-6 text-center font-['Source_Sans_3',sans-serif]" data-testid={`qty-display-${item.id}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-[#332C22] rounded-sm text-[#8B7D6B] hover:border-[#C8572D] hover:text-[#C8572D] transition-colors" data-testid={`qty-plus-${item.id}`}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 flex items-center justify-center text-[#5C5347] hover:text-red-500 transition-colors" data-testid={`remove-item-${item.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#332C22]">
              <div className="flex justify-between items-center">
                <span className="text-[#8B7D6B] uppercase text-sm tracking-[0.15em] font-['Oswald',sans-serif]">
                  {t('cart.total')} ({totalItems} {t('cart.items')})
                </span>
                <span className="text-2xl font-bold text-[#C8572D] font-['Bebas_Neue',sans-serif] tracking-wide" data-testid="cart-total-price">
                  {totalPrice.toFixed(2)} RON
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
