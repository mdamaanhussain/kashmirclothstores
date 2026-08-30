import React from "react";
import { Link } from "react-router-dom";
import { OUR_CATEGORY_STRIP } from "../categories.js";

const categoryImages = {
  "daily-wear": "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788102640/ChatGPT_Image_Aug_30_2026_08_36_22_PM_pw2ij3.png",
  "party-wear": "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788102640/ChatGPT_Image_Aug_30_2026_08_35_12_PM_bctsw6.png",
  "festive-wear": "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788102640/ChatGPT_Image_Aug_30_2026_08_33_02_PM_gwmkuu.png",
  "readymade": "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788102918/Group_47807815_1_y8gbsg.jpg",
  "celebrity-look": "https://res.cloudinary.com/dvnwxbqqh/image/upload/v1788102641/ChatGPT_Image_Aug_30_2026_08_40_15_PM_zspxv4.png",
};

export default function CategoryStrip() {
  return (
    <section className="category-strip">
      <h2>OUR CATEGORY</h2>

      <div className="category-strip-row">
        {OUR_CATEGORY_STRIP.map((c) => (
          <Link
            key={c.slug}
            to={`/collections/${c.slug}`}
            className="category-strip-item"
          >
            <div className="category-strip-img">
              <img
                src={categoryImages[c.slug]}
                alt={c.label}
              />
            </div>

            <span>← {c.label} →</span>
            <small>SHOP NOW</small>
          </Link>
        ))}
      </div>
    </section>
  );
}