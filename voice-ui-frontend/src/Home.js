// import React from "react";

// const Home = () => {
//     return (
//         <div className="container mt-5">
//             <h1>Welcome to Voice UI</h1>
//             <p>
//                 Voice UI is a hands-free data entry and automation tool designed to improve productivity
//                 and accessibility in workplaces. Use voice commands to simplify your workflow!
//             </p>
//             <p>
//                 Please <a href="/login">Login</a> or <a href="/signup">Signup</a> to get started.
//             </p>
//         </div>
//     );
// };

// export default Home;

import React from "react";
import img from "./img5.png"

const Home = () => {
    return (
        <div className="container mt-5">
            <div className="row align-items-center">
                {/* Left Content */}
                <div className="col-md-6">
                    <h1 className="display-4">Welcome to Voice UI</h1>
                    <p className="lead">
                        Voice UI is a hands-free data entry and automation tool designed to improve
                        productivity and accessibility in workplaces.
                    </p>
                    <p>
                        Use your voice to simplify your workflow, improve efficiency, and reduce manual effort.
                    </p>
                    <div>
                        <a href="/login" className="btn btn-primary btn-lg me-3">
                            Login
                        </a>
                        <a href="/signup" className="btn btn-link btn-lg">
                            Signup
                        </a>
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

