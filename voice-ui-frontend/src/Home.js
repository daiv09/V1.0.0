import React from "react";
import img from "./img/img5.png";
import img1 from "./img/features/feature1.png";
import img2 from "./img/features/feature2.png";
import img3 from "./img/features/feature3.png";
import "./Home.css"; // Import custom styles

const Home = () => {
  return (
    <div className="container mt-5">
      {/* Hero Section */}
      <div className="row align-items-center mb-5">
        <div className="col-md-6 text-animation">
          <h1 className="display-4 primary-text fw-bold">
            Welcome to <br />
            Voice UI
          </h1>
          <p className="lead font-weight-normal text-secondary">
            Voice UI is a hands-free data entry and automation tool designed to
            increase productivity, streamline workflows, and improve
            accessibility at workplaces.
          </p>
          <p>
            Say goodbye to manual work—use your voice to control tasks and
            simplify your daily processes.
          </p>
          <div className="button-group">
            <a href="/login" className="btn btn-primary btn-lg me-2 fade-i">
              Login
            </a>
            <a href="/signup" className="btn btn-outline-primary btn-lg">
              Signup
            </a>
          </div>
        </div>
        <div className="col-md-6 text-center">
          <img
            src={img}
            alt="Voice UI demonstration"
            className="img-fluid rounded shadow-lg hover-zoom bg-image"
            style={{ maxWidth: "80%", height: "auto" }}
            loading="lazy"
          />
        </div>
      </div>

      {/* Features Section */}
      <section className="voice-ui-section text-center py-5 bg-light">
        <div className="container">
          <h2 className="display-4 fw-bold text-primary mb-4 fade-in-title">
            Revolutionize Your Workflow
          </h2>
          <p className="lead font-weight-normal text-secondary px-lg-5 mx-auto">
            Discover the future of work with{" "}
            <span className="text-highlight">Voice UI</span>. Simplify your
            daily tasks, improve efficiency, and unlock a new level of
            productivity.
          </p>
          <ul className="feature-list d-flex justify-content-center flex-wrap gap-4 mt-4">
            <li className="feature-item p-3 shadow rounded bg-white d-flex align-items-center hover-scale">
              <span className="icon me-3">🚀</span>{" "}
              <span>Hands-free operation</span>
            </li>
            <li className="feature-item p-3 shadow rounded bg-white d-flex align-items-center hover-scale">
              <span className="icon me-3">🔒</span>{" "}
              <span>Secure and reliable</span>
            </li>
            <li className="feature-item p-3 shadow rounded bg-white d-flex align-items-center hover-scale">
              <span className="icon me-3">🎯</span>{" "}
              <span>Boost efficiency</span>
            </li>
            <li className="feature-item p-3 shadow rounded bg-white d-flex align-items-center hover-scale">
              <span className="icon me-3">🌐</span>{" "}
              <span>Seamless integration</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="security-privacy py-5 bg-light">
        <div className="container text-center">
          <h2 className="display-4 text-gradient fw-bold mb-4">
            Security & Privacy
          </h2>
          <p className="lead text-secondary px-lg-5 mx-auto mb-4">
            At Voice UI, we take your security and privacy seriously. Our latest
            updates ensure that your data remains safe and protected.
          </p>
          <p>
            We use industry-standard encryption to secure all data transmissions
            and comply with the latest privacy regulations. Your voice data is
            never shared without your permission.
          </p>
          <p>
            With our new privacy features, you have complete control over what
            information you share. We ensure that Voice UI remains a trusted
            tool for both individuals and businesses.
          </p>
        </div>
      </section>

      {/* Feature Cards Section */}
      <div className="row mt-5 feature-section p-5 d-flex justify-content-between">
        <div className="col-md-3 text-center d-flex flex-column align-items-center bg-white p-4 rounded shadow-lg">
          <img src={img1} alt="Efficiency" className="feature-icon mb-3" />
          <h3 className="text-primary">Efficiency Redefined</h3>
          <p>
            Automate repetitive tasks and focus on what matters most. Boost
            productivity and save valuable time.
          </p>
        </div>
        <div className="col-md-3 text-center d-flex flex-column align-items-center bg-white p-4 rounded shadow-lg">
          <img
            src={img2}
            alt="Seamless Integration"
            className="feature-icon mb-3"
          />
          <h3 className="text-primary">Seamless Integration</h3>
          <p>
            Easily integrate Voice UI into your existing workflow. It works with
            your current tools for smooth operation.
          </p>
        </div>
        <div className="col-md-3 text-center d-flex flex-column align-items-center bg-white p-4 rounded shadow-lg">
          <img src={img3} alt="Customizable" className="feature-icon mb-3" />
          <h3 className="text-primary">Tailored to You and Me</h3>
          <p>
            Customize the system to suit your unique needs. Voice UI adapts to
            your workflow, not the other way around.
          </p>
        </div>
      </div>

      {/* Contributors Section */}
      <section className="contributors-section py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Meet the Team</h2>
          <p className="text-light">
            The creators behind Voice UI—dedicated to revolutionizing the
            workplace.
          </p>
          <div className="d-flex justify-content-center gap-5 mt-4">
            <div>
              <h4 className="text-light">Daiwiik Harihar</h4>
            </div>
            <div>
              <h4 className="text-light">Vedansh Shrivastava</h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;