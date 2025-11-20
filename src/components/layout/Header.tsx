import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userName?: string;
  currentPath?: string;
}

export default function Header({
  isAuthenticated = false,
  isAdmin = false,
  userName = "",
  currentPath = "/",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "text-sm font-medium transition-colors hover:text-primary";
    const activeClasses = isActivePath(path) ? "text-primary font-semibold" : "";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Church Prompts</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className={getLinkClasses("/")}>
            Home
          </a>
          <a href="/directory" className={getLinkClasses("/directory")}>
            Directory
          </a>
          <a href="/subscribe" className={getLinkClasses("/subscribe")}>
            Pricing
          </a>
          {isAuthenticated && (
            <>
              <a href="/submit" className={getLinkClasses("/submit")}>
                Submit Prompt
              </a>
              <a href="/profile" className={getLinkClasses("/profile")}>
                Profile
              </a>
              {isAdmin && (
                <a href="/admin" className={getLinkClasses("/admin")}>
                  Admin
                </a>
              )}
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{userName}</span>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm">
              Login
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-3">
            <a href="/" className={`${getLinkClasses("/")} py-2`}>
              Home
            </a>
            <a href="/directory" className={`${getLinkClasses("/directory")} py-2`}>
              Directory
            </a>
            <a href="/subscribe" className={`${getLinkClasses("/subscribe")} py-2`}>
              Pricing
            </a>
            {isAuthenticated && (
              <>
                <a href="/submit" className={`${getLinkClasses("/submit")} py-2`}>
                  Submit Prompt
                </a>
                <a href="/profile" className={`${getLinkClasses("/profile")} py-2`}>
                  Profile
                </a>
                {isAdmin && (
                  <a href="/admin" className={`${getLinkClasses("/admin")} py-2`}>
                    Admin
                  </a>
                )}
              </>
            )}
            <div className="pt-3 border-t flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    {userName}
                  </span>
                  <Button variant="outline" size="sm" className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" className="w-full">
                  Login
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
