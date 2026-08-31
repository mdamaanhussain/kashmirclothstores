import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../categories.js";
import { useLikes } from "../context/LikesContext.jsx";
import { Search } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { likes } = useLikes();
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  function onSearchSubmit(e) {
    e.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      closeMenu();
    }
  }

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && menuOpen) {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Prevent the page behind the drawer from scrolling while it is open.
  useEffect(() => {
    if (!menuOpen) {
      document.body.classList.remove("menu-open");
      return;
    }

    document.body.classList.add("menu-open");

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  const mainLinks = CATEGORIES.filter((c) =>
    ["trending", "stitched-wear", "save-more"].includes(c.slug)
  );

  return (
    <header className={menuOpen ? "menu-open" : ""}>
      <div className="announcement">
        <div className="announcement-text">
          <b>Free shipping</b> all orders: All over India!
          &nbsp;&nbsp; | &nbsp;&nbsp;
          For any order related query, contact us on WhatsApp - 7004281547
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <b>Free shipping</b> all orders: All over India!
          &nbsp;&nbsp; | &nbsp;&nbsp;
          For any order related query, contact us on WhatsApp - 7004281547
        </div>
      </div>

      <div className="top-header">
        <button
          className="mobile-menu"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <Link to="/" className="logo" onClick={closeMenu}>
          KASHMIR
          <small>CLOTH STORES</small>
        </Link>

        <nav>
          <Link to="/collections/trending">New DROP</Link>
          <Link to="/collections/stitched-wear">Ready To Wear</Link>
          <Link to="/collections/unstitched">Unstitched</Link>

          <div className="nav-dropdown">
            <span>By Budget</span>

            <div className="dropdown-menu">
              <Link to="/collections/suits-under-1699">
                Suits Under ₹1,699
              </Link>

              <Link to="/collections/suits-1700-3000">
                ₹1,700 - ₹3,000
              </Link>

              <Link to="/collections/premium-suits-above-3-000">
                Premium Suits ₹3,000+
              </Link>
            </div>
          </div>

          <Link to="/collections/festive-wear">Specials</Link>
          <Link to="/collections/luxe">LUXE 💎</Link>
          <Link to="/collections/save-more">Sale Deals</Link>
        </nav>

        <div className="actions">
          <form className="search-bar" onSubmit={onSearchSubmit}>
            <input
              className="search-box"
              placeholder="Search the store"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search the store"
            />

            <button type="submit" aria-label="Search">
              <Search size={18} strokeWidth={2} />
            </button>
          </form>

          <Link to="/likes" className="wishlist-btn" title="My Likes">
            ♥
            {likes.length > 0 && <sup>{likes.length}</sup>}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div
          className="mobile-menu-backdrop"
          aria-hidden="true"
          onClick={closeMenu}
        />
      )}

      <aside
        id="mobile-navigation"
        className="mobile-nav"
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-header">
          <h3 className="mobile-nav-title">Menu</h3>

          <button
            className="mobile-nav-close"
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            ×
          </button>
        </div>

        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to={`/collections/${c.slug}`}
            onClick={closeMenu}
          >
            {c.label}
          </Link>
        ))}
      </aside>
    </header>
  );
}
