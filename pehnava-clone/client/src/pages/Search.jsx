import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const [results, setResults] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      const query = q.trim();

      if (!query) {
        setResults([]);
        setSuggested([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setResults([]);
      setSuggested([]);

      try {
        // First, fetch the actual search results.
        const searchResponse = await api.get(
          `/products?search=${encodeURIComponent(query)}`
        );

        const searchResults = Array.isArray(searchResponse.data)
          ? searchResponse.data
          : [];

        if (cancelled) return;

        if (searchResults.length > 0) {
          setResults(searchResults);
          return;
        }

        // No exact matches:
        // fetch the normal product list so the page never looks empty.
        const fallbackResponse = await api.get("/products");
        const allProducts = Array.isArray(fallbackResponse.data)
          ? fallbackResponse.data
          : [];

        if (!cancelled) {
          setSuggested(allProducts.slice(0, 8));
        }
      } catch (err) {
        console.error("Search failed:", err);

        if (!cancelled) {
          setResults([]);
          setSuggested([]);
          setError("Unable to load search results.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <main className="products-section">
      <h2>Search results for "{q}"</h2>

      {loading ? (
        <div className="search-loading" role="status" aria-live="polite">
          <span className="search-spinner" aria-hidden="true" />
          <span>Searching...</span>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : results.length > 0 ? (
        <div className="product-row grid4">
          {results.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : suggested.length > 0 ? (
        <>
          <div className="search-no-match">
            <p>
              No exact matches for <strong>"{q}"</strong>.
            </p>
            <span>You may like these:</span>
          </div>

          <div className="product-row grid4">
            {suggested.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="search-empty">
          <p>No products are available right now.</p>
        </div>
      )}
    </main>
  );
}
