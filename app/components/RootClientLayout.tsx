"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Footer from "./Footer";
import { WAModal, FloatingWA } from "./GlobalContact";
import { ModalProvider, useModal } from "./ModalContext";
import PreFooterQuoteCTA from "./PreFooterQuoteCTA";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

const EXCLUDED_PATHS = ["/dashboard", "/forgot-password", "/reset-password"];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isWAModalOpen, openWAModal, closeWAModal } = useModal();
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));
  const isErp = pathname === "/erp";

  return (
    <div className={`root-layout-inner ${isErp ? "is-erp" : ""} ${isExcluded ? "is-excluded" : ""}`}>
      {!isExcluded && <Navbar onOpen={openWAModal} />}
      <main className="main-content">{children}</main>
      {!isExcluded && !isErp && <PreFooterQuoteCTA />}
      {!isExcluded && <Footer />}
      {!isExcluded && <FloatingWA onClick={openWAModal} />}
      {!isExcluded && isWAModalOpen && <WAModal onClose={closeWAModal} />}
    </div>
  );
}

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <LayoutContent>{children}</LayoutContent>
    </ModalProvider>
  );
}
