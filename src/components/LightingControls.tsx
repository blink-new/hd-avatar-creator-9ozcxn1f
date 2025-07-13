import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { 
  Lightbulb, 
  Sun, 
  Moon, 
  Palette, 
  Settings,
  RotateCcw,
  Eye,
  Zap,
  Camera
} from 'lucide-react'

interface LightingControlsProps {
  lighting: {
    ambientIntensity: number
    directionalIntensity: number
    directionalPosition: [number, number, number]
    environmentIntensity: number
    shadows: boolean
  }
  onLightingChange: (lighting: any) => void
}

interface LightingPreset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  settings: {
    ambientIntensity: number
    directionalIntensity: number
    directionalPosition: [number, number, number]
    environmentIntensity: number
    shadows: boolean
  }
  category: 'studio' | 'natural' | 'dramatic' | 'soft'
}

const lightingPresets: LightingPreset[] = [
  {
    id: 'studio-professional',
    name: 'Studio Professional',
    description: 'Balanced lighting for professional photos',
    icon: <Camera className="w-4 h-4" />,
    category: 'studio',
    settings: {
      ambientIntensity: 0.4,
      directionalIntensity: 1.2,
      directionalPosition: [2, 4, 2],
      environmentIntensity: 0.8,
      shadows: true
    }
  },
  {
    id: 'portrait-soft',
    name: 'Soft Portrait',
    description: 'Gentle lighting for portraits',
    icon: <Eye className="w-4 h-4" />,
    category: 'soft',
    settings: {
      ambientIntensity: 0.6,
      directionalIntensity: 0.8,
      directionalPosition: [1, 3, 1],
      environmentIntensity: 1.0,
      shadows: false
    }
  },
  {
    id: 'dramatic-contrast',
    name: 'Dramatic Contrast',
    description: 'High contrast for artistic effect',
    icon: <Zap className="w-4 h-4" />,
    category: 'dramatic',
    settings: {
      ambientIntensity: 0.1,
      directionalIntensity: 2.0,
      directionalPosition: [3, 2, 1],
      environmentIntensity: 0.3,
      shadows: true
    }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm, natural outdoor lighting',
    icon: <Sun className="w-4 h-4" />,
    category: 'natural',
    settings: {
      ambientIntensity: 0.5,
      directionalIntensity: 1.5,
      directionalPosition: [-2, 2, 3],
      environmentIntensity: 1.2,
      shadows: true
    }
  },
  {
    id: 'moonlight',
    name: 'Moonlight',
    description: 'Cool, mysterious night lighting',
    icon: <Moon className="w-4 h-4" />,
    category: 'dramatic',
    settings: {
      ambientIntensity: 0.2,
      directionalIntensity: 0.8,
      directionalPosition: [0, 5, -2],
      environmentIntensity: 0.4,
      shadows: true
    }
  },
  {
    id: 'bright-clean',
    name: 'Bright & Clean',
    description: 'Even, bright lighting',
    icon: <Lightbulb className="w-4 h-4" />,
    category: 'studio',
    settings: {
      ambientIntensity: 0.8,
      directionalIntensity: 1.0,
      directionalPosition: [0, 4, 2],
      environmentIntensity: 1.0,
      shadows: false
    }
  }
]

export default function LightingControls({ lighting, onLightingChange }: LightingControlsProps) {
  const [activeTab, setActiveTab] = useState('presets')

  const updateLighting = (key: string, value: any) => {
    onLightingChange({
      ...lighting,
      [key]: value
    })
  }

  const updateDirectionalPosition = (axis: number, value: number) => {
    const newPosition = [...lighting.directionalPosition] as [number, number, number]
    newPosition[axis] = value
    updateLighting('directionalPosition', newPosition)
  }

  const applyPreset = (preset: LightingPreset) => {
    onLightingChange(preset.settings)
  }

  const resetToDefaults = () => {
    onLightingChange({
      ambientIntensity: 0.5,
      directionalIntensity: 1.0,
      directionalPosition: [2, 4, 2],
      environmentIntensity: 0.8,
      shadows: true
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'studio': return 'bg-blue-500'
      case 'natural': return 'bg-green-500'
      case 'dramatic': return 'bg-purple-500'
      case 'soft': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
          Advanced Lighting
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetToDefaults}
          className="border-slate-600"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="presets" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="manual" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-3 mt-4">
          <div className="space-y-2">
            {lightingPresets.map((preset) => (
              <div 
                key={preset.id}
                className="border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-colors cursor-pointer"
                onClick={() => applyPreset(preset)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">{preset.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm text-slate-200">{preset.name}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-0 ${getCategoryColor(preset.category)} text-white`}
                        >
                          {preset.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{preset.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick preview of settings */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>Ambient: {(preset.settings.ambientIntensity * 100).toFixed(0)}%</div>
                  <div>Main: {(preset.settings.directionalIntensity * 100).toFixed(0)}%</div>
                  <div>Environment: {(preset.settings.environmentIntensity * 100).toFixed(0)}%</div>
                  <div>Shadows: {preset.settings.shadows ? 'On' : 'Off'}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 mt-4">
          {/* Ambient Light */}
          <div className="space-y-2">
            <Label className="text-sm">Ambient Light: {Math.round(lighting.ambientIntensity * 100)}%</Label>
            <Slider
              value={[lighting.ambientIntensity * 100]}
              onValueChange={(value) => updateLighting('ambientIntensity', value[0] / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-slate-400">Overall scene brightness</div>
          </div>

          {/* Directional Light Intensity */}
          <div className="space-y-2">
            <Label className="text-sm">Main Light: {Math.round(lighting.directionalIntensity * 100)}%</Label>
            <Slider
              value={[lighting.directionalIntensity * 100]}
              onValueChange={(value) => updateLighting('directionalIntensity', value[0] / 100)}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-slate-400">Primary directional light strength</div>
          </div>

          {/* Environment Intensity */}
          <div className="space-y-2">
            <Label className="text-sm">Environment: {Math.round(lighting.environmentIntensity * 100)}%</Label>
            <Slider
              value={[lighting.environmentIntensity * 100]}
              onValueChange={(value) => updateLighting('environmentIntensity', value[0] / 100)}
              min={0}
              max={150}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-slate-400">Environmental lighting contribution</div>
          </div>

          {/* Light Position */}
          <div className="space-y-3">
            <Label className="text-sm">Light Position</Label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">X (Left/Right)</span>
                <span className="text-xs text-slate-300">{lighting.directionalPosition[0].toFixed(1)}</span>
              </div>
              <Slider
                value={[lighting.directionalPosition[0]]}
                onValueChange={(value) => updateDirectionalPosition(0, value[0])}
                min={-5}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Y (Up/Down)</span>
                <span className="text-xs text-slate-300">{lighting.directionalPosition[1].toFixed(1)}</span>
              </div>
              <Slider
                value={[lighting.directionalPosition[1]]}
                onValueChange={(value) => updateDirectionalPosition(1, value[0])}
                min={0}
                max={8}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Z (Front/Back)</span>
                <span className="text-xs text-slate-300">{lighting.directionalPosition[2].toFixed(1)}</span>
              </div>
              <Slider
                value={[lighting.directionalPosition[2]]}
                onValueChange={(value) => updateDirectionalPosition(2, value[0])}
                min={-5}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Shadows Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-sm">Cast Shadows</Label>
              <div className="text-xs text-slate-400">Enable realistic shadow casting</div>
            </div>
            <Switch
              checked={lighting.shadows}
              onCheckedChange={(checked) => updateLighting('shadows', checked)}
            />
          </div>

          {/* Current Settings Summary */}
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Current Setup</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400">Intensity:</div>
                <div className="text-slate-300">Ambient: {Math.round(lighting.ambientIntensity * 100)}%</div>
                <div className="text-slate-300">Main: {Math.round(lighting.directionalIntensity * 100)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400">Effects:</div>
                <div className="text-slate-300">Environment: {Math.round(lighting.environmentIntensity * 100)}%</div>
                <div className="text-slate-300">Shadows: {lighting.shadows ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}