'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = auth.getUser();

  function handleLogout() {
    auth.clearSession();
    router.push('/login');
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/menu', label: 'Menu Items' },
    { href: '/customers', label: 'Customers' },
    { href: '/orders', label: 'Orders' },
  ];

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          RestaurantMS
        </Link>
        <div className="flex gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-300">
            {user.name}{' '}
            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{user.role}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
