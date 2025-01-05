import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [transcript, setTranscript] = useState("");
  const [newText, setNewText] = useState(""); // For adding new data
  const [savedData, setSavedData] = useState([]);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const token = localStorage.getItem("token");
  const accumulatedTranscript = useRef(""); // To store the entire transcript for the session

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:4000/data", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSavedData(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to fetch data");
      });
  }, [token]);

  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();

    const availableLanguages = ["en-US", "fr-FR", "es-ES", "hi-IN"]; // Example language options
    const userSelectedLanguage = "en-US"; // Could come from a user input or settings

    const language = availableLanguages.includes(userSelectedLanguage)
      ? userSelectedLanguage
      : navigator.language;

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onerror = (event) => {
      toast.error(`Speech recognition error: ${event.error}`);
    };

    accumulatedTranscript.current = ""; // Reset the accumulated transcript

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim(); // Trim the final text
          if (finalText) {
            accumulatedTranscript.current += finalText + " "; // Append only non-empty final text
          }
        } else {
          interimTranscript += result[0].transcript; // Collect interim results
        }
      }

      // Update the transcript displayed in the UI
      setTranscript(
        accumulatedTranscript.current.trim() + " " + interimTranscript.trim()
      );
    };
    recognition.onspeechend = () => {
      console.log("Speech has ended.");
      recognition.stop();
    };

    recognition.start();
    setRecognitionInstance(recognition);
    toast.info("Speech recognition started");
  };

  
  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setRecognitionInstance(null);

      const finalTranscript = accumulatedTranscript.current.trim();
      if (finalTranscript) {
        axios
          .post(
            "http://localhost:4000/save",
            { text: finalTranscript },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => {
            setSavedData((prev) => [
              ...prev,
              { text: finalTranscript, noteId: Date.now() },
            ]);
            toast.success("Data saved successfully");
          })
          .catch(() => toast.error("Failed to save data"));
      }

      setTranscript("");
      toast.info("Speech recognition stopped");
    }
  };
  
  const addData = async () => {
    if (!newText.trim()) {
      toast.error("Text cannot be empty");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/save",
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedData((prev) => [...prev, response.data]);
      setNewText(""); // Clear input
      toast.success("Data added successfully");
    } catch (error) {
      toast.error("Failed to add data");
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:4000/data", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSavedData(response.data);
      })
      .catch((error) => toast.error("Failed to fetch data"));
  }, [savedData]);

  const updateData = async (id, updatedText) => {
    if (!updatedText.trim()) {
      alert("Text cannot be empty");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:4000/data/${id}`,
        { text: updatedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedData((prev) =>
        prev.map((data) =>
          data.noteId === id ? { ...data, text: response.data.text } : data
        )
      );
      toast.success("Data updated successfully");
    } catch (error) {
      toast.error("Failed to update data");
    }
  };

  const deleteData = async (id) => {
    if (deleteConfirmation === id) {
      try {
        await axios.delete(`http://localhost:4000/data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get("http://localhost:4000/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedData(response.data);
        setDeleteConfirmation(null);
        toast.success("Data deleted successfully");
      } catch (error) {
        toast.error("Failed to delete data");
      }
    } else {
      setDeleteConfirmation(id);
      toast.info("Click again to confirm delete");
    }
  };

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       // Check if the spacebar is pressed to start listening
//       if (event.key === " " || event.keyCode === 32) {
//         startListening();
//       }

//       // Check if the Escape key is pressed to stop listening
//       if (event.key === "Escape") {
//         stopListening();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);

//     // Cleanup the event listener on component unmount
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [startListening, stopListening]); // Add both functions to the dependency array

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="text-center mb-4">Dashboard</h1>

      <div className="text-center mb-4">
        <button className="btn btn-success" onClick={startListening}>
          Start Listening
        </button>
        <button
          className="btn btn-danger mx-3"
          onClick={stopListening}
          disabled={!recognitionInstance}
        >
          Stop Listening
        </button>
      </div>
      <p className="mt-3">
        <strong>Transcript:</strong> {transcript}
      </p>

      {loading ? (
        <div className="text-center">Loading data...</div>
      ) : (
        <>
          <h2>Saved Data</h2>
          <ul className="list-group mb-4">
            {savedData.map((item) => (
              <li
                key={item._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <EditableText
                  text={item.text}
                  onSave={(updatedText) => updateData(item._id, updatedText)}
                />
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteData(item._id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-4">
            <h3 className="t-2">Add New Data</h3>
            <input
              type="text"
              className="form-control pt-2"
              placeholder="Enter new text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <button className="btn btn-primary mt-3" onClick={addData}>
              Add New Text
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const EditableText = ({ text, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    ["link", "image", "video", "formula"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  useEffect(() => {
    if (isEditing) {
      if (!quillRef.current && editorRef.current) {
        quillRef.current = new Quill(editorRef.current, {
          theme: "snow",
          modules: { toolbar: toolbarOptions },
        });

        quillRef.current.on("text-change", () => {
          setCurrentText(quillRef.current.root.innerHTML);
        });
      }
    } else {
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(currentText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentText(text);
  };

  return isEditing ? (
    <div>
      <div
        ref={editorRef}
        style={{ minHeight: "100px", border: "1px solid #ccc" }}
      />
      <div className="mt-2">
        <button className="btn btn-success btn-sm" onClick={handleSave}>
          Save
        </button>
        <button
          className="btn btn-secondary btn-sm ms-2"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <span>
      <span dangerouslySetInnerHTML={{ __html: currentText }} />
      <button className="btn btn-link btn-sm ms-2" onClick={handleEdit}>
        Edit
      </button>
    </span>
  );
};

export default Dashboard;
