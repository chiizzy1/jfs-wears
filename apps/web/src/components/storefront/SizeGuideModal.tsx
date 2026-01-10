"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

const sizeCharts = {
  tops: {
    title: "Tops & Shirts",
    headers: ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"],
    rows: [
      ["S", "36-38", "27", "17"],
      ["M", "38-40", "28", "18"],
      ["L", "40-42", "29", "19"],
      ["XL", "42-44", "30", "20"],
      ["XXL", "44-46", "31", "21"],
    ],
  },
  bottoms: {
    title: "Pants & Trousers",
    headers: ["Size", "Waist (in)", "Inseam (in)", "Hip (in)"],
    rows: [
      ["28", "28", "30", "36"],
      ["30", "30", "31", "38"],
      ["32", "32", "31", "40"],
      ["34", "34", "32", "42"],
      ["36", "36", "32", "44"],
    ],
  },
  dresses: {
    title: "Dresses",
    headers: ["Size", "Bust (in)", "Waist (in)", "Hip (in)", "Length (in)"],
    rows: [
      ["XS", "32", "24", "34", "34"],
      ["S", "34", "26", "36", "35"],
      ["M", "36", "28", "38", "36"],
      ["L", "38", "30", "40", "37"],
      ["XL", "40", "32", "42", "38"],
    ],
  },
};

export default function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof sizeCharts>(
    (category?.toLowerCase() as keyof typeof sizeCharts) || "tops"
  );

  if (!isOpen) return null;

  const currentChart = sizeCharts[activeTab];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Size Guide</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b border-gray-100 overflow-x-auto">
            {Object.keys(sizeCharts).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as keyof typeof sizeCharts)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === key ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {sizeCharts[key as keyof typeof sizeCharts].title}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {currentChart.headers.map((header) => (
                    <th key={header} className="text-left py-3 px-4 font-semibold text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentChart.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="py-3 px-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <h3 className="font-semibold mb-2">How to Measure</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>Chest:</strong> Measure around the fullest part of your chest
              </li>
              <li>
                • <strong>Waist:</strong> Measure around your natural waistline
              </li>
              <li>
                • <strong>Hip:</strong> Measure around the fullest part of your hips
              </li>
              <li>
                • <strong>Inseam:</strong> Measure from the crotch to the bottom of your leg
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
