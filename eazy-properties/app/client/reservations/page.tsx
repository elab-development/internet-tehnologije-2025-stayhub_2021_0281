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

type Reservation = {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  property: Property;
};

export default function ClientReservationsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-05");
  const [message, setMessage] = useState("");

  async function loadProperties() {
    const response = await fetch("/api/properties");
    const result = await response.json();

    if (response.ok) {
      setProperties(result.data);
    }
  }

  async function loadReservations() {
    const response = await fetch("/api/reservations");
    const result = await response.json();

    if (response.ok) {
      setReservations(result.data);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setPropertyId("");
    setStartDate("2026-08-01");
    setEndDate("2026-08-05");
    setIsModalOpen(true);
  }

  function openEditModal(reservation: Reservation) {
    setEditingId(reservation.id);
    setPropertyId(String(reservation.property.id));
    setStartDate(reservation.startDate.slice(0, 10));
    setEndDate(reservation.endDate.slice(0, 10));
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
  }

  async function saveReservation(event: React.FormEvent) {
    event.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/reservations/${editingId}` : "/api/reservations";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        propertyId,
        startDate,
        endDate,
      }),
    });

    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      closeModal();
      loadReservations();
    }
  }

  async function deleteReservation(id: number) {
    const confirmed = confirm("Are you sure you want to delete this reservation?");
    if (!confirmed) return;

    const response = await fetch(`/api/reservations/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    setMessage(result.message);
    loadReservations();
  }

  useEffect(() => {
    loadProperties();
    loadReservations();
  }, []);

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="section-heading">
          <p className="eyebrow">Client area.</p>
          <h1>Reservations CRUD.</h1>
          <p>Clients can create, read, update and delete reservations.</p>
        </div>

        <div className="action-row">
          <AppButton text="Create reservation" onClick={openCreateModal} />
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="table-box">
          <h2>My reservations</h2>

          {reservations.map((reservation) => (
            <div className="crud-row" key={reservation.id}>
              <div>
                <strong>{reservation.property.title}</strong>
                <span>{reservation.property.city}</span>
              </div>

              <div>
                <strong>{reservation.status}</strong>
                <span>
                  {reservation.startDate.slice(0, 10)} -{" "}
                  {reservation.endDate.slice(0, 10)}
                </span>
              </div>

              <div className="crud-actions">
                <AppButton
                  text="Edit"
                  variant="secondary"
                  onClick={() => openEditModal(reservation)}
                />
                <AppButton
                  text="Delete"
                  variant="danger"
                  onClick={() => deleteReservation(reservation.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <AppModal
          isOpen={isModalOpen}
          title={editingId ? "Update reservation" : "Create reservation"}
          onClose={closeModal}
        >
          <form className="simple-form" onSubmit={saveReservation}>
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

            <div className="reservation-grid">
              <AppInput
                label="Start date"
                type="date"
                value={startDate}
                onChange={setStartDate}
              />

              <AppInput
                label="End date"
                type="date"
                value={endDate}
                onChange={setEndDate}
              />
            </div>

            <div className="action-row">
              <AppButton
                text={editingId ? "Update reservation" : "Create reservation"}
                type="submit"
              />
              <AppButton text="Cancel" variant="secondary" onClick={closeModal} />
            </div>
          </form>
        </AppModal>
      </section>
    </main>
  );
}