import Image from "next/image";
import Link from "next/link";

type PropertyCardProps = {
  property: {
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
};

export default function PropertyCard({ property }: PropertyCardProps) {
  // Ova kartica prikazuje osnovne informacije o nekretnini.
  return (
    <article className="modern-property-card">
      <div className="property-image-wrap">
        <Image
          src={property.imageUrl}
          alt={property.title}
          width={700}
          height={460}
        />

        <div className="property-badges">
          {property.panoramaUrl && <span>360°</span>}
          {property.model3dUrl && <span>3D</span>}
        </div>
      </div>

      <div className="modern-property-body">
        <div>
          <p className="property-city">{property.city}</p>
          <h3>{property.title}</h3>
          <p>{property.description}</p>
        </div>

        <div className="property-footer">
          <strong>{property.price} € / night</strong>
          <Link href={`/properties/${property.id}`}>View details</Link>
        </div>
      </div>
    </article>
  );
}