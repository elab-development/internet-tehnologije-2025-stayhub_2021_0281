"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import AppModal from "@/components/AppModal";

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
  images?: Array<{
    id: number;
    imageUrl: string;
  }>;
};

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("New Modern Apartment");
  const [description, setDescription] = useState("Beautiful and simple property.");
  const [city, setCity] = useState("Paris");
  const [address, setAddress] = useState("Main Street 1");
  const [price, setPrice] = useState("120");
  const [imageUrl, setImageUrl] = useState("/home-images/homecard1.jpg");
  const [panoramaUrl, setPanoramaUrl] = useState("https://pannellum.org/images/alma.jpg");
  const [model3dUrl, setModel3dUrl] = useState(
    "https://sketchfab.com/models/7575f718657545edacee98f84e41c6a0/embed"
  );

  const [imagePropertyId, setImagePropertyId] = useState("");
  const [extraImageUrl, setExtraImageUrl] = useState("/cities/Paris.jpg");

  const [message, setMessage] = useState("");

  async function loadProperties() {
    const response = await fetch("/api/properties");
    const result = await response.json();

    if (response.ok) {
      setProperties(result.data);
    }
  }

  function openCreatePropertyModal() {
    // Otvaramo modal za novu nekretninu.
    setEditingId(null);
    setTitle("New Modern Apartment");
    setDescription("Beautiful and simple property.");
    setCity("Paris");
    setAddress("Main Street 1");
    setPrice("120");
    setImageUrl("/home-images/homecard1.jpg");
    setPanoramaUrl("https://pannellum.org/images/alma.jpg");
    setModel3dUrl("https://sketchfab.com/models/7575f718657545edacee98f84e41c6a0/embed");
    setIsPropertyModalOpen(true);
  }

  function openEditPropertyModal(property: Property) {
    // Otvaramo modal za izmenu nekretnine.
    setEditingId(property.id);
    setTitle(property.title);
    setDescription(property.description);
    setCity(property.city);
    setAddress(property.address);
    setPrice(String(property.price));
    setImageUrl(property.imageUrl);
    setPanoramaUrl(property.panoramaUrl || "");
    setModel3dUrl(property.model3dUrl || "");
    setIsPropertyModalOpen(true);
  }

  function openImageModal(propertyId?: number) {
    // Otvaramo modal za dodatnu sliku.
    setImagePropertyId(propertyId ? String(propertyId) : "");
    setExtraImageUrl("/cities/Paris.jpg");
    setIsImageModalOpen(true);
  }

  function closeModals() {
    setIsPropertyModalOpen(false);
    setIsImageModalOpen(false);
    setEditingId(null);
  }

  async function saveProperty(event: React.FormEvent) {
    event.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/properties/${editingId}` : "/api/properties";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        city,
        address,
        price,
        imageUrl,
        panoramaUrl,
        model3dUrl,
      }),
    });

    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      closeModals();
      loadProperties();
    }
  }

  async function deleteProperty(id: number) {
    const confirmed = confirm("Are you sure you want to delete this property?");
    if (!confirmed) return;

    const response = await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    setMessage(result.message);
    loadProperties();
  }

  async function addPropertyImage(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/property-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        propertyId: imagePropertyId,
        imageUrl: extraImageUrl,
      }),
    });

    const result = await response.json();
    setMessage(result.message);

    if (response.ok) {
      closeModals();
      loadProperties();
    }
  }

  async function deletePropertyImage(id: number) {
    const response = await fetch(`/api/property-images/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    setMessage(result.message);
    loadProperties();
  }

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="section-heading">
          <p className="eyebrow">Agent area.</p>
          <h1>Properties CRUD.</h1>
          <p>Agents can create, read, update and delete properties.</p>
        </div>

        <div className="action-row" style={{ marginBottom: "30px" }}>
          <AppButton text="Create property" onClick={openCreatePropertyModal} />
          <AppButton
            text="Add extra image"
            variant="secondary"
            onClick={() => openImageModal()}
          />
        </div>

        {message && <p className="form-message">{message}</p>}

        <div className="crud-grid">
          {properties.map((property) => (
            <article className="crud-card" key={property.id}>
              <img src={property.imageUrl} alt={property.title} />

              <div className="crud-card-body">
                <p className="eyebrow">{property.city}</p>
                <h3>{property.title}</h3>
                <p>{property.description}</p>
                <strong>{property.price} € / night</strong>

                <div className="crud-actions">
                  <AppButton
                    text="Edit"
                    variant="secondary"
                    onClick={() => openEditPropertyModal(property)}
                  />
                  <AppButton
                    text="Add image"
                    variant="secondary"
                    onClick={() => openImageModal(property.id)}
                  />
                  <AppButton
                    text="Delete"
                    variant="danger"
                    onClick={() => deleteProperty(property.id)}
                  />
                </div>

                {property.images && property.images.length > 0 && (
                  <div className="extra-images">
                    <h4>Extra images</h4>

                    {property.images.map((image) => (
                      <div className="extra-image-row" key={image.id}>
                        <span>{image.imageUrl}</span>
                        <AppButton
                          text="Delete"
                          variant="danger"
                          onClick={() => deletePropertyImage(image.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <AppModal
          isOpen={isPropertyModalOpen}
          title={editingId ? "Update property" : "Create property"}
          onClose={closeModals}
        >
          <form className="simple-form" onSubmit={saveProperty}>
            <AppInput label="Title" value={title} onChange={setTitle} />
            <AppInput label="Description" value={description} onChange={setDescription} />
            <AppInput label="City" value={city} onChange={setCity} />
            <AppInput label="Address" value={address} onChange={setAddress} />
            <AppInput label="Price" value={price} onChange={setPrice} />
            <AppInput label="Main image URL" value={imageUrl} onChange={setImageUrl} />
            <AppInput label="360 image URL" value={panoramaUrl} onChange={setPanoramaUrl} />
            <AppInput label="3D model URL" value={model3dUrl} onChange={setModel3dUrl} />

            <div className="action-row">
              <AppButton
                text={editingId ? "Update property" : "Create property"}
                type="submit"
              />
              <AppButton text="Cancel" variant="secondary" onClick={closeModals} />
            </div>
          </form>
        </AppModal>

        <AppModal
          isOpen={isImageModalOpen}
          title="Add extra property image"
          onClose={closeModals}
        >
          <form className="simple-form" onSubmit={addPropertyImage}>
            <label className="input-group">
              <span>Property</span>
              <select
                value={imagePropertyId}
                onChange={(event) => setImagePropertyId(event.target.value)}
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </label>

            <AppInput
              label="Extra image URL"
              value={extraImageUrl}
              onChange={setExtraImageUrl}
            />

            <div className="action-row">
              <AppButton text="Add image" type="submit" />
              <AppButton text="Cancel" variant="secondary" onClick={closeModals} />
            </div>
          </form>
        </AppModal>
      </section>
    </main>
  );
}