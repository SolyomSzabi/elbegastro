import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/restaurant/Navbar';
import Footer from '@/components/restaurant/Footer';
import HomePage from '@/pages/HomePage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmation from '@/pages/OrderConfirmation';

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0F0F10] text-[#EDEDED]">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
            </Routes>
            <Footer />
          </div>
          <Toaster position="top-right" theme="dark" richColors />
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
