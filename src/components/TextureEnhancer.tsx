import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { 
  Sparkles, 
  Zap, 
  Download, 
  Palette, 
  Layers,
  Eye,
  Loader2
} from 'lucide-react'

interface TextureEnhancerProps {
  settings: {
    muscle: number
    bodyFat: number
    skinTone: number
    gender: 'male' | 'female' | 'non-binary'
  }
  onTextureGenerated: (textureUrl: string) => void
}

export default function TextureEnhancer({ settings, onTextureGenerated }: TextureEnhancerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [textureQuality, setTextureQuality] = useState(1024)
  const [muscleIntensity, setMuscleIntensity] = useState(50)
  const [skinDetail, setSkinDetail] = useState(70)
  const [vascularization, setVascularization] = useState(30)
  const [generatedTexture, setGeneratedTexture] = useState<string | null>(null)

  // Generate procedural muscle and skin texture
  const generateEnhancedTexture = async () => {
    setIsGenerating(true)
    
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size based on quality
      canvas.width = textureQuality
      canvas.height = textureQuality

      // Base skin color calculation
      const skinHue = (settings.skinTone / 100) * 30 // 0-30 degrees
      const skinSat = 40 + (settings.skinTone / 100) * 30 // 40-70%
      const skinLight = 50 + (settings.skinTone / 100) * 30 // 50-80%

      // Create base skin texture
      const imageData = ctx.createImageData(textureQuality, textureQuality)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % textureQuality
        const y = Math.floor((i / 4) / textureQuality)
        
        // Normalize coordinates
        const nx = x / textureQuality
        const ny = y / textureQuality

        // Base skin color
        const hsl = hslToRgb(skinHue / 360, skinSat / 100, skinLight / 100)
        
        // Add skin texture noise
        const noise = (Math.random() - 0.5) * (skinDetail / 100) * 20
        
        // Muscle definition areas (based on anatomy)
        let muscleDefinition = 0
        if (settings.muscle > 30) {
          // Chest area
          if (ny > 0.3 && ny < 0.6 && Math.abs(nx - 0.5) < 0.2) {
            muscleDefinition = (settings.muscle / 100) * (muscleIntensity / 100) * 30
          }
          // Abs area
          if (ny > 0.5 && ny < 0.8 && Math.abs(nx - 0.5) < 0.15) {
            muscleDefinition = (settings.muscle / 100) * (muscleIntensity / 100) * 25
          }
          // Arms area
          if ((nx < 0.2 || nx > 0.8) && ny > 0.2 && ny < 0.7) {
            muscleDefinition = (settings.muscle / 100) * (muscleIntensity / 100) * 20
          }
        }

        // Vascular details for high muscle definition
        let vascularDetail = 0
        if (settings.muscle > 60 && settings.bodyFat < 15) {
          const veinPattern = Math.sin(nx * 20) * Math.cos(ny * 15) * 0.5 + 0.5
          if (veinPattern > 0.8) {
            vascularDetail = (vascularization / 100) * 15
          }
        }

        // Body fat softening effect
        const fatSoftening = (settings.bodyFat / 100) * 10

        // Apply all effects
        const finalR = Math.max(0, Math.min(255, hsl[0] + noise - muscleDefinition - vascularDetail + fatSoftening))
        const finalG = Math.max(0, Math.min(255, hsl[1] + noise - muscleDefinition - vascularDetail + fatSoftening))
        const finalB = Math.max(0, Math.min(255, hsl[2] + noise - muscleDefinition - vascularDetail + fatSoftening))

        data[i] = finalR     // Red
        data[i + 1] = finalG // Green
        data[i + 2] = finalB // Blue
        data[i + 3] = 255    // Alpha
      }

      ctx.putImageData(imageData, 0, 0)

      // Add additional muscle highlights with gradients
      if (settings.muscle > 40) {
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = (settings.muscle / 100) * 0.3

        // Chest highlights
        const chestGradient = ctx.createRadialGradient(
          textureQuality * 0.3, textureQuality * 0.4, 0,
          textureQuality * 0.3, textureQuality * 0.4, textureQuality * 0.15
        )
        chestGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        chestGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = chestGradient
        ctx.fillRect(0, 0, textureQuality, textureQuality)

        // Mirror for right side
        const chestGradient2 = ctx.createRadialGradient(
          textureQuality * 0.7, textureQuality * 0.4, 0,
          textureQuality * 0.7, textureQuality * 0.4, textureQuality * 0.15
        )
        chestGradient2.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        chestGradient2.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = chestGradient2
        ctx.fillRect(0, 0, textureQuality, textureQuality)

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }

      // Convert canvas to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setGeneratedTexture(url)
          onTextureGenerated(url)
        }
      }, 'image/png')

      // Simulate processing time for realism
      await new Promise(resolve => setTimeout(resolve, 1500))

    } catch (error) {
      console.error('Texture generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // HSL to RGB conversion helper
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  // Auto-generate when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateEnhancedTexture()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [settings.muscle, settings.bodyFat, settings.skinTone, muscleIntensity, skinDetail, vascularization])

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            HD Texture Enhancement
          </h3>
          <div className="flex space-x-2">
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              <Layers className="w-3 h-3 mr-1" />
              {textureQuality}px
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          </div>
        </div>

        {/* Texture Quality */}
        <div className="space-y-2">
          <Label>Texture Quality</Label>
          <div className="grid grid-cols-3 gap-2">
            {[512, 1024, 2048].map((quality) => (
              <Button
                key={quality}
                variant={textureQuality === quality ? "default" : "outline"}
                size="sm"
                onClick={() => setTextureQuality(quality)}
                className="text-xs"
              >
                {quality}px
              </Button>
            ))}
          </div>
        </div>

        {/* Enhancement Controls */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Muscle Intensity: {muscleIntensity}%</Label>
            <Slider
              value={[muscleIntensity]}
              onValueChange={(value) => setMuscleIntensity(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Skin Detail: {skinDetail}%</Label>
            <Slider
              value={[skinDetail]}
              onValueChange={(value) => setSkinDetail(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {settings.muscle > 60 && (
            <div className="space-y-2">
              <Label>Vascularization: {vascularization}%</Label>
              <Slider
                value={[vascularization]}
                onValueChange={(value) => setVascularization(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Generation Status */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={generateEnhancedTexture}
            disabled={isGenerating}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Texture'}
          </Button>

          {generatedTexture && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const link = document.createElement('a')
                link.href = generatedTexture
                link.download = `avatar-texture-${textureQuality}px.png`
                link.click()
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>

        {/* Preview */}
        {generatedTexture && (
          <div className="space-y-2">
            <Label className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Texture Preview
            </Label>
            <div className="relative">
              <img 
                src={generatedTexture} 
                alt="Generated texture" 
                className="w-full h-32 object-cover rounded-lg border-2 border-blue-500"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/20 border-green-500 text-green-400">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for texture generation */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
          width={textureQuality}
          height={textureQuality}
        />
      </div>
    </Card>
  )
}