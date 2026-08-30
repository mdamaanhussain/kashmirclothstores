import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import CategoryStrip from "../components/CategoryStrip.jsx";
import { Link } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);

  const newDropRef = useRef(null);
  const readyWearRef = useRef(null);

  const heroImages = [
    "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788091504/Pehnava-Banner-lawns_xbl4up.webp",
    "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788093800/webfront_dn9jhb.png",
  ];

const mobileHeroImages = [
  "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788115734/ratio-mobile-hero_siahdh.png",
  "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788115801/ratio-mobile-hero-2_qbhncd.png",
];

  // =========================
  // HERO IMAGE SLIDER
  // =========================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // GET PRODUCTS
  // =========================
  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Failed to load products:", err);
      });
  }, []);

  // =========================
  // NEW DROP CAROUSEL
  // =========================
  const scrollNewDrop = (direction) => {
  if (newDropRef.current) {
    newDropRef.current.scrollBy({
      left: direction * newDropRef.current.clientWidth,
      behavior: "smooth",
    });
  }
};

const scrollReadyWear = (direction) => {
  if (readyWearRef.current) {
    readyWearRef.current.scrollBy({
      left: direction * readyWearRef.current.clientWidth,
      behavior: "smooth",
    });
  }
};

  return (
    <main>

      {/* =========================
          HERO
      ========================= */}
      <section className="hero">
  <picture>
    <source
      media="(max-width: 600px)"
      srcSet={mobileHeroImages[currentHero]}
    />

    <img
      key={currentHero}
      className="hero-img"
      src={heroImages[currentHero]}
      alt="Kashmir Cloth Stores"
    />
  </picture>

  <div className="hero-overlay">
  </div>
</section>


      {/* =========================
          NEW DROP
      ========================= */}
      <section className="products-section">

        <div className="section-head">
          <h2>New Drop</h2>

          <Link to="/collections/trending">
            View all
          </Link>
        </div>

        <div className="product-carousel">

          {/* LEFT ARROW */}
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollNewDrop(-1)}
            aria-label="Previous New Drop products"
          >
            ←
          </button>

          {/* PRODUCTS */}
          <div
            className="product-row"
            ref={newDropRef}
          >
            {products
              .slice(0, 10)
              .map((p) => (
               <ProductCard
  key={p._id}
  product={p}
  showBuyNow={false}
/>
              ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            type="button"
            className="carousel-arrow carousel-right"
            onClick={() => scrollNewDrop(1)}
            aria-label="Next New Drop products"
          >
            →
          </button>

        </div>
      </section>


      {/* =========================
          OUR CATEGORY
      ========================= */}
      <CategoryStrip />


      {/* =========================
          READY TO WEAR
      ========================= */}
      <section className="products-section">

        <div className="section-head">
          <h2>Ready To Wear</h2>

          <Link to="/collections/stitched-wear">
            View all
          </Link>
        </div>

        <div className="product-carousel">

          {/* LEFT ARROW */}
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollReadyWear(-1)}
            aria-label="Previous Ready To Wear products"
          >
            ←
          </button>

          {/* PRODUCTS */}
          <div
            className="product-row"
            ref={readyWearRef}
          >
            {products
              .filter((p) =>
                p.categories?.includes("ready-to-wear")
              )
              .slice(0, 10)
              .map((p) => (
                <ProductCard
  key={p._id}
  product={p}
  showBuyNow={false}
/>
              ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            type="button"
            className="carousel-arrow carousel-right"
            onClick={() => scrollReadyWear(1)}
            aria-label="Next Ready To Wear products"
          >
            →
          </button>

        </div>
      </section>

    </main>
  );
}