import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Text, useGLTF } from '@react-three/drei'
import { Mesh, Group, DirectionalLight, AmbientLight } from 'three'
import * as THREE from 'three'

interface ImprovedAvatar3DProps {
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
  customModelUrl?: string | null
}

// Custom GLB Model Component
function CustomGLBModel({ url, settings }: { url: string; settings: any }) {
  const [modelError, setModelError] = useState(false)
  const modelRef = useRef<THREE.Group>(null)

  let scene: THREE.Group | null = null
  
  try {
    const gltf = useGLTF(url)
    scene = gltf.scene.clone()
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

      // Apply customizations to the GLB model
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Skin tone adjustments
              if (mat.name?.toLowerCase().includes('skin') || 
                  mat.name?.toLowerCase().includes('body') ||
                  mat.name?.toLowerCase().includes('face')) {
                const skinHue = (settings.skinTone / 100) * 0.15
                const skinSaturation = 0.3 + (settings.skinTone / 100) * 0.4
                const skinLightness = 0.4 + (settings.skinTone / 100) * 0.4
                mat.color.setHSL(skinHue, skinSaturation, skinLightness)
              }
              
              // Hair color adjustments
              if (mat.name?.toLowerCase().includes('hair')) {
                const hairHue = (settings.hairColor / 100) * 0.8
                mat.color.setHSL(hairHue, 0.8, 0.3)
              }
              
              // Muscle definition through normal map intensity
              if (settings.muscle > 50) {
                mat.normalScale?.setScalar(1 + (settings.muscle - 50) * 0.01)
              }
            }
          })
        }
      })
    }
  }, [scene, settings, modelError])

  if (modelError || !scene) {
    return null
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

// Improved realistic avatar using smoother geometry
function RealisticAvatarMesh({ settings, lighting }: ImprovedAvatar3DProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useThree()

  // Animate the avatar
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  // Calculate body proportions based on settings
  const heightScale = settings.height / 180
  const muscleScale = 1 + (settings.muscle - 50) * 0.004
  const bodyFatScale = 1 + (settings.bodyFat - 20) * 0.003
  const shoulderScale = 1 + (settings.shoulderWidth - 50) * 0.003
  const waistScale = 1 + (settings.waistSize - 50) * 0.002

  // Skin tone calculation
  const skinHue = (settings.skinTone / 100) * 0.15
  const skinSaturation = 0.3 + (settings.skinTone / 100) * 0.4
  const skinLightness = 0.4 + (settings.skinTone / 100) * 0.4
  const skinColor = new THREE.Color().setHSL(skinHue, skinSaturation, skinLightness)

  // Hair color calculation
  const hairHue = (settings.hairColor / 100) * 0.8
  const hairColor = new THREE.Color().setHSL(hairHue, 0.8, 0.3)

  // Gender-specific proportions
  const genderMultipliers = {
    male: { shoulderBonus: 1.2, waistReduction: 0.9, muscle: 1.1, hipReduction: 0.9 },
    female: { shoulderBonus: 0.9, waistReduction: 0.7, muscle: 0.8, hipReduction: 1.1 },
    'non-binary': { shoulderBonus: 1.0, waistReduction: 0.8, muscle: 0.95, hipReduction: 1.0 }
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
      {/* Head - More realistic proportions */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.11 * (1 + settings.facialStructure * 0.002), 32, 32]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.7} 
          metalness={0.05}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>

      {/* Eyes - More detailed */}
      <group position={[0, 1.63, 0.08]}>
        {/* Eye sockets */}
        <mesh position={[-0.035, 0, 0]} castShadow>
          <sphereGeometry args={[0.015 * (1 + settings.eyeSize * 0.002), 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.035, 0, 0]} castShadow>
          <sphereGeometry args={[0.015 * (1 + settings.eyeSize * 0.002), 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.035, 0, 0.01]} castShadow>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.035, 0, 0.01]} castShadow>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>

      {/* Nose - More realistic shape */}
      <mesh position={[0, 1.58, 0.09]} castShadow>
        <coneGeometry args={[0.015 * (1 + settings.noseSize * 0.002), 0.03, 8]} />
        <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.98)} roughness={0.8} />
      </mesh>

      {/* Mouth - More detailed */}
      <mesh position={[0, 1.54, 0.08]} castShadow>
        <sphereGeometry args={[0.025 * (1 + settings.mouthSize * 0.002), 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#8B2635" roughness={0.3} />
      </mesh>

      {/* Hair - More varied styles */}
      {settings.hairStyle === 1 && (
        <mesh position={[0, 1.72, -0.01]} castShadow>
          <sphereGeometry args={[0.12, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      )}
      {settings.hairStyle === 2 && (
        <mesh position={[0, 1.75, -0.02]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
      )}
      {settings.hairStyle === 3 && (
        <mesh position={[0, 1.78, 0]} castShadow>
          <sphereGeometry args={[0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} />
        </mesh>
      )}
      {settings.hairStyle === 4 && (
        <mesh position={[0, 1.7, 0]} castShadow>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color={hairColor} roughness={0.95} />
        </mesh>
      )}

      {/* Neck - More realistic */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.12, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Torso - More anatomically correct */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <sphereGeometry args={[
          0.18 * shoulderScale * muscleScale * bodyFatScale * genderMods.shoulderBonus, 
          0.32, 
          0.12 * muscleScale * bodyFatScale
        ], 16, 16, 0, Math.PI * 2, 0, Math.PI} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.6} 
          metalness={0.05}
          normalScale={new THREE.Vector2(0.3, 0.3)}
        />
      </mesh>

      {/* Chest definition for muscular builds */}
      {settings.muscle > 30 && (
        <>
          <mesh position={[-0.07, 1.25, 0.08]} castShadow>
            <sphereGeometry args={[0.05 * muscleScale * genderMods.muscle, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.96)} roughness={0.5} />
          </mesh>
          <mesh position={[0.07, 1.25, 0.08]} castShadow>
            <sphereGeometry args={[0.05 * muscleScale * genderMods.muscle, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.96)} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Abdominal definition */}
      {settings.muscle > 40 && settings.bodyFat < 25 && (
        <group position={[0, 1.0, 0.09]}>
          {[0, -0.08, -0.16].map((yOffset, index) => (
            <mesh key={index} position={[0, yOffset, 0]} castShadow>
              <sphereGeometry args={[0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.94)} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {/* Waist/Hips - Gender-specific shaping */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <sphereGeometry args={[
          0.14 * waistScale * bodyFatScale * genderMods.waistReduction, 
          0.16 * bodyFatScale * genderMods.hipReduction, 
          0.10 * bodyFatScale
        ], 16, 16} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Arms - More realistic with joints */}
      {/* Upper arms */}
      <mesh position={[-0.22 * shoulderScale * genderMods.shoulderBonus, 1.15, 0]} rotation={[0, 0, 0.15]} castShadow receiveShadow>
        <capsuleGeometry args={[0.04 * muscleScale, 0.25, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.22 * shoulderScale * genderMods.shoulderBonus, 1.15, 0]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
        <capsuleGeometry args={[0.04 * muscleScale, 0.25, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Biceps for muscular builds */}
      {settings.muscle > 50 && (
        <>
          <mesh position={[-0.22 * shoulderScale * genderMods.shoulderBonus, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.035 * muscleScale * genderMods.muscle, 12, 12]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.95)} roughness={0.5} />
          </mesh>
          <mesh position={[0.22 * shoulderScale * genderMods.shoulderBonus, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.035 * muscleScale * genderMods.muscle, 12, 12]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.95)} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Forearms */}
      <mesh position={[-0.28 * shoulderScale * genderMods.shoulderBonus, 0.85, 0]} rotation={[0, 0, 0.25]} castShadow receiveShadow>
        <capsuleGeometry args={[0.035 * muscleScale, 0.22, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.28 * shoulderScale * genderMods.shoulderBonus, 0.85, 0]} rotation={[0, 0, -0.25]} castShadow receiveShadow>
        <capsuleGeometry args={[0.035 * muscleScale, 0.22, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.32 * shoulderScale * genderMods.shoulderBonus, 0.65, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.32 * shoulderScale * genderMods.shoulderBonus, 0.65, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Legs - More realistic with proper joints */}
      {/* Thighs */}
      <mesh position={[-0.11, 0.4, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06 * muscleScale, 0.35, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.11, 0.4, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06 * muscleScale, 0.35, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Quadriceps definition */}
      {settings.muscle > 45 && (
        <>
          <mesh position={[-0.11, 0.5, 0.05]} castShadow>
            <sphereGeometry args={[0.04 * muscleScale, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.94)} roughness={0.5} />
          </mesh>
          <mesh position={[0.11, 0.5, 0.05]} castShadow>
            <sphereGeometry args={[0.04 * muscleScale, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color={skinColor.clone().multiplyScalar(0.94)} roughness={0.5} />
          </mesh>
        </>
      )}

      {/* Calves */}
      <mesh position={[-0.11, 0.05, -0.01]} castShadow receiveShadow>
        <capsuleGeometry args={[0.045 * muscleScale, 0.25, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.11, 0.05, -0.01]} castShadow receiveShadow>
        <capsuleGeometry args={[0.045 * muscleScale, 0.25, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.11, -0.15, 0.04]} castShadow receiveShadow>
        <sphereGeometry args={[0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.11, -0.15, 0.04]} castShadow receiveShadow>
        <sphereGeometry args={[0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Height indicator */}
      <Text
        position={[0.4, 0, 0]}
        fontSize={0.06}
        color="#60A5FA"
        anchorX="left"
        anchorY="middle"
      >
        {(settings.height / 100).toFixed(2)}m
      </Text>
    </group>
  )
}

// Error boundary component
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

// 2D Fallback component
function Avatar2DFallback({ settings }: { settings: ImprovedAvatar3DProps['settings'] }) {
  const heightScale = settings.height / 180
  const muscleScale = 1 + (settings.muscle - 50) * 0.004
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg relative">
      <div className="text-center">
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
      </div>
    </div>
  )
}

export default function ImprovedAvatar3D({ settings, lighting, customModelUrl }: ImprovedAvatar3DProps) {
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
              gl.shadowMap.enabled = true
              gl.shadowMap.type = THREE.PCFSoftShadowMap
            } catch (error) {
              handleCanvasError(error)
            }
          }}
          onError={handleCanvasError}
        >
          {/* Enhanced lighting setup */}
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
          
          {/* Fill light for better illumination */}
          <directionalLight
            position={[-2, 2, 2]}
            intensity={lighting.directionalIntensity * 0.3}
            color="#ffffff"
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
            dampingFactor={0.05}
            enableDamping={true}
          />
          
          {/* Avatar - Use custom GLB model if available, otherwise use improved avatar */}
          <Suspense fallback={null}>
            {customModelUrl ? (
              <CustomGLBModel url={customModelUrl} settings={settings} />
            ) : (
              <RealisticAvatarMesh settings={settings} lighting={lighting} />
            )}
          </Suspense>
          
          {/* Enhanced ground shadow */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={6}
            blur={2.5}
            far={3}
            color="#000000"
          />
          
          {/* Grid floor with better material */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial 
              color="#1e293b" 
              transparent 
              opacity={0.2}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </Canvas>
      </Avatar3DErrorBoundary>
    </div>
  )
}