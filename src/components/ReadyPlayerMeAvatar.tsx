import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Loader2, Download, Sparkles, Zap, Users, User } from 'lucide-react'

// Import the GLB Avatar Viewer
import GLBAvatarViewer from './GLBAvatarViewer'

interface ReadyPlayerMeAvatarProps {
  settings: {
    gender: 'male' | 'female' | 'non-binary'
    height: number
    muscle: number
    bodyFat: number
    shoulderWidth: number
    waistSize: number
    skinTone: number
    facialStructure: number
    eyeSize: number
    noseSize: number
    mouthSize: number
    hairStyle: number
    hairColor: number
  }
  lighting: {
    ambientIntensity: number
    directionalIntensity: number
    directionalPosition: [number, number, number]
    environmentIntensity: number
    shadows: boolean
  }
  uploadedPhoto?: string | null
}

export default function ReadyPlayerMeAvatar({ settings, lighting, uploadedPhoto }: ReadyPlayerMeAvatarProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  const generateAvatar = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Simulate avatar generation with enhanced processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      setError(null)
    } catch (err) {
      setError('Failed to generate avatar. Using available preset.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate when component mounts
  useEffect(() => {
    generateAvatar()
  }, [])

  if (isGenerating) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <div className="text-slate-300 mb-2">Loading HD Avatar System...</div>
          <div className="text-sm text-slate-400">
            Initializing {settings.gender} preset with customizations
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Zap className="w-3 h-3 mr-1" />
              HD Quality
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              <Users className="w-3 h-3 mr-1" />
              Multi-Gender
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  // Use the GLB Avatar Viewer for enhanced 3D rendering
  return (
    <div className="w-full h-full relative">
      <GLBAvatarViewer 
        settings={settings} 
        lighting={lighting} 
        uploadedPhoto={uploadedPhoto} 
      />

      {/* Avatar Preset Selector */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={settings.gender === 'female' ? 'default' : 'outline'}
            className="text-xs"
            onClick={() => {/* This would be handled by parent component */}}
          >
            <User className="w-3 h-3 mr-1" />
            Female
          </Button>
          <Button
            size="sm"
            variant={settings.gender === 'male' ? 'default' : 'outline'}
            className="text-xs"
            onClick={() => {/* This would be handled by parent component */}}
          >
            <User className="w-3 h-3 mr-1" />
            Male
          </Button>
        </div>
      </div>

      {/* Enhanced Quality indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        <Badge className="bg-green-500/20 border-green-500 text-green-400">
          <Download className="w-3 h-3 mr-1" />
          HD Avatar System
        </Badge>
        <Badge className="bg-purple-500/20 border-purple-500 text-purple-400">
          <Sparkles className="w-3 h-3 mr-1" />
          3D Enhanced
        </Badge>
        <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">
          <Users className="w-3 h-3 mr-1" />
          {settings.gender.charAt(0).toUpperCase() + settings.gender.slice(1)} Preset
        </Badge>
      </div>

      {/* Enhanced Generation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
        <Button 
          onClick={generateAvatar} 
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {isGenerating ? 'Generating...' : 'Regenerate HD Avatar'}
        </Button>
        <Button variant="outline" className="border-slate-600">
          <Download className="w-4 h-4 mr-2" />
          Export GLB
        </Button>
      </div>

      {error && (
        <div className="absolute bottom-4 right-4">
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
            {error}
          </Badge>
        </div>
      )}

      {/* Avatar Info Panel */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 space-y-1">
          <div className="text-xs text-slate-300">
            Height: {(settings.height / 100).toFixed(2)}m
          </div>
          <div className="text-xs text-slate-300">
            Muscle: {settings.muscle}% | Body Fat: {settings.bodyFat}%
          </div>
          <div className="text-xs text-slate-400">
            Gender: {settings.gender} | Style: {settings.hairStyle}
          </div>
        </div>
      </div>
    </div>
  )
}