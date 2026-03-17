'use client';

import { useStore } from '@/lib/store';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookPage from './pages/BookPage';
import TrackingPage from './pages/TrackingPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const page = useStore((s) => s.page);

  const pages: Record<string, React.ReactNode> = {
    home: <HomePage />,
    login: <LoginPage />,
    register: <RegisterPage />,
    book: <BookPage />,
    tracking: <TrackingPage />,
    history: <HistoryPage />,
    profile: <ProfilePage />,
  };

  return <>{pages[page] ?? <HomePage />}</>;
}
