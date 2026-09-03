import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../categories.js";

export default function Footer() {
  return (
    <footer>
      {/* BRAND */}
      <div className="footer-brand">
        <div className="logo">
          KASHMIR
          <small>CLOTH STORES</small>
        </div>

        <p>
          Beautiful stitched & unstitched lawn suits for women.
        </p>

      </div>

      {/* SHOP */}
      <div>
        <h4>SHOP</h4>

        {CATEGORIES.slice(0, 4).map((c) => (
          <Link
            key={c.slug}
            to={`/collections/${c.slug}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* HELP */}
      <div>
        <h4>HELP</h4>

        <Link to="/shipping-and-delivery-policy">
          Shipping & Delivery
        </Link>

        <Link to="/refund-policy">
          Return / Refund
        </Link>

        <Link to="/frequently-asked-questions">
          Frequently Asked Questions
        </Link>
      </div>

      {/* ABOUT */}
      <div>
        <h4>ABOUT</h4>

        <Link to="/our-story">
          Our Story
        </Link>

        <Link to="/contact">
          Contact Us
        </Link>
      </div>

      {/* FOLLOW */}
      <div>
        <h4>FOLLOW</h4>

        <a
          href="https://www.instagram.com/kashmirclothstores/"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>
      </div>
    </footer>
  );
}