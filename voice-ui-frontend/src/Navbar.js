<<<<<<< HEAD
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

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
=======
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

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
>>>>>>> upstream/main
