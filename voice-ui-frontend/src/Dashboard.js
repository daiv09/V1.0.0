import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Quill from 'quill';
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
            .get("http://localhost:4000/data", { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {setSavedData(response.data); setLoading(false);})
            .catch(() => {setLoading(false);
                toast.error("Failed to fetch data");});
    }, [token]);

    const startListening = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        // const userPreferredLanguage="en-US";
        // const language = userPreferredLanguage || navigator.language;

        const availableLanguages = ["en-US", "fr-FR", "es-ES", "hi-IN"]; // Example language options
        const userSelectedLanguage = "en-US"; // Could come from a user input or settings

        const language = availableLanguages.includes(userSelectedLanguage) ? userSelectedLanguage : navigator.language;

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
            setTranscript(accumulatedTranscript.current.trim() + " " + interimTranscript.trim());
        };
        recognition.onspeechend = () => {
            console.log("Speech has ended.");
            recognition.stop();
            // Optionally restart recognition here
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
                // Save the final transcript to the server
                axios
                    .post(
                        "http://localhost:4000/save",
                        { text: finalTranscript },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    .then(() => {
                        setSavedData((prev) => [...prev, { text: finalTranscript, noteId: Date.now() }]);
                        toast.success("Data saved successfully");
                    })
                    .catch(() => toast.error("Failed to save data"));
            }

            // Clear the displayed transcript
            setTranscript("");
            toast.info("Speech recognition stopped");
        }
    };
    //
     // Add new data
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
        // Re-fetch the saved data after adding new data
        axios
            .get("http://localhost:4000/data", { headers: { Authorization: `Bearer ${token}` } })
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
//we  can   hvae  the   Modal  OPtion  Here   about  to  get  the   Deleter  the   MOdal 
    return (
        // <div className="container mt-5">
        //     <h1>Dashboard</h1>
        // </div>
        <div className="container mt-5">
            <ToastContainer />
            <h1>Dashboard</h1>

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
            <p className="mt-3">
                <strong>Transcript:</strong> {transcript}
            </p>

            {loading ? (
                <p>Loading data...</p>
            ) : (
                <>
                    <h2>Saved Tasks</h2>
                    <ul className="list-group">
            {savedData.map((item) => (
                <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <EditableText
                        text={item.text}
                        onSave={(updatedText) => updateData(item._id, updatedText)}
                    />
                    <button className="btn btn-danger btn-sm" onClick=
                        { () => deleteData(item._id) }
                        // {deleteConfirmation === item._id ? "Are you sure?" : "Delete"}
                        >
                        Delete
                    </button>
                </li>
            ))}
        </ul>

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

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
    ];

    useEffect(() => {
        console.log('useEffect triggered. isEditing:', isEditing);

        if (isEditing) {
            if (!quillRef.current && editorRef.current) {
                console.log('Initializing Quill editor');
                quillRef.current = new Quill(editorRef.current, {
                    theme: 'snow',
                    modules: { toolbar: toolbarOptions },
                });

                quillRef.current.on('text-change', () => {
                    console.log('Text changed in Quill editor');
                    setCurrentText(quillRef.current.root.innerHTML);
                });
            }

            console.log('Updating Quill editor content:', currentText);
            if (quillRef.current) {
                quillRef.current.root.innerHTML = currentText;
            }
        } else {
            // Cleanup the Quill editor if not editing
            if (quillRef.current) {
                console.log('Destroying Quill editor');
                quillRef.current.off('text-change'); // Remove listeners
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
        
        if(editorRef.current){
            
            quillRef.current.on('text-change', () => {
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
                style={{ minHeight: '100px', border: '1px solid #ccc' }}
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