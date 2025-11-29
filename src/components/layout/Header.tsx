import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, User, Shield } from "lucide-react";
import { useState } from "react";
import { SignOutButton, useAuth } from "@clerk/astro/react";

interface HeaderProps {
  currentPath?: string;
}

export default function Header({
  currentPath = "/",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useAuth();
  
  // Derive authentication state from Clerk hooks
  const isAuthenticated = auth.isLoaded && !!auth.userId;
  const isAdmin = (auth.sessionClaims as any)?.metadata?.role === 'admin';
  const userName = (auth.sessionClaims as any)?.firstName || (auth.sessionClaims as any)?.username || '';

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
            <span className="text-xl">churchprompt.directory</span>
          </a>
        </div>

        {/* Desktop Navigation - Right Aligned */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          {isAuthenticated ? (
            <>
              <a href="/directory" className={getLinkClasses("/directory")}>
                Directory
              </a>
              <a href="/blogs" className={getLinkClasses("/blogs")}>
                Blog
              </a>
              <a href="/submit" className={getLinkClasses("/submit")}>
                Submit Prompt
              </a>
              {/* <a href="/subscribe" className={getLinkClasses("/subscribe")}>
                Pricing
              </a> */}
              <a href="/profile" className={getLinkClasses("/profile")}>
                Profile
              </a>
              {isAdmin && (
                <a href="/admin" className={getLinkClasses("/admin")}>
                  Admin
                </a>
              )}
              <div className="flex items-center gap-3 ml-2 pl-6 border-l">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{userName}</span>
                  {isAdmin && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <SignOutButton>
                  <Button variant="outline" size="sm">
                    Logout
                  </Button>
                </SignOutButton>
              </div>
            </>
          ) : (
            <>
              <a href="/" className={getLinkClasses("/")}>
                Home
              </a>
              <a href="/directory" className={getLinkClasses("/directory")}>
                Directory
              </a>
              <a href="/blogs" className={getLinkClasses("/blogs")}>
                Blog
              </a>
              {/* <a href="/subscribe" className={getLinkClasses("/subscribe")}>
                Pricing
              </a> */}
              <a href="/sign-in">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </a>
            </>
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
            {isAuthenticated ? (
              <>
                <a href="/directory" className={`${getLinkClasses("/directory")} py-2`}>
                  Directory
                </a>
                <a href="/blogs" className={`${getLinkClasses("/blogs")} py-2`}>
                  Blog
                </a>
                <a href="/submit" className={`${getLinkClasses("/submit")} py-2`}>
                  Submit Prompt
                </a>
                {/* <a href="/subscribe" className={`${getLinkClasses("/subscribe")} py-2`}>
                Pricing
              </a> */}
                <a href="/profile" className={`${getLinkClasses("/profile")} py-2`}>
                  Profile
                </a>
                {isAdmin && (
                  <a href="/admin" className={`${getLinkClasses("/admin")} py-2`}>
                    Admin
                  </a>
                )}
              </>
            ) : (
              <>
                <a href="/" className={`${getLinkClasses("/")} py-2`}>
                  Home
                </a>
                <a href="/directory" className={`${getLinkClasses("/directory")} py-2`}>
                  Directory
                </a>
                <a href="/blogs" className={`${getLinkClasses("/blogs")} py-2`}>
                  Blog
                </a>
                {/* <a href="/subscribe" className={`${getLinkClasses("/subscribe")} py-2`}>
                  Pricing
                </a> */}
              </>
            )}
            <div className="pt-3 border-t flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {userName}
                    </span>
                    {isAdmin && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <SignOutButton>
                    <Button variant="outline" size="sm" className="w-full">
                      Logout
                    </Button>
                  </SignOutButton>
                </>
              ) : (
                <a href="/sign-in">
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
