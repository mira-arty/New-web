"use client";

import { useState, useRef, useCallback } from "react";
import { BusinessProfileData } from "@/app/business/profile/page";

interface CoverLogoEditorProps {
  profile: BusinessProfileData;
  updateProfile: (updates: Partial<BusinessProfileData>) => void;
}

interface UploadProgress {
  file: string;
  progress: number;
}

export default function CoverLogoEditor({ profile, updateProfile }: CoverLogoEditorProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState<"cover" | "logo" | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, type: "cover" | "logo") => {
    const uploadId = `${type}_${Date.now()}`;
    setUploads((prev) => [...prev, { file: file.name, progress: 0 }]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/business/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      if (type === "cover") {
        updateProfile({ coverUrl: data.url });
      } else {
        updateProfile({ logoUrl: data.url });
      }

      setUploads((prev) =>
        prev.filter((u) => u.file !== file.name)
      );
    } catch {
      alert("Зураг оруулахад алдаа гарлаа");
      setUploads((prev) =>
        prev.filter((u) => u.file !== file.name)
      );
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent, type: "cover" | "logo") => {
    e.preventDefault();
    setDragOver(type);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "cover" | "logo") => {
      e.preventDefault();
      setDragOver(null);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadFile(files[0], type);
      }
    },
    []
  );

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, type);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Зураг</h3>

      {/* Cover Photo */}
      <div
        className={`relative border-2 border-dashed rounded-lg overflow-hidden transition-colors ${
          dragOver === "cover"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={(e) => handleDragOver(e, "cover")}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, "cover")}
      >
        {profile.coverUrl ? (
          <div className="relative group">
            <img
              src={profile.coverUrl}
              alt="Cover"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => updateProfile({ coverUrl: null })}
                className="text-white hover:text-red-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div
            className="h-48 flex flex-col items-center justify-center cursor-pointer"
            onClick={() => coverInputRef.current?.click()}
          >
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">Cover зураг оруулах</p>
            <p className="text-xs text-gray-400">Эсвэл зургаа энд чирнэ үү</p>
          </div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, "cover")}
          className="hidden"
        />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <div
          className={`relative w-24 h-24 border-2 border-dashed rounded-full overflow-hidden transition-colors ${
            dragOver === "logo"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => handleDragOver(e, "logo")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "logo")}
        >
          {profile.logoUrl ? (
            <div className="relative group w-full h-full">
              <img
                src={profile.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full">
                <button
                  type="button"
                  onClick={() => updateProfile({ logoUrl: null })}
                  className="text-white hover:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
              onClick={() => logoInputRef.current?.click()}
            >
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "logo")}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-sm font-medium">Лого</p>
          <p className="text-xs text-gray-500">200x200px эсвэл дөрвөлжин зураг</p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate">{upload.file}</span>
                <span className="text-sm text-gray-500">{upload.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
