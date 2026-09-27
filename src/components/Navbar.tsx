import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Shield, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: "/self-defence", label: "Self Defence" },
    { to: "/domestic-violence", label: "Domestic Violence" },
    { to: "/emergency", label: "Emergency" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav className="bg-card border-b shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink 
            to="/dashboard" 
            className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <Shield className="h-6 w-6" />
            <span>Brahmastra</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Hamburger Icon */}
          <div className="md:hidden flex items-center">
            <Button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              variant="ghost" 
              size="sm"
              className="p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card border-t py-4 px-2 shadow-lg absolute left-0 right-0 z-50">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Button
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                variant="ghost"
                className="justify-start px-4 py-3 w-full text-left font-medium text-foreground hover:bg-secondary"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
