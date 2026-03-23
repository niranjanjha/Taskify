import React, { useState } from 'react'
import { Zap, Camera } from 'lucide-react'
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

import {BUTTONCLASSES, Inputwrapper, MESSAGE_ERROR, MESSAGE_SUCCESS,FIELDS} from '../assets/dummy.jsx'
import FaceRegistration from './FaceRegistration'

const API_URL="http://localhost:4000/"
const INITIAL_FORM={name:"",email:"",password:""}

const SignUp = ({onSwitchMode, onSubmit}) => {
    const [formData,setFormData] =useState(INITIAL_FORM);
    const[loading,setLoading]=useState(false)
    const[message,setMessage]=useState({text:"",type:""})
    const [showFaceRegistration, setShowFaceRegistration] = useState(false);
    const [userJustRegistered, setUserJustRegistered] = useState(null);
    const navigate = useNavigate();

    console.log("SignUp component rendered", { showFaceRegistration, userJustRegistered });

    const handleSubmit=async (e)=>
    {
      e.preventDefault()
      setLoading(true)
      setMessage({text:"",type:""})
 try {
    const { data } = await axios.post(`${API_URL}api/user/register`, formData)

      console.log("Signup Successful",data)
      setMessage({text:"Registration successful! You can now log in",type:"success"})
      setUserJustRegistered(data.user);
      setFormData(INITIAL_FORM)

 } catch (err) {
  console.error("Signup Error:",err)
  setMessage({text:err.response?.data?.message || "An error occured.Please try again",type:"error"})
 } finally {
   setLoading(false)
 }
    }

    const handleFaceRegistrationComplete = () => {
      console.log("handleFaceRegistrationComplete called");
      toast.success("Face registered successfully! You can now use face recognition to login.");
      // Redirect to login page after face registration
      setTimeout(() => {
        onSwitchMode?.();
      }, 2000);
    }

    const handleSwitchToFaceRegistration = () => {
      console.log("handleSwitchToFaceRegistration called");
      setShowFaceRegistration(true);
    }

    const handleBackToSignup = () => {
      console.log("handleBackToSignup called");
      setShowFaceRegistration(false);
    }

    // If face registration is selected after signup, render the FaceRegistration component
    if (showFaceRegistration && userJustRegistered) {
      console.log("Rendering FaceRegistration component after signup");
      return (
        <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Face Registration</h2>
            <p className="text-gray-500 text-sm mt-1">Register your face for quick login</p>
          </div>
          
          <FaceRegistration 
            onRegistrationComplete={() => {
              console.log("FaceRegistration onRegistrationComplete called");
              handleFaceRegistrationComplete();
            }} 
          />
          
          <button
            onClick={() => {
              console.log("Skip for now button clicked");
              handleBackToSignup();
            }}
            className="w-full mt-4 text-center text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors"
          >
            Skip for now
          </button>
        </div>
      )
    }

    // If user just registered and wants to add face
    if (userJustRegistered && message.type === "success") {
      console.log("Showing post-registration face registration option");
      return (
        <div className="max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Account Created!</h2>
            <p className="text-gray-500 text-sm mt-1">Welcome to Taskify, {userJustRegistered.name}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-center">
              {message.text}
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                console.log("Register Face button clicked");
                handleSwitchToFaceRegistration();
              }}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Register Face for Quick Login
            </button>
            
            <button
              onClick={() => {
                console.log("Continue to Login button clicked");
                onSwitchMode?.();
              }}
              className="w-full border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )
    }

  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8'>
      <div className='mb-6 text-center'>
        <div className='w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4'>
          <Zap className='w-8 h-8 text-white'/>
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>
          Create Account
        </h2>
        <p className='text-gray-500 text-sm mt-1'>
          Join Taskify to manage your tasks
        </p>
      </div>
      
      {message.text && (
        <div className={message.type==='success'?MESSAGE_SUCCESS:MESSAGE_ERROR}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {FIELDS.map(({name,type,placeholder,icon:Icon})=>(
          <div key={name} className={Inputwrapper}>
            <Icon className='text-purple-500 w-5 h-5 mr-2'/>
            <input 
              type={type} 
              placeholder={placeholder} 
              value={formData[name]} 
              onChange={(e)=>setFormData({...formData,[name]:e.target.value})}
              className='w-full focus:outline-none text-sm text-gray-700'
              required
            />
          </div>
        ))}

        <button type='submit' className={BUTTONCLASSES} disabled={loading}>
          {loading ? "Signing Up...":<><Zap className='w-4 h-4'/>SignUp </>}
        </button>
      </form>

      <p className='text-center text-sm text-gray-600 mt-6'>
        Already have an Account?{''}
        <button 
          onClick={() => {
            console.log("Login button clicked");
            onSwitchMode?.();
          }}
          className='text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors'
        >
          Login
        </button> 
      </p>
    </div>
  )
}

export default SignUp