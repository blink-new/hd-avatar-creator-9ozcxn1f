import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Slider } from './components/ui/slider'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Separator } from './components/ui/separator'
import { Badge } from './components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { 
  Upload, 
  RotateCcw, 
  Download, 
  Settings,
  User,
  Zap,
  Camera,
  Palette,
  Sliders,
  Save,
  Play,
  Brain,
  Users,
  Lightbulb,
  Package,
  Sparkles,
  LogOut,
  Plus,
  Trash2,
  Grid3x3
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

// Blink SDK
import { blink } from './blink/client'

// Import components with error handling
import ImprovedAvatar3D from './components/ImprovedAvatar3D'
import GLBUploader from './components/GLBUploader'
import ReadyPlayerMeAPI from './components/ReadyPlayerMeAPI'
import TextureEnhancer from './components/TextureEnhancer'
import AvatarML from './components/AvatarML'
import ExportPanel from './components/ExportPanel'
import BodyPresets from './components/BodyPresets'
import LightingControls from './components/LightingControls'
import AvatarPresets from './components/AvatarPresets'

interface AvatarSettings {
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

interface LightingSettings {
  ambientIntensity: number
  directionalIntensity: number
  directionalPosition: [number, number, number]
  environmentIntensity: number
  shadows: boolean
}

interface SavedAvatar {
  id: string
  name: string
  settings: AvatarSettings
  thumbnailUrl?: string
  createdAt: string
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarSettings, setAvatarSettings] = useState<AvatarSettings>({
    gender: 'male',
    height: 180,
    muscle: 50,
    bodyFat: 20,
    shoulderWidth: 50,
    waistSize: 50,
    skinTone: 50,
    facialStructure: 50,
    eyeSize: 50,
    noseSize: 50,
    mouthSize: 50,
    hairStyle: 1,
    hairColor: 50
  })

  const [lightingSettings, setLightingSettings] = useState<LightingSettings>({
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    directionalPosition: [2, 4, 2],
    environmentIntensity: 0.8,
    shadows: true
  })

  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [renderQuality, setRenderQuality] = useState<'HD' | '4K' | '8K'>('HD')
  const [savedAvatars, setSavedAvatars] = useState<SavedAvatar[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [avatarName, setAvatarName] = useState('')
  const [currentAvatarId, setCurrentAvatarId] = useState<string | null>(null)
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null)
  const [generatedAvatarId, setGeneratedAvatarId] = useState<string | null>(null)
  const [enhancedTexture, setEnhancedTexture] = useState<string | null>(null)
  const [customGLBModel, setCustomGLBModel] = useState<string | null>(null)
  const [customModelName, setCustomModelName] = useState<string | null>(null)

  // Authentication effect with error handling
  useEffect(() => {
    try {
      const unsubscribe = blink.auth.onAuthStateChanged((state) => {
        console.log('Auth state changed:', state)
        setUser(state.user)
        setIsLoading(state.isLoading)
        setError(null)
      })
      return unsubscribe
    } catch (err) {
      console.error('Auth error:', err)
      setError('Authentication system failed to initialize. Please refresh the page.')
      setIsLoading(false)
    }
  }, [])

  // Load saved avatars when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadSavedAvatars()
    }
  }, [user?.id])

  const loadSavedAvatars = async () => {
    try {
      if (!user?.id) return
      
      const avatars = await blink.db.avatars.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })

      const parsedAvatars = avatars.map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        settings: JSON.parse(avatar.settings),
        thumbnailUrl: avatar.thumbnailUrl || undefined,
        createdAt: avatar.createdAt
      }))
      
      setSavedAvatars(parsedAvatars)
    } catch (error) {
      console.error('Error loading avatars:', error)
      toast.error('Failed to load saved avatars')
    }
  }

  const saveAvatar = async () => {
    if (!user?.id || !avatarName.trim()) {
      toast.error('Please enter a name for your avatar')
      return
    }

    try {
      const avatarData = {
        id: currentAvatarId || `avatar_${Date.now()}`,
        userId: user.id,
        name: avatarName.trim(),
        settings: JSON.stringify(avatarSettings),
        thumbnailUrl: null // We could generate a thumbnail here
      }

      if (currentAvatarId) {
        // Update existing avatar
        await blink.db.avatars.update(currentAvatarId, avatarData)
        toast.success('Avatar updated successfully!')
      } else {
        // Create new avatar
        await blink.db.avatars.create(avatarData)
        toast.success('Avatar saved successfully!')
        setCurrentAvatarId(avatarData.id)
      }

      await loadSavedAvatars()
      setShowSaveDialog(false)
      setAvatarName('')
    } catch (error) {
      console.error('Error saving avatar:', error)
      toast.error('Failed to save avatar')
    }
  }

  const loadAvatar = (avatar: SavedAvatar) => {
    setAvatarSettings(avatar.settings)
    setCurrentAvatarId(avatar.id)
    setAvatarName(avatar.name)
    setShowLoadDialog(false)
    toast.success(`Loaded "${avatar.name}"`)
  }

  const deleteAvatar = async (avatarId: string, avatarName: string) => {
    if (!confirm(`Are you sure you want to delete "${avatarName}"?`)) return

    try {
      await blink.db.avatars.delete(avatarId)
      await loadSavedAvatars()
      toast.success('Avatar deleted successfully!')
      
      if (currentAvatarId === avatarId) {
        setCurrentAvatarId(null)
        setAvatarName('')
      }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      toast.error('Failed to delete avatar')
    }
  }

  const updateSetting = (key: keyof AvatarSettings, value: number | string) => {
    setAvatarSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateMultipleSettings = (updates: Partial<AvatarSettings>) => {
    setAvatarSettings(prev => ({ ...prev, ...updates }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAvatar = () => {
    setIsGenerating(true)
    // Simulate avatar generation with ML processing
    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Avatar generated successfully!')
    }, 3000)
  }

  const resetToDefaults = () => {
    setAvatarSettings({
      gender: 'male',
      height: 180,
      muscle: 50,
      bodyFat: 20,
      shoulderWidth: 50,
      waistSize: 50,
      skinTone: 50,
      facialStructure: 50,
      eyeSize: 50,
      noseSize: 50,
      mouthSize: 50,
      hairStyle: 1,
      hairColor: 50
    })
    setUploadedPhoto(null)
    setActivePreset(null)
    setCurrentAvatarId(null)
    setAvatarName('')
    toast.success('Reset to defaults')
  }

  const handleExport = (format: string, options: any) => {
    console.log('Exporting avatar:', format, options)
    toast.success(`Avatar exported as ${format}`)
  }

  const handleAvatarGenerated = (avatarUrl: string, avatarId: string) => {
    setGeneratedAvatarUrl(avatarUrl)
    setGeneratedAvatarId(avatarId)
    toast.success('HD Avatar generated successfully!')
  }

  const handleTextureGenerated = (textureUrl: string) => {
    setEnhancedTexture(textureUrl)
    toast.success('Enhanced texture generated!')
  }

  const applyPreset = (presetSettings: Partial<AvatarSettings>) => {
    setAvatarSettings(prev => ({ ...prev, ...presetSettings }))
    setActivePreset('applied')
    toast.success('Preset applied!')
  }

  const newAvatar = () => {
    resetToDefaults()
    toast.success('Started new avatar')
  }

  const handleGLBModelUploaded = (modelUrl: string, modelName: string) => {
    setCustomGLBModel(modelUrl)
    setCustomModelName(modelName)
    toast.success(`GLB model "${modelName}" loaded successfully!`)
  }

  const handleGLBModelRemoved = () => {
    setCustomGLBModel(null)
    setCustomModelName(null)
    toast.success('Custom GLB model removed')
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
        <Card className="glass-panel border-slate-600 p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
            <p className="text-slate-300 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Initializing HD Avatar Creator</h2>
          <p className="text-slate-300 mb-4">Setting up your 3D avatar workspace...</p>
          <div className="flex justify-center space-x-2">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-400">
              <Zap className="w-3 h-3 mr-1" />
              HD Quality
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  // Auth required state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
        <Card className="glass-panel border-slate-600 p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">HD Avatar Creator</h1>
            <p className="text-slate-300 mb-4">Create stunning 3D avatars with AI-powered customization</p>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
              <p className="text-blue-400 text-sm">
                🔐 Authentication required to save and manage your avatars
              </p>
            </div>
            <Button 
              onClick={() => blink.auth.login()}
              className="w-full bg-blue-600 hover:bg-blue-700 mb-3"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In to Continue
            </Button>
            <p className="text-xs text-slate-400">
              Your avatars will be saved securely to your account
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">HD Avatar Creator</h1>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300 hidden md:block">Welcome, {user.email}</span>
                
                {/* Status Badges */}
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    {renderQuality} Quality
                  </Badge>
                  {customGLBModel && (
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">
                      <Package className="w-3 h-3 mr-1" />
                      Custom Model
                    </Badge>
                  )}
                </div>
                
                {/* Avatar Management */}
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" onClick={newAvatar}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                
                  <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Grid3x3 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Load ({savedAvatars.length}/10)</span>
                        <span className="sm:hidden">Load</span>
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-600">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100">Load Avatar</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {savedAvatars.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-slate-400">
                          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No saved avatars yet</p>
                        </div>
                      ) : (
                        savedAvatars.map((avatar) => (
                          <div key={avatar.id} className="bg-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-slate-200 text-sm">{avatar.name}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAvatar(avatar.id, avatar.name)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-slate-400 mb-3">
                              {new Date(avatar.createdAt).toLocaleDateString()}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => loadAvatar(avatar)}
                              className="w-full text-xs"
                            >
                              Load Avatar
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Save</span>
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-600">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100">
                        {currentAvatarId ? 'Update Avatar' : 'Save Avatar'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="avatar-name" className="text-slate-300">Avatar Name</Label>
                        <Input
                          id="avatar-name"
                          value={avatarName}
                          onChange={(e) => setAvatarName(e.target.value)}
                          placeholder="Enter avatar name..."
                          className="bg-slate-700 border-slate-600 text-slate-100"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={saveAvatar}
                          disabled={!avatarName.trim()}
                          className="flex-1"
                        >
                          {currentAvatarId ? 'Update' : 'Save'} Avatar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowSaveDialog(false)}
                          className="border-slate-600"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                  <Button variant="outline" size="sm" onClick={resetToDefaults}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => blink.auth.logout()}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-6 h-[calc(100vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            
            {/* 3D Avatar Viewport */}
            <div className="lg:col-span-2">
              <Card className="h-full glass-panel border-slate-600">
                <div className="relative h-full avatar-viewport rounded-lg overflow-hidden">
                  
                  {/* Current Avatar Info */}
                  {currentAvatarId && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-green-500/20 border-green-500 text-green-400">
                        <Save className="w-3 h-3 mr-1" />
                        {avatarName}
                      </Badge>
                    </div>
                  )}

                  {/* Camera Controls */}
                  <div className="absolute top-4 right-4 z-10 flex space-x-2">
                    <Button size="sm" variant="outline" className="bg-slate-800/80 border-slate-600">
                      <Camera className="w-4 h-4 mr-2" />
                      Reset View
                    </Button>
                    <Button size="sm" variant="outline" className="bg-slate-800/80 border-slate-600">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quality & Features Badge */}
                  <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
                    <div className="bg-orange-500/20 border border-orange-500 rounded-full px-3 py-1 text-sm font-medium text-orange-400">
                      <Zap className="w-4 h-4 inline mr-1" />
                      {renderQuality} Quality
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500 rounded-full px-3 py-1 text-sm font-medium text-purple-400">
                      <Brain className="w-4 h-4 inline mr-1" />
                      ML Enhanced
                    </div>
                  </div>

                  {/* 3D Avatar Component with error boundary */}
                  <div className="w-full h-full">
                    <ImprovedAvatar3D 
                      settings={avatarSettings}
                      lighting={lightingSettings}
                      customModelUrl={customGLBModel}
                    />
                  </div>

                  {/* Generation Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                    <Button 
                      onClick={generateAvatar} 
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate HD Avatar'}
                    </Button>
                    <Button variant="outline" className="border-slate-600">
                      <Download className="w-4 h-4 mr-2" />
                      Quick Export
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Customization Panel */}
            <div className="lg:col-span-2 space-y-4 max-h-full overflow-y-auto">
              
              {/* Photo Upload & AI Analysis */}
              <Card className="glass-panel border-slate-600">
                <div className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Facial Reference
                  </h3>
                  <div className="space-y-3">
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <div className="text-sm text-slate-400">
                          Upload photo for AI face mapping
                        </div>
                      </div>
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {uploadedPhoto && (
                      <div className="mt-3">
                        <img 
                          src={uploadedPhoto} 
                          alt="Uploaded reference" 
                          className="w-20 h-20 rounded-lg object-cover border-2 border-blue-500 mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Main Customization Tabs */}
              <Card className="glass-panel border-slate-600">
                <Tabs defaultValue="body" className="p-4">
                  <TabsList className="grid w-full grid-cols-6 bg-slate-800">
                    <TabsTrigger value="body" className="text-xs">
                      <Sliders className="w-3 h-3 mr-1" />
                      Body
                    </TabsTrigger>
                    <TabsTrigger value="face" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      Face
                    </TabsTrigger>
                    <TabsTrigger value="style" className="text-xs">
                      <Palette className="w-3 h-3 mr-1" />
                      Style
                    </TabsTrigger>
                    <TabsTrigger value="models" className="text-xs">
                      <Package className="w-3 h-3 mr-1" />
                      Models
                    </TabsTrigger>
                    <TabsTrigger value="presets" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Presets
                    </TabsTrigger>
                    <TabsTrigger value="lighting" className="text-xs">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Light
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="body" className="space-y-4 mt-4">
                    {/* Gender Selection */}
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['male', 'female', 'non-binary'] as const).map((gender) => (
                          <Button
                            key={gender}
                            variant={avatarSettings.gender === gender ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSetting('gender', gender)}
                            className="text-xs capitalize"
                          >
                            {gender}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    {/* Height */}
                    <div className="space-y-2">
                      <Label>Height: {(avatarSettings.height / 100).toFixed(2)}m</Label>
                      <Slider
                        value={[avatarSettings.height]}
                        onValueChange={(value) => updateSetting('height', value[0])}
                        min={170}
                        max={210}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Muscle Definition */}
                    <div className="space-y-2">
                      <Label>Muscle Definition: {avatarSettings.muscle}%</Label>
                      <Slider
                        value={[avatarSettings.muscle]}
                        onValueChange={(value) => updateSetting('muscle', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Body Fat */}
                    <div className="space-y-2">
                      <Label>Body Fat: {avatarSettings.bodyFat}%</Label>
                      <Slider
                        value={[avatarSettings.bodyFat]}
                        onValueChange={(value) => updateSetting('bodyFat', value[0])}
                        min={5}
                        max={40}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Shoulder Width */}
                    <div className="space-y-2">
                      <Label>Shoulder Width: {avatarSettings.shoulderWidth}%</Label>
                      <Slider
                        value={[avatarSettings.shoulderWidth]}
                        onValueChange={(value) => updateSetting('shoulderWidth', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="face" className="space-y-4 mt-4">
                    {/* Facial Structure */}
                    <div className="space-y-2">
                      <Label>Facial Structure: {avatarSettings.facialStructure}%</Label>
                      <Slider
                        value={[avatarSettings.facialStructure]}
                        onValueChange={(value) => updateSetting('facialStructure', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Eye Size */}
                    <div className="space-y-2">
                      <Label>Eye Size: {avatarSettings.eyeSize}%</Label>
                      <Slider
                        value={[avatarSettings.eyeSize]}
                        onValueChange={(value) => updateSetting('eyeSize', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Nose Size */}
                    <div className="space-y-2">
                      <Label>Nose Size: {avatarSettings.noseSize}%</Label>
                      <Slider
                        value={[avatarSettings.noseSize]}
                        onValueChange={(value) => updateSetting('noseSize', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Mouth Size */}
                    <div className="space-y-2">
                      <Label>Mouth Size: {avatarSettings.mouthSize}%</Label>
                      <Slider
                        value={[avatarSettings.mouthSize]}
                        onValueChange={(value) => updateSetting('mouthSize', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4 mt-4">
                    {/* Skin Tone */}
                    <div className="space-y-2">
                      <Label>Skin Tone: {avatarSettings.skinTone}%</Label>
                      <Slider
                        value={[avatarSettings.skinTone]}
                        onValueChange={(value) => updateSetting('skinTone', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Hair Style */}
                    <div className="space-y-2">
                      <Label>Hair Style</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((style) => (
                          <Button
                            key={style}
                            variant={avatarSettings.hairStyle === style ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSetting('hairStyle', style)}
                            className="text-xs"
                          >
                            Style {style}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Hair Color */}
                    <div className="space-y-2">
                      <Label>Hair Color: {avatarSettings.hairColor}%</Label>
                      <Slider
                        value={[avatarSettings.hairColor]}
                        onValueChange={(value) => updateSetting('hairColor', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="models" className="mt-4">
                    <div className="space-y-4">
                      {/* Current Model Status */}
                      {customGLBModel && (
                        <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-green-400" />
                              <div>
                                <div className="text-sm font-medium text-green-400">
                                  Custom Model Active: {customModelName}
                                </div>
                                <div className="text-xs text-green-300">
                                  All customization options are applied to your GLB model
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleGLBModelRemoved}
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* GLB Uploader */}
                      <GLBUploader
                        onModelUploaded={handleGLBModelUploaded}
                        onModelRemoved={handleGLBModelRemoved}
                        currentModel={customGLBModel}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="presets" className="mt-4">
                    <AvatarPresets 
                      currentGender={avatarSettings.gender}
                      onGenderChange={(gender) => updateSetting('gender', gender)}
                      onApplyPreset={applyPreset}
                    />
                  </TabsContent>

                  <TabsContent value="lighting" className="mt-4">
                    <LightingControls 
                      lighting={lightingSettings}
                      onLightingChange={setLightingSettings}
                    />
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Ready Player Me Integration */}
              <ReadyPlayerMeAPI 
                settings={avatarSettings}
                uploadedPhoto={uploadedPhoto}
                onAvatarGenerated={handleAvatarGenerated}
              />

              {/* HD Texture Enhancement */}
              <TextureEnhancer 
                settings={avatarSettings}
                onTextureGenerated={handleTextureGenerated}
              />

              {/* AI Analysis Panel */}
              <AvatarML 
                uploadedPhoto={uploadedPhoto}
                settings={avatarSettings}
                onSettingsUpdate={updateMultipleSettings}
              />

              {/* Export Panel */}
              <ExportPanel 
                settings={avatarSettings}
                onExport={handleExport}
              />

              {/* Avatar Presets */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App