"use client";

interface DescriptionEditorProps {
  description: string;
  onChange: (description: string) => void;
}

const MAX_CHARS = 500;

export default function DescriptionEditor({ description, onChange }: DescriptionEditorProps) {
  const charCount = description.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Тайлбар</h3>
        <span
          className={`text-sm ${
            isOverLimit
              ? "text-red-600 font-medium"
              : isNearLimit
              ? "text-orange-600"
              : "text-gray-500"
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>

      <textarea
        value={description}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            onChange(e.target.value);
          }
        }}
        rows={5}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
          isOverLimit
            ? "border-red-300 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        placeholder="Бизнесийнхээ талаар товч мэдээлэл бичнэ үү. Ямар үйлчилгээ үзүүлдэг, онцлог юу вэ?"
      />

      {isOverLimit && (
        <p className="text-sm text-red-600">{MAX_CHARS} тэмдэгтээс хэтэрсэн байна</p>
      )}
    </div>
  );
}
