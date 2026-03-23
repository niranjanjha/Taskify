import { useState } from "react";
import FaceLogin from "./FaceLogin";

const IsolatedFaceTest = () => {
  const [authData, setAuthData] = useState(null);
  
  const handleAuthSubmit = (data) => {
    console.log("Auth submitted:", data);
    setAuthData(data);
  };
  
  const handleSwitchMode = () => {
    console.log("Switch mode called");
  };
  
  const handleSwitchToEmail = () => {
    console.log("Switch to email called");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-fuchsia-50 to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGw0MCA0ME00MCAwTDAgNDAiIHN0cm9rZT0iI2Q5ZTBmMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-10"></div>
      <div className="relative z-10 w-full max-w-md">
        <FaceLogin 
          onSubmit={handleAuthSubmit}
          onSwitchMode={handleSwitchMode}
          onSwitchToEmail={handleSwitchToEmail}
        />
      </div>
    </div>
  );
};

export default IsolatedFaceTest;