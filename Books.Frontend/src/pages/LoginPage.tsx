import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../api/authApi';

export const LoginPage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await getToken(userName, password);
      if (res.data?.token) {
        login(res.data.token, res.data.refreshToken);
        navigate('/');
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-content">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-content/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">BooksMS</span>
        </div>

        <div className="animate-slide-right">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your library,<br />managed with ease.
          </h1>
          <p className="text-primary-content/70 text-lg leading-relaxed">
            A centralized platform for managing your books, authors, and genres — with role-based access and real-time updates.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { label: 'Books tracked', value: 'Unlimited' },
              { label: 'User roles',    value: '2 levels'  },
              { label: 'API-first',     value: 'REST + JWT' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xl font-bold">{value}</div>
                <div className="text-primary-content/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-content/40 text-sm">
          Books Microservices &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center bg-base-100 p-8">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <span className="font-bold">BooksMS</span>
            </div>
            <h2 className="text-2xl font-bold text-base-content">Welcome back</h2>
            <p className="text-base-content/50 mt-1 text-sm">Sign in to access your library dashboard</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm animate-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1.5">Username</label>
              <input
                type="text"
                className="input input-bordered w-full focus:input-primary transition-colors"
                placeholder="Enter your username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1.5">Password</label>
              <input
                type="password"
                className="input input-bordered w-full focus:input-primary transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-1"
            >
              {loading
                ? <><span className="loading loading-spinner loading-sm" /> Signing in...</>
                : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
