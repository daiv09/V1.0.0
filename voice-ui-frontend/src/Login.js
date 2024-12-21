<<<<<<< HEAD
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
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <h1>Login</h1>
                    <p>Welcome back! Please log in to your account to access your dashboard and personalized features.</p>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <p className="mt-2">Your username is the one you used when signing up for this service.</p>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <p className="mt-2">Ensure your password is correct. If you've forgotten it, <a href="/forgot-password" >click here</a> to reset.
                    {/* navigate("/forgot"); */}
                    </p>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    <p className="mt-3">
                        Don't have an account? <a href="/signup">Sign up here</a>.
                    </p>
                </div>
                <div className="col-md-6">
                    <img
                        src={img}
                        alt="Placeholder"
                        className="img-fluid rounded"
                        // style={{ maxHeight: "500px" }}
                        style={{ maxHeight: "500px", width: "100%" }}
                    />
                    <p className="mt-3 text-center">
                        Access your account to view reports, manage tasks, and stay updated!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
=======
import React, { useState } from "react";
import axios from "axios";

import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    // const [isLoading, setIsLoading] = useState(false); // For loading state
    const navigate = useNavigate();
    
    const handleLogin = async () => {
        // Form validation
        // if (!username || !password) {
        //     Toastify({
        //         text: "Please fill in both username and password.",
        //         duration: 3000,
        //         gravity: "top",
        //         position: "right",
        //         backgroundColor: "#ffc107",
        //     }).showToast();
        //     return;
        // }

        // setIsLoading(true); // Set loading state to true

        // try {
        //     const response = await axios.post("http://localhost:4000/login", { username, password });
        //     localStorage.setItem("token", response.data.token);

        //     toast.success("Login successful!", { position: "top-right" });
        //     navigate("/dashboard");
        // } 
        try {
            const response = await axios.post("http://localhost:4000/login", { username, password });
            localStorage.setItem("token", response.data.token);
                Toastify({
                    text: "Login successful !",
                    duration: 3000, 
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#28a745",
                }).showToast();
                navigate("/dashboard");
        }
        // catch (error) {
        //     toast.error("Login failed. Please check your credentials.", { position: "top-right" });
        // }
        catch (error) {
            if (error.response.status === 401) {
                // Unauthorized - Wrong credentials
                Toastify({
                  text: "Login failed. Incorrect username or password.",
                  duration: 3000,
                  gravity: "top",
                  position: "right",
                  backgroundColor: "#dc3545",
                }).showToast();
              } else {
                // General server or network error
                Toastify({
                  text: "An error occurred. Please try again later.",
                  duration: 3000,
                  gravity: "top",
                  position: "right",
                  backgroundColor: "#ffc107",
                }).showToast();
              }
          console.error();
        } 
        
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <h1>Login</h1>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={handleLogin}
                            // disabled={isLoading} // Disable button while loading
                        >
                            Login
                        </button>
                    </div>
                    <div className="col-md-6">
                    <img
                        src="https://via.placeholder.com/400" // Placeholder image URL
                        alt="Placeholder"
                        className="img-fluid" // Make the image responsive
                    />
                </div>
            </div>
            {/* <ToastContainer /> */}
        </div>
    );
};

export default Login;
>>>>>>> upstream/main
