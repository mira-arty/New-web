"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CoverLogoEditor from "@/components/business/profile/CoverLogoEditor";
import DescriptionEditor from "@/components/business/profile/DescriptionEditor";
import GalleryEditor from "@/components/business/profile/GalleryEditor";
import TagsEditor from "@/components/business/profile/TagsEditor";
import HighlightsEditor from "@/components/business/profile/HighlightsEditor";
import SocialLinksEditor from "@/components/business/profile/SocialLinksEditor";
import SlugEditor from "@/components/business/profile/SlugEditor";
import BusinessProfilePreview from "@/components/business/profile/preview/BusinessProfilePreview";

export interface BusinessProfileData {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  logoUrl: string | null;
  gallery: string[];
  tags: string[];
  highlights: string[];
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  category: string;
  address: string;
  phone: string;
  avgRating: number;
  reviewCount: number;
}

const HIGHLIGHT_OPTIONS = [
  { id: "walk-ins", label: "Walk-ins welcome", icon: "DoorOpen" },
  { id: "free-parking", label: "Free parking", icon: "Parking" },
  { id: "female-staff", label: "Female staff only", icon: "User" },
  { id: "english", label: "English spoken", icon: "Globe" },
  { id: "card-payment", label: "Card payment accepted", icon: "CreditCard" },
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfileData>({
    id: "",
    name: "",
    slug: "",
    description: "",
    coverUrl: null,
    logoUrl: null,
    gallery: [],
    tags: [],
    highlights: [],
    socialLinks: { instagram: "", facebook: "", tiktok: "" },
    category: "",
    address: "",
    phone: "",
    avgRating: 0,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/business/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("Профайл ачааллахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Auto-save with debounce
  const debouncedSave = useCallback(
    (updatedProfile: BusinessProfileData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaving(true);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/business/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProfile),
          });

          if (!res.ok) throw new Error("Save failed");

          setLastSaved(new Date());
          setError("");
        } catch (err) {
          setError("Хадгалахад алдаа гарлаа");
        } finally {
          setSaving(false);
        }
      }, 2000);
    },
    []
  );

  const updateProfile = useCallback(
    (updates: Partial<BusinessProfileData>) => {
      setProfile((prev) => {
        const updated = { ...prev, ...updates };
        debouncedSave(updated);
        return updated;
      });
    },
    [debouncedSave]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/business/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold">Бизнесийн профайл</h1>
            </div>

            <div className="flex items-center gap-3">
              {saving && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  Хадгалж байна...
                </div>
              )}
              {!saving && lastSaved && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Хадгалагдсан
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Screen */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Panel - 40% Editing */}
        <div className="w-[40%] overflow-y-auto bg-white border-r">
          <div className="p-6 space-y-8 max-w-2xl">
            <CoverLogoEditor
              profile={profile}
              updateProfile={updateProfile}
            />

            <DescriptionEditor
              description={profile.description}
              onChange={(description) => updateProfile({ description })}
            />

            <GalleryEditor
              gallery={profile.gallery}
              onChange={(gallery) => updateProfile({ gallery })}
            />

            <TagsEditor
              tags={profile.tags}
              onChange={(tags) => updateProfile({ tags })}
            />

            <HighlightsEditor
              highlights={profile.highlights}
              options={HIGHLIGHT_OPTIONS}
              onChange={(highlights) => updateProfile({ highlights })}
            />

            <SocialLinksEditor
              socialLinks={profile.socialLinks}
              onChange={(socialLinks) => updateProfile({ socialLinks })}
            />

            <SlugEditor
              slug={profile.slug}
              onChange={(slug) => updateProfile({ slug })}
            />
          </div>
        </div>

        {/* Right Panel - 60% Preview */}
        <div className="w-[60%] overflow-y-auto bg-gray-100">
          <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
            Үйлчлүүлэгчдэд харагдах байдал
          </div>
          <div className="p-8">
            <BusinessProfilePreview profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
