import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css"; // Import the new styles

const Navbar = () => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const navigate = useNavigate(); 
    const location = useLocation();
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // Sync state if token changes in another part of the app
    useEffect(() => {
        const syncToken = () => setToken(localStorage.getItem("token"));
        window.addEventListener("storage", syncToken);  // Listen for token changes
        return () => window.removeEventListener("storage", syncToken);
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-primary">
            <div className="container">
                <Link className="navbar-brand text-white" to="/">Voice UI</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {!localStorage.getItem("token") ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link  text-white" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link  text-white" to="/signup">Signup</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link  text-white" to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-link nav-link text-white" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;