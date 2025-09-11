import Link from 'next/link';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`bg-white shadow-sm border-b border-campaign-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-campaign-600">
              Cadence Collins
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#bio" className="text-campaign-600 hover:text-accent-500 transition-colors">
              About
            </a>
            <a href="#events" className="text-campaign-600 hover:text-accent-500 transition-colors">
              Events
            </a>
            <a href="#policy" className="text-campaign-600 hover:text-accent-500 transition-colors">
              Policy
            </a>
            <a href="#contact" className="text-campaign-600 hover:text-accent-500 transition-colors">
              Contact
            </a>
          </nav>
          <div className="md:hidden">
            <button className="text-campaign-600 hover:text-accent-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}