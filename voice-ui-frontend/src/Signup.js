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
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <h1>Signup</h1>
          <p>
            Welcome to the signup page! Please create an account by filling out
            the form below.
          </p>
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
          <p className="mt-3">
            Make sure your password is strong and secure. A strong password
            typically includes a mix of letters, numbers, and special
            characters.
          </p>
          <button className="btn btn-primary mt-3" onClick={handleSignup}>
            Signup
          </button>
          <p className="mt-3">
            By signing up, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
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

      <section className="testimonials py-5 bg-light">
        <div className="container text-center">
          <h2 className="display-4 text-gradient fw-bold mb-4">
            What Our Users Say
          </h2>
          <p className="lead text-secondary px-lg-5 mx-auto mb-4">
            Don’t just take our word for it—see how Voice UI is transforming
            workflows for users across various industries.
          </p>
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="testimonial-card p-4 bg-white shadow rounded">
                <p className="testimonial-text">
                  "Voice UI has drastically improved the way we manage tasks in
                  our team. The voice commands are accurate and save us so much
                  time!"
                </p>
                <h5 className="text-primary">Samantha Lee</h5>
                <p className="text-secondary">Project Manager, XYZ Corp</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card p-4 bg-white shadow rounded">
                <p className="testimonial-text">
                  "I can now navigate my daily tasks without having to touch my
                  computer. It’s a game-changer for accessibility in our
                  workplace."
                </p>
                <h5 className="text-primary">John Doe</h5>
                <p className="text-secondary">
                  Productivity Specialist, ABC Ltd.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="testimonial-card p-4 bg-white shadow rounded">
                <p className="testimonial-text">
                  "The new features have made voice navigation smoother and more
                  intuitive. I'm more productive than ever! Lorem10asdgj sadogksadgk 
                  asgd"
                </p>
                <h5 className="text-primary">Emily Zhang</h5>
                <p className="text-secondary">UX Designer, 123 Innovations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="upcoming-features py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-4 fw-bold mb-4">Upcoming Features</h2>
          <p className="text-warning px-lg-5 mx-auto mb-4 font-bold font-weight-bold">
            <b><em>
                We're constantly working on new updates to make Voice UI even
                better. Here’s a sneak peek at what's coming soon:
            </em></b>
          </p>
          <ul className="list-unstyled text-left mt-4">
            <li>
              <strong>Voice-to-Text Support</strong> – Easily convert your
              spoken words into text for faster note-taking and documentation.
            </li>
            <li>
              <strong>Multi-Language Support</strong> – Voice UI will soon
              understand multiple languages, making it accessible for a global
              user base.
            </li>
            <li>
              <strong>Custom Voice Commands</strong> – Personalize Voice UI to
              respond to your unique voice commands, making it work the way you
              want.
            </li>
          </ul>
          <p className="mt-4">
            Stay tuned for more details, and let us know what features you’d
            like to see in the future!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Signup;