import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { User, Users, Sparkles } from 'lucide-react'

interface AvatarPresetsProps {
  currentGender: 'male' | 'female' | 'non-binary'
  onGenderChange: (gender: 'male' | 'female' | 'non-binary') => void
  onApplyPreset: (preset: any) => void
}

export default function AvatarPresets({ currentGender, onGenderChange, onApplyPreset }: AvatarPresetsProps) {
  const presets = {
    female: {
      athletic: {
        name: "Athletic Female",
        description: "Toned and fit female build",
        settings: {
          gender: 'female' as const,
          height: 170,
          muscle: 65,
          bodyFat: 18,
          shoulderWidth: 45,
          waistSize: 35,
          skinTone: 50,
          facialStructure: 45,
          eyeSize: 55,
          noseSize: 45,
          mouthSize: 50,
          hairStyle: 2,
          hairColor: 30
        }
      },
      curvy: {
        name: "Curvy Female",
        description: "Feminine curves with natural proportions",
        settings: {
          gender: 'female' as const,
          height: 165,
          muscle: 40,
          bodyFat: 25,
          shoulderWidth: 40,
          waistSize: 45,
          skinTone: 60,
          facialStructure: 50,
          eyeSize: 60,
          noseSize: 40,
          mouthSize: 55,
          hairStyle: 3,
          hairColor: 70
        }
      },
      muscular: {
        name: "Muscular Female",
        description: "Strong and powerful female build",
        settings: {
          gender: 'female' as const,
          height: 175,
          muscle: 80,
          bodyFat: 15,
          shoulderWidth: 55,
          waistSize: 30,
          skinTone: 40,
          facialStructure: 55,
          eyeSize: 50,
          noseSize: 50,
          mouthSize: 45,
          hairStyle: 1,
          hairColor: 20
        }
      }
    },
    male: {
      athletic: {
        name: "Athletic Male",
        description: "Fit and toned male build",
        settings: {
          gender: 'male' as const,
          height: 180,
          muscle: 70,
          bodyFat: 12,
          shoulderWidth: 65,
          waistSize: 40,
          skinTone: 45,
          facialStructure: 60,
          eyeSize: 45,
          noseSize: 55,
          mouthSize: 50,
          hairStyle: 1,
          hairColor: 25
        }
      },
      bulky: {
        name: "Bulky Male",
        description: "Large and powerful male build",
        settings: {
          gender: 'male' as const,
          height: 190,
          muscle: 85,
          bodyFat: 18,
          shoulderWidth: 75,
          waistSize: 50,
          skinTone: 35,
          facialStructure: 70,
          eyeSize: 40,
          noseSize: 60,
          mouthSize: 45,
          hairStyle: 2,
          hairColor: 15
        }
      },
      lean: {
        name: "Lean Male",
        description: "Slim and defined male build",
        settings: {
          gender: 'male' as const,
          height: 175,
          muscle: 55,
          bodyFat: 8,
          shoulderWidth: 55,
          waistSize: 35,
          skinTone: 55,
          facialStructure: 50,
          eyeSize: 50,
          noseSize: 45,
          mouthSize: 50,
          hairStyle: 3,
          hairColor: 60
        }
      }
    }
  }

  const currentPresets = currentGender === 'female' ? presets.female : presets.male

  return (
    <div className="space-y-4">
      {/* Gender Selection */}
      <div className="space-y-2">
        <h4 className="font-medium text-slate-200 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Avatar Gender
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={currentGender === 'female' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGenderChange('female')}
            className="text-xs"
          >
            <User className="w-3 h-3 mr-1" />
            Female
          </Button>
          <Button
            variant={currentGender === 'male' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGenderChange('male')}
            className="text-xs"
          >
            <User className="w-3 h-3 mr-1" />
            Male
          </Button>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="space-y-2">
        <h4 className="font-medium text-slate-200 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          {currentGender.charAt(0).toUpperCase() + currentGender.slice(1)} Presets
        </h4>
        <div className="space-y-2">
          {Object.entries(currentPresets).map(([key, preset]) => (
            <Card key={key} className="bg-slate-700 border-slate-600 p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-slate-200 text-sm">{preset.name}</h5>
                    <p className="text-xs text-slate-400">{preset.description}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                    {preset.settings.height}cm
                  </Badge>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Muscle: {preset.settings.muscle}%</span>
                  <span>Body Fat: {preset.settings.bodyFat}%</span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onApplyPreset(preset.settings)}
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                >
                  Apply Preset
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="space-y-2">
        <Badge variant="outline" className="border-purple-500 text-purple-400 w-full justify-center">
          <Sparkles className="w-3 h-3 mr-1" />
          Non-Binary Presets Coming Soon
        </Badge>
      </div>
    </div>
  )
}