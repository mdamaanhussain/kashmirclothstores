import React from "react";
import { Link } from "react-router-dom";
import { useLikes } from "../context/LikesContext.jsx";
import { useToast } from "./Toast.jsx";
import { INSTAGRAM_USERNAME } from "../api.js";

export default function ProductCard({ product, showBuyNow = true }) {
  const { isLiked, toggleLike } = useLikes();
  const showToast = useToast();
  const liked = isLiked(product._id);

  function handleShare(e) {
    e.preventDefault();
    const url = `${window.location.origin}/products/${product.slug}`;
    if (navigator.share) {
      navigator.share({ title: product.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Product link copied!");
    }
  }

 function handleBuyNow(e) {
  e.preventDefault();

  const productUrl = `${window.location.origin}/products/${product.slug}`;

  const text = `Hi! I want to order this product.

Product: ${product.title}
Product Code: ${product.sku}
Price: Rs. ${product.price.toLocaleString("en-IN")}.00
${product.colors?.length
    ? `Available Colors: ${product.colors.map((c) => c.name).join(", ")}\n`
    : ""}Product Link: ${productUrl}`;

  const whatsappNumber = "917004281547";

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
    "_blank"
  );
}

  function handleLike(e) {
    e.preventDefault();
    toggleLike(product._id);
  }

  const sizeLabel = product.sizes?.join(" / ");

  return (
    <div className="product">
      <Link to={`/products/${product.slug}`} className="product-img">
        {product.soldOut && <span className="badge sold-out">SOLD OUT</span>}
        {!product.soldOut && product.isNew && <span className="badge new">NEW</span>}
        <img src={product.images?.[0]} alt={product.title} loading="lazy" />
        <div className="size-overlay">{sizeLabel}</div>
        <div className="card-icons">
          <button title="Share" onClick={handleShare}>
            ⤴
          </button>
          <button
            title={liked ? "Unlike" : "Like"}
            className={liked ? "liked" : ""}
            onClick={handleLike}
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>
      </Link>
      <Link to={`/products/${product.slug}`} className="product-title">
        {product.title}
      </Link>
      <p className="product-price">
        {product.categories?.includes("from-price") ? "From " : ""}Rs.{" "}
        {product.price.toLocaleString("en-IN")}.00
      </p>
      {product.colors?.length > 0 && (
        <div className="swatches">
          {product.colors.map((c) => (
            <span
              key={c.name}
              className="swatch"
              title={c.name}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      )}{showBuyNow && (
  <button
    className="buy-now-btn"
    onClick={handleBuyNow}
    disabled={product.soldOut}
  >
    {product.soldOut ? "SOLD OUT" : "BUY IT NOW"}
  </button>
)}
    </div>
  );
}
