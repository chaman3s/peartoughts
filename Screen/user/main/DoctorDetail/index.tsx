"use client";

import { useState } from "react";
import Button from "@/Components/ui/Button";

import DoctorHeader from "../DoctorHeader";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useNavigate } from "@/utils";

type ReviewItem = {
  id: string;
  name: string;
  text: string;
  postedAt: string;
  rating: number;
};

export default function DoctorDetailScreen() {
  const { doctor } = useDoctor();
  const navigate = useNavigate();
  const clinicName = "Sanskar Netralaya";
  const clinicAddress = "Nungambakkam, Chennai, Tamil Nadu";
  const clinicQuery = encodeURIComponent(`${clinicName}, ${clinicAddress}`);
  const [reviewText, setReviewText] = useState("");
  const [isReviewComposerOpen, setIsReviewComposerOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [userReviewId, setUserReviewId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: "c1",
      name: "Aarav",
      text: "Doctor explained everything clearly and the appointment was smooth.",
      postedAt: "2 days ago",
      rating: 5,
    },
    {
      id: "c2",
      name: "Priya",
      text: "Very professional staff and short waiting time.",
      postedAt: "5 days ago",
      rating: 4,
    },
  ]);

  const handleAddReview = () => {
    const cleanText = reviewText.trim();
    if (!cleanText || selectedRating === null) return;

    if (userReviewId) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === userReviewId
            ? {
                ...review,
                text: cleanText,
                rating: selectedRating,
                postedAt: "Updated just now",
              }
            : review
        )
      );
    } else {
      const newReview: ReviewItem = {
        id: `c${Date.now()}`,
        name: "You",
        text: cleanText,
        postedAt: "Just now",
        rating: selectedRating,
      };
      setReviews((prev) => [newReview, ...prev]);
      setUserReviewId(newReview.id);
    }

    setReviewText("");
    setSelectedRating(null);
    setIsReviewComposerOpen(false);
  };

  const handleCancelReview = () => {
    setIsReviewComposerOpen(false);
    setSelectedRating(null);
    setReviewText("");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const isActive = index < rating;
          return (
            <svg
              key={`${rating}-${index}`}
              viewBox="0 0 24 24"
              className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-300"}`}
              aria-hidden="true"
            >
              <path
                d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="currentColor"
              />
            </svg>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6">
        <DoctorHeader
          status={doctor.status}
          doctorName={doctor.doctorName}
          specialist={doctor.specialist}
          doctorDegree={doctor.doctorDegree}
          clinicName={doctor.clinicName}
          clinicLocation={doctor.clinicLocation}
          clinicAddress={doctor.clinicAddress}
          doctorLicenseNo={doctor.doctorLicenseNo}
          doctorImage={doctor.doctorImage}
          stats={doctor.stats}
        />

      

        <div className="mt-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_14px_38px_-26px_rgba(15,23,42,0.45)] md:p-6">
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900">About Doctor</h3>
          <p className="mt-2 text-lg leading-relaxed text-slate-600">
            15+ years of experience in all aspects of cardiology, including non-invasive and interventional
            procedures.
          </p>

          <h3 className="mt-7 text-3xl font-semibold tracking-tight text-slate-900">Service &amp; Specialization</h3>
          <div className="mt-3 space-y-2 text-lg">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
              <span>Service</span>
              <span className="font-medium text-slate-800">Medicare</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
              <span>Specialization</span>
              <span className="font-medium text-slate-800">Cardiology</span>
            </div>
          </div>

          <h3 className="mt-7 text-3xl font-semibold tracking-tight text-slate-900">Availability For Consulting</h3>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-lg text-slate-600">
            <span>Monday to Friday</span>
            <span className="font-medium text-slate-800">10 PM to 5 PM</span>
          </div>

          <h3 className="mt-7 text-3xl font-semibold tracking-tight text-slate-900">Clinic Location</h3>
          <p className="mt-2 text-lg text-slate-600">
            {clinicName}, {clinicAddress}
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <iframe
              title="Clinic location map"
              src={`https://maps.google.com/maps?q=${clinicQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${clinicQuery}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-base font-semibold text-blue-600 hover:text-blue-700"
          >
            Open in Google Maps
          </a>

          <h3 className="mt-7 text-3xl font-semibold tracking-tight text-slate-900">Reviews</h3>
          <p className="mt-2 text-base text-slate-500">Read patient reviews and share your experience.</p>

          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.postedAt}</p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-xs font-semibold text-slate-700">{review.rating}.0</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                disabled={isReviewComposerOpen}
                onClick={() => {
                  setIsReviewComposerOpen(true);
                  if (userReviewId) {
                    const currentUserReview = reviews.find((review) => review.id === userReviewId);
                    if (currentUserReview) {
                      setSelectedRating(currentUserReview.rating);
                      setReviewText(currentUserReview.text);
                    }
                  } else {
                    setSelectedRating(null);
                    setReviewText("");
                  }
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {userReviewId ? "Edit your review" : "Rate us"}
              </Button>

              {isReviewComposerOpen && (
                <Button
                  type="button"
                  onClick={handleCancelReview}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {isReviewComposerOpen && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">Select stars</p>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  const isActive = selectedRating !== null && starValue <= selectedRating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setSelectedRating(starValue)}
                      className="rounded p-1"
                      aria-label={`Rate ${starValue} star`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-7 w-7 ${isActive ? "text-amber-400" : "text-slate-300"}`}
                        aria-hidden="true"
                      >
                        <path
                          d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  );
                })}
                {selectedRating !== null && (
                  <span className="ml-2 text-sm font-semibold text-slate-700">{selectedRating}.0</span>
                )}
              </div>

              <label htmlFor="review" className="mb-2 mt-3 block text-sm font-medium text-slate-700">
                Write a review
              </label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="Type your review..."
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  disabled={selectedRating === null || reviewText.trim().length === 0}
                  onClick={handleAddReview}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {userReviewId ? "Update Review" : "Post Review"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={() => navigate("/home/dashBoard/BookAppointment")}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-lg font-semibold text-white shadow-[0_14px_28px_-18px_rgba(37,99,235,0.85)] hover:from-blue-700 hover:to-cyan-600"
        >
          Book appointment
        </Button>
      </section>
    </main>
  );
}
