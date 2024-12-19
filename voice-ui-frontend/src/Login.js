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
