"use client";

interface SocialLinksEditorProps {
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  onChange: (socialLinks: { instagram: string; facebook: string; tiktok: string }) => void;
}

export default function SocialLinksEditor({ socialLinks, onChange }: SocialLinksEditorProps) {
  const updateLink = (platform: keyof typeof socialLinks, value: string) => {
    onChange({ ...socialLinks, [platform]: value });
  };

  const platforms = [
    {
      key: "instagram" as const,
      label: "Instagram",
      placeholder: "https://instagram.com/yourbusiness",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth={2} />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2} strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "facebook" as const,
      label: "Facebook",
      placeholder: "https://facebook.com/yourbusiness",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      placeholder: "https://tiktok.com/@yourbusiness",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Сошиал холбоос</h3>

      <div className="space-y-3">
        {platforms.map((platform) => (
          <div key={platform.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {platform.label}
            </label>
            <div className="flex items-center gap-3">
              <div className="text-gray-400">{platform.icon}</div>
              <input
                type="url"
                value={socialLinks[platform.key]}
                onChange={(e) => updateLink(platform.key, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={platform.placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
