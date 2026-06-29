import Navigation from "@/components/Navigation";
import PropertyCard from "@/components/PropertyCard";

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

async function getProperties() {
  const response = await fetch("http://localhost:3000/api/properties", {
    cache: "no-store",
  });

  const result = await response.json();
  return result.data as Property[];
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="section-heading">
          <p className="eyebrow">Explore listings.</p>
          <h1>Available properties.</h1>
          <p>Open any property to view details, 360 panorama and 3D model.</p>
        </div>

        <div className="modern-property-grid">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
}