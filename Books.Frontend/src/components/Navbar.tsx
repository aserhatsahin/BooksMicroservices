import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getInitials = (name: string | null) => name ? name.slice(0, 2).toUpperCase() : 'U';

export const Navbar = () => {
  const { token, userName, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const libraryLinks = [
    { to: '/',        label: 'Books'   },
    { to: '/authors', label: 'Authors' },
    { to: '/genres',  label: 'Genres'  },
  ];

  const adminLinks = [
    { to: '/users', label: 'Users' },
    { to: '/roles', label: 'Roles' },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-40 border-b border-base-200 bg-base-100/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <svg className="w-4 h-4 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
          <span className="font-bold text-base-content tracking-tight">Books<span className="text-primary">MS</span></span>
        </Link>

        {/* Nav */}
        {token && (
          <nav className="hidden md:flex items-center gap-0.5">
            {/* Library group */}
            <div className="flex items-center gap-0.5">
              {libraryLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive(to) ? 'bg-primary/10 text-primary' : 'text-base-content/55 hover:text-base-content hover:bg-base-200'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Admin group */}
            {isAdmin && (
              <>
                <div className="w-px h-4 bg-base-300 mx-2" />
                <div className="flex items-center gap-0.5">
                  {adminLinks.map(({ to, label }) => (
                    <Link key={to} to={to}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive(to) ? 'bg-primary/10 text-primary' : 'text-base-content/55 hover:text-base-content hover:bg-base-200'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>
        )}

        {/* User area */}
        <div className="flex items-center gap-3 shrink-0">
          {token ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                    Admin
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-bold">
                  {getInitials(userName)}
                </div>
                <span className="text-sm text-base-content/60 font-medium">{userName}</span>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-base-300 text-base-content/50 hover:text-base-content hover:border-base-content/30 hover:bg-base-200 transition-all duration-150"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
};
