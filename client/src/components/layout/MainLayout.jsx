import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import UiDemoBanner from '../common/UiDemoBanner';

export default function MainLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <UiDemoBanner />
      <main
        className={
          isHome
            ? 'w-full flex-1'
            : 'mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
