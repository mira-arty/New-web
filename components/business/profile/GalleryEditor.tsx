"use client";

import { useState, useRef, useCallback } from "react";

interface GalleryEditorProps {
  gallery: string[];
  onChange: (gallery: string[]) => void;
}

const MAX_PHOTOS = 20;

export default function GalleryEditor({ gallery, onChange }: GalleryEditorProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (gallery.length + files.length > MAX_PHOTOS) {
      alert(`Хамгийн ихдээ ${MAX_PHOTOS} зураг оруулах боломжтой`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "gallery");

        const res = await fetch("/api/business/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        }
      }

      onChange([...gallery, ...newUrls]);
    } catch {
      alert("Зураг оруулахад алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleUpload(files);
      }
    },
    [gallery]
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newGallery = [...gallery];
    const [removed] = newGallery.splice(draggedIndex, 1);
    newGallery.splice(index, 0, removed);
    onChange(newGallery);
    setDraggedIndex(index);
  };

  const handleDelete = (index: number) => {
    onChange(gallery.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Галерей</h3>
        <span className="text-sm text-gray-500">
          {gallery.length}/{MAX_PHOTOS} зураг
        </span>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-center cursor-pointer">
          <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600">
            {uploading ? "Оруулж байна..." : "Зургаа энд чирнэ үү эсвэл дарж оруулна уу"}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (хамгийн ихдээ 5MB)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Photo Grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={() => setDraggedIndex(null)}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-move"
            >
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
