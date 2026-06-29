import Navigation from "@/components/Navigation";
import LottieBox from "@/components/LottieBox";
import Image from "next/image";

import homeAnimation from "@/public/animations/HOME.json";
import propertyAnimation from "@/public/animations/PROPERTY.json";
import clickAnimation from "@/public/animations/CLICK.json";

export default function HomePage() {
  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="modern-hero">
          <div className="hero-text">
            <p className="eyebrow">EazyProperties platform.</p>
            <h1>Manage properties with simple tools and modern previews.</h1>
            <p>
              Agents add properties, clients reserve them, and admins manage the
              whole system from one clean dashboard.
            </p>
          </div>

          <div className="hero-animation-card">
            <LottieBox animationData={homeAnimation} />
          </div>
        </div>

        <div className="feature-grid">
          <div className="feature-card large">
            <Image
              src="/home-images/homecard1.jpg"
              alt="Modern property"
              width={900}
              height={600}
            />
            <div>
              <p className="eyebrow">Search.</p>
              <h3>Browse properties easily.</h3>
              <p>
                Users can view important property information, photos, prices,
                360 images and 3D previews.
              </p>
            </div>
          </div>

          <div className="feature-card large">
            <Image
              src="/home-images/homecard2.jpg"
              alt="Property preview"
              width={900}
              height={600}
            />
            <div>
              <p className="eyebrow">Preview.</p>
              <h3>Support for 360° and 3D.</h3>
              <p>
                Property details can show panorama viewers and public Sketchfab
                3D models.
              </p>
            </div>
          </div>
        </div>

        <div className="role-grid">
          <div className="role-card">
            <LottieBox animationData={propertyAnimation} small />
            <h3>Agent</h3>
            <p>Create, update and delete properties.</p>
          </div>

          <div className="role-card">
            <LottieBox animationData={clickAnimation} small />
            <h3>Client</h3>
            <p>Reserve properties and write reviews.</p>
          </div>

          <div className="role-card">
            <LottieBox animationData={homeAnimation} small />
            <h3>Admin</h3>
            <p>Manage users and control the platform.</p>
          </div>
        </div>

        <div className="section-heading">
          <p className="eyebrow">Our team.</p>
          <h2>People behind EazyProperties.</h2>
        </div>

        <div className="team-grid-modern">
          <div className="team-card-modern">
            <Image src="/about-us/CEO.jpg" alt="CEO" width={500} height={500} />
            <h3>Stefan Kostić</h3>
            <p>CEO</p>
          </div>

          <div className="team-card-modern">
            <Image src="/about-us/CFO.jpg" alt="CFO" width={500} height={500} />
            <h3>Marta Mladenović</h3>
            <p>CFO</p>
          </div>

          <div className="team-card-modern">
            <Image src="/about-us/CSM.jpg" alt="CSM" width={500} height={500} />
            <h3>Aleksa Obradović</h3>
            <p>Customer Success Manager</p>
          </div>
        </div>
      </section>
    </main>
  );
}