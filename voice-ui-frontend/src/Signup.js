import React, { useState } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        // try {
        //     await axios.post("http://localhost:4000/signup", { username, password });
        //     alert("User created successfully");
        // } catch (error) {
        //     alert("Signup failed");
        // }
        try {
            await axios.post("http://localhost:4000/signup", { username, password });
            Toastify({
                text: "User created successfully !",
                duration: 3000, // Time in ms
                gravity: "top", // Position (top or bottom)
                position: "right", // Position (left, center, or right)
                backgroundColor: "#28a745", // Success color
            }).showToast();
            navigate("/dashboard");
        } catch (error) {
            Toastify({
                text: "Signup failed !",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#dc3545", // Error color
            }).showToast();
            console.error();
        }
        
    };

    return (
        <div className="container mt-5">
            <h1>Signup</h1>
            <div className="form-group">
                <label>Username</label>
                <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
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
            <button className="btn btn-primary mt-3" onClick={handleSignup}>
                Signup
            </button>
        </div>
    );
};

export default Signup;
