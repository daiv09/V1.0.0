# Voice-Based User Interface for Hands-Free Data Entry

## 💡 About the Project
This project implements a Voice-Based User Interface to allow hands-free data entry. The system uses speech-to-text technology to convert the user's voice into text input, enabling them to interact with web applications without using a keyboard or mouse. The main goal is to create an inclusive solution that provides better accessibility and convenience for individuals with mobility or dexterity impairments.

The application consists of two parts:

1. **Frontend:**
   - The user interface (UI) where users can interact with the system. It captures the voice input and sends it to the backend for processing.

2. **Backend**
   - Handles the logic and data processing of the voice commands. It uses Node.js and Express to process incoming requests, interacting with the frontend and databases as necessary.

## 🌟 Key Features:
   * Voice Input: Users can speak commands and text into the interface.
   * Speech Recognition: Converts spoken words into text and processes them.
   * Real-Time Feedback: The system provides real-time feedback to the user based on the voice input.
   * Hands-Free Operation: Ideal for users who are unable to use traditional input methods.

## 🚀 How to Run the Code

### Step-by-Step Instructions

1. **Open Two Terminal Windows:**
   - You will need two separate terminals: one for the **frontend** and one for the **backend**.

2. **Run the Frontend:**
   - In the first terminal, navigate to the `voice-ui-frontend` directory:
     ```bash
     cd voice-ui-frontend
     ```
   - Start the frontend application:
     ```bash
     npm start
     ```
   - This will launch the frontend app and make it accessible on your browser (typically at `http://localhost:3000`).

3. **Run the Backend:**
   - In the second terminal, navigate to the `voice-ui-backend` directory:
     ```bash
     cd voice-ui-backend
     ```
   - Start the backend using **nodemon** for automatic reloading:
     ```bash
     npx nodemon server.js
     ```
   - This will start the backend server and make it ready to handle requests.

---

## 🔧 Additional Setup

### Dependencies:
Ensure you have the required dependencies installed for both the frontend and backend:

```bash
# For Frontend
cd voice-ui-frontend
npm install

# For Backend
cd voice-ui-backend
npm install
