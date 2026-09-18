import { HashRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import { CartProvider } from './context/CartContext';
import About from './pages/About/About';
import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import Contact from './pages/Contact/Contact';
import Home from './pages/Home/Home';
import IngredientsPage from './pages/IngredientsPage/IngredientsPage';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import Product from './pages/Product/Product';
import ReviewsPage from './pages/ReviewsPage/ReviewsPage';
import Shop from './pages/Shop/Shop';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            {/* Catch-all */}
            <Route
              path="*"
              element={
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-3xl font-bold text-[#2F4A24] font-serif-heading mb-3">
                    Page Not Found
                  </h2>
                  <p className="text-[#6B4A2D] mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="#/"
                    className="bg-[#2F4A24] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#253022] transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              }
            />
          </Routes>
        </Layout>
      </HashRouter>
    </CartProvider>
  );
}
