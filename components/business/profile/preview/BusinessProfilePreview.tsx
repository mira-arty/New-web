"use client";

import { BusinessProfileData } from "@/app/business/profile/page";

interface BusinessProfilePreviewProps {
  profile: BusinessProfileData;
}

const HIGHLIGHT_MAP: Record<string, { label: string; icon: JSX.Element }> = {
  "walk-ins": {
    label: "Walk-ins welcome",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
  },
  "free-parking": {
    label: "Free parking",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
  },
  "female-staff": {
    label: "Female staff only",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  english: {
    label: "English spoken",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  "card-payment": {
    label: "Card payment accepted",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth={2} />
        <line x1="1" y1="10" x2="23" y2="10" strokeWidth={2} />
      </svg>
    ),
  },
};

export default function BusinessProfilePreview({ profile }: BusinessProfilePreviewProps) {
  const fullUrl = profile.slug ? `timer.mn/b/${profile.slug}` : "timer.mn/b/your-business";

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gray-200">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
            <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-2xl font-bold text-gray-400">
                  {profile.name ? profile.name[0] : "?"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="pt-12 px-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.name || "Таны бизнесийн нэр"}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500 capitalize">{profile.category || "Ангилал"}</span>
          {profile.avgRating > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{profile.avgRating}</span>
                <span className="text-sm text-gray-500">({profile.reviewCount} сэтгэгдэл)</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {profile.address || "Хаяг оруулаагүй"}
        </div>

        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {profile.phone || "Утас оруулаагүй"}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-4 flex gap-3">
        <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Цаг авах
        </button>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {profile.description && (
        <div className="px-6 py-4 border-t">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {profile.description}
          </p>
        </div>
      )}

      {/* Highlights */}
      {profile.highlights.length > 0 && (
        <div className="px-6 py-4 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Онцлогууд</h3>
          <div className="flex flex-wrap gap-2">
            {profile.highlights.map((highlight) => {
              const info = HIGHLIGHT_MAP[highlight];
              if (!info) return null;
              return (
                <span
                  key={highlight}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {info.icon}
                  {info.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      {profile.tags.length > 0 && (
        <div className="px-6 py-4 border-t">
          <div className="flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {profile.gallery.length > 0 && (
        <div className="px-6 py-4 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Галерей ({profile.gallery.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {profile.gallery.slice(0, 6).map((url, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            {profile.gallery.length > 6 && (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">+{profile.gallery.length - 6}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(profile.socialLinks.instagram || profile.socialLinks.facebook || profile.socialLinks.tiktok) && (
        <div className="px-6 py-4 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Сошиал</h3>
          <div className="flex gap-4">
            {profile.socialLinks.instagram && (
              <a
                href={profile.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2" fill="none" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </a>
            )}
            {profile.socialLinks.facebook && (
              <a
                href={profile.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {profile.socialLinks.tiktok && (
              <a
                href={profile.socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      {/* URL Preview */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <p className="text-xs text-gray-500">Холбоос: {fullUrl}</p>
      </div>
    </div>
  );
}
