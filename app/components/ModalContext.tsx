"use client";

import React, { createContext, useContext, useState } from "react";

interface ModalContextType {
  isWAModalOpen: boolean;
  openWAModal: () => void;
  closeWAModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);

  const openWAModal = () => setIsWAModalOpen(true);
  const closeWAModal = () => setIsWAModalOpen(false);

  return (
    <ModalContext.Provider value={{ isWAModalOpen, openWAModal, closeWAModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
