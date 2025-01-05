import React from "react";
import img from "./img5.png"

const Home = () => {
    return (
        <div className="container mt-5">
            <div className="row align-items-center">
                {/* Left Content */}
                <div className="col-md-6">
                    <h1 className="display-4">Welcome to Voice UI</h1>
                    <p className="lead font-weight-normal">
                        Voice UI is a hands-free data entry and automation tool designed to improve
                        productivity and accessibility in workplaces.
                    </p>
                    <p>
                        Use your voice to simplify your workflow, improve efficiency, and reduce manual effort.
                    </p>
                    <div>
                        <a href="/login" className="btn btn-primary btn-lg me-2">
                            Login
                        </a>
                        <a href="/signup" className="btn btn-link btn-lg me-2">Signup</a>
                        {/* // btn-link btn-lg */}
                    </div>
                </div>

                {/* Right Placeholder Image */}
                <div className="col-md-6 text-center">
                    <img
                        src={img}
                        alt="Placeholder"
                        className="img-fluid rounded"
                        style={{ maxWidth: "80%", height: "auto" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;

