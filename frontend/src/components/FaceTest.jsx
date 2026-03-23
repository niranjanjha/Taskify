import { useState, useEffect } from "react";
import faceRecognitionService from "./FaceRecognitionService";

const FaceTest = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Testing face recognition models...");

  useEffect(() => {
    const testModels = async () => {
      try {
        await faceRecognitionService.loadModels();
        setStatus("success");
        setMessage("All face recognition models loaded successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(`Error loading models: ${error.message}`);
      }
    };

    testModels();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Face Recognition Test</h1>
      <div
        style={{
          padding: "10px",
          borderRadius: "5px",
          backgroundColor:
            status === "loading"
              ? "#fff3cd"
              : status === "success"
              ? "#d4edda"
              : "#f8d7da",
          color:
            status === "loading"
              ? "#856404"
              : status === "success"
              ? "#155724"
              : "#721c24",
          border:
            status === "loading"
              ? "1px solid #ffeaa7"
              : status === "success"
              ? "1px solid #c3e6cb"
              : "1px solid #f5c6cb",
        }}
      >
        <h2>Status: {status.toUpperCase()}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default FaceTest;