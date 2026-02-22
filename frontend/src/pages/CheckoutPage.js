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
      // Create order
      const orderRes = await axios.post(`${API}/orders`, {
        ...formData,
        payment_method: paymentMethod,
        items: items.map(i => ({ item_id: i.id, quantity: i.quantity })),
        language
      });

      const order = orderRes.data;

      if (paymentMethod === 'card') {
        // Create Stripe checkout session
        const checkoutRes = await axios.post(`${API}/checkout/session`, {
          order_id: order.id,
          origin_url: window.location.origin
        });
        // Redirect to Stripe
        window.location.href = checkoutRes.data.url;
      } else {
        // Cash payment - go to confirmation
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
        <ShoppingCart size={64} className="text-[#2E2E30] mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-semibold text-[#EDEDED] mb-2">{t('cart.empty')}</h2>
        <Link to="/" className="mt-6 text-[#D4AF37] hover:text-[#F3E5AB] transition-colors uppercase text-sm tracking-widest font-bold" data-testid="back-to-menu-link">
          {t('checkout.backToMenu')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto" data-testid="checkout-page">
      <Link to="/" className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-[#D4AF37] transition-colors text-sm mb-8" data-testid="back-to-menu">
        <ArrowLeft size={16} strokeWidth={1.5} />
        {t('checkout.backToMenu')}
      </Link>

      <h1 className="text-4xl md:text-5xl font-semibold tracking-wide mb-8" data-testid="checkout-title">
        {t('checkout.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Order Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8" data-testid="checkout-form">
          {/* Pickup notice */}
          <div className="bg-[#18181B] border border-[#2E2E30] rounded-sm p-5">
            <p className="text-sm text-[#D4AF37] uppercase tracking-widest font-bold mb-1 font-['Manrope',sans-serif]">
              {t('checkout.pickup')}
            </p>
            <p className="text-sm text-[#A1A1AA] font-['Manrope',sans-serif]">
              {t('checkout.pickupNote')}
            </p>
          </div>

          {/* Customer Info */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#A1A1AA] uppercase tracking-widest mb-2 font-['Manrope',sans-serif]">{t('checkout.name')} *</label>
              <input name="customer_name" value={formData.customer_name} onChange={handleChange} required
                className="w-full bg-transparent border-b border-[#2E2E30] focus:border-[#D4AF37] rounded-none px-0 py-3 text-lg text-[#EDEDED] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors font-['Manrope',sans-serif]"
                data-testid="input-name" />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] uppercase tracking-widest mb-2 font-['Manrope',sans-serif]">{t('checkout.phone')} *</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required
                className="w-full bg-transparent border-b border-[#2E2E30] focus:border-[#D4AF37] rounded-none px-0 py-3 text-lg text-[#EDEDED] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors font-['Manrope',sans-serif]"
                data-testid="input-phone" />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] uppercase tracking-widest mb-2 font-['Manrope',sans-serif]">{t('checkout.email')} *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required
                className="w-full bg-transparent border-b border-[#2E2E30] focus:border-[#D4AF37] rounded-none px-0 py-3 text-lg text-[#EDEDED] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors font-['Manrope',sans-serif]"
                data-testid="input-email" />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] uppercase tracking-widest mb-2 font-['Manrope',sans-serif]">{t('checkout.notes')}</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                placeholder={t('checkout.notesPlaceholder')}
                className="w-full bg-transparent border-b border-[#2E2E30] focus:border-[#D4AF37] rounded-none px-0 py-3 text-base text-[#EDEDED] placeholder:text-[#444] focus:ring-0 focus:outline-none transition-colors resize-none font-['Manrope',sans-serif]"
                data-testid="input-notes" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm text-[#A1A1AA] uppercase tracking-widest mb-4 font-['Manrope',sans-serif]">{t('checkout.paymentMethod')}</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setPaymentMethod('card')}
                className={`flex items-center gap-3 p-4 border rounded-sm transition-all ${paymentMethod === 'card' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#2E2E30] hover:border-[#D4AF37]/50'}`}
                data-testid="payment-card">
                <CreditCard size={20} className={paymentMethod === 'card' ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'} strokeWidth={1.5} />
                <span className={`text-sm font-bold uppercase tracking-wider font-['Manrope',sans-serif] ${paymentMethod === 'card' ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}`}>
                  {t('checkout.card')}
                </span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('cash')}
                className={`flex items-center gap-3 p-4 border rounded-sm transition-all ${paymentMethod === 'cash' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#2E2E30] hover:border-[#D4AF37]/50'}`}
                data-testid="payment-cash">
                <Banknote size={20} className={paymentMethod === 'cash' ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'} strokeWidth={1.5} />
                <span className={`text-sm font-bold uppercase tracking-wider font-['Manrope',sans-serif] ${paymentMethod === 'cash' ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}`}>
                  {t('checkout.cash')}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-[#D4AF37] text-black py-4 rounded-sm uppercase tracking-[0.2em] font-bold text-sm hover:bg-[#C5A059] transition-all duration-300 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="place-order-btn">
            {loading ? t('checkout.paying') : t('checkout.placeOrder')}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2" data-testid="order-summary">
          <div className="bg-[#18181B] border border-[#2E2E30] rounded-sm p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-6">{t('checkout.orderSummary')}</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-3" data-testid={`summary-item-${item.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#EDEDED] font-semibold font-['Playfair_Display',serif] truncate">{getItemName(item)}</p>
                    <p className="text-xs text-[#A1A1AA] font-['Manrope',sans-serif]">{item.price} RON</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center border border-[#2E2E30] rounded-sm text-[#A1A1AA] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors" data-testid={`qty-minus-${item.id}`}>
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-[#EDEDED] w-6 text-center font-['Manrope',sans-serif]" data-testid={`qty-display-${item.id}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center border border-[#2E2E30] rounded-sm text-[#A1A1AA] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors" data-testid={`qty-plus-${item.id}`}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-red-500 transition-colors" data-testid={`remove-item-${item.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#2E2E30]">
              <div className="flex justify-between items-center">
                <span className="text-[#A1A1AA] uppercase text-sm tracking-widest font-['Manrope',sans-serif]">
                  {t('cart.total')} ({totalItems} {t('cart.items')})
                </span>
                <span className="text-2xl font-bold text-[#D4AF37] font-['Manrope',sans-serif]" data-testid="cart-total-price">
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
