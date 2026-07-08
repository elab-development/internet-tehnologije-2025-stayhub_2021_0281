"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const cityImages = [
  "/cities/Bejing.jpg",
  "/cities/Belgrade.jpg",
  "/cities/Dubai.jpg",
  "/cities/London.jpg",
  "/cities/Moscow.jpg",
  "/cities/Newyork.jpg",
  "/cities/Paris.jpg",
  "/cities/Singapoore.jpg",
  "/cities/Sydney.jpg",
  "/cities/Tokyo.jpg",
];

export default function AuthShowcase() {
  const [index, setIndex] = useState(0);

  // Slika grada se automatski menja na nekoliko sekundi.
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((oldIndex) => (oldIndex + 1) % cityImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="auth-showcase">
      <Image
        src={cityImages[index]}
        alt="City"
        width={1200}
        height={1000}
        className="auth-showcase-image"
        priority
      />

      <div className="auth-showcase-overlay" />

      <div className="auth-logo-card">
        <Image
          src="/logoSizeL.png"
          alt="EazyProperties logo"
          width={260}
          height={80}
        />
      </div>

      <div className="auth-showcase-content">
        <p className="eyebrow">Property management made simple.</p>
        <h1>Find, view and reserve properties in one beautiful app.</h1>
        <p>
          Agents manage properties. Clients reserve homes. Admins control the
          whole platform.
        </p>

        <div className="auth-stats">
          <div>
            <strong>360°</strong>
            <span>Panorama view.</span>
          </div>

          <div>
            <strong>3D</strong>
            <span>Model preview.</span>
          </div>

          <div>
            <strong>3</strong>
            <span>User roles.</span>
          </div>
        </div>
      </div>
    </section>
  );
}