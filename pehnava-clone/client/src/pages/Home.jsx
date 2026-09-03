import React, { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import CategoryStrip from "../components/CategoryStrip.jsx";
import { Link } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentHero, setCurrentHero] = useState(0);

  // =========================
  // CAROUSEL REFS
  // =========================
  const newDropRef = useRef(null);
  const readyWearRef = useRef(null);
  const unstitchedRef = useRef(null);
  const under1699Ref = useRef(null);
  const range1700to3000Ref = useRef(null);
  const premium3000Ref = useRef(null);

  // =========================
  // HERO IMAGES
  // =========================
  const heroImages = [
    "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788091504/Pehnava-Banner-lawns_xbl4up.webp",
    "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788438230/ChatGPT_Image_Aug_30_2026_06_02_04_PM_u88fhz.png",
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
  }, [heroImages.length]);

  // =========================
  // GET PRODUCTS
  // =========================
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await api.get("/products");

        if (!cancelled) {
          setProducts(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);

        if (!cancelled) {
          setProducts([]);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // GENERIC CAROUSEL SCROLL
  // =========================
  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: direction * ref.current.clientWidth,
      behavior: "smooth",
    });
  };

  const scrollNewDrop = (direction) =>
    scrollCarousel(newDropRef, direction);

  const scrollReadyWear = (direction) =>
    scrollCarousel(readyWearRef, direction);

  const scrollUnstitched = (direction) =>
    scrollCarousel(unstitchedRef, direction);

  const scrollUnder1699 = (direction) =>
    scrollCarousel(under1699Ref, direction);

  const scroll1700to3000 = (direction) =>
    scrollCarousel(range1700to3000Ref, direction);

  const scrollPremium3000 = (direction) =>
    scrollCarousel(premium3000Ref, direction);

  // =========================
  // PRODUCT FILTERS
  // =========================

  // Unstitched products are category based.
  // Supports both common slug variants.
  const unstitchedProducts = products
    .filter((p) =>
      Array.isArray(p.categories) &&
      p.categories.some((category) =>
        ["unstitched", "unstitched-wear"].includes(
          String(category).toLowerCase()
        )
      )
    )
    .slice(0, 10);

  // Budget sections are intentionally price based.
  // This avoids depending on a separate budget category slug.
  const under1699Products = products
    .filter((p) => {
      const price = Number(p.price);
      return Number.isFinite(price) && price > 0 && price <= 1699;
    })
    .slice(0, 10);

  const range1700to3000Products = products
    .filter((p) => {
      const price = Number(p.price);
      return Number.isFinite(price) && price >= 1700 && price <= 3000;
    })
    .slice(0, 10);

  const premium3000Products = products
    .filter((p) => {
      const price = Number(p.price);
      return Number.isFinite(price) && price > 3000;
    })
    .slice(0, 10);

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

        <div className="hero-overlay"></div>
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
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollNewDrop(-1)}
            aria-label="Previous New Drop products"
          >
            ←
          </button>

          <div className="product-row" ref={newDropRef}>
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
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollReadyWear(-1)}
            aria-label="Previous Ready To Wear products"
          >
            ←
          </button>

          <div className="product-row" ref={readyWearRef}>
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

      {/* =========================
          UNSTITCHED
      ========================= */}
      <section className="products-section">
        <div className="section-head">
          <h2>Unstitched</h2>

          <Link to="/collections/unstitched">
            View all
          </Link>
        </div>

        <div className="product-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollUnstitched(-1)}
            aria-label="Previous Unstitched products"
          >
            ←
          </button>

          <div className="product-row" ref={unstitchedRef}>
            {unstitchedProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                showBuyNow={false}
              />
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-right"
            onClick={() => scrollUnstitched(1)}
            aria-label="Next Unstitched products"
          >
            →
          </button>
        </div>
      </section>

      {/* =========================
          SUITS UNDER ₹1,699
      ========================= */}
      <section className="products-section">
        <div className="section-head">
          <h2>Suits Under ₹1,699</h2>

          <Link to="/collections/suits-under-1699">
            View all
          </Link>
        </div>

        <div className="product-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollUnder1699(-1)}
            aria-label="Previous suits under 1699"
          >
            ←
          </button>

          <div className="product-row" ref={under1699Ref}>
            {under1699Products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                showBuyNow={false}
              />
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-right"
            onClick={() => scrollUnder1699(1)}
            aria-label="Next suits under 1699"
          >
            →
          </button>
        </div>
      </section>

      {/* =========================
          ₹1,700 - ₹3,000
      ========================= */}
      <section className="products-section">
        <div className="section-head">
          <h2>₹1,700 - ₹3,000</h2>

          <Link to="/collections/suits-1700-3000">
            View all
          </Link>
        </div>

        <div className="product-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scroll1700to3000(-1)}
            aria-label="Previous products from 1700 to 3000"
          >
            ←
          </button>

          <div className="product-row" ref={range1700to3000Ref}>
            {range1700to3000Products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                showBuyNow={false}
              />
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-right"
            onClick={() => scroll1700to3000(1)}
            aria-label="Next products from 1700 to 3000"
          >
            →
          </button>
        </div>
      </section>

      {/* =========================
          PREMIUM SUITS ₹3,000+
      ========================= */}
      <section className="products-section">
        <div className="section-head">
          <h2>Premium Suits ₹3,000+</h2>

          <Link to="/collections/premium-suits-above-3-000">
            View all
          </Link>
        </div>

        <div className="product-carousel">
          <button
            type="button"
            className="carousel-arrow carousel-left"
            onClick={() => scrollPremium3000(-1)}
            aria-label="Previous premium suits"
          >
            ←
          </button>

          <div className="product-row" ref={premium3000Ref}>
            {premium3000Products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                showBuyNow={false}
              />
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-right"
            onClick={() => scrollPremium3000(1)}
            aria-label="Next premium suits"
          >
            →
          </button>
        </div>
      </section>
    </main>
  );
}
