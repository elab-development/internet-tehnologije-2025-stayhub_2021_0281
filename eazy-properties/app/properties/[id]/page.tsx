"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";

type Property = {
  id: number;
  title: string;
  description: string;
  city: string;
  address: string;
  price: number;
  imageUrl: string;
  panoramaUrl?: string;
  model3dUrl?: string;
};

type NearbyPlace = {
  name: string;
  address: string;
  categories: string[];
  distance: number | null;
};

type ElectricityCarbon = {
  city: string;
  zone: string;
  carbonIntensity: number;
  isEstimated: boolean;
  datetime: string;
  emissionFactorType?: string;
};

export default function PropertyDetailsPage() {
  const params = useParams();

  const [property, setProperty] = useState<Property | null>(null);

  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-05");

  const [message, setMessage] = useState("");

  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [placeCategory, setPlaceCategory] = useState("catering.restaurant");
  const [placesLoading, setPlacesLoading] = useState(false);

  const [electricityCarbon, setElectricityCarbon] =
    useState<ElectricityCarbon | null>(null);
  const [electricityLoading, setElectricityLoading] = useState(false);

  const propertyId = params.id as string;

  // Učitavamo detalje nekretnine na osnovu ID-ja iz URL-a.
  useEffect(() => {
    if (!propertyId) return;

    async function loadProperty() {
      const response = await fetch(`/api/properties/${propertyId}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok) {
        setProperty(result.data);
      } else {
        setMessage(result.message || "Failed to load property.");
      }
    }

    loadProperty();
  }, [propertyId]);

  async function createReservation() {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        propertyId,
      }),
    });

    const result = await response.json();
    setMessage(result.message);
  }

  async function loadNearbyPlaces() {
    if (!property) return;

    setPlacesLoading(true);
    setMessage("");

    const response = await fetch(
      `/api/external/nearby-places?city=${encodeURIComponent(
        property.city
      )}&address=${encodeURIComponent(
        property.address
      )}&category=${encodeURIComponent(placeCategory)}`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (response.ok) {
      setNearbyPlaces(result.data.places);
    } else {
      setNearbyPlaces([]);
      setMessage(result.message || "Failed to load nearby places.");
    }

    setPlacesLoading(false);
  }

  async function loadElectricityCarbon() {
    if (!property) return;

    setElectricityLoading(true);
    setMessage("");

    const response = await fetch(
      `/api/external/electricity-carbon?city=${encodeURIComponent(property.city)}`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (response.ok) {
      setElectricityCarbon(result.data);
    } else {
      setElectricityCarbon(null);
      setMessage(result.message || "Failed to load electricity carbon data.");
    }

    setElectricityLoading(false);
  }

  if (!property) {
    return (
      <main className="app-shell">
        <Navigation />

        <section className="modern-page">
          <div className="details-box">
            <h2>Loading property...</h2>
            <p>Please wait while we load the property details.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="property-details-hero">
          <div>
            <p className="eyebrow">Property details.</p>
            <h1>{property.title}</h1>
            <p>{property.description}</p>
          </div>

          <div className="property-price-card">
            <span>Price per night</span>
            <strong>{property.price} €</strong>
          </div>
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="details-box property-info-grid">
          <div>
            <span>City</span>
            <strong>{property.city}</strong>
          </div>

          <div>
            <span>Address</span>
            <strong>{property.address}</strong>
          </div>

          <div>
            <span>Price</span>
            <strong>{property.price} € / night</strong>
          </div>
        </div>

        {property.panoramaUrl && (
          <div className="viewer-section">
            <div className="section-heading compact">
              <p className="eyebrow">Interactive preview.</p>
              <h2>360 View</h2>
            </div>

            <iframe
              className="viewer-frame"
              src={`https://cdn.pannellum.org/2.5/pannellum.htm#panorama=${property.panoramaUrl}&autoLoad=true`}
            />
          </div>
        )}

        {property.model3dUrl && (
          <div className="viewer-section">
            <div className="section-heading compact">
              <p className="eyebrow">Interactive preview.</p>
              <h2>3D Model</h2>
            </div>

            <iframe className="viewer-frame" src={property.model3dUrl} />
          </div>
        )}

        <div className="external-api-grid">
          <div className="external-api-card">
            <p className="eyebrow">Geoapify API.</p>
            <h2>Nearby places</h2>
            <p>
              Find restaurants, shops, parks and useful places near this
              property.
            </p>

            <label className="input-group">
              <span>Place category</span>
              <select
                value={placeCategory}
                onChange={(event) => setPlaceCategory(event.target.value)}
              >
                <option value="catering.restaurant">Restaurants</option>
                <option value="catering.cafe">Cafes</option>
                <option value="commercial.supermarket">Supermarkets</option>
                <option value="healthcare.hospital">Hospitals</option>
                <option value="leisure.park">Parks</option>
                <option value="public_transport">Public transport</option>
              </select>
            </label>

            <AppButton
              text={placesLoading ? "Loading..." : "Load nearby places"}
              onClick={loadNearbyPlaces}
            />

            <div className="nearby-list">
              {nearbyPlaces.map((place, index) => (
                <div className="nearby-item" key={index}>
                  <strong>{place.name}</strong>
                  <span>{place.address}</span>

                  {place.distance && (
                    <small>{Math.round(place.distance)} m away</small>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="external-api-card">
            <p className="eyebrow">Electricity Maps API.</p>
            <h2>Electricity carbon intensity</h2>
            <p>
              See how carbon-heavy the electricity grid is around this property.
            </p>

            <AppButton
              text={
                electricityLoading
                  ? "Loading..."
                  : "Load electricity carbon data"
              }
              onClick={loadElectricityCarbon}
            />

            {electricityCarbon && (
              <div className="carbon-result">
                <span>Current grid intensity</span>
                <strong>
                  {electricityCarbon.carbonIntensity} gCO₂e/kWh
                </strong>

                <small>Zone: {electricityCarbon.zone}</small>

                {electricityCarbon.datetime && (
                  <small>
                    Updated:{" "}
                    {new Date(electricityCarbon.datetime).toLocaleString()}
                  </small>
                )}

                <small>
                  {electricityCarbon.isEstimated
                    ? "This value is estimated."
                    : "This value is based on available grid data."}
                </small>
              </div>
            )}
          </div>
        </div>

        <div className="reservation-box">
          <h2>Make reservation</h2>
          <p>Choose dates and send your reservation request.</p>

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

          <AppButton text="Reserve property" onClick={createReservation} />
        </div>
      </section>
    </main>
  );
}