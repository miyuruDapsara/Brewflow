import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

export default function MainLayout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        className={
          isHome
            ? 'w-full flex-1'
            : 'mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10'
        }
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
