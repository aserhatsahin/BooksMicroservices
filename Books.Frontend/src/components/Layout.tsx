import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => (
  <div className="min-h-screen bg-base-200/40">
    <Navbar />
    <main className="max-w-7xl mx-auto px-6 py-8">
      <Outlet />
    </main>
    <footer className="border-t border-base-200 mt-16 py-6">
      <p className="text-center text-xs text-base-content/40">
        Books Microservices &mdash; Library Management System &copy; {new Date().getFullYear()}
      </p>
    </footer>
  </div>
);
