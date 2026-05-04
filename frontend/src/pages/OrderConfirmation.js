import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, XCircle, MapPin, ArrowLeft, Loader2, Clock } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const isCash = searchParams.get('payment') === 'cash';
  const { t } = useLanguage();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await axios.get(`${API}/orders/${orderId}`);
      setOrder(res.data);
    } catch {}
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Poll every 10 seconds for status updates (confirmed/rejected)
  useEffect(() => {
    if (!orderId) return;
    if (order?.status === 'confirmed' || order?.status === 'rejected') return;

    const timer = setTimeout(() => {
      fetchOrder();
      setPollCount(prev => prev + 1);
    }, 10000);

    return () => clearTimeout(timer);
  }, [orderId, order, pollCount, fetchOrder]);

  const status = order?.status;
  const isConfirmed = status === 'confirmed';
  const isRejected = status === 'rejected';
  const isPending = !status || status === 'pending';

  const getStatusColor = () => {
    if (isConfirmed) return 'text-green-400';
    if (isRejected) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusText = () => {
    if (isConfirmed) return t('confirmation.confirmed');
    if (isRejected) return t('confirmation.rejected');
    return t('confirmation.pending');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center" data-testid="order-confirmation-page">
      <div className="max-w-lg w-full text-center">
        {/* Status Icon */}
        <div className="mb-8">
          {isConfirmed ? (
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto" data-testid="confirmation-icon">
              <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
            </div>
          ) : isRejected ? (
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mx-auto" data-testid="rejected-icon">
              <XCircle size={40} className="text-red-500" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#252019] border-2 border-[#C8572D] flex items-center justify-center mx-auto" data-testid="processing-icon">
              {isCash ? (
                <Clock size={40} className="text-[#C8572D]" strokeWidth={1.5} />
              ) : (
                <Loader2 size={40} className="text-[#C8572D] animate-spin" strokeWidth={1.5} />
              )}
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold mb-3 font-['Oswald',sans-serif]" data-testid="confirmation-title">
          {isConfirmed
            ? t('confirmation.title')
            : isRejected
            ? t('confirmation.rejectedTitle')
            : t('confirmation.waitingTitle')}
        </h1>
        <p className="text-[#8B7D6B] text-lg font-['Source_Sans_3',sans-serif] mb-8">
          {isConfirmed
            ? t('confirmation.thankYou')
            : isRejected
            ? t('confirmation.rejectedNote')
            : t('confirmation.waitingNote')}
        </p>

        {order && (
          <div className="bg-[#252019] border border-[#332C22] rounded-sm p-6 text-left space-y-4 mb-8" data-testid="order-details">
            <div className="flex justify-between">
              <span className="text-[#8B7D6B] text-sm uppercase tracking-[0.15em] font-['Oswald',sans-serif]">{t('confirmation.orderId')}</span>
              <span className="text-[#C8572D] font-bold font-['Bebas_Neue',sans-serif] text-lg" data-testid="order-id-display">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B7D6B] text-sm uppercase tracking-[0.15em] font-['Oswald',sans-serif]">{t('confirmation.total')}</span>
              <span className="text-[#E8DDD0] font-bold font-['Bebas_Neue',sans-serif] text-lg" data-testid="order-total-display">{order.total?.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B7D6B] text-sm uppercase tracking-[0.15em] font-['Oswald',sans-serif]">{t('confirmation.status')}</span>
              <span className={`font-bold text-sm uppercase font-['Oswald',sans-serif] ${getStatusColor()}`} data-testid="order-status-display">
                {getStatusText()}
              </span>
            </div>

            {isCash && isPending && (
              <p className="text-sm text-yellow-400 mt-2 font-['Source_Sans_3',sans-serif]" data-testid="cash-note">
                {t('confirmation.waitingNote')}
              </p>
            )}

            {isCash && isConfirmed && (
              <p className="text-sm text-[#C8572D] mt-2 font-['Source_Sans_3',sans-serif]" data-testid="cash-note">
                {t('confirmation.cashNote')}
              </p>
            )}

            {order.items && (
              <div className="pt-4 border-t border-[#332C22] space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm font-['Source_Sans_3',sans-serif]">
                    <span className="text-[#8B7D6B]">{item.quantity}x {item.name}</span>
                    <span className="text-[#E8DDD0]">{item.subtotal?.toFixed(2)} RON</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isRejected && (
          <div className="bg-[#252019] border border-[#332C22] rounded-sm p-5 mb-8 flex items-center gap-4" data-testid="pickup-location">
            <MapPin size={24} className="text-[#C8572D] shrink-0" strokeWidth={1.5} />
            <div className="text-left">
              <p className="text-sm text-[#8B7D6B] uppercase tracking-[0.15em] font-['Oswald',sans-serif]">{t('confirmation.pickupAt')}</p>
              <p className="text-[#E8DDD0] font-['Source_Sans_3',sans-serif]">380 Principala, 457085 Crasna</p>
            </div>
          </div>
        )}

        {/* Pending indicator */}
        {isPending && (
          <div className="bg-[#252019] border border-yellow-500/30 rounded-sm p-4 mb-8 flex items-center gap-3">
            <Loader2 size={18} className="text-yellow-400 animate-spin shrink-0" />
            <p className="text-sm text-yellow-400 font-['Source_Sans_3',sans-serif] text-left">
              {t('confirmation.waitingForRestaurant')}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#C8572D] text-white px-8 py-3 rounded-sm uppercase tracking-[0.2em] font-bold text-sm hover:bg-[#A84523] transition-all font-['Oswald',sans-serif]" data-testid="back-home-btn">
            <ArrowLeft size={16} />
            {t('confirmation.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
