// src/components/Navbar/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import search_icon from "../../assets/search_icon.svg";
import caret_icon from "../../assets/caret_icon.svg";
import profile_img from "../../assets/profile_img1.JPG";

import { logout } from "../../firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Notifications 🔔
import Notifications from "../../pages/Notifications/Notifications";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const navRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on login and player pages
  const isLogin = location.pathname === "/login";
  const isPlayer = location.pathname.startsWith("/player");

  useEffect(() => {
    const scroll = () => {
      if (window.scrollY > 60) navRef.current.classList.add("nav-dark");
      else navRef.current.classList.remove("nav-dark");
    };

    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  // Hide navbar on login or player page
  if (isLogin || isPlayer) return null;

  return (
    <div ref={navRef} className="navbar">
      {/* LEFT: Logo + Navigation Links */}
      <div className="navbar-left">
        <img src={logo} alt="Logo" />

        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/movies">Movies</Link></li>
          <li><Link to="/tv">TV Shows</Link></li>
          <li><Link to="/genre">Genre</Link></li>
          <li><Link to="/rating">Rating</Link></li>
          <li><Link to="/recommended">Recommended</Link></li>
        </ul>
      </div>

      {/* RIGHT: Search, Notifications, Profile */}
      <div className="navbar-right">
        <div className="search-container">
          <img src={search_icon} alt="Search" className="icons" />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Notifications 🔔 */}
        <Notifications />

        {/* Profile */}
        <div className="navbar-profile">
          <Link to="/profile">
            <img src={profile_img} alt="Profile" className="profile" />
          </Link>

          <img src={caret_icon} alt="Dropdown" />

          <div className="dropdown">
            <p onClick={() => logout()}>Sign Out of Movie Sphere</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
