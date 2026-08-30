import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!q) return setResults([]);
    api.get(`/products?search=${encodeURIComponent(q)}`).then((res) => setResults(res.data));
  }, [q]);

  return (
    <main className="products-section">
      <h2>Search results for "{q}"</h2>
      <div className="product-row grid4">
        {results.length === 0 && <p>No products found.</p>}
        {results.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </main>
  );
}
