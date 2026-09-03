import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, INSTAGRAM_USERNAME } from "../api.js";
import { useLikes } from "../context/LikesContext.jsx";
import { useRecentlyViewed } from "../context/RecentlyViewedContext.jsx";
import { useToast } from "../components/Toast.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { Heart, Share2, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("description");
  const [recentProducts, setRecentProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loadError, setLoadError] = useState("");
  const { isLiked, toggleLike } = useLikes();
  const { recent, addRecent } = useRecentlyViewed();
  const showToast = useToast();

  function firstAvailableSize(productData, colorName) {
    if (productData.variantStock?.length) {
      return productData.sizes?.find((size) => productData.variantStock.some((variant) => variant.color === colorName && variant.size === size && variant.stock > 0)) || "";
    }
    return productData.sizes?.find(() => (productData.stock || 0) > 0) || "";
  }

  useEffect(() => {
    setProduct(null);
    setLoadError("");
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data);
      setActiveImg(0);
      const firstColor = res.data.colors?.find((color) => (res.data.variantStock?.length ? res.data.variantStock.some((variant) => variant.color === color.name && variant.stock > 0) : color.stock > 0))?.name || "";
      setSelectedColor(firstColor);
      setSelectedSize(firstAvailableSize(res.data, firstColor));
      setQuantity(1);
      addRecent(res.data._id);
    }).catch(() => setLoadError("This product could not be loaded. Please try again."));
    // eslint-disable-next-line
  }, [slug]);

  useEffect(() => {
    const ids = recent.filter((id) => id !== product?._id);
    if (ids.length === 0) return setRecentProducts([]);
    api.get(`/products?ids=${ids.join(",")}`).then((res) => setRecentProducts(res.data));
  }, [recent, product]);

  useEffect(() => {
    if (!selectedColor || !product) return;
    const nextVariant = product.variantStock?.find((variant) => variant.color === selectedColor && variant.size === selectedSize);
    if (product.variantStock?.length && (!nextVariant || nextVariant.stock <= 0)) setSelectedSize(firstAvailableSize(product, selectedColor));
    setQuantity(1);
  }, [selectedColor, product]);

  if (!product) return <main className="product-detail"><p>{loadError || "Loading..."}</p></main>;

  const liked = isLiked(product._id);
  const selectedVariant = product.variantStock?.find((variant) => variant.size === selectedSize && variant.color === selectedColor);
  const availableStock = product.variantStock?.length
    ? selectedVariant?.stock ?? 0
    : (selectedColor ? product.colors?.find((color) => color.name === selectedColor)?.stock : product.stock) ?? 0;
  const isUnavailable = product.soldOut || availableStock <= 0;

  function selectColor(color) {
    setSelectedColor(color.name);
    setSelectedSize(firstAvailableSize(product, color.name));
    if (color.images?.length) setActiveImg(0);
  }

  const colorPhoto = product.colors?.find((color) => color.name === selectedColor)?.images?.[0];

  function handleBuyNow() {
    const text = `Hi! I want to order: ${product.title} (Code: ${product.sku})\nQuantity: ${quantity}\n${selectedSize ? `Size: ${selectedSize}\n` : ""}${selectedColor ? `Color: ${selectedColor}` : ""}`;
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
            <img src={colorPhoto || product.images[activeImg]} alt={`${product.title}${selectedColor ? ` - ${selectedColor}` : ""}`} />
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
          <p className="pd-price">Rs. {(product.salePrice ?? product.price).toLocaleString("en-IN")}.00 {product.discount > 0 && <del>Rs. {product.price.toLocaleString("en-IN")}</del>} {product.discount > 0 && <strong className="discount-badge">{product.discount}% OFF</strong>}</p>
          <p className="pd-sku">SKU: {product.sku}</p>

          {product.colors?.length > 0 && (
            <div className="pd-colors">
              <h4>Color</h4>
              <div className="swatches">
                {product.colors.map((c) => (
                  <button key={c.name} type="button" className={`variant-swatch ${selectedColor === c.name ? "selected" : ""} ${c.stock <= 0 ? "unavailable" : ""}`} title={c.stock <= 0 ? `${c.name} unavailable` : c.name} onClick={() => c.stock > 0 && selectColor(c)}><span className="swatch big" style={{ background: c.hex }} /><span className="variant-name">{c.name}</span>{c.stock <= 0 && <span className="variant-cross" />}</button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="pd-sizes">
              <h4>Size</h4>
              <div className="size-options">{product.sizes.map((size) => { const variant = product.variantStock?.find((entry) => entry.size === size && entry.color === selectedColor); const stock = product.variantStock?.length ? variant?.stock ?? 0 : product.stock ?? 0; return <button type="button" key={size} className={`${selectedSize === size ? "selected" : ""} ${stock <= 0 ? "unavailable" : ""}`} disabled={stock <= 0} onClick={() => setSelectedSize(size)}>{size}{stock <= 0 && <span className="variant-cross" />}</button>; })}</div>
            </div>
          )}

          <div className="quantity-control"><h4>Quantity</h4><div><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><strong>{quantity}</strong><button type="button" aria-label="Increase quantity" disabled={quantity >= availableStock} onClick={() => setQuantity((value) => Math.min(availableStock, value + 1))}><Plus size={15} /></button></div></div>

          <div className="pd-actions">
            <button className="buy-now-btn large" onClick={handleBuyNow} disabled={isUnavailable || quantity > availableStock}>
              {isUnavailable ? "OUT OF STOCK" : "BUY IT NOW"}
            </button>
            <div className="pd-icon-row">
              <button className={`like-btn ${liked ? "liked" : ""}`} onClick={() => toggleLike(product._id)}>
                <Heart size={16} fill={liked ? "currentColor" : "none"} /> {liked ? "Liked" : "Like"}
              </button>
              <button className="share-btn" onClick={handleShare}>
                <Share2 size={16} /> Share
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
