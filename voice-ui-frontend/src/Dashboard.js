import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import html2pdf from "html2pdf.js";
import { AuthProvider } from "./AuthContext";
import "animate.css"; // Importing animate.css for animations
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [transcript, setTranscript] = useState("");
  const [newText, setNewText] = useState(""); // For adding new data
  const [savedData, setSavedData] = useState([]);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const currentTasks = savedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Define a function to handle the pagination logic
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // Logic for disabling the Previous/Next buttons based on the current page
  const isPreviousDisabled = currentPage === 1;
  const isNextDisabled = currentTasks.length < itemsPerPage;

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
    // const userPreferredLanguage="en-US";
    // const language = userPreferredLanguage || navigator.language;

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
    let inactivityTimeout = null;
    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        toast.error("No speech detected for 10 seconds, stopping recognition.");
        recognition.stop();
        clearTimeout(inactivityTimeout);
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim(); // Trim the final text
          if (finalText) {
            accumulatedTranscript.current += finalText + " "; // Append only non-empty final text

            // Save the final text to the backend
            // axios
            //     .post(
            //         "http://localhost:4000/save",
            //         { text: finalText },
            //         { headers: { Authorization: `Bearer ${token}` } }
            //     )
            //     .then(() => {
            //         setSavedData((prev) => [...prev, { text: finalText, noteId: Date.now() }]);
            //         toast.success("Data saved successfully");
            //     })
            //     .catch(() => toast.error("Failed to save data"));
          }
        } else {
          interimTranscript += result[0].transcript; // Collect interim results
        }
      }

      // Update the transcript displayed in the UI
      setTranscript(
        accumulatedTranscript.current.trim() + " " + interimTranscript.trim()
      );

      // Reset inactivity timeout whenever new text is generated
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        console.log("No speech detected for 10 seconds, stopping recognition.");
        recognition.stop();
      }, 10000); // 10 seconds timeout
    };
    recognition.onspeechend = () => {
      console.log("Speech has ended.");
      recognition.stop();
      // Optionally restart recognition here
    };

    recognition.start();
    setRecognitionInstance(recognition);
    toast.info("Speech recognition started", {
      autoClose: 2000, // Duration in milliseconds (2000ms = 2 seconds)
    });
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setRecognitionInstance(null);

      const finalTranscript = accumulatedTranscript.current.trim();
      if (finalTranscript) {
        const currentTime = new Date();
        const timestamp = currentTime.toLocaleString(); // "12/21/2024, 14:30:45"

        axios
          .post(
            "http://localhost:4000/save",
            { text: finalTranscript, timestamp: timestamp },
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

      // Clear the displayed transcript
      setTranscript("");
      toast.info("Speech recognition stopped");
    }
  };
  
  const exportToPDF = (text, taskId, timestamp) => {
    if (!text) {
        toast.error("No transcript available to export");
        return;
    }

//
    const displayTimestamp = timestamp || new Date().toLocaleString();
    const element = document.createElement("div");
    element.innerHTML = `
        <h3>Task ID: ${taskId}</h3>
        <p>${text}</p>
        <p><small>Saved on: ${displayTimestamp}</small></p>
    `;
    document.body.appendChild(element);

    const opt = {
        margin: 10,
        filename: `task_${taskId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save()
        .then(() => document.body.removeChild(element))
        .catch(() => {
            document.body.removeChild(element);
            toast.error("Failed to export PDF");
        });
};

const exportToCSV = (text, taskId, timestamp) => {
    if (!text) {
        toast.error("No transcript available to export");
        return;
    }
    const displayTimestamp = timestamp || new Date().toLocaleString();
    const csvContent = `data:text/csv;charset=utf-8,Task ID,Transcript,Timestamp\n"${taskId}","${text.replace(/"/g, '""')}","${displayTimestamp}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `task_${taskId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Task exported to CSV");
};

const copyToClipboard = (text, timestamp) => {
    if (!text) {
        toast.error("No transcript available to copy");
        return;
    }
    const displayTimestamp = timestamp || new Date().toLocaleString();
    const contentToCopy = `${text}\nSaved on: ${displayTimestamp}`;
    navigator.clipboard.writeText(contentToCopy)
        .then(() => toast.success("Task copied to clipboard"))
        .catch(() => toast.error("Failed to copy task"));
};

  // Add new data
  const addData = async () => {
    if (!newText.trim()) {
      toast.error("Text cannot be empty");
      return;
    }
    const currentTime = new Date();
    const timestamp = currentTime.toLocaleString();
    try {
      const response = await axios.post(
        "http://localhost:4000/save",
        { text: newText, timestamp: timestamp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedData((prev) => [...prev,{ text: newText, timestamp: timestamp, noteId: response.data.noteId }    
      ]);
      setNewText(""); // Clear input
      toast.success("Data added successfully");
    } catch (error) {
      toast.error("Failed to add data");
    }
  };
  useEffect(() => {
    // Re-fetch the saved data after adding new data
    axios
      .get("http://localhost:4000/data", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSavedData(response.data); // Update saved data with the new list
      })
      .catch((error) => toast.error("Failed to fetch data"));
  }, [savedData]); // Re-run when savedData changes

  // Update existing data
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

  // Delete existing data
  // const deleteData = async (id) => {
  //     try {
  //         await axios.delete(`http://localhost:4000/data/${id}`, {
  //             headers: { Authorization: `Bearer ${token}` },
  //         });
  //         setSavedData((prev) => prev.filter((data) => data.noteId !== id));
  //         toast.success("Data deleted successfully");
  //     } catch (error) {
  //         toast.error("Failed to delete data");
  //     }
  // };
  //

  /*
        const deleteData = async (id) => {
            if (deleteConfirmation === id) {
                try {
                    await axios.delete(`http://localhost:4000/data/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setSavedData((prev) => prev.filter((data) => data.noteId !== id));
                    setDeleteConfirmation(null); // Reset confirmation state
                    toast.success("Data deleted successfully");
                } catch (error) {
                    toast.error("Failed to delete data");
                }
            } else {
                setDeleteConfirmation(id); // Ask for confirmation
            }
        };
        */

  const deleteData = async (id) => {
    if (deleteConfirmation === id) {
      try {
        // Delete from the backend
        await axios.delete(`http://localhost:4000/data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Re-fetch data to ensure the frontend is up-to-date with the backend
        const response = await axios.get("http://localhost:4000/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedData(response.data);

        // Reset the confirmation state
        setDeleteConfirmation(null);

        toast.success("Data deleted successfully");
      } catch (error) {
        toast.error("Failed to delete data");
      }
    } else {
      setDeleteConfirmation(id); // Ask for confirmation before deleting
      toast.info("Click Again! To Confirm Delete");
    }
  };

  // We can have the Modal OPtion Here about to get the Deleter the MOdal
  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="animate__animated animate__fadeIn">Dashboard</h1>
      <p className="text-muted text-center animate__animated animate__fadeInUp">
        Welcome to your dashboard! Here you can transcribe audio, manage tasks,
        and save your data effortlessly.
      </p>
      <div className="mb-4">
        <h2>Speech-to-Text</h2>
        <button className="btn btn-success" onClick={startListening}>
          Start Listening
        </button>
        <button
          className="btn btn-danger mx-3 animate__animated animate__fadeIn animate__delay-2s"
          onClick={stopListening}
          disabled={!recognitionInstance}
        >
          Stop Listening
        </button>
        <p className="mt-3">
          <strong>Transcript:</strong>
          <span className="text-primary">
            {transcript || " No transcript available. "}
          </span>
          {/* {transcript} */}
        </p>
      </div>
      <div className="mb-4">
        <h2>Audio File Transcription</h2>
        <div className="mb-3 d-flex align-items-stretch">
          <input
            className="form-control me-2"
            type="file"
            accept="audio/*"
            // onChange={handleAudioFileChange}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-outline-success"
            // onClick={transcribeAudio}
            style={{ flexGrow: 0 }}
            // disabled={!audioFile} // Disable button until a file is uploaded
          >
            Transcribe Audio
          </button>
        </div>
        <p className="text-muted mt-2">
          Upload an audio file to generate a text transcription.
        </p>
      </div>

      {loading ? (
        <p className="animate__animated animate__flash">Loading data...</p>
      ) : (
        <>
          <div className="mb-4">
            <h2>Saved Tasks</h2>
            {savedData.length > 0 ? (
              <ul className="list-group">
                {" "}
                {savedData.map((item) => (
                  <li
                    key={item._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <EditableText
                      text={item.text}
                      onSave={(updatedText) =>
                        updateData(item._id, updatedText)
                      }
                    />

                    <small className="text-muted d-block mt-1">
                      Saved on: {item.timestamp || "N/A"}
                    </small>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => exportToPDF(item.text, item._id)}
                      >
                        PDF
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => exportToCSV(item.text, item._id)}
                      >
                        CSV
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => copyToClipboard(item.text)}
                      >
                        Copy
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteData(item._id)}
                        // {deleteConfirmation === item._id ? "Are you sure?" : "Delete"}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">
                No tasks saved yet. Add a new one below!
              </p>
            )}
          </div>

          {/* Add New Data */}
          <div className="mb-4 pt-2">
            <h3 className="t-2">Add New Data</h3>
            <input
              type="text"
              className="form-control pt-2"
              placeholder="Enter new text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <button className="btn btn-primary mt-3  pt-2" onClick={addData}>
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// const Dashboard = () => {
//     const [transcript, setTranscript] = useState("");
//     const [savedData, setSavedData] = useState([]);
//     const [recognitionInstance, setRecognitionInstance] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [deleteConfirmation, setDeleteConfirmation] = useState(null);

//     const token = localStorage.getItem("token");
//     const accumulatedTranscript = useRef(""); // To store the entire transcript for the session

//     useEffect(() => {
//         setLoading(true);
//         axios
//             .get("http://localhost:4000/data", { headers: { Authorization: `Bearer ${token}` } })
//             .then((response) => { setSavedData(response.data); setLoading(false); })
//             .catch(() => {
//                 setLoading(false);
//                 toast.error("Failed to fetch data");
//             });
//     }, [token]);

//     const startListening = () => {
//         const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognition.lang = "en-US";
//         recognition.continuous = true;
//         recognition.interimResults = true;

//         accumulatedTranscript.current = ""; // Reset the accumulated transcript

//         recognition.onresult = (event) => {
//             const interimTranscript = Array.from(event.results)
//                 .map((result) => result[0].transcript)
//                 .join("");
//             setTranscript(interimTranscript); // Update UI with the live transcript
//             accumulatedTranscript.current += interimTranscript; // Append to accumulated transcript
//         };

//         recognition.onerror = (event) => {
//             toast.error(`Speech recognition error: ${event.error}`);
//         };

//         recognition.start();
//         setRecognitionInstance(recognition);
//         toast.info("Speech recognition started");
//     };

//     const stopListening = () => {
//         if (recognitionInstance) {
//             recognitionInstance.stop();
//             setRecognitionInstance(null);

//             const finalTranscript = accumulatedTranscript.current.trim();
//             if (finalTranscript) {
//                 // Save the final transcript to the server
//                 axios
//                     .post(
//                         "http://localhost:4000/save",
//                         { text: finalTranscript },
//                         { headers: { Authorization: `Bearer ${token}` } }
//                     )
//                     .then(() => {
//                         setSavedData((prev) => [...prev, { text: finalTranscript, noteId: Date.now() }]);
//                         toast.success("Data saved successfully");
//                     })
//                     .catch(() => toast.error("Failed to save data"));
//             }

//             toast.info("Speech recognition stopped");
//         }
//     };

//     return (
//         <div className="container mt-5">
//             <ToastContainer />
//             <h1>Dashboard</h1>

//             <button className="btn btn-success" onClick={startListening}>
//                 Start Listening
//             </button>
//             <button
//                 className="btn btn-danger"
//                 onClick={stopListening}
//                 disabled={!recognitionInstance}
//             >
//                 Stop Listening
//             </button>
//             <p className="mt-3">
//                 <strong>Transcript:</strong> {transcript}
//             </p>

//             {loading ? (
//                 <p>Loading data...</p>
//             ) : (
//                 <>
//                     <h2>Saved Tasks</h2>
//                     <ul className="list-group">
//                         {savedData.map((item) => (
//                             <li key={item.noteId} className="list-group-item d-flex justify-content-between align-items-center">
//                                 {item.text}
//                             </li>
//                         ))}
//                     </ul>
//                 </>
//             )}
//         </div>
//     );
// };

// Dropdown menu for editing and deleting notes
// const DropdownMenu = ({ onEdit, onDelete }) => {
//     const [showMenu, setShowMenu] = useState(false);
//     const [updatedText, setUpdatedText] = useState("");

//     const handleEdit = () => {
//         if (!updatedText.trim()) {
//             alert("Text cannot be empty");
//             return;
//         }
//         onEdit(updatedText);
//         setUpdatedText(""); // Clear input after saving
//         setShowMenu(false);
//     };
//                 useEffect(() => {
//                     const handleOutsideClick = (event) => {
//                         if (!event.target.closest(".dropdown")) {
//                             setShowMenu(false);
//                         }
//                     };

//                     document.addEventListener("click", handleOutsideClick);
//                     return () => document.removeEventListener("click", handleOutsideClick);
//                 }, []);
//                 const dropdownRef = useRef();
//             useEffect(() => {
//                 const handleOutsideClick = (event) => {
//                     if (!dropdownRef.current?.contains(event.target)) {
//                         setShowMenu(false);
//                     }
//                 };
//                 document.addEventListener("click", handleOutsideClick);
//                 return () => document.removeEventListener("click", handleOutsideClick);
//                 }, []);

//     useEffect(() => {
//         const handleOutsideClick = (event) => {
//             if (!dropdownRef.current?.contains(event.target)) {
//                 setShowMenu(false);
//             }
//         };
//         document.addEventListener("click", handleOutsideClick);
//         return () => document.removeEventListener("click", handleOutsideClick);
//     }, []);
//     const handleToggle = (e) => {
//         e.stopPropagation(); // Prevent event bubbling
//         setShowMenu((prev) => !prev);

//     };
//     return (
//         <div className="dropdown" style={{ position: "relative" }}>
//             <button
//                 className="btn btn-secondary dropdown-toggle"
//                 onClick={handleToggle}
//             >
//                 Options
//             </button>
//             {showMenu && (
//                 <div className="dropdown-menu">
//                     <div className="dropdown-item">
//                         <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Edit Note"
//                             value={updatedText}
//                             onChange={(e) => setUpdatedText(e.target.value)}
//                         />
//                     </div>
//                     <button className="dropdown-item" onClick={handleEdit}>
//                         Save Edit
//                     </button>
//                     <button className="dropdown-item text-danger" onClick={onDelete}>
//                         Delete Note
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// ----------------------------------------------------------------------------------------------------------------------------------
// const EditableText = ({ text, onSave }) => {
//     const [isEditing, setIsEditing] = useState(false);
//     const [currentText, setCurrentText] = useState(text);
//     const editorRef = useRef(null);
//     const quillRef = useRef(null);

//     const toolbarOptions = [
//         ['bold', 'italic', 'underline', 'strike'],
//         ['blockquote', 'code-block'],
//         ['link', 'image', 'video', 'formula'],
//         [{ 'header': 1 }, { 'header': 2 }],
//         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//         [{ 'indent': '-1' }, { 'indent': '+1' }],
//         [{ 'size': ['small', false, 'large', 'huge'] }],
//         [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
//         [{ 'color': [] }, { 'background': [] }],
//         [{ 'align': [] }],
//         ['clean']
//     ];

//     useEffect(() => {
// if (isEditing && editorRef.current && !quillRef.current) {
//     quillRef.current = new Quill(editorRef.current, {
//         theme: "snow",
//         modules: { toolbar: toolbarOptions },
//     });

//     quillRef.current.on("text-change", () => {
//         setCurrentText(quillRef.current.root.innerHTML);
//     });

//     quillRef.current.root.innerHTML = currentText;
// }
//     }, [isEditing]);

//     const handleSave = () => {
//         onSave(currentText);
//         setIsEditing(false);
//     };

//     const handleEdit = () => {
//         if (quillRef.current) {
//             quillRef.current.root.innerHTML = currentText;
//         }
//         setIsEditing(true);
//     };

//     const handleCancel = () => {
//         setIsEditing(false);
//         setCurrentText(text);
//         if (quillRef.current) {
//             quillRef.current.root.innerHTML = text;
//         }
//     };

//     return isEditing ? (
//         <div>
//             <div ref={editorRef} style={{ minHeight: "100px", border: "1px solid #ccc" }} />
//             <button className="btn btn-success btn-sm mt-2" onClick={handleSave}>
//                 Save
//             </button>
//             <button className="btn btn-secondary btn-sm mt-2 ms-2" onClick={handleCancel}>
//                 Cancel
//             </button>
//         </div>
//     ) : (
//         <span>
//             <span dangerouslySetInnerHTML={{ __html: currentText }} />
//             <button className="btn btn-link btn-sm ms-2" onClick={handleEdit}>
//                 Edit
//             </button>
//         </span>
//     );
// };
// -----------------------------------------------------------------------------------------------------------------------------

const EditableText = ({ text, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [audioFile, setAudioFile] = useState(null); // For storing the uploaded audio file

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
    console.log("useEffect triggered. isEditing:", isEditing);

    if (isEditing) {
      if (!quillRef.current && editorRef.current) {
        console.log("Initializing Quill editor");
        quillRef.current = new Quill(editorRef.current, {
          theme: "snow",
          modules: { toolbar: toolbarOptions },
        });

        quillRef.current.on("text-change", () => {
          console.log("Text changed in Quill editor");
          setCurrentText(quillRef.current.root.innerHTML);
        });
      }

      console.log("Updating Quill editor content:", currentText);
      if (quillRef.current) {
        quillRef.current.root.innerHTML = currentText;
      }
    } else {
      // Cleanup the Quill editor if not editing
      if (quillRef.current) {
        console.log("Destroying Quill editor");
        quillRef.current.off("text-change"); // Remove listeners
        quillRef.current = null; // Reset editor
      }
    }
    /*
            if (!quillRef.current && editorRef.current) {
                quillRef.current = new Quill(editorRef.current, {
                    theme: 'snow',
                    modules: { toolbar: toolbarOptions },
                });

                quillRef.current.on('text-change', () => {
                    setCurrentText(quillRef.current.root.innerHTML);
                });
                //quillRef.current.root.innerHTML = currentText;
            }
            if (isEditing && quillRef.current) {
                // Set the editor content to the current text when entering edit mode
                quillRef.current.root.innerHTML = currentText;
            }
    */

    if (editorRef.current) {
      quillRef.current.on("text-change", () => {
        setCurrentText(quillRef.current.root.innerHTML);
      });
      quillRef.current.root.innerHTML = currentText;
      handleEdit();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML = currentText;
    }
    setIsEditing(true);
    // ----------------------------------------------------------------------------------------------
  };
  useEffect(() => {
    if (isEditing && quillRef.current) {
      quillRef.current.root.innerHTML = currentText;
    }
  }, [isEditing, currentText]);
  useEffect(() => {
    if (isEditing && quillRef.current) {
      quillRef.current.root.innerHTML = currentText;
    }
  }, [isEditing, currentText]);

  // Handle audio file upload
  const handleAudioFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 5000000) {
      // 5MB limit
      console.log("File uploaded:", file);
      toast.error("File size exceeds 5MB.");
      return;
    }
    setAudioFile(file);
  };

  // Start live audio recording and transcribe
  const startListening2 = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result.split(",")[1];
        fetchGoogleSpeechToText(base64Audio);
      };
    };
    mediaRecorderRef.current.start();
  };
  // Fetch transcribed text using Google Speech-to-Text
  const fetchGoogleSpeechToText = async (base64Audio) => {
    const apiKey = "AIzaSyDBe0Sd0XxI5RPVEQk1wQ7rJvnLt_F9WxA";
    const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
    const requestBody = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: base64Audio,
      },
    };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      const refinedText = data.results
        .map((result) => result.alternatives[0].transcript)
        .join(" ");
      setCurrentText(refinedText);
      if (quillRef.current) {
        quillRef.current.root.innerHTML = refinedText;
      }
    } catch (error) {
      console.error("Error refining speech-to-text:", error);
    }
  };
  // Convert uploaded audio file to text
  const transcribeAudio = () => {
    if (!audioFile) {
      toast.error("Please upload an audio file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const audioDataURL = reader.result; // This is a Data URL, not ArrayBuffer
      const audioElement = new Audio(audioDataURL); // Use the Data URL to load the audio file
      audioElement.play();
      // Convert the audio to base64 for Google Speech API
      const base64Audio = audioDataURL.split(",")[1];
      fetchGoogleSpeechToText(base64Audio);
    };
    reader.readAsDataURL(audioFile);
    // ----------------------------------------------------------------------------------------------
  };

  const handleSave = () => {
    onSave(currentText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentText(text);
    if (quillRef.current) {
      quillRef.current.root.innerHTML = text;
    }
  };

  return isEditing ? (
    <div>
      <div
        ref={editorRef}
        style={{ minHeight: "100px", border: "1px solid #ccc" }}
      />
      <button className="btn btn-success btn-sm mt-2" onClick={handleSave}>
        Save
      </button>
      <button
        className="btn btn-secondary btn-sm mt-2 ms-2"
        onClick={handleCancel}
      >
        Cancel
      </button>
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
