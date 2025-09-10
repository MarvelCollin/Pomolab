import { Link } from 'react-router-dom';
import { ChevronDown, Globe, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D6A99D] to-[#9CAFAA] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#D6A99D] to-[#9CAFAA] bg-clip-text text-transparent">
              Pomolab
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-[#D6A99D] font-medium transition-colors duration-200 relative group"
            >
              <span className="text-[#D6A99D] font-semibold">Home</span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D6A99D] transform scale-x-100 transition-transform"></div>
            </Link>
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-[#D6A99D] font-medium transition-colors duration-200 relative group"
            >
              About
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D6A99D] transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
            </Link>

            <div 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 hover:text-[#D6A99D] font-medium transition-colors duration-200">
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 py-2">
                  <Link to="/services/dental" className="block px-4 py-2 text-gray-700 hover:text-[#D6A99D] hover:bg-[#FBF3D5]/50">
                    Dental Care
                  </Link>
                  <Link to="/services/consultation" className="block px-4 py-2 text-gray-700 hover:text-[#D6A99D] hover:bg-[#FBF3D5]/50">
                    Consultation
                  </Link>
                  <Link to="/services/treatment" className="block px-4 py-2 text-gray-700 hover:text-[#D6A99D] hover:bg-[#FBF3D5]/50">
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
              <button className="flex items-center gap-1 text-gray-700 hover:text-[#D6A99D] font-medium transition-colors duration-200">
                Products
                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 py-2">
                  <Link to="/products/equipment" className="block px-4 py-2 text-gray-700 hover:text-[#D6A99D] hover:bg-[#FBF3D5]/50">
                    Equipment
                  </Link>
                  <Link to="/products/supplies" className="block px-4 py-2 text-gray-700 hover:text-[#D6A99D] hover:bg-[#FBF3D5]/50">
                    Supplies
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/blog" 
              className="text-gray-700 hover:text-[#D6A99D] font-medium transition-colors duration-200 relative group"
            >
              Blog
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D6A99D] transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Eng</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <Link
              to="/learn-together"
              className="btn-secondary text-sm"
            >
              Learn Together
            </Link>
            
            <button className="btn-primary flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              Login / Register
            </button>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200/50">
            <div className="flex flex-col gap-4 pt-4">
              <Link to="/" className="text-[#D6A99D] font-semibold">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-[#D6A99D]">About</Link>
              <Link to="/services" className="text-gray-700 hover:text-[#D6A99D]">Services</Link>
              <Link to="/products" className="text-gray-700 hover:text-[#D6A99D]">Products</Link>
              <Link to="/blog" className="text-gray-700 hover:text-[#D6A99D]">Blog</Link>
              <Link to="/learn-together" className="text-gray-700 hover:text-[#D6A99D]">Learn Together</Link>
              <div className="flex flex-col gap-2 pt-2">
                <button className="btn-primary text-sm w-full">Login / Register</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
