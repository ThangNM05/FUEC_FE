import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user } = useUser();
  console.log('🚀 ~ Header ~ user:', user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Company</span>
        </div>

        {/* Mobile menu button */}
        <button className="block md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary">
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            About
          </Link>
          <Link href="#cta" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
          {user ? (
            <UserButton />
          ) : (
            <Button asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <nav className="container flex flex-col py-4 gap-4">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:text-primary px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:text-primary px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#cta"
                className="text-sm font-medium hover:text-primary px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
