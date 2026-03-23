'use client'

import { SplineScene } from "./spline";
import { Card } from "./card"
import { Spotlight } from "./spotlight"
import { cn } from "../../lib/utils"
import { ArrowRight, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function SplineLanding() {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full h-[500px] bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100 relative overflow-hidden border-0">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(192, 132, 252, 0.5)" />

      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-800">Taskify</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Transform Your
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">Productivity</span>
          </h1>
          
          <p className="mt-4 text-gray-600 max-w-lg text-lg">
            Experience task management like never before with our interactive 3D interface. 
            Simplify your workflow and boost efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Start For Free <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 bg-white border border-purple-200 text-purple-600 px-6 py-3 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}