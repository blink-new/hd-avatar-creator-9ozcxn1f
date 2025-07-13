import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Text, PerspectiveCamera } from '@react-three/drei'
import { Mesh, BoxGeometry, SphereGeometry, CylinderGeometry, Group, DirectionalLight, AmbientLight, Material } from 'three'
import * as THREE from 'three'

interface Avatar3DProps {
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
  preset?: string | null
}

// Error boundary component for 3D rendering
function Avatar3DErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message?.includes('WebGL') || error.message?.includes('Context Lost')) {
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Simple 2D fallback component
function Avatar2DFallback({ settings }: { settings: Avatar3DProps['settings'] }) {
  const heightScale = settings.height / 180
  const muscleScale = 1 + (settings.muscle - 50) * 0.004
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg relative">
      <div className="text-center">
        {/* Simple avatar representation */}
        <div className="relative mx-auto mb-4" style={{ width: '120px', height: `${120 * heightScale}px` }}>
          {/* Head */}
          <div 
            className="absolute bg-orange-300 rounded-full border-2 border-orange-400"
            style={{
              width: '40px',
              height: '40px',
              top: '0px',
              left: '40px'
            }}
          />
          
          {/* Body */}
          <div 
            className="absolute bg-blue-400 rounded-lg border-2 border-blue-500"
            style={{
              width: `${50 + settings.shoulderWidth * 0.3}px`,
              height: `${60 * heightScale}px`,
              top: '35px',
              left: `${60 - (50 + settings.shoulderWidth * 0.3) / 2}px`
            }}
          />
          
          {/* Arms */}
          <div 
            className="absolute bg-orange-300 rounded-lg border border-orange-400"
            style={{
              width: `${8 + muscleScale * 2}px`,
              height: `${40 * heightScale}px`,
              top: '40px',
              left: `${25 - muscleScale}px`
            }}
          />
          <div 
            className="absolute bg-orange-300 rounded-lg border border-orange-400"
            style={{
              width: `${8 + muscleScale * 2}px`,
              height: `${40 * heightScale}px`,
              top: '40px',
              right: `${25 - muscleScale}px`
            }}
          />
          
          {/* Legs */}
          <div 
            className="absolute bg-blue-400 rounded-lg border border-blue-500"
            style={{
              width: '15px',
              height: `${50 * heightScale}px`,
              bottom: '0px',
              left: '35px'
            }}
          />
          <div 
            className="absolute bg-blue-400 rounded-lg border border-blue-500"
            style={{
              width: '15px',
              height: `${50 * heightScale}px`,
              bottom: '0px',
              right: '35px'
            }}
          />
        </div>
        
        <div className="text-slate-300 text-sm mb-2 font-medium">
          {settings.gender.charAt(0).toUpperCase() + settings.gender.slice(1)} Avatar Preview
        </div>
        <div className="text-slate-400 text-xs mb-3">
          {(settings.height / 100).toFixed(2)}m • {settings.muscle}% muscle • {settings.bodyFat}% body fat
        </div>
        
        {/* Feature badges */}
        <div className="flex justify-center space-x-2 mb-3">
          <div className="bg-blue-500/20 border border-blue-500 rounded-full px-2 py-1 text-xs text-blue-400">
            2D Preview
          </div>
          <div className="bg-orange-500/20 border border-orange-500 rounded-full px-2 py-1 text-xs text-orange-400">
            Settings Applied
          </div>
        </div>
        
        <div className="text-slate-500 text-xs">
          3D rendering unavailable - showing 2D preview
        </div>
        <div className="text-slate-600 text-xs mt-1">
          Try refreshing or use a different device for 3D view
        </div>
      </div>
    </div>
  )
}

function AvatarMesh({ settings, lighting }: Avatar3DProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useThree()

  // Animate the avatar
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  // Calculate body proportions based on settings
  const heightScale = settings.height / 180 // 180cm = default height
  const muscleScale = 1 + (settings.muscle - 50) * 0.004 // -20% to +20%
  const bodyFatScale = 1 + (settings.bodyFat - 20) * 0.003 // Body fat affects overall size
  const shoulderScale = 1 + (settings.shoulderWidth - 50) * 0.003
  const waistScale = 1 + (settings.waistSize - 50) * 0.002

  // Skin tone calculation
  const skinHue = (settings.skinTone / 100) * 0.15 // 0 to 0.15 hue range
  const skinSaturation = 0.3 + (settings.skinTone / 100) * 0.4 // 0.3 to 0.7
  const skinLightness = 0.4 + (settings.skinTone / 100) * 0.4 // 0.4 to 0.8
  const skinColor = new THREE.Color().setHSL(skinHue, skinSaturation, skinLightness)

  // Hair color calculation
  const hairHue = (settings.hairColor / 100) * 0.8 // Full hue range
  const hairColor = new THREE.Color().setHSL(hairHue, 0.8, 0.3)

  // Gender-specific proportions
  const genderMultipliers = {
    male: { shoulderBonus: 1.2, waistReduction: 0.9, muscle: 1.1 },
    female: { shoulderBonus: 0.9, waistReduction: 0.8, muscle: 0.8 },
    'non-binary': { shoulderBonus: 1.0, waistReduction: 0.85, muscle: 0.95 }
  }
  
  const genderMods = genderMultipliers[settings.gender]

  useEffect(() => {
    // Update lighting
    scene.traverse((child) => {
      if (child instanceof DirectionalLight) {
        child.intensity = lighting.directionalIntensity
        child.position.set(...lighting.directionalPosition)
        child.castShadow = lighting.shadows
      }
      if (child instanceof AmbientLight) {
        child.intensity = lighting.ambientIntensity
      }
    })
  }, [lighting, scene])

  return (
    <group ref={groupRef} scale={[heightScale, heightScale, heightScale]}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.12 * (1 + settings.facialStructure * 0.001), 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.04, 1.63, 0.08]} castShadow>
        <sphereGeometry args={[0.01 * (1 + settings.eyeSize * 0.001), 8, 8]} />
        <meshStandardMaterial color="#000033" />
      </mesh>
      <mesh position={[0.04, 1.63, 0.08]} castShadow>
        <sphereGeometry args={[0.01 * (1 + settings.eyeSize * 0.001), 8, 8]} />
        <meshStandardMaterial color="#000033" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.58, 0.09]} castShadow>
        <boxGeometry args={[0.02 * (1 + settings.noseSize * 0.001), 0.04, 0.02]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 1.54, 0.08]} castShadow>
        <boxGeometry args={[0.06 * (1 + settings.mouthSize * 0.001), 0.01, 0.01]} />
        <meshStandardMaterial color="#8B2635" />
      </mesh>

      {/* Hair (different styles) */}
      {settings.hairStyle === 1 && (
        <mesh position={[0, 1.7, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      )}
      {settings.hairStyle === 2 && (
        <mesh position={[0, 1.7, -0.02]} castShadow>
          <boxGeometry args={[0.22, 0.15, 0.2]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      )}
      {settings.hairStyle === 3 && (
        <mesh position={[0, 1.75, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.2, 12]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      )}
      {settings.hairStyle === 4 && (
        <mesh position={[0, 1.68, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} />
        </mesh>
      )}

      {/* Neck */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[
          0.35 * shoulderScale * muscleScale * bodyFatScale * genderMods.shoulderBonus, 
          0.6, 
          0.2 * muscleScale * bodyFatScale
        ]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Chest muscles (enhanced for muscle definition) */}
      {settings.muscle > 30 && (
        <>
          <mesh position={[-0.08, 1.25, 0.08]} castShadow>
            <sphereGeometry args={[0.06 * muscleScale * genderMods.muscle, 12, 12]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.95)} roughness={0.6} />
          </mesh>
          <mesh position={[0.08, 1.25, 0.08]} castShadow>
            <sphereGeometry args={[0.06 * muscleScale * genderMods.muscle, 12, 12]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.95)} roughness={0.6} />
          </mesh>
        </>
      )}

      {/* Abs (visible with low body fat and high muscle) */}
      {settings.muscle > 40 && settings.bodyFat < 25 && (
        <>
          <mesh position={[0, 1.05, 0.09]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.02]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.92)} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.95, 0.09]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.02]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.92)} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Waist */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[
          0.15 * waistScale * bodyFatScale * genderMods.waistReduction, 
          0.18 * bodyFatScale, 
          0.25, 
          12
        ]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.25 * shoulderScale * genderMods.shoulderBonus, 1.2, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05 * muscleScale, 0.06 * muscleScale, 0.5, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.25 * shoulderScale * genderMods.shoulderBonus, 1.2, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05 * muscleScale, 0.06 * muscleScale, 0.5, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Biceps (visible with high muscle definition) */}
      {settings.muscle > 50 && (
        <>
          <mesh position={[-0.25 * shoulderScale * genderMods.shoulderBonus, 1.3, 0]} castShadow>
            <sphereGeometry args={[0.04 * muscleScale * genderMods.muscle, 8, 8]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.94)} roughness={0.6} />
          </mesh>
          <mesh position={[0.25 * shoulderScale * genderMods.shoulderBonus, 1.3, 0]} castShadow>
            <sphereGeometry args={[0.04 * muscleScale * genderMods.muscle, 8, 8]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.94)} roughness={0.6} />
          </mesh>
        </>
      )}

      {/* Forearms */}
      <mesh position={[-0.32 * shoulderScale * genderMods.shoulderBonus, 0.85, 0]} rotation={[0, 0, 0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04 * muscleScale, 0.05 * muscleScale, 0.4, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.32 * shoulderScale * genderMods.shoulderBonus, 0.85, 0]} rotation={[0, 0, -0.3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04 * muscleScale, 0.05 * muscleScale, 0.4, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.36 * shoulderScale * genderMods.shoulderBonus, 0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.36 * shoulderScale * genderMods.shoulderBonus, 0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.12, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08 * muscleScale, 0.1 * muscleScale * bodyFatScale, 0.7, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08 * muscleScale, 0.1 * muscleScale * bodyFatScale, 0.7, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Quads (visible with high muscle definition) */}
      {settings.muscle > 45 && (
        <>
          <mesh position={[-0.12, 0.55, 0.06]} castShadow>
            <boxGeometry args={[0.08 * muscleScale, 0.25, 0.04]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.93)} roughness={0.6} />
          </mesh>
          <mesh position={[0.12, 0.55, 0.06]} castShadow>
            <boxGeometry args={[0.08 * muscleScale, 0.25, 0.04]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.93)} roughness={0.6} />
          </mesh>
        </>
      )}

      {/* Calves */}
      <mesh position={[-0.12, -0.15, -0.02]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06 * muscleScale, 0.07 * muscleScale, 0.4, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.12, -0.15, -0.02]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06 * muscleScale, 0.07 * muscleScale, 0.4, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.12, -0.4, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.04, 0.2]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, -0.4, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.04, 0.2]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} />
      </mesh>

      {/* Height indicator */}
      <Text
        position={[0.5, 0, 0]}
        fontSize={0.08}
        color="#60A5FA"
        anchorX="left"
        anchorY="middle"
      >
        {(settings.height / 100).toFixed(2)}m
      </Text>
    </group>
  )
}

export default function Avatar3D({ settings, lighting, preset }: Avatar3DProps) {
  const [webglSupported, setWebglSupported] = useState(true)
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebglSupported(false)
        setRenderError('WebGL not supported on this device')
      }
    } catch (e) {
      setWebglSupported(false)
      setRenderError('3D rendering not available')
    }
  }, [])

  // Error boundary for Canvas
  const handleCanvasError = (error: any) => {
    console.error('Canvas rendering error:', error)
    setRenderError('3D rendering failed - using 2D fallback')
    setWebglSupported(false)
  }

  if (!webglSupported || renderError) {
    return <Avatar2DFallback settings={settings} />
  }

  return (
    <div className="w-full h-full">
      <Avatar3DErrorBoundary fallback={<Avatar2DFallback settings={settings} />}>
        <Canvas
          shadows
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          className="bg-gradient-to-b from-slate-800 to-slate-900"
          onCreated={({ gl }) => {
            try {
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            } catch (error) {
              handleCanvasError(error)
            }
          }}
          onError={handleCanvasError}
        >
          {/* Lighting setup */}
          <ambientLight intensity={lighting.ambientIntensity} />
          <directionalLight
            position={lighting.directionalPosition}
            intensity={lighting.directionalIntensity}
            castShadow={lighting.shadows}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {/* Environment and controls */}
          <Environment preset="studio" background={false} environmentIntensity={lighting.environmentIntensity} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1.5}
            maxDistance={8}
            maxPolarAngle={Math.PI / 1.8}
          />
          
          {/* Avatar */}
          <AvatarMesh settings={settings} lighting={lighting} />
          
          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.3}
            scale={5}
            blur={2}
            far={2}
          />
          
          {/* Grid floor */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#1e293b" transparent opacity={0.3} />
          </mesh>
        </Canvas>
      </Avatar3DErrorBoundary>
    </div>
  )
}