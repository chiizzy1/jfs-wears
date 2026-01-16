"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { NewsletterForm } from "./NewsletterForm";
import { NewsletterFormValues } from "@/schemas/newsletter.schema";
import { apiClient } from "@/lib/api-client";
import toast from "react-hot-toast";

const STORAGE_KEY = "newsletter_popup_dismissed";
const POPUP_DELAY = 5000; // 5 seconds

/**
 * Newsletter Popup Component
 *
 * Uses existing Modal and NewsletterForm components.
 * Appears after delay on first visit, stores dismissal in localStorage.
 */
export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleSubmit = async (data: NewsletterFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/newsletter/subscribe", {
        email: data.email,
        source: "popup",
      });
      toast.success("Thanks for subscribing! 🎉");
      handleDismiss();
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 409) {
        toast.error("You're already subscribed!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Get 10% Off Your First Order"
      description="Subscribe to our newsletter for exclusive deals, new arrivals, and style inspiration."
      isOpen={isOpen}
      onClose={handleDismiss}
    >
      <div className="mt-4">
        <NewsletterForm isLoading={isLoading} onSubmit={handleSubmit} />
        <p className="text-center text-xs text-gray-400 mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </Modal>
  );
}
