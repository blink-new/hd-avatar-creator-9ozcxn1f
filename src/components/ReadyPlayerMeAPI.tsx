import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  User,
  Download,
  RefreshCw,
  Save
} from 'lucide-react'
import { blink } from '../blink/client'
import toast from 'react-hot-toast'

interface ReadyPlayerMeAPIProps {
  settings: {
    gender: 'male' | 'female' | 'non-binary'
    height: number
    muscle: number
    bodyFat: number
    skinTone: number
  }
  uploadedPhoto?: string | null
  onAvatarGenerated: (avatarUrl: string, avatarId: string) => void
}

interface AvatarGenerationStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  description: string
}

export default function ReadyPlayerMeAPI({ settings, uploadedPhoto, onAvatarGenerated }: ReadyPlayerMeAPIProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [steps, setSteps] = useState<AvatarGenerationStep[]>([
    {
      id: 'init',
      name: 'Initialize Avatar',
      status: 'pending',
      description: 'Setting up base avatar template'
    },
    {
      id: 'photo',
      name: 'Process Photo',
      status: 'pending',
      description: 'Analyzing facial features from uploaded photo'
    },
    {
      id: 'customize',
      name: 'Apply Customization',
      status: 'pending',
      description: 'Applying body and facial customizations'
    },
    {
      id: 'enhance',
      name: 'HD Enhancement',
      status: 'pending',
      description: 'Applying muscle definition and HD textures'
    },
    {
      id: 'finalize',
      name: 'Finalize Avatar',
      status: 'pending',
      description: 'Generating final high-quality model'
    }
  ])

  const updateStepStatus = (stepId: string, status: AvatarGenerationStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const generateAvatar = async () => {
    setIsGenerating(true)
    setError(null)
    setCurrentStep(0)
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))

    try {
      // Step 1: Initialize Avatar
      updateStepStatus('init', 'processing')
      setCurrentStep(0)
      
      // Simulate Ready Player Me API call for avatar creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Select base template based on gender and body type
      const getBaseTemplate = () => {
        if (settings.gender === 'female') {
          return settings.muscle > 60 ? 'athletic-female-v2' : 'slim-female-v2'
        } else if (settings.gender === 'male') {
          return settings.muscle > 60 ? 'muscular-male-v2' : 'athletic-male-v2'
        } else {
          return 'athletic-unisex-v2'
        }
      }

      const baseTemplate = getBaseTemplate()
      updateStepStatus('init', 'completed')

      // Step 2: Process Photo (if uploaded)
      updateStepStatus('photo', 'processing')
      setCurrentStep(1)
      
      let faceAnalysis = null
      if (uploadedPhoto) {
        // Simulate AI face analysis
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // In a real implementation, you would:
        // 1. Upload photo to Ready Player Me
        // 2. Get facial feature analysis
        // 3. Apply facial mapping
        
        faceAnalysis = {
          faceShape: 'oval',
          eyeSize: 'medium',
          noseSize: 'medium',
          mouthSize: 'medium',
          confidence: 0.92
        }
      }
      updateStepStatus('photo', 'completed')

      // Step 3: Apply Customization
      updateStepStatus('customize', 'processing')
      setCurrentStep(2)
      
      // Simulate customization application
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Build customization parameters
      const customizationParams = {
        height: settings.height,
        muscle: settings.muscle,
        bodyFat: settings.bodyFat,
        skinTone: settings.skinTone,
        gender: settings.gender,
        faceAnalysis
      }
      
      updateStepStatus('customize', 'completed')

      // Step 4: HD Enhancement
      updateStepStatus('enhance', 'processing')
      setCurrentStep(3)
      
      // Simulate HD texture generation and muscle enhancement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Apply muscle definition enhancements
      const muscleEnhancements = {
        chestDefinition: settings.muscle > 40 ? 'high' : 'medium',
        abDefinition: settings.muscle > 50 && settings.bodyFat < 20 ? 'visible' : 'subtle',
        armDefinition: settings.muscle > 30 ? 'toned' : 'normal',
        legDefinition: settings.muscle > 35 ? 'athletic' : 'normal'
      }
      
      updateStepStatus('enhance', 'completed')

      // Step 5: Finalize Avatar
      updateStepStatus('finalize', 'processing')
      setCurrentStep(4)
      
      // Simulate final avatar generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate final avatar URL (in production, this would be from Ready Player Me API)
      const generatedAvatarId = `rpm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const generatedAvatarUrl = `https://models.readyplayer.me/${generatedAvatarId}.glb?quality=high&textureAtlas=2048&morphTargets=ARKit&pose=A&muscleDefinition=${settings.muscle}&bodyFat=${settings.bodyFat}`
      
      setAvatarId(generatedAvatarId)
      setAvatarUrl(generatedAvatarUrl)
      
      updateStepStatus('finalize', 'completed')
      
      // Save to database
      try {
        const user = await blink.auth.me()
        if (user?.id) {
          await blink.db.enhancedAvatars.create({
            id: generatedAvatarId,
            userId: user.id,
            name: `Avatar ${new Date().toLocaleDateString()}`,
            readyPlayerMeId: generatedAvatarId,
            readyPlayerMeUrl: generatedAvatarUrl,
            settings: JSON.stringify(customizationParams),
            muscleDefinition: settings.muscle,
            bodyFatPercentage: settings.bodyFat,
            heightCm: settings.height,
            skinTone: settings.skinTone,
            gender: settings.gender,
            qualityLevel: 'HD',
            generationStatus: 'completed'
          })
          
          toast.success('Avatar saved to your collection!')
        }
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Don't fail the whole process if DB save fails
        toast.error('Avatar generated but failed to save to collection')
      }
      
      // Notify parent component
      onAvatarGenerated(generatedAvatarUrl, generatedAvatarId)
      
    } catch (err) {
      console.error('Avatar generation error:', err)
      setError('Failed to generate avatar. Please try again.')
      
      // Mark current step as error
      if (currentStep < steps.length) {
        updateStepStatus(steps[currentStep].id, 'error')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate when significant settings change
  useEffect(() => {
    if (!isGenerating) {
      const timer = setTimeout(() => {
        generateAvatar()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [settings.gender, settings.muscle, settings.bodyFat])

  const getStepIcon = (status: AvatarGenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
    }
  }

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center">
            <User className="w-4 h-4 mr-2" />
            Ready Player Me Integration
          </h3>
          <div className="flex space-x-2">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            {avatarId && (
              <Badge className="bg-green-500/20 border-green-500 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Generated
              </Badge>
            )}
          </div>
        </div>

        {/* Generation Progress */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                index === currentStep && isGenerating 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-slate-800/50'
              }`}
            >
              {getStepIcon(step.status)}
              <div className="flex-1">
                <div className="font-medium text-sm">{step.name}</div>
                <div className="text-xs text-slate-400">{step.description}</div>
              </div>
              {step.status === 'processing' && (
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  Processing...
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Avatar Info */}
        {avatarId && avatarUrl && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-400 font-medium">Avatar Generated Successfully!</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-xs text-slate-400">
                Avatar ID: {avatarId}
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(avatarUrl)
                  }}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Copy URL
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(avatarUrl, '_blank')}
                  className="text-xs"
                >
                  <User className="w-3 h-3 mr-1" />
                  View Model
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-2">
          <Button 
            onClick={generateAvatar}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating Avatar...' : 'Generate New Avatar'}
          </Button>
        </div>

        {/* Photo Upload Reminder */}
        {!uploadedPhoto && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm">
                Upload a photo for facial feature mapping to get better results!
              </span>
            </div>
          </div>
        )}

        {/* Settings Summary */}
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Current Settings:</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Gender: {settings.gender}</div>
            <div>Height: {(settings.height / 100).toFixed(2)}m</div>
            <div>Muscle: {settings.muscle}%</div>
            <div>Body Fat: {settings.bodyFat}%</div>
          </div>
        </div>
      </div>
    </Card>
  )
}