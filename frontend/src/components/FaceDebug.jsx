import { useState } from "react";
import FaceLogin from "./FaceLogin";
import FaceRegistration from "./FaceRegistration";

const FaceDebug = () => {
  const [activeComponent, setActiveComponent] = useState("login");
  
  const handleAuthSubmit = (data) => {
    console.log("Auth submitted:", data);
  };
  
  const handleSwitchMode = () => {
    console.log("Switch mode called");
  };
  
  const handleSwitchToEmail = () => {
    console.log("Switch to email called");
  };
  
  const handleRegistrationComplete = () => {
    console.log("Registration complete");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Face Recognition Debug</h1>
      
      <div className="mb-6">
        <button 
          onClick={() => setActiveComponent("login")}
          className={`mr-4 px-4 py-2 rounded-lg ${activeComponent === "login" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Face Login
        </button>
        <button 
          onClick={() => setActiveComponent("register")}
          className={`px-4 py-2 rounded-lg ${activeComponent === "register" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Face Registration
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {activeComponent === "login" ? (
          <FaceLogin 
            onSubmit={handleAuthSubmit}
            onSwitchMode={handleSwitchMode}
            onSwitchToEmail={handleSwitchToEmail}
          />
        ) : (
          <FaceRegistration 
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}
      </div>
    </div>
  );
};

export default FaceDebug;