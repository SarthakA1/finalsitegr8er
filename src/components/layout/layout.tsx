import React, { ReactNode } from "react";
import { useRouter } from "next/router";
import Navbar from "../Navbar/Navbar";
import Header from "../Subject/Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const noNavbarRoutes = ["/"]; // Add routes where you don't want to show the Navbar

  return (
    <>
      {!noNavbarRoutes.includes(router.pathname) && <Navbar />}
      <main>{children}</main>
    </>
  );
};

export default Layout;
