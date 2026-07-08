"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import AppModal from "@/components/AppModal";

type Property = {
  id: number;
  title: string;
  city: string;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  property: Property;
  client: {
    id: number;
    name: string;
  };
};

async function readJsonSafely(response: Response) {
  // Nekad response može biti prazan, zato prvo čitamo tekst.
  const text = await response.text();

  // Ako nema teksta, vraćamo prazan objekat da aplikacija ne pukne.
  if (!text) {
    return {};
  }

  return JSON.parse(text);
}

export default function ClientReviewsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [propertyId, setPropertyId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("Great property.");
  const [message, setMessage] = useState("");

  async function loadCurrentUser() {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
    });

    const result = await readJsonSafely(response);

    if (response.ok && result.data) {
      setCurrentUserId(result.data.id);
    } else {
      setMessage(result.message || "You must be logged in to manage reviews.");
    }
  }

  async function loadProperties() {
    const response = await fetch("/api/properties", {
      cache: "no-store",
    });

    const result = await readJsonSafely(response);

    if (response.ok && result.data) {
      setProperties(result.data);
    }
  }

  async function loadReviews() {
    const response = await fetch("/api/reviews", {
      cache: "no-store",
    });

    const result = await readJsonSafely(response);

    if (response.ok && result.data) {
      setReviews(result.data);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setPropertyId("");
    setRating("5");
    setComment("Great property.");
    setIsModalOpen(true);
  }

  function openEditModal(review: Review) {
    setEditingId(review.id);
    setPropertyId(String(review.property.id));
    setRating(String(review.rating));
    setComment(review.comment);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
  }

  async function saveReview(event: React.FormEvent) {
    event.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/reviews/${editingId}` : "/api/reviews";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        propertyId,
        rating,
        comment,
      }),
    });

    const result = await readJsonSafely(response);
    setMessage(result.message || "Review request completed.");

    if (response.ok) {
      closeModal();
      loadReviews();
    }
  }

  async function deleteReview(id: number) {
    const confirmed = confirm("Are you sure you want to delete this review?");

    if (!confirmed) return;

    const response = await fetch(`/api/reviews/${id}`, {
      method: "DELETE",
    });

    const result = await readJsonSafely(response);
    setMessage(result.message || "Review deleted.");

    if (response.ok) {
      loadReviews();
    }
  }

  useEffect(() => {
    loadCurrentUser();
    loadProperties();
    loadReviews();
  }, []);

  const myReviews = reviews.filter(
    (review) => review.client?.id === currentUserId
  );

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="section-heading">
          <p className="eyebrow">Client area.</p>
          <h1>Reviews CRUD.</h1>
          <p>Clients can create, read, update and delete reviews.</p>
        </div>

        <div className="action-row">
          <AppButton text="Create review" onClick={openCreateModal} />
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="table-box">
          <h2>My reviews</h2>

          {myReviews.length === 0 && (
            <p>You do not have reviews yet. Create your first review.</p>
          )}

          {myReviews.map((review) => (
            <div className="crud-row" key={review.id}>
              <div>
                <strong>{review.property.title}</strong>
                <span>{review.property.city}</span>
              </div>

              <div>
                <strong>{review.rating} / 5</strong>
                <span>{review.comment}</span>
              </div>

              <div className="crud-actions">
                <AppButton
                  text="Edit"
                  variant="secondary"
                  onClick={() => openEditModal(review)}
                />
                <AppButton
                  text="Delete"
                  variant="danger"
                  onClick={() => deleteReview(review.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <AppModal
          isOpen={isModalOpen}
          title={editingId ? "Update review" : "Create review"}
          onClose={closeModal}
        >
          <form className="simple-form" onSubmit={saveReview}>
            {!editingId && (
              <label className="input-group">
                <span>Property</span>
                <select
                  value={propertyId}
                  onChange={(event) => setPropertyId(event.target.value)}
                >
                  <option value="">Select property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.city}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="input-group">
              <span>Rating</span>
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
              >
                <option value="1">1 star</option>
                <option value="2">2 stars</option>
                <option value="3">3 stars</option>
                <option value="4">4 stars</option>
                <option value="5">5 stars</option>
              </select>
            </label>

            <AppInput label="Comment" value={comment} onChange={setComment} />

            <div className="action-row">
              <AppButton
                text={editingId ? "Update review" : "Create review"}
                type="submit"
              />
              <AppButton
                text="Cancel"
                variant="secondary"
                onClick={closeModal}
              />
            </div>
          </form>
        </AppModal>
      </section>
    </main>
  );
}