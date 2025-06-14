import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSignInModal } from "./SignInModalContext";

export default function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In Required</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4 text-gray-600">You need to sign in to use this feature.</p>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              onClose();
              router.push("/login");
            }}
          >
            Go to Sign In
          </Button>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export function openSignInModal() {
  if (typeof window !== "undefined" && (window as any).openSignInModal) {
    (window as any).openSignInModal();
  }
} 