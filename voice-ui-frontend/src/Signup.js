<<<<<<< HEAD
import React, { useState } from "react";
import axios from "axios";
import img from "./img2.png";
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
        if (!username || !password) {
            Toastify({
                text: "Username and password are required!",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#ffc107", // Warning color
            }).showToast();
            return;
        } 
        try {
            //genrate the   Jwt  Token as  the   USer  singup  
            const  response=  await axios.post("http://localhost:4000/signup", { username, password });
            localStorage.setItem("token", response.data.token);
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
        }
        
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <h1>Signup</h1>
                    <p>Welcome to the signup page! Please create an account by filling out the form below.</p>
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
            <p className="mt-3">
                Make sure your password is strong and secure. A strong password typically includes a mix of letters,
                numbers, and special characters.
            </p>
            <button className="btn btn-primary mt-3" onClick={handleSignup}>
                Signup
            </button>
            <p className="mt-3">
                By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </p>
        </div>
        <div className="col-md-6">
                            <img
                                src={img} // Placeholder image URL
                                // className="img-fluid"
                                alt="Placeholder"
                                className="img-thumbnail" // Make the image responsive
                                // style={{ width: "100%", height: "auto", maxHeight: "500px" }}
                                width="450" // Fixed width
                                height="auto" // Maintain aspect ratio
                            />
        </div>
                        </div>
        </div>
    );
};

export default Signup;
=======
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
>>>>>>> upstream/main
