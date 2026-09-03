import React, { useEffect, useState } from "react";
import { api, setCustomerToken } from "../api.js";

export default function Account() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", marketingConsent: true });
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { api.get("/customers/me").then((res) => setCustomer(res.data)).catch(() => {}); }, []);
  useEffect(() => { if (customer) api.get("/orders").then((res) => setOrders(res.data)); }, [customer]);
  async function submit(event) {
    event.preventDefault(); setError("");
    try {
      const res = await api.post(`/customers/${mode}`, { ...form, phone: form.phone.trim(), email: form.email.trim() || undefined });
      setCustomerToken(res.data.token);
      setCustomer(res.data.customer);
    } catch (err) {
      setError(err.response?.data?.message || (err.request ? "Backend se connection nahi ho raha. Server start karke dobara try karein." : "Unable to continue"));
    }
  }
  if (!customer) return <main className="account-page"><form className="account-form" onSubmit={submit}><h1>{mode === "login" ? "Your account" : "Create account"}</h1>{mode === "register" && <input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}<input type="tel" placeholder="Phone number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />{mode === "register" && <input type="email" placeholder="Email for order updates (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}<input type="password" minLength="8" placeholder="Password (8+ characters)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{mode === "register" && <label><input type="checkbox" checked={form.marketingConsent} onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })} /> Send me product updates and offers</label>}{error && <p className="error">{error}</p>}<button type="submit">{mode === "login" ? "Sign in" : "Create account"}</button><button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create a new account" : "Already have an account? Sign in"}</button></form></main>;
  return <main className="account-page"><div className="account-head"><div><p className="eyebrow">Welcome back</p><h1>{customer.name}</h1><p>{customer.phone}{customer.email ? ` | ${customer.email}` : ""}</p></div><button onClick={() => { setCustomerToken(null); setCustomer(null); }}>Sign out</button></div><section className="orders"><h2>Your orders</h2>{orders.length ? orders.map((order) => <article className="order-row" key={order._id}><div><strong>#{order._id.slice(-8).toUpperCase()}</strong><span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span></div><div><strong>Rs. {order.total.toLocaleString("en-IN")}</strong><span className={`order-status status-${order.status}`}>{order.status}</span></div>{order.trackingNumber && <p>{order.carrier || "Shipment"}: {order.trackingNumber}</p>}</article>) : <p>No orders yet.</p>}</section></main>;
}