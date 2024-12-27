import React, { useState } from "react";
import axios from "axios";
import img from "./img3.png";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useNavigate } from "react-router-dom";

const showToast = (message, backgroundColor) => {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor,
    }).showToast();
};

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username || !password) {
            showToast("Please fill in both username and password.", "#ffc107");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:4000/login", {
                username,
                password
            });
            localStorage.setItem("token", response.data.token);
            showToast("Login successful!", "#28a745");
            navigate("/dashboard");
        } 
        catch (error) {
            console.log("Error Response", error.response.data)
            setIsLoading(false);
            if (error.response.status === 401) {
                    showToast("Login failed. Incorrect username or password.", "#dc3545");
            }
            else {
                    showToast("An error occurred. Please try again later.", "#dc3545");
            }
        }
    };

    return (
        <div className="container mt-2">
            <div className="row align-items-center">
                <div className="col-md-6">
                    <h1>Login</h1>
                    
                    <p>Welcome back! Please log in to your account to access your dashboard and personalized features.</p>
                    <div className="form-group mb-3">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <p className="mt-2">Your username is the one you used when signing up for this service.</p>
                    <div className="form-group mb-3">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <p className="mt-2">Ensure your password is correct. If you've forgotten it, <a href="/forgot-password">click here</a> to reset.</p>
                    <button
                        className="btn btn-primary  mt-3"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    <p className="mt-3 text-center">
                        Don't have an account? <a href="/signup">Sign up here</a>.
                    </p>
                </div>
                <div className="col-md-6 text-center">
                    <img
                        src={img}
                        alt="Placeholder"
                        className="img-fluid rounded shadow-lg"
                        style={{ maxHeight: "450px", width: "100%", objectFit: "cover" }}
                    />
                    <p className="mt-3" style={{ visibility: 'visible', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
                        Access your account to view reports, manage tasks, and stay updated!
                    </p>
                </div>
            </div>

            <section className="new-features py-5">
    <div className="container text-center">
        <h2 className="display-4 text-gradient fw-bold mb-4">New Features and Updates</h2>
        <p className="lead text-secondary px-lg-5 mx-auto mb-4">
            We’re always working to improve your experience! Check out the latest features and updates designed to enhance your productivity and workflow.
        </p>
        <div className="row mt-5">
            <div className="col-md-4">
                <div className="feature-card p-4 bg-light shadow rounded">
                    <h4 className="text-primary">AI-Powered Voice Recognition</h4>
                    <p>Leverage cutting-edge AI technology for more accurate and responsive voice commands. Get more done with less effort!</p>
                </div>
            </div>
            <div className="col-md-4">
                <div className="feature-card p-4 bg-light shadow rounded">
                    <h4 className="text-primary">Real-Time Collaboration</h4>
                    <p>Collaborate seamlessly with your team by sharing tasks and updates in real-time, all powered by voice commands.</p>
                </div>
            </div>
            <div className="col-md-4">
                <div className="feature-card p-4 bg-light shadow rounded">
                    <h4 className="text-primary">Enhanced Security</h4>
                    <p>We've upgraded our security protocols to ensure that your data is always protected. Enjoy peace of mind while working.</p>
                </div>
            </div>
        </div>
    </div>
</section>


        </div>
    );
};

export default Login;
