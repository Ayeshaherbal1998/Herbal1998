import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Ingredients', to: '/ingredients' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#EFE7D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#2F4A24] flex items-center justify-center">
              <span className="text-white text-xs font-bold leading-none">AH</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[#2F4A24] font-bold text-base leading-none">Ayesha Herbal</p>
              <p className="text-[#6B4A2D] text-xs">Powder</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-[#2F4A24] bg-[#F8F4E8]'
                      : 'text-[#253022] hover:text-[#2F4A24] hover:bg-[#F8F4E8]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="border border-[#5B7138] rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#2F4A24] w-48"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 text-[#253022] hover:text-[#2F4A24]">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-[#253022] hover:bg-[#F8F4E8] hover:text-[#2F4A24] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full text-[#253022] hover:bg-[#F8F4E8] hover:text-[#2F4A24] transition-colors"
              aria-label={`Cart — ${totalItems} items`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-bold bg-[#2F4A24] text-white rounded-full flex items-center justify-center px-0.5">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-full text-[#253022] hover:bg-[#F8F4E8] transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-[#EFE7D5] px-4 pb-4 pt-2 shadow-md">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-[#2F4A24] bg-[#F8F4E8] font-semibold'
                      : 'text-[#253022] hover:text-[#2F4A24] hover:bg-[#F8F4E8]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
