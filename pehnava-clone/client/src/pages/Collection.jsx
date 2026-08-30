import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import { getCategoryConfig } from "../categories.js";

export default function Collection() {
  const { slug } = useParams();
  const config = getCategoryConfig(slug);

  const [all, setAll] = useState([]);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    color: "",
    dupatta: "",
  });

  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    api.get("/products").then((res) => setAll(res.data));
  }, []);

  const baseFiltered = useMemo(() => {
    if (!config) return all;

    if (config.type === "tag") {
      return all.filter((p) =>
        p.categories?.includes(config.tag)
      );
    }

    if (config.type === "price") {
      return all.filter(
        (p) =>
          (config.min === undefined || p.price >= config.min) &&
          (config.max === undefined || p.price <= config.max)
      );
    }

    return all;
  }, [all, config]);

  const filtered = useMemo(() => {
    return baseFiltered.filter((p) => {
      if (
        filters.minPrice &&
        p.price < Number(filters.minPrice)
      ) {
        return false;
      }

      if (
        filters.maxPrice &&
        p.price > Number(filters.maxPrice)
      ) {
        return false;
      }

      if (
        filters.color &&
        !p.colors?.some(
          (c) => c.name === filters.color
        )
      ) {
        return false;
      }

      if (
        filters.dupatta &&
        p.dupatta !== filters.dupatta
      ) {
        return false;
      }

      return true;
    });
  }, [baseFiltered, filters]);
return (
  <main className="collection-page">

    <div className="breadcrumb">
      <Link to="/">Home</Link> &gt;{" "}
      <span>{config?.label || slug}</span>
    </div>

    <h1 className="collection-title">
      {config?.label || slug}
    </h1>

    {/* MOBILE FILTER BUTTON */}
    <button
      type="button"
      className="mobile-filter-btn"
      onClick={() => setFilterOpen(true)}
    >
      <span>☰</span>
      Filter
    </button>

    {/* DARK BACKDROP */}
    {filterOpen && (
      <div
        className="filter-backdrop"
        onClick={() => setFilterOpen(false)}
      />
    )}

    <div className="collection-layout">

      <FilterSidebar
        products={baseFiltered}
        filters={filters}
        setFilters={setFilters}
        category={slug}
        mobileOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      <div className="product-row grid4">
        {filtered.length === 0 && (
          <p>No products match these filters yet.</p>
        )}

        {filtered.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
          />
        ))}
      </div>

    </div>
  </main>
);
}