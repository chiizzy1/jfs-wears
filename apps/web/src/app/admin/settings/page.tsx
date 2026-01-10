"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { adminAPI } from "@/lib/admin-api";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [notifyOrder, setNotifyOrder] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyReview, setNotifyReview] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await adminAPI.getSettings();
      if (settings) {
        setStoreName(settings.storeName);
        setStoreEmail(settings.storeEmail);
        setCurrency(settings.currency);
        setNotifyOrder(settings.notifyOrder);
        setNotifyLowStock(settings.notifyLowStock);
        setNotifyReview(settings.notifyReview);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminAPI.updateSettings({
        storeName,
        storeEmail,
        currency,
        notifyOrder,
        notifyLowStock,
        notifyReview,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Settings</h1>
        <p className="text-2xl font-light mt-1">Store Configuration</p>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-100 p-8">
        <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-8">General Settings</h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted font-medium mb-3">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted font-medium mb-3">Store Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted font-medium mb-3">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 bg-white focus:outline-none focus:border-black transition-colors text-sm"
            >
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-gray-100 p-8">
        <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-8">Notifications</h2>
        <div className="space-y-4 max-w-2xl">
          <label className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors">
            <div>
              <p className="font-medium text-sm">Order Notifications</p>
              <p className="text-xs text-muted mt-1">Receive email when a new order is placed</p>
            </div>
            <input
              type="checkbox"
              checked={notifyOrder}
              onChange={(e) => setNotifyOrder(e.target.checked)}
              className="w-5 h-5 accent-black"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors">
            <div>
              <p className="font-medium text-sm">Low Stock Alerts</p>
              <p className="text-xs text-muted mt-1">Get notified when product stock is low</p>
            </div>
            <input
              type="checkbox"
              checked={notifyLowStock}
              onChange={(e) => setNotifyLowStock(e.target.checked)}
              className="w-5 h-5 accent-black"
            />
          </label>
          <label className="flex items-center justify-between p-4 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors">
            <div>
              <p className="font-medium text-sm">Customer Reviews</p>
              <p className="text-xs text-muted mt-1">Receive notifications for new reviews</p>
            </div>
            <input
              type="checkbox"
              checked={notifyReview}
              onChange={(e) => setNotifyReview(e.target.checked)}
              className="w-5 h-5 accent-black"
            />
          </label>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white border border-gray-100 p-8">
        <h2 className="text-xs uppercase tracking-[0.15em] font-medium mb-8">Payment Settings</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="p-4 bg-secondary flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">P</span>
              </div>
              <div>
                <p className="font-medium text-sm">Paystack</p>
                <p className="text-xs text-muted">Accept card payments</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-medium">Connected</span>
          </div>
          <div className="p-4 bg-secondary flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">B</span>
              </div>
              <div>
                <p className="font-medium text-sm">Bank Transfer</p>
                <p className="text-xs text-muted">Manual bank transfers</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
