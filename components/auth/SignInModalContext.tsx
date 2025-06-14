"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import SignInModal from "./SignInModal";

type SignInModalContextType = {
  open: () => void;
  close: () => void;
};

const SignInModalContext = createContext<SignInModalContextType | undefined>(undefined);

export function useSignInModal() {
  const ctx = useContext(SignInModalContext);
  if (!ctx) throw new Error("useSignInModal must be used within SignInModalProvider");
  return ctx;
}

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Expose globally for legacy openSignInModal() calls
  if (typeof window !== "undefined") {
    (window as any).openSignInModal = open;
  }

  return (
    <SignInModalContext.Provider value={{ open, close }}>
      {children}
      <SignInModal open={isOpen} onClose={close} />
    </SignInModalContext.Provider>
  );
} 