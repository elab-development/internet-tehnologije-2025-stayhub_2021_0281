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

export default function AuthSlider() {
  const [index, setIndex] = useState(0);

  // Svake 3 sekunde menjamo sliku grada.
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((oldIndex) => (oldIndex + 1) % cityImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="auth-slider">
      <Image
        src={cityImages[index]}
        alt="City"
        width={900}
        height={900}
        className="auth-slider-image"
      />

      <div className="auth-slider-text">
        <h1>EazyProperties</h1>
        <p>Find, view and reserve beautiful properties around the world.</p>
      </div>
    </div>
  );
}