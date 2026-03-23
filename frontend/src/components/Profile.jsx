import { useState, useEffect } from "react"
import axios from "axios"
import { Lock, ChevronLeft, Shield, LogOut, Save, UserCircle, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { INPUT_WRAPPER, FULL_BUTTON, SECTION_WRAPPER, BACK_BUTTON, DANGER_BTN, personalFields, securityFields } from '../assets/dummy'
import FaceRegistration from './FaceRegistration'

// Constants & Dummy Data
const API_URL = "http://localhost:4000"

export default function Profile({ setCurrentUser, onLogout }) {
  const [profile, setProfile] = useState({ name: "", email: "" })
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [hasFaceRegistered, setHasFaceRegistered] = useState(false)
  const [showFaceRegistration, setShowFaceRegistration] = useState(false)
  const navigate = useNavigate()

  console.log("Profile component rendered", { showFaceRegistration });

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    // Fetch user profile
    axios
      .get(`${API_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data.success) setProfile({ name: data.user.name, email: data.user.email })
        else toast.error(data.message)
      })
      .catch(() => toast.error("Unable to load profile."))
      
    // Check if user has face registered
    axios
      .get(`${API_URL}/api/face/check`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data.success) setHasFaceRegistered(data.hasFace)
      })
      .catch(() => {
        // If face API is not available, assume no face registered
        setHasFaceRegistered(false)
      })
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name
          )}&background=random`,
        }))
        toast.success("Profile updated")
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed")
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match")
    }
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        { currentPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success("Password changed")
        setPasswords({ current: "", new: "", confirm: "" })
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed")
    }
  }

  const handleFaceRegistrationComplete = () => {
    console.log("handleFaceRegistrationComplete called");
    setHasFaceRegistered(true)
    setShowFaceRegistration(false)
    toast.success("Face registered successfully!")
  }

  const handleRemoveFace = async () => {
    try {
      const token = localStorage.getItem("token")
      // To remove face data, we send an empty array
      const { data } = await axios.post(
        `${API_URL}/api/face/register`,
        { faceData: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        setHasFaceRegistered(false)
        toast.success("Face registration removed")
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove face registration")
    }
  }

  // If user wants to register face, show the FaceRegistration component
  if (showFaceRegistration) {
    console.log("Rendering FaceRegistration component in profile");
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-center" autoClose={3000} />
        <div className="max-w-4xl mx-auto p-6">
          <button 
            onClick={() => {
              console.log("Back to Profile button clicked");
              setShowFaceRegistration(false);
            }}
            className={BACK_BUTTON}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Profile
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {profile.name ? profile.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Face Registration</h1>
              <p className="text-gray-500 text-sm">Register your face for quick login</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <FaceRegistration 
              onRegistrationComplete={() => {
                console.log("FaceRegistration onRegistrationComplete called in profile");
                handleFaceRegistrationComplete();
              }} 
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className={BACK_BUTTON}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 text-sm">Manage your profile and security settings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <UserCircle className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                <div key={name} className={INPUT_WRAPPER}>
                  <Icon className="text-purple-500 w-5 h-5 mr-2" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={profile[name]}
                    onChange={(e) => setProfile({ ...profile, [name]: e.target.value })}
                    className="w-full text-sm focus:outline-none"
                    required
                  />
                </div>
              ))}
              <button className={FULL_BUTTON}>
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </form>
          </section>

          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">Security</h2>
            </div>
            <form onSubmit={changePassword} className="space-y-4">
              {securityFields.map(({ name, placeholder }) => (
                <div key={name} className={INPUT_WRAPPER}>
                  <Lock className="text-purple-500 w-5 h-5 mr-2" />
                  <input
                    type="password"
                    placeholder={placeholder}
                    value={passwords[name]}
                    onChange={(e) =>
                      setPasswords({ ...passwords, [name]: e.target.value })
                    }
                    className="w-full text-sm focus:outline-none"
                    required
                  />
                </div>
              ))}
              <button className={FULL_BUTTON}>
                <Shield className="w-4 h-4" /> Change Password
              </button>

              {/* Face Registration Section */}
              <div className="mt-8 pt-6 border-t border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-500" /> Face Recognition
                </h3>
                
                {hasFaceRegistered ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 mb-3">Face registered successfully!</p>
                    <p className="text-green-600 text-sm mb-4">You can use face recognition to login to your account.</p>
                    <button 
                      onClick={handleRemoveFace}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Remove Face Registration
                    </button>
                  </div>
                ) : (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 mb-3">No face registered yet</p>
                    <p className="text-purple-600 text-sm mb-4">Register your face for quick and secure login.</p>
                    <button 
                      onClick={() => {
                        console.log("Register Face button clicked in profile");
                        setShowFaceRegistration(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:shadow-md text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Register Face
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-purple-100">
                <h3 className="text-red-600 font-semibold mb-4 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Danger Zone
                </h3>
                <button onClick={onLogout} className={DANGER_BTN}>
                  Logout
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}