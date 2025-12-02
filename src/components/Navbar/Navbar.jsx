import React, { useEffect, useRef, useState } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';
import search_icon from '../../assets/search_icon.svg';
import bell_icon from '../../assets/bell_icon.svg';
import profile_img from '../../assets/profile_img1.JPG';
import caret_icon from '../../assets/caret_icon.svg';
import { logout } from '../../firebase';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef();

  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 80) {
        navRef.current?.classList.add('nav-dark');
      } else {
        navRef.current?.classList.remove('nav-dark');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  // If login page, return null (hide full navbar)
  if (isLoginPage) return null;

  return (
    <div ref={navRef} className="navbar">
      {/* Show left side only on home page */}
      {isHomePage && (
        <div className="navbar-left">
          <img src={logo} alt="Logo" />
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/movies">Movies</Link></li>
            <li><Link to="/tv">TV Shows</Link></li>
            <li><Link to="/genre">Genre</Link></li>
            <li><Link to="/rating">Rating</Link></li>
            <li><Link to="/recommended" className="recommend-link">Recommended for You</Link></li>

          </ul>
        </div>
      )}

      {/* Always show right side except login */}
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
        <img src={bell_icon} alt="Notifications" className="icons" />
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
