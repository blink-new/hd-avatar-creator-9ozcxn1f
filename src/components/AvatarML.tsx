import { useState } from 'react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Brain, Zap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface AvatarMLProps {
  uploadedPhoto: string | null
  settings: any
  onSettingsUpdate: (updates: any) => void
}

interface MLAnalysisResult {
  facialFeatures: {
    eyeSize: number
    noseSize: number
    mouthSize: number
    facialStructure: number
    jawWidth: number
    cheekbones: number
  }
  bodyEstimation: {
    estimatedHeight: number
    bodyType: 'ectomorph' | 'mesomorph' | 'endomorph'
    musclePotential: number
  }
  skinAnalysis: {
    skinTone: number
    undertones: 'warm' | 'cool' | 'neutral'
  }
  confidence: number
}

export default function AvatarML({ uploadedPhoto, settings, onSettingsUpdate }: AvatarMLProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
  const [mlResults, setMlResults] = useState<MLAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzePhoto = async () => {
    if (!uploadedPhoto) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setError(null)

    try {
      // Stage 1: Face Detection
      setAnalysisStage('Detecting facial features...')
      setAnalysisProgress(20)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 2: Facial Analysis
      setAnalysisStage('Analyzing facial structure...')
      setAnalysisProgress(40)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 3: Body Estimation
      setAnalysisStage('Estimating body proportions...')
      setAnalysisProgress(60)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 4: Skin Analysis
      setAnalysisStage('Analyzing skin tone and texture...')
      setAnalysisProgress(80)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 5: Final Processing
      setAnalysisStage('Generating recommendations...')
      setAnalysisProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Simulate ML analysis results
      const results: MLAnalysisResult = {
        facialFeatures: {
          eyeSize: Math.random() * 40 + 30, // 30-70
          noseSize: Math.random() * 40 + 30,
          mouthSize: Math.random() * 40 + 30,
          facialStructure: Math.random() * 60 + 20, // 20-80
          jawWidth: Math.random() * 50 + 25,
          cheekbones: Math.random() * 50 + 25
        },
        bodyEstimation: {
          estimatedHeight: Math.random() * 30 + 165, // 165-195cm
          bodyType: ['ectomorph', 'mesomorph', 'endomorph'][Math.floor(Math.random() * 3)] as any,
          musclePotential: Math.random() * 60 + 20 // 20-80
        },
        skinAnalysis: {
          skinTone: Math.random() * 80 + 10, // 10-90
          undertones: ['warm', 'cool', 'neutral'][Math.floor(Math.random() * 3)] as any
        },
        confidence: Math.random() * 20 + 80 // 80-100%
      }

      setMlResults(results)
      setAnalysisStage('Analysis complete!')

    } catch (err) {
      setError('Failed to analyze photo. Please try again.')
      console.error('ML Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyMLResults = () => {
    if (!mlResults) return

    onSettingsUpdate({
      eyeSize: Math.round(mlResults.facialFeatures.eyeSize),
      noseSize: Math.round(mlResults.facialFeatures.noseSize),
      mouthSize: Math.round(mlResults.facialFeatures.mouthSize),
      facialStructure: Math.round(mlResults.facialFeatures.facialStructure),
      height: Math.round(mlResults.bodyEstimation.estimatedHeight),
      skinTone: Math.round(mlResults.skinAnalysis.skinTone),
      muscle: Math.round(mlResults.bodyEstimation.musclePotential)
    })
  }

  const getBodyTypeDescription = (bodyType: string) => {
    switch (bodyType) {
      case 'ectomorph': return 'Naturally lean, fast metabolism'
      case 'mesomorph': return 'Athletic build, gains muscle easily'
      case 'endomorph': return 'Larger frame, gains weight easily'
      default: return 'Unknown body type'
    }
  }

  const getUndertoneDescription = (undertone: string) => {
    switch (undertone) {
      case 'warm': return 'Golden, yellow, or peach undertones'
      case 'cool': return 'Pink, red, or blue undertones'
      case 'neutral': return 'Balanced undertones'
      default: return 'Unknown undertone'
    }
  }

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <h3 className="font-semibold mb-4 flex items-center">
        <Brain className="w-4 h-4 mr-2 text-purple-400" />
        AI Avatar Analysis
      </h3>

      {!uploadedPhoto && (
        <div className="text-center py-8 text-slate-400">
          <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Upload a photo to enable AI analysis</p>
        </div>
      )}

      {uploadedPhoto && !mlResults && !isAnalyzing && (
        <div className="space-y-4">
          <div className="text-sm text-slate-300 mb-3">
            Our AI will analyze your photo to automatically detect facial features, 
            estimate body proportions, and recommend avatar settings.
          </div>
          <Button 
            onClick={analyzePhoto}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Analyze with AI
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-sm text-slate-300">{analysisStage}</span>
          </div>
          <Progress value={analysisProgress} className="w-full" />
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {mlResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Analysis Complete</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {Math.round(mlResults.confidence)}% confidence
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="font-medium text-slate-200 mb-2">Facial Features</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>Eye Size: {Math.round(mlResults.facialFeatures.eyeSize)}%</div>
                <div>Nose Size: {Math.round(mlResults.facialFeatures.noseSize)}%</div>
                <div>Mouth Size: {Math.round(mlResults.facialFeatures.mouthSize)}%</div>
                <div>Face Structure: {Math.round(mlResults.facialFeatures.facialStructure)}%</div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="font-medium text-slate-200 mb-2">Body Analysis</h4>
              <div className="space-y-1 text-xs text-slate-300">
                <div>Est. Height: {Math.round(mlResults.bodyEstimation.estimatedHeight)}cm</div>
                <div>Body Type: <span className="capitalize">{mlResults.bodyEstimation.bodyType}</span></div>
                <div className="text-xs text-slate-400">
                  {getBodyTypeDescription(mlResults.bodyEstimation.bodyType)}
                </div>
                <div>Muscle Potential: {Math.round(mlResults.bodyEstimation.musclePotential)}%</div>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-3">
              <h4 className="font-medium text-slate-200 mb-2">Skin Analysis</h4>
              <div className="space-y-1 text-xs text-slate-300">
                <div>Skin Tone: {Math.round(mlResults.skinAnalysis.skinTone)}%</div>
                <div>Undertones: <span className="capitalize">{mlResults.skinAnalysis.undertones}</span></div>
                <div className="text-xs text-slate-400">
                  {getUndertoneDescription(mlResults.skinAnalysis.undertones)}
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={applyMLResults}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Apply AI Recommendations
          </Button>
        </div>
      )}
    </Card>
  )
}