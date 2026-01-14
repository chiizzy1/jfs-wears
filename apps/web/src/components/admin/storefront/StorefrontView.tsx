"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Eye, EyeOff, Edit2 } from "lucide-react";
import { StorefrontSkeleton } from "@/components/admin/skeletons/StorefrontSkeleton";

import { useConfirm } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { storefrontService } from "@/services/storefront.service";
import { StorefrontHero, StorefrontSection } from "@/types/storefront.types";
import { Category } from "@/types/category.types";
import { adminAPI } from "@/lib/admin-api";

import { HeroForm } from "./HeroForm";
import { SectionForm } from "./SectionForm";
import { CategoryGridTab } from "./CategoryGridTab";

export function StorefrontView() {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<"heroes" | "categories" | "carousels">("heroes");

  const [heroes, setHeroes] = useState<StorefrontHero[]>([]);
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingHero, setEditingHero] = useState<StorefrontHero | null>(null);
  const [editingSection, setEditingSection] = useState<StorefrontSection | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [heroesRes, sectionsRes, categoriesRes] = await Promise.all([
        storefrontService.getHeroes(),
        storefrontService.getSections(),
        adminAPI.get<Category[]>("/categories"), // Using adminAPI directly for categories lists
      ]);
      setHeroes(heroesRes);
      setSections(sectionsRes);
      setCategories(categoriesRes);
    } catch (err) {
      console.error("Error fetching storefront data:", err);
      toast.error("Failed to load storefront data");
    } finally {
      setLoading(false);
    }
  };

  const toggleHeroActive = async (hero: StorefrontHero) => {
    try {
      await storefrontService.updateHero(hero.id, { isActive: !hero.isActive });
      setHeroes((prev) => prev.map((h) => (h.id === hero.id ? { ...h, isActive: !h.isActive } : h)));
      toast.success(`Hero ${hero.isActive ? "hidden" : "shown"}`);
    } catch {
      toast.error("Failed to update hero");
    }
  };

  const deleteHero = async (id: string) => {
    const ok = await confirm({
      title: "Delete Hero Slide",
      message: "Are you sure you want to delete this hero slide?",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await storefrontService.deleteHero(id);
      setHeroes((prev) => prev.filter((h) => h.id !== id));
      toast.success("Hero deleted");
    } catch {
      toast.error("Failed to delete hero");
    }
  };

  const toggleSectionActive = async (section: StorefrontSection) => {
    try {
      await storefrontService.updateSection(section.id, { isActive: !section.isActive });
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, isActive: !s.isActive } : s)));
      toast.success(`Section ${section.isActive ? "hidden" : "shown"}`);
    } catch {
      toast.error("Failed to update section");
    }
  };

  const deleteSection = async (id: string) => {
    const ok = await confirm({
      title: "Delete Section",
      message: "Are you sure you want to delete this section?",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await storefrontService.deleteSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const carouselSections = sections.filter((s) => s.type === "CATEGORY" || s.type === "FEATURED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Storefront CMS</h1>
        <p className="text-gray-500 text-sm mt-1">Manage hero slides, category grid, and product carousels</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {[
          { id: "heroes", label: "Hero Slides" },
          { id: "categories", label: "Category Grid" },
          { id: "carousels", label: "Product Carousels" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <StorefrontSkeleton />
      ) : (
        <>
          {activeTab === "heroes" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingHero(null);
                    setShowHeroModal(true);
                  }}
                  variant="premium"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Hero Slide
                </Button>
              </div>

              {heroes.length === 0 ? (
                <EmptyState
                  onAdd={() => {
                    setEditingHero(null);
                    setShowHeroModal(true);
                  }}
                  type="Hero Slide"
                />
              ) : (
                <div className="space-y-3">
                  {heroes.map((hero) => (
                    <div
                      key={hero.id}
                      className={`flex items-center gap-4 p-4 border rounded-none ${
                        hero.isActive ? "bg-white" : "bg-gray-50 opacity-60"
                      }`}
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                      <div className="w-32 h-20 bg-gray-100 rounded-none overflow-hidden flex-shrink-0 relative">
                        {hero.mediaType === "VIDEO" ? (
                          <video src={hero.mediaUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={hero.mediaUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        {hero.mediaType === "VIDEO" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="bg-white/80 p-1 rounded-full">
                              <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{hero.headline}</p>
                        <p className="text-sm text-gray-500 truncate">{hero.subheadline || "No subheadline"}</p>
                        <div className="flex gap-2 mt-1">
                          {hero.category && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 uppercase tracking-wide">
                              {hero.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleHeroActive(hero)}
                          title={hero.isActive ? "Hide" : "Show"}
                        >
                          {hero.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingHero(hero);
                            setShowHeroModal(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteHero(hero.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "categories" && <CategoryGridTab categories={categories} onRefresh={fetchData} />}

          {activeTab === "carousels" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingSection(null);
                    setShowSectionModal(true);
                  }}
                  variant="premium"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Carousel
                </Button>
              </div>

              {carouselSections.length === 0 ? (
                <EmptyState
                  onAdd={() => {
                    setEditingSection(null);
                    setShowSectionModal(true);
                  }}
                  type="Carousel"
                />
              ) : (
                <div className="space-y-3">
                  {carouselSections.map((section) => (
                    <div
                      key={section.id}
                      className={`flex items-center gap-4 p-4 border rounded-none ${
                        section.isActive ? "bg-white" : "bg-gray-50 opacity-60"
                      }`}
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{section.title}</p>
                        <p className="text-sm text-gray-500">{section.subtitle || "No subtitle"}</p>
                        <div className="flex gap-2 mt-1">
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 ${
                              section.type === "FEATURED" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {section.type}
                          </span>
                          {section.category && (
                            <span className="text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 uppercase tracking-wide">
                              {section.category.name}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 px-2 py-0.5">Max: {section.maxProducts}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSectionActive(section)}
                          title={section.isActive ? "Hide" : "Show"}
                        >
                          {section.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSection(section);
                            setShowSectionModal(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <Dialog open={showHeroModal} onOpenChange={setShowHeroModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingHero ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
          </DialogHeader>
          <HeroForm
            initialData={editingHero}
            categories={categories}
            onSuccess={() => {
              setShowHeroModal(false);
              fetchData();
            }}
            onCancel={() => setShowHeroModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add Section"}</DialogTitle>
          </DialogHeader>
          <SectionForm
            initialData={editingSection}
            categories={categories}
            onSuccess={() => {
              setShowSectionModal(false);
              fetchData();
            }}
            onCancel={() => setShowSectionModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ onAdd, type }: { onAdd: () => void; type: string }) {
  return (
    <div className="border border-dashed border-gray-300 py-12 text-center bg-gray-50/50">
      <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500">No {type.toLowerCase()}s found</p>
      <Button onClick={onAdd} variant="outline" className="mt-4">
        Add {type}
      </Button>
    </div>
  );
}
