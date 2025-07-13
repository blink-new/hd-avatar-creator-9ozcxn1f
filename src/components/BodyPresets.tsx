import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { 
  Users, 
  Zap, 
  Star, 
  Crown,
  User,
  UserCheck,
  UserX,
  Dumbbell,
  Heart,
  Target
} from 'lucide-react'

interface BodyPresetsProps {
  currentSettings: any
  onApplyPreset: (preset: any) => void
}

interface BodyPreset {
  id: string
  name: string
  description: string
  category: 'athletic' | 'casual' | 'professional' | 'fantasy'
  gender: 'male' | 'female' | 'non-binary' | 'all'
  settings: {
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
  popularity: number
  icon: React.ReactNode
  tags: string[]
}

const bodyPresets: BodyPreset[] = [
  // Athletic Presets
  {
    id: 'bodybuilder-male',
    name: 'Bodybuilder',
    description: 'Massive muscle definition, low body fat',
    category: 'athletic',
    gender: 'male',
    settings: {
      height: 185,
      muscle: 95,
      bodyFat: 8,
      shoulderWidth: 85,
      waistSize: 35,
      skinTone: 45,
      facialStructure: 70,
      eyeSize: 50,
      noseSize: 55,
      mouthSize: 50,
      hairStyle: 2,
      hairColor: 30
    },
    popularity: 95,
    icon: <Dumbbell className="w-4 h-4" />,
    tags: ['Strong', 'Muscular', 'Athletic']
  },
  {
    id: 'fitness-female',
    name: 'Fitness Model',
    description: 'Toned and athletic female physique',
    category: 'athletic',
    gender: 'female',
    settings: {
      height: 170,
      muscle: 75,
      bodyFat: 15,
      shoulderWidth: 45,
      waistSize: 30,
      skinTone: 55,
      facialStructure: 60,
      eyeSize: 65,
      noseSize: 45,
      mouthSize: 55,
      hairStyle: 3,
      hairColor: 60
    },
    popularity: 88,
    icon: <Heart className="w-4 h-4" />,
    tags: ['Fit', 'Toned', 'Healthy']
  },
  {
    id: 'swimmer-male',
    name: 'Swimmer',
    description: 'Lean muscle, broad shoulders',
    category: 'athletic',
    gender: 'male',
    settings: {
      height: 190,
      muscle: 70,
      bodyFat: 12,
      shoulderWidth: 80,
      waistSize: 40,
      skinTone: 50,
      facialStructure: 55,
      eyeSize: 50,
      noseSize: 50,
      mouthSize: 50,
      hairStyle: 1,
      hairColor: 45
    },
    popularity: 76,
    icon: <Target className="w-4 h-4" />,
    tags: ['Lean', 'Tall', 'Athletic']
  },
  {
    id: 'crossfit-female',
    name: 'CrossFit Athlete',
    description: 'Strong, functional muscle build',
    category: 'athletic',
    gender: 'female',
    settings: {
      height: 165,
      muscle: 85,
      bodyFat: 18,
      shoulderWidth: 55,
      waistSize: 35,
      skinTone: 40,
      facialStructure: 65,
      eyeSize: 55,
      noseSize: 50,
      mouthSize: 50,
      hairStyle: 2,
      hairColor: 25
    },
    popularity: 82,
    icon: <Dumbbell className="w-4 h-4" />,
    tags: ['Strong', 'Functional', 'Powerful']
  },

  // Casual Presets
  {
    id: 'average-male',
    name: 'Average Build',
    description: 'Typical male proportions',
    category: 'casual',
    gender: 'male',
    settings: {
      height: 175,
      muscle: 45,
      bodyFat: 22,
      shoulderWidth: 50,
      waistSize: 50,
      skinTone: 50,
      facialStructure: 50,
      eyeSize: 50,
      noseSize: 50,
      mouthSize: 50,
      hairStyle: 2,
      hairColor: 50
    },
    popularity: 92,
    icon: <User className="w-4 h-4" />,
    tags: ['Normal', 'Typical', 'Balanced']
  },
  {
    id: 'curvy-female',
    name: 'Curvy Figure',
    description: 'Feminine curves, hourglass shape',
    category: 'casual',
    gender: 'female',
    settings: {
      height: 168,
      muscle: 35,
      bodyFat: 28,
      shoulderWidth: 40,
      waistSize: 25,
      skinTone: 60,
      facialStructure: 45,
      eyeSize: 60,
      noseSize: 45,
      mouthSize: 55,
      hairStyle: 4,
      hairColor: 70
    },
    popularity: 89,
    icon: <Heart className="w-4 h-4" />,
    tags: ['Curvy', 'Feminine', 'Elegant']
  },
  {
    id: 'slim-male',
    name: 'Slim Build',
    description: 'Lean, ectomorph body type',
    category: 'casual',
    gender: 'male',
    settings: {
      height: 180,
      muscle: 25,
      bodyFat: 15,
      shoulderWidth: 35,
      waistSize: 35,
      skinTone: 45,
      facialStructure: 45,
      eyeSize: 55,
      noseSize: 45,
      mouthSize: 50,
      hairStyle: 1,
      hairColor: 40
    },
    popularity: 75,
    icon: <UserX className="w-4 h-4" />,
    tags: ['Slim', 'Lean', 'Minimal']
  },
  {
    id: 'petite-female',
    name: 'Petite',
    description: 'Small frame, delicate features',
    category: 'casual',
    gender: 'female',
    settings: {
      height: 155,
      muscle: 30,
      bodyFat: 20,
      shoulderWidth: 35,
      waistSize: 35,
      skinTone: 65,
      facialStructure: 40,
      eyeSize: 70,
      noseSize: 40,
      mouthSize: 50,
      hairStyle: 3,
      hairColor: 80
    },
    popularity: 81,
    icon: <Star className="w-4 h-4" />,
    tags: ['Petite', 'Delicate', 'Cute']
  },

  // Professional Presets
  {
    id: 'executive-male',
    name: 'Executive',
    description: 'Professional, well-maintained appearance',
    category: 'professional',
    gender: 'male',
    settings: {
      height: 182,
      muscle: 55,
      bodyFat: 18,
      shoulderWidth: 60,
      waistSize: 45,
      skinTone: 50,
      facialStructure: 60,
      eyeSize: 50,
      noseSize: 50,
      mouthSize: 50,
      hairStyle: 2,
      hairColor: 35
    },
    popularity: 87,
    icon: <Crown className="w-4 h-4" />,
    tags: ['Professional', 'Sophisticated', 'Confident']
  },
  {
    id: 'business-female',
    name: 'Business Professional',
    description: 'Confident, professional woman',
    category: 'professional',
    gender: 'female',
    settings: {
      height: 172,
      muscle: 50,
      bodyFat: 22,
      shoulderWidth: 45,
      waistSize: 40,
      skinTone: 55,
      facialStructure: 55,
      eyeSize: 55,
      noseSize: 50,
      mouthSize: 50,
      hairStyle: 2,
      hairColor: 45
    },
    popularity: 85,
    icon: <UserCheck className="w-4 h-4" />,
    tags: ['Professional', 'Elegant', 'Successful']
  }
]

export default function BodyPresets({ currentSettings, onApplyPreset }: BodyPresetsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedGender, setSelectedGender] = useState<string>('all')

  const filteredPresets = bodyPresets.filter(preset => {
    const categoryMatch = selectedCategory === 'all' || preset.category === selectedCategory
    const genderMatch = selectedGender === 'all' || preset.gender === selectedGender || preset.gender === 'all'
    return categoryMatch && genderMatch
  })

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return 'text-orange-400'
    if (popularity >= 80) return 'text-purple-400'
    if (popularity >= 70) return 'text-blue-400'
    return 'text-slate-400'
  }

  const getPopularityIcon = (popularity: number) => {
    if (popularity >= 90) return <Crown className="w-3 h-3" />
    if (popularity >= 80) return <Star className="w-3 h-3" />
    if (popularity >= 70) return <Zap className="w-3 h-3" />
    return <User className="w-3 h-3" />
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'athletic': return <Dumbbell className="w-3 h-3" />
      case 'casual': return <User className="w-3 h-3" />
      case 'professional': return <Crown className="w-3 h-3" />
      case 'fantasy': return <Star className="w-3 h-3" />
      default: return <Users className="w-3 h-3" />
    }
  }

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <h3 className="font-semibold mb-4 flex items-center">
        <Users className="w-4 h-4 mr-2 text-blue-400" />
        Body Presets
      </h3>

      <div className="space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'athletic', 'casual', 'professional'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs capitalize justify-start"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">{category}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'male', 'female', 'non-binary'].map((gender) => (
                <Button
                  key={gender}
                  variant={selectedGender === gender ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGender(gender)}
                  className="text-xs capitalize"
                >
                  {gender === 'all' ? 'All' : gender}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Presets List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No presets match your filters</p>
            </div>
          ) : (
            filteredPresets.map((preset) => (
              <div 
                key={preset.id}
                className="border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2">
                    <div className="mt-1">{preset.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm text-slate-200">{preset.name}</h4>
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-0 capitalize"
                        >
                          {preset.gender}
                        </Badge>
                        <div className={`flex items-center space-x-1 ${getPopularityColor(preset.popularity)}`}>
                          {getPopularityIcon(preset.popularity)}
                          <span className="text-xs">{preset.popularity}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {preset.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-slate-400">
                  <div>Height: {(preset.settings.height / 100).toFixed(2)}m</div>
                  <div>Muscle: {preset.settings.muscle}%</div>
                  <div>Body Fat: {preset.settings.bodyFat}%</div>
                </div>

                {/* Apply Button */}
                <Button
                  size="sm"
                  onClick={() => onApplyPreset(preset.settings)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <UserCheck className="w-3 h-3 mr-2" />
                  Apply Preset
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Current Settings Summary */}
        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Current Avatar</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400">Physical:</div>
              <div className="text-slate-300">Height: {(currentSettings.height / 100).toFixed(2)}m</div>
              <div className="text-slate-300">Muscle: {currentSettings.muscle}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Body:</div>
              <div className="text-slate-300">Body Fat: {currentSettings.bodyFat}%</div>
              <div className="text-slate-300">Gender: {currentSettings.gender}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}