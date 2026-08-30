import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, INSTAGRAM_USERNAME } from "../api.js";
import { useLikes } from "../context/LikesContext.jsx";
import { useRecentlyViewed } from "../context/RecentlyViewedContext.jsx";
import { useToast } from "../components/Toast.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("description");
  const [recentProducts, setRecentProducts] = useState([]);
  const { isLiked, toggleLike } = useLikes();
  const { recent, addRecent } = useRecentlyViewed();
  const showToast = useToast();

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data);
      setActiveImg(0);
      addRecent(res.data._id);
    });
    // eslint-disable-next-line
  }, [slug]);

  useEffect(() => {
    const ids = recent.filter((id) => id !== product?._id);
    if (ids.length === 0) return setRecentProducts([]);
    api.get(`/products?ids=${ids.join(",")}`).then((res) => setRecentProducts(res.data));
  }, [recent, product]);

  if (!product) return <main className="product-detail"><p>Loading...</p></main>;

  const liked = isLiked(product._id);

  function handleBuyNow() {
    const text = `Hi! I want to order: ${product.title} (Code: ${product.sku})`;
    navigator.clipboard?.writeText(text);
    showToast("Product code copied — paste it in the chat!");
    window.open(`https://ig.me/m/${INSTAGRAM_USERNAME}`, "_blank");
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Product link copied!");
    }
  }

  return (
    <main className="product-detail">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/collections/stitched-wear">Stitched Wear</Link> &gt;{" "}
        <span>{product.title}</span>
      </div>

      <div className="pd-layout">
        <div className="pd-gallery">
          <div className="pd-main-img">
            {product.soldOut && <span className="badge sold-out">SOLD OUT</span>}
            <img src={product.images[activeImg]} alt={product.title} />
          </div>
          {product.images.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={i === activeImg ? "active" : ""}
                  onClick={() => setActiveImg(i)}
                  alt=""
                />
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <h1>{product.title}</h1>
          <p className="pd-price">Rs. {product.price.toLocaleString("en-IN")}.00</p>
          <p className="pd-sku">SKU: {product.sku}</p>

          {product.colors?.length > 0 && (
            <div className="pd-colors">
              <h4>Color</h4>
              <div className="swatches">
                {product.colors.map((c) => (
                  <span key={c.name} className="swatch big" title={c.name} style={{ background: c.hex }} />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="pd-sizes">
              <h4>Size</h4>
              <p>{product.sizes.join(" / ")}</p>
            </div>
          )}

          <div className="pd-actions">
            <button className="buy-now-btn large" onClick={handleBuyNow} disabled={product.soldOut}>
              {product.soldOut ? "SOLD OUT" : "BUY IT NOW"}
            </button>
            <div className="pd-icon-row">
              <button className={`like-btn ${liked ? "liked" : ""}`} onClick={() => toggleLike(product._id)}>
                {liked ? "♥ Liked" : "♡ Like"}
              </button>
              <button className="share-btn" onClick={handleShare}>
                ⤴ Share
              </button>
            </div>
          </div>

          <div className="pd-tabs">
            <div className="pd-tab-heads">
              {["description", "care", "shipping"].map((t) => (
                <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                  {t === "description" ? "Description" : t === "care" ? "Care Guide" : "Shipping and Exchange"}
                </button>
              ))}
            </div>
            <div className="pd-tab-body">
              {tab === "description" && <p>{product.description}</p>}
              {tab === "care" && <p>{product.careGuide}</p>}
              {tab === "shipping" && <p>{product.shipping}</p>}
            </div>
          </div>
        </div>
      </div>

      {recentProducts.length > 0 && (
        <section className="products-section">
          <h2>Recently Viewed Products</h2>
          <div className="product-row">
            {recentProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
