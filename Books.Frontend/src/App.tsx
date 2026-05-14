import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './pages/LoginPage';
import { BooksPage } from './pages/BooksPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { GenresPage } from './pages/GenresPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
              <Route path="/authors" element={<ProtectedRoute><AuthorsPage /></ProtectedRoute>} />
              <Route path="/genres" element={<ProtectedRoute><GenresPage /></ProtectedRoute>} />
              <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="/roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
