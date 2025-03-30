'use client';

import Link from 'next/link';
import { useState } from 'react';
import UserStatus from './UserStatus';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white/90 dark:bg-ink-dark/90 shadow-md backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="bagua-symbol mr-2"></div>
              <span className="text-2xl font-semibold text-earth dark:text-earth">BaZi Calculator</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/calculator" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire px-3 py-2 rounded-md text-sm font-medium">
                Calculator
              </Link>
              <Link href="/destiny-analysis" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire px-3 py-2 rounded-md text-sm font-medium">
                Destiny Analysis
              </Link>
              <Link href="/services" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire px-3 py-2 rounded-md text-sm font-medium">
                Services
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <UserStatus />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link href="/calculator" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire block px-3 py-2 rounded-md text-base font-medium">
              Calculator
            </Link>
            <Link href="/destiny-analysis" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire block px-3 py-2 rounded-md text-base font-medium">
              Destiny Analysis
            </Link>
            <Link href="/services" className="text-ink-dark hover:text-fire dark:text-paper-white dark:hover:text-fire block px-3 py-2 rounded-md text-base font-medium">
              Services
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2">
              <UserStatus />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 