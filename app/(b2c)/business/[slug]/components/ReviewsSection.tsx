"use client";

import { ReviewItem } from "@/lib/types/business-profile";
import { format } from "date-fns";
import { mn } from "date-fns/locale";

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  avgRating: number;
  reviewCount: number;
}

export default function ReviewsSection({ reviews, avgRating, reviewCount }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  // Calculate star distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = (count / reviews.length) * 100;
    return { star, count, percentage };
  });

  return (
    <section className="px-4 sm:px-6 py-6">
      <h2 className="text-xl font-semibold mb-4">Сэтгэгдэл ({reviewCount})</h2>

      <div className="flex items-start gap-6 mb-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">{reviewCount} сэтгэгдэл</p>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {distribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-8">{star}★</span>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {review.customerAvatar ? (
                  <img
                    src={review.customerAvatar}
                    alt={review.customerName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= Math.round(review.rating) ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(review.createdAt), "yyyy.MM.dd", { locale: mn })}
                  </span>
                </div>

                <p className="mt-2 text-gray-700 text-sm">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
