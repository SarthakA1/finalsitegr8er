import React, { ReactNode } from "react";
import Navbar from "../Navbar/Navbar";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, loading, error] = useAuthState(auth); // Firebase auth state
  const userLoggedIn = user !== null && !loading && !error; // Check if user is logged in

  return (
    <>
      {userLoggedIn ? (
        <>
          <Navbar/>
          <main>{children}</main>
        </>
      ) : (
        <iframe
          src="/path-to-your-html-file.html"
          title="Login Required"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
            zIndex: 9999, // Adjust z-index as needed
          }}
        />
        // Replace "/path-to-your-html-file.html" with the actual path to your HTML file
      )}
    </>
  );
};

export default Layout;
