import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const isCash = searchParams.get('payment') === 'cash';
  const { t } = useLanguage();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(isCash ? 'cash' : 'checking');
  const [pollCount, setPollCount] = useState(0);

  // Clear cart on mount
  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch order
  useEffect(() => {
    if (orderId) {
      axios.get(`${API}/orders/${orderId}`).then(res => setOrder(res.data)).catch(() => {});
    }
  }, [orderId, paymentStatus]);

  // Poll payment status for card payments
  useEffect(() => {
    if (!sessionId || isCash || pollCount >= 5) return;

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/checkout/status/${sessionId}`);
        if (res.data.payment_status === 'paid') {
          setPaymentStatus('paid');
          // Refetch order
          if (orderId) {
            const orderRes = await axios.get(`${API}/orders/${orderId}`);
            setOrder(orderRes.data);
          }
        } else if (res.data.status === 'expired') {
          setPaymentStatus('failed');
        } else {
          setPollCount(prev => prev + 1);
        }
      } catch {
        setPollCount(prev => prev + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, isCash, pollCount, orderId]);

  const isConfirmed = paymentStatus === 'paid' || paymentStatus === 'cash';

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center" data-testid="order-confirmation-page">
      <div className="max-w-lg w-full text-center">
        {/* Status Icon */}
        <div className="mb-8">
          {isConfirmed ? (
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center mx-auto" data-testid="confirmation-icon">
              <CheckCircle size={40} className="text-[#D4AF37]" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#18181B] border-2 border-[#2E2E30] flex items-center justify-center mx-auto" data-testid="processing-icon">
              <Loader2 size={40} className="text-[#D4AF37] animate-spin" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-semibold mb-3" data-testid="confirmation-title">
          {isConfirmed ? t('confirmation.title') : t('confirmation.processing')}
        </h1>
        <p className="text-[#A1A1AA] text-lg font-['Manrope',sans-serif] mb-8">
          {isConfirmed ? t('confirmation.thankYou') : ''}
        </p>

        {/* Order Details */}
        {order && (
          <div className="bg-[#18181B] border border-[#2E2E30] rounded-sm p-6 text-left space-y-4 mb-8" data-testid="order-details">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA] text-sm uppercase tracking-widest font-['Manrope',sans-serif]">{t('confirmation.orderId')}</span>
              <span className="text-[#D4AF37] font-bold font-['Manrope',sans-serif]" data-testid="order-id-display">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA] text-sm uppercase tracking-widest font-['Manrope',sans-serif]">{t('confirmation.total')}</span>
              <span className="text-[#EDEDED] font-bold font-['Manrope',sans-serif]" data-testid="order-total-display">{order.total?.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A1A1AA] text-sm uppercase tracking-widest font-['Manrope',sans-serif]">{t('confirmation.status')}</span>
              <span className={`font-bold text-sm uppercase font-['Manrope',sans-serif] ${isConfirmed ? 'text-green-400' : 'text-yellow-400'}`} data-testid="order-status-display">
                {isConfirmed ? t('confirmation.confirmed') : t('confirmation.pending')}
              </span>
            </div>
            {isCash && (
              <p className="text-sm text-[#D4AF37] mt-2 font-['Manrope',sans-serif]" data-testid="cash-note">
                {t('confirmation.cashNote')}
              </p>
            )}

            {/* Items list */}
            {order.items && (
              <div className="pt-4 border-t border-[#2E2E30] space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-['Manrope',sans-serif]">
                    <span className="text-[#A1A1AA]">{item.quantity}x {item.name}</span>
                    <span className="text-[#EDEDED]">{item.subtotal?.toFixed(2)} RON</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pickup Location */}
        <div className="bg-[#18181B] border border-[#2E2E30] rounded-sm p-5 mb-8 flex items-center gap-4" data-testid="pickup-location">
          <MapPin size={24} className="text-[#D4AF37] shrink-0" strokeWidth={1.5} />
          <div className="text-left">
            <p className="text-sm text-[#A1A1AA] uppercase tracking-widest font-['Manrope',sans-serif]">{t('confirmation.pickupAt')}</p>
            <p className="text-[#EDEDED] font-['Manrope',sans-serif]">380 Principala, 457085 Crasna</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-8 py-3 rounded-sm uppercase tracking-widest font-bold text-sm hover:bg-[#C5A059] transition-all" data-testid="back-home-btn">
            <ArrowLeft size={16} />
            {t('confirmation.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
