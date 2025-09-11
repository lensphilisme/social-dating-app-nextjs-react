import { getUserInfoForNav } from '@/app/actions/userActions';
import { auth } from '@/auth';
import Link from 'next/link';
import { GiMatchTip } from 'react-icons/gi';
import FiltersWrapper from './FiltersWrapper';
import UserMenu from './UserMenu';

export default async function TopNav() {
  const session = await auth();
  const userInfo = session?.user && (await getUserInfoForNav());

  const memberLinks = [
    { href: '/discover', label: 'Discover' },
    { href: '/matches', label: 'Matches' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/members', label: 'All Members' },
    { href: '/match-requests', label: 'Requests' },
    { href: '/questions', label: 'Questions' },
    { href: '/messages', label: 'Messages' },
  ];

  const adminLinks = [{ href: '/admin/moderation', label: 'Photo Moderation' }];

  const links = session?.user.role === 'ADMIN' ? adminLinks : memberLinks;

  return (
    <div className="w-full">
      <nav className="bg-gradient-to-r from-purple-400 to-purple-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">💒</span>
            </div>
            <div className="font-black text-2xl bg-gradient-to-r from-yellow-400 to-purple-600 bg-clip-text text-transparent">
              JW Date
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {session ? (
              links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xl text-white uppercase hover:text-yellow-200 transition-colors"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xl text-white uppercase hover:text-yellow-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-xl text-white uppercase hover:text-yellow-200 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {userInfo ? (
              <UserMenu userInfo={userInfo} />
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-purple-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-purple-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <FiltersWrapper />
    </div>
  );
}
