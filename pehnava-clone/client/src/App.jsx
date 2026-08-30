import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import Home from "./pages/Home.jsx";
import Collection from "./pages/Collection.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Search from "./pages/Search.jsx";
import Likes from "./pages/Likes.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ShippingPolicy from "./pages/ShippingPolicy.jsx";
import RefundPolicy from "./pages/RefundPolicy.jsx";
import FAQ from "./pages/FAQ.jsx";
import OurStory from "./pages/OurStory.jsx";
import Contact from "./pages/Contact.jsx";
export default function App() {
  return (
    <ToastProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
  path="/shipping-and-delivery-policy"
  element={<ShippingPolicy />}
/>

<Route
  path="/refund-policy"
  element={<RefundPolicy />}
/>

<Route
  path="/frequently-asked-questions"
  element={<FAQ />}
/>

<Route
  path="/our-story"
  element={<OurStory />}
/>

<Route
  path="/contact"
  element={<Contact />}
/>
      </Routes>
      <Footer />
    </ToastProvider>
  );
}
