import { Link } from 'react-router-dom';
import { ChevronDown, Globe, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-lg border border-white/10">
              <span className="text-white font-bold text-xl drop-shadow-lg">P</span>
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              Pomolab
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-white/90 hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <span className="text-white font-semibold drop-shadow">Home</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/80 transform scale-x-100 transition-transform shadow-sm"></div>
            </Link>
            
            <Link 
              to="/about" 
              className="text-white/70 hover:text-white font-medium transition-colors duration-200 relative group drop-shadow"
            >
              About
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/80 transform scale-x-0 group-hover:scale-x-100 transition-transform shadow-sm"></div>
            </Link>

            <div 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className="flex items-center gap-1 text-white/70 hover:text-white font-medium transition-colors duration-200 drop-shadow">
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/10 backdrop-blur-2xl rounded-xl shadow-xl border border-white/20 py-2">
                  <Link to="/services/dental" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    Dental Care
                  </Link>
                  <Link to="/services/consultation" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    Consultation
                  </Link>
                  <Link to="/services/treatment" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    Treatment Plans
                  </Link>
                </div>
              )}
            </div>

            <div 
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button className="flex items-center gap-1 text-white/70 hover:text-white font-medium transition-colors duration-200 drop-shadow">
                Products
                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/10 backdrop-blur-2xl rounded-xl shadow-xl border border-white/20 py-2">
                  <Link to="/products/equipment" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    Equipment
                  </Link>
                  <Link to="/products/supplies" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    Supplies
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/blog" 
              className="text-white/70 hover:text-white font-medium transition-colors duration-200 relative group drop-shadow"
            >
              Blog
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/80 transform scale-x-0 group-hover:scale-x-100 transition-transform shadow-sm"></div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Eng</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            
            <div className="w-px h-6 bg-white/30"></div>
            
            <button className="px-4 py-2 bg-white/20 backdrop-blur-2xl border border-white/10 hover:bg-white/30 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg flex items-center gap-2">
              <User className="w-4 h-4" />
              Login / Register
            </button>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col gap-4 pt-4">
              <Link to="/" className="text-white font-semibold drop-shadow">Home</Link>
              <Link to="/about" className="text-white/80 hover:text-white drop-shadow">About</Link>
              <Link to="/services" className="text-white/80 hover:text-white drop-shadow">Services</Link>
              <Link to="/products" className="text-white/80 hover:text-white drop-shadow">Products</Link>
              <Link to="/blog" className="text-white/80 hover:text-white drop-shadow">Blog</Link>
              <div className="flex flex-col gap-2 pt-2">
                <button className="px-4 py-2 bg-white/20 backdrop-blur-2xl border border-white/10 hover:bg-white/30 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg w-full">Login / Register</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
