import React, { ReactNode } from "react";
import Navbar from "../Navbar/Navbar";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  return (
    <>
      {user ? (
        <>
          <Navbar />
          <main>{children}</main>
        </>
      ) : (
        <iframe
          src="/landingpage.html" // Adjust the path based on your project structure
          style={{ width: '100%', height: '100vh', border: 'none' }}
          title="landing-page"
        />
      )}
    </>
  );
};

export default Layout;
