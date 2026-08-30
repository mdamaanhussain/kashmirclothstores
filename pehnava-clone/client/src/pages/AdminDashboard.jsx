import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAdminToken } from "../api.js";
import { CATEGORIES } from "../categories.js";

const EMPTY = {
  title: "",
  sku: "",
  price: "",
  images: "",
  type: "Stitched/Ready to Wear",
  fabric: "Cotton",
  dupatta: "Cotton",
  colorsText: "",
  sizesText: "Free Size",
  categories: [],
  soldOut: false,
  isNew: true,
  description: "",
  careGuide: "Dry wash only.",
  shipping: "Free shipping all over India. Dispatched in 3-5 days.",
};

const tagCategories = CATEGORIES.filter((c) => c.type === "tag");

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function loadProducts() {
    api.get("/products").then((res) => setProducts(res.data));
  }

  useEffect(() => {
    const token = localStorage.getItem("pehnava_admin_token");
    if (!token) return navigate("/admin");
    loadProducts();
    // eslint-disable-next-line
  }, []);

  function logout() {
    setAdminToken(null);
    navigate("/admin");
  }

  function toggleCategory(slug) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(slug)
        ? f.categories.filter((s) => s !== slug)
        : [...f.categories, slug],
    }));
  }

  function editProduct(p) {
    setEditingId(p._id);
    setForm({
      title: p.title,
      sku: p.sku,
      price: p.price,
      images: p.images.join(", "),
      type: p.type,
      fabric: p.fabric,
      dupatta: p.dupatta,
      colorsText: p.colors.map((c) => `${c.name}:${c.hex}`).join(", "),
      sizesText: p.sizes.join(", "),
      categories: p.categories,
      soldOut: p.soldOut,
      isNew: p.isNew,
      description: p.description,
      careGuide: p.careGuide,
      shipping: p.shipping,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      title: form.title,
      sku: form.sku,
      price: Number(form.price),
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      type: form.type,
      fabric: form.fabric,
      dupatta: form.dupatta,
      colors: form.colorsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((pair) => {
          const [name, hex] = pair.split(":").map((s) => s.trim());
          return { name, hex: hex || "#cccccc" };
        }),
      sizes: form.sizesText.split(",").map((s) => s.trim()).filter(Boolean),
      categories: form.categories,
      soldOut: form.soldOut,
      isNew: form.isNew,
      description: form.description,
      careGuide: form.careGuide,
      shipping: form.shipping,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-head">
        <h2>Admin Panel — Products</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
        {error && <p className="error">{error}</p>}
        <div className="admin-grid">
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            SKU / Code
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          </label>
          <label>
            Price (Rs.)
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
          <label>
            Type
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </label>
          <label>
            Fabric
            <input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />
          </label>
          <label>
            Dupatta
            <input value={form.dupatta} onChange={(e) => setForm({ ...form, dupatta: e.target.value })} />
          </label>
          <label className="span-2">
            Image URLs (comma separated) — leave default placeholder if you don't have real photos yet
            <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://... , https://..." />
          </label>
          <label className="span-2">
            Colors — name:hex, name:hex (e.g. Maroon:#7a1f2b, Blue:#1c4e9e)
            <input value={form.colorsText} onChange={(e) => setForm({ ...form, colorsText: e.target.value })} />
          </label>
          <label className="span-2">
            Sizes (comma separated, e.g. M, L, XL, XXL or Unstitched)
            <input value={form.sizesText} onChange={(e) => setForm({ ...form, sizesText: e.target.value })} />
          </label>
          <label className="span-2">
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="span-2">
            Care Guide
            <textarea value={form.careGuide} onChange={(e) => setForm({ ...form, careGuide: e.target.value })} />
          </label>
          <div className="span-2 checkbox-row">
            <label>
              <input type="checkbox" checked={form.soldOut} onChange={(e) => setForm({ ...form, soldOut: e.target.checked })} />
              Sold Out
            </label>
            <label>
              <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
              Mark as New
            </label>
          </div>
          <div className="span-2">
            <h4>Categories (a product can be in more than one)</h4>
            <div className="category-checkboxes">
              {tagCategories.map((c) => (
                <label key={c.slug}>
                  <input
                    type="checkbox"
                    checked={form.categories.includes(c.tag)}
                    onChange={() => toggleCategory(c.tag)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit">{editingId ? "Save Changes" : "Add Product"}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3>All Products ({products.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Categories</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                <img className="admin-thumb" src={p.images?.[0]} alt="" />
              </td>
              <td>{p.title}</td>
              <td>{p.sku}</td>
              <td>Rs. {p.price}</td>
              <td>{p.categories.join(", ")}</td>
              <td>{p.soldOut ? "Sold Out" : "In Stock"}</td>
              <td>
                <button onClick={() => editProduct(p)}>Edit</button>
                <button onClick={() => deleteProduct(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
