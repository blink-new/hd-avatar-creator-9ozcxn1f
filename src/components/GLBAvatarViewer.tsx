import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Loader2, Download, Sparkles, Zap, RotateCcw } from 'lucide-react'

// Import the basic Avatar3D component as fallback
import Avatar3D from './Avatar3D'

interface GLBAvatarViewerProps {
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

// GLB Model Component with error handling
function GLBModel({ url, settings }: { url: string; settings: any }) {
  const [modelError, setModelError] = useState(false)
  const modelRef = useRef<THREE.Group>(null)

  let scene: THREE.Group | null = null
  
  try {
    const gltf = useGLTF(url)
    scene = gltf.scene
  } catch (error) {
    console.error('Failed to load GLB model:', error)
    setModelError(true)
  }

  useFrame((state) => {
    if (modelRef.current && !modelError) {
      // Gentle rotation animation
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  useEffect(() => {
    if (scene && modelRef.current && !modelError) {
      // Apply height scaling
      const heightScale = settings.height / 180
      modelRef.current.scale.setScalar(heightScale)

      // Apply basic material modifications based on settings
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // Adjust skin tone if this looks like skin material
                if (mat.name?.toLowerCase().includes('skin') || 
                    mat.color?.r > 0.7 && mat.color?.g > 0.5 && mat.color?.b > 0.4) {
                  const skinHue = (settings.skinTone / 100) * 0.15
                  const skinSaturation = 0.3 + (settings.skinTone / 100) * 0.4
                  const skinLightness = 0.4 + (settings.skinTone / 100) * 0.4
                  mat.color.setHSL(skinHue, skinSaturation, skinLightness)
                }
              }
            })
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            // Adjust skin tone for single materials
            if (child.material.name?.toLowerCase().includes('skin') ||
                child.material.color?.r > 0.7 && child.material.color?.g > 0.5 && child.material.color?.b > 0.4) {
              const skinHue = (settings.skinTone / 100) * 0.15
              const skinSaturation = 0.3 + (settings.skinTone / 100) * 0.4
              const skinLightness = 0.4 + (settings.skinTone / 100) * 0.4
              child.material.color.setHSL(skinHue, skinSaturation, skinLightness)
            }
          }
        }
      })
    }
  }, [scene, settings, modelError])

  if (modelError || !scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#4F46E5" wireframe />
      </mesh>
    )
  }

  return (
    <group ref={modelRef}>
      <primitive object={scene} />
      {/* Height indicator */}
      <Text
        position={[1, 0, 0]}
        fontSize={0.1}
        color="#60A5FA"
        anchorX="left"
        anchorY="middle"
      >
        {(settings.height / 100).toFixed(2)}m
      </Text>
    </group>
  )
}

// Fallback loading component
function ModelLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <mesh>
          <boxGeometry args={[1, 2, 0.5]} />
          <meshStandardMaterial color="#4F46E5" wireframe />
        </mesh>
      }
    >
      {children}
    </Suspense>
  )
}

export default function GLBAvatarViewer({ settings, lighting, uploadedPhoto }: GLBAvatarViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useBasicAvatar, setUseBasicAvatar] = useState(true)
  const [currentModel, setCurrentModel] = useState<string | null>(null)
  const [webglSupported, setWebglSupported] = useState(true)

  // Available avatar models (currently none available, so we'll use basic avatar)
  const avatarModels = {
    female: null, // No GLB model available yet
    male: null, // No GLB model available yet
    'non-binary': null
  }

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebglSupported(false)
        setUseBasicAvatar(true)
        setError('WebGL not supported. Using basic 3D avatar.')
      }
    } catch (e) {
      setWebglSupported(false)
      setUseBasicAvatar(true)
      setError('WebGL not supported. Using basic 3D avatar.')
    }
  }, [])

  const loadGLBModel = async () => {
    if (!webglSupported) {
      setError('WebGL not supported')
      return
    }

    const modelUrl = avatarModels[settings.gender]
    
    if (!modelUrl) {
      setError(`GLB model for ${settings.gender} not available yet. Using basic avatar.`)
      setUseBasicAvatar(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Test if the model exists and is valid
      const response = await fetch(modelUrl, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error('Model file not found')
      }

      setCurrentModel(modelUrl)
      setUseBasicAvatar(false)
    } catch (err) {
      console.error('Failed to load GLB model:', err)
      setError('GLB model not available. Using basic avatar.')
      setUseBasicAvatar(true)
    } finally {
      setIsLoading(false)
    }
  }

  const switchToBasicAvatar = () => {
    setUseBasicAvatar(true)
    setCurrentModel(null)
    setError(null)
  }

  // Auto-load GLB model when gender changes (but only if models are available)
  useEffect(() => {
    if (webglSupported && avatarModels[settings.gender]) {
      loadGLBModel()
    } else {
      setUseBasicAvatar(true)
      if (!webglSupported) {
        setError('WebGL not supported')
      } else {
        setError(`GLB model for ${settings.gender} coming soon!`)
      }
    }
  }, [settings.gender, webglSupported])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <div className="text-slate-300 mb-2">Loading HD GLB Avatar...</div>
          <div className="text-sm text-slate-400">
            Applying customizations to 3D model
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Zap className="w-3 h-3 mr-1" />
              GLB Model
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              <Sparkles className="w-3 h-3 mr-1" />
              HD Quality
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  // Always use basic avatar since no GLB models are available
  return (
    <div className="w-full h-full relative">
      <Avatar3D settings={settings} lighting={lighting} />

      {/* Quality indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">
          <Sparkles className="w-3 h-3 mr-1" />
          Basic 3D
        </Badge>
        <Badge className="bg-purple-500/20 border-purple-500 text-purple-400">
          <Zap className="w-3 h-3 mr-1" />
          HD Enhanced
        </Badge>
      </div>

      {/* Model controls - disabled since no models available */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button 
          disabled
          size="sm"
          variant="outline"
          className="border-slate-600 opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          GLB Models Coming Soon
        </Button>
      </div>

      {error && (
        <div className="absolute bottom-4 left-4">
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
            {error}
          </Badge>
        </div>
      )}
    </div>
  )
}