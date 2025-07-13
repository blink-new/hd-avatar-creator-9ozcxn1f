import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Download, 
  Image, 
  FileText, 
  Package, 
  Loader2, 
  CheckCircle,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react'

interface ExportPanelProps {
  settings: any
  onExport: (format: string, options: any) => void
}

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  fileSize: string
  quality: 'HD' | '4K' | '8K'
  format: string
  useCase: string
}

const exportFormats: ExportFormat[] = [
  {
    id: 'png-hd',
    name: 'PNG HD',
    description: 'High-definition transparent background',
    icon: <Image className="w-4 h-4" />,
    fileSize: '~2MB',
    quality: 'HD',
    format: 'PNG',
    useCase: 'Profile pictures, social media'
  },
  {
    id: 'png-4k',
    name: 'PNG 4K',
    description: 'Ultra high-definition with transparency',
    icon: <Image className="w-4 h-4" />,
    fileSize: '~8MB',
    quality: '4K',
    format: 'PNG',
    useCase: 'Professional use, large displays'
  },
  {
    id: 'jpg-hd',
    name: 'JPG HD',
    description: 'High-definition with white background',
    icon: <Image className="w-4 h-4" />,
    fileSize: '~1.5MB',
    quality: 'HD',
    format: 'JPG',
    useCase: 'General use, smaller file size'
  },
  {
    id: 'glb-3d',
    name: '3D Model (GLB)',
    description: 'Interactive 3D model for games/AR',
    icon: <Package className="w-4 h-4" />,
    fileSize: '~5MB',
    quality: 'HD',
    format: 'GLB',
    useCase: 'Games, AR/VR, 3D applications'
  },
  {
    id: 'fbx-3d',
    name: '3D Model (FBX)',
    description: 'Industry standard 3D format',
    icon: <Package className="w-4 h-4" />,
    fileSize: '~7MB',
    quality: 'HD',
    format: 'FBX',
    useCase: 'Animation, game engines'
  },
  {
    id: 'obj-3d',
    name: '3D Model (OBJ)',
    description: 'Universal 3D format with textures',
    icon: <Package className="w-4 h-4" />,
    fileSize: '~4MB',
    quality: 'HD',
    format: 'OBJ',
    useCase: '3D printing, modeling software'
  }
]

export default function ExportPanel({ settings, onExport }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStage, setExportStage] = useState('')
  const [exportedFiles, setExportedFiles] = useState<{id: string, url: string, name: string}[]>([])
  const [activeExport, setActiveExport] = useState<string | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setActiveExport(format.id)
    setExportProgress(0)
    setExportStage('')

    try {
      // Stage 1: Preparing scene
      setExportStage('Preparing 3D scene...')
      setExportProgress(20)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 2: Processing geometry
      setExportStage('Processing avatar geometry...')
      setExportProgress(40)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 3: Applying textures
      setExportStage('Applying HD textures...')
      setExportProgress(60)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Stage 4: Rendering/Encoding
      if (format.format === 'PNG' || format.format === 'JPG') {
        setExportStage('Rendering high-quality image...')
      } else {
        setExportStage('Encoding 3D model...')
      }
      setExportProgress(80)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Stage 5: Finalizing
      setExportStage('Finalizing export...')
      setExportProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Simulate file creation
      const mockUrl = `https://storage.example.com/avatars/avatar-${Date.now()}.${format.format.toLowerCase()}`
      const fileName = `avatar-${settings.gender}-${Date.now()}.${format.format.toLowerCase()}`
      
      setExportedFiles(prev => [...prev, {
        id: format.id,
        url: mockUrl,
        name: fileName
      }])

      onExport(format.id, { quality: format.quality, format: format.format })

    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setActiveExport(null)
      setExportStage('')
      setExportProgress(0)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'HD': return 'bg-blue-500'
      case '4K': return 'bg-purple-500'
      case '8K': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <h3 className="font-semibold mb-4 flex items-center">
        <Download className="w-4 h-4 mr-2 text-green-400" />
        Export Avatar
      </h3>

      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="formats" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            Formats
          </TabsTrigger>
          <TabsTrigger value="exported" className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            Downloads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-3 mt-4">
          {isExporting && (
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                <span className="text-sm text-slate-300">{exportStage}</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          <div className="space-y-2">
            {exportFormats.map((format) => (
              <div 
                key={format.id}
                className="border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">{format.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm text-slate-200">{format.name}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-0 ${getQualityColor(format.quality)} text-white`}
                        >
                          {format.quality}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{format.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                        <span>{format.fileSize}</span>
                        <span>•</span>
                        <span>{format.useCase}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleExport(format)}
                    disabled={isExporting}
                    className={`ml-2 ${
                      activeExport === format.id 
                        ? 'bg-green-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {activeExport === format.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Export Options</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400">Current Settings:</div>
                <div className="text-slate-300">Height: {(settings.height / 100).toFixed(2)}m</div>
                <div className="text-slate-300">Muscle: {settings.muscle}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400">Quality:</div>
                <div className="text-slate-300">Render Quality: HD+</div>
                <div className="text-slate-300">Anti-aliasing: 8x</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exported" className="space-y-3 mt-4">
          {exportedFiles.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No exports yet</p>
              <p className="text-xs mt-1">Export your avatar to see downloads here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exportedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="border border-slate-600 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-200">{file.name}</div>
                        <div className="text-xs text-slate-400">Ready to download</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(file.url)}
                        className="border-slate-600"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-sm text-green-400 font-medium mb-1">
                  {exportedFiles.length} file{exportedFiles.length !== 1 ? 's' : ''} ready
                </div>
                <div className="text-xs text-green-300">
                  Files are available for 7 days. Download to keep permanently.
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}