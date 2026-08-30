import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLikes } from "../context/LikesContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function Likes() {
  const { likes } = useLikes();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (likes.length === 0) return setProducts([]);
    api.get(`/products?ids=${likes.join(",")}`).then((res) => setProducts(res.data));
  }, [likes]);

  return (
    <main className="products-section">
      <h2>My Liked Products</h2>
      {products.length === 0 && <p>You haven't liked any products yet.</p>}
      <div className="product-row grid4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </main>
  );
}
