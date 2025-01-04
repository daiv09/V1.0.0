# Voice-Based User Interface for Hands-Free Data Entry

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
