import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Navbar from "./Navbar";
import Home from "./Home";
import { AuthProvider } from "./AuthContext";
import Dashboard from "./Dashboard";

const socket = io("http://localhost:4000");

const App = () => {
    const [transcript, setTranscript] = useState("");
    const [savedData, setSavedData] = useState([]);

    const startListening = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";

        // 
            
        // 

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);

            // Send to server
            socket.emit("voiceData", { text });
        };

        recognition.start();
    };

    useEffect(() => {
        // Listen for updates from the server
        socket.on("dataUpdate", (data) => {
            setSavedData((prevData) => [...prevData, data]);
        });

        return () => socket.off("dataUpdate");
    }, []);

    useEffect(() => {
        // Fetch initial data
        fetch("http://localhost:4000/data")
            .then((res) => res.json())
            .then((data) => setSavedData(data));
    }, []);

    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
