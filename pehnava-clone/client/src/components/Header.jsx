import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../categories.js";
import { useLikes } from "../context/LikesContext.jsx";
import { Search } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { likes } = useLikes();
  const navigate = useNavigate();

  function onSearchSubmit(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  }

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
    &nbsp;&nbsp;  &nbsp;&nbsp; &nbsp;&nbsp;  &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;

      <b>Free shipping</b> all orders: All over India!
    &nbsp;&nbsp; | &nbsp;&nbsp;
    For any order related query, contact us on WhatsApp - 7004281547 
  </div>
</div>
      <div className="top-header">
        <button className="mobile-menu" onClick={() => setMenuOpen((v) => !v)}>
          ☰
        </button>
        <Link to="/" className="logo">
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
    />

    <button type="submit" aria-label="Search">
      <Search size={18} strokeWidth={2} />
    </button>
  </form>

  <Link to="/likes" className="wishlist-btn" title="My Likes">
    ♥{likes.length > 0 && <sup>{likes.length}</sup>}
  </Link>
</div>
      </div>
      
      <div className="mobile-nav">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/collections/${c.slug}`} onClick={() => setMenuOpen(false)}>
            {c.label}
          </Link>
        ))}
       
      </div>
    </header>
  );
}
