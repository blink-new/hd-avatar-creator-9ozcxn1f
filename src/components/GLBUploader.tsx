import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { 
  Upload, 
  File, 
  Check, 
  X, 
  AlertCircle, 
  Package,
  Trash2,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { blink } from '../blink/client'

interface GLBUploaderProps {
  onModelUploaded: (modelUrl: string, modelName: string) => void
  onModelRemoved: () => void
  currentModel?: string | null
}

interface UploadedModel {
  name: string
  url: string
  size: number
  uploadedAt: string
}

export default function GLBUploader({ onModelUploaded, onModelRemoved, currentModel }: GLBUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedModels, setUploadedModels] = useState<UploadedModel[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB in bytes

  const validateFile = (file: File): string | null => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
      return 'Only .glb files are supported'
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }

    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const uploadModel = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Upload to Blink storage
      const { publicUrl } = await blink.storage.upload(
        selectedFile,
        `models/${selectedFile.name}`,
        {
          upsert: true,
          onProgress: (percent) => {
            setUploadProgress(percent)
          }
        }
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Create model record
      const modelData: UploadedModel = {
        name: selectedFile.name.replace('.glb', ''),
        url: publicUrl,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString()
      }

      setUploadedModels(prev => [...prev, modelData])
      onModelUploaded(publicUrl, modelData.name)
      
      toast.success('GLB model uploaded successfully!')
      setSelectedFile(null)
      setUploadProgress(0)

    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload GLB model')
    } finally {
      setIsUploading(false)
    }
  }

  const removeModel = async (model: UploadedModel) => {
    try {
      // Remove from storage
      await blink.storage.remove(model.url.split('/').pop() || '')
      
      // Remove from local state
      setUploadedModels(prev => prev.filter(m => m.url !== model.url))
      
      // If this was the current model, notify parent
      if (currentModel === model.url) {
        onModelRemoved()
      }
      
      toast.success('Model removed successfully')
    } catch (error) {
      console.error('Failed to remove model:', error)
      toast.error('Failed to remove model')
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="glass-panel border-slate-600 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center">
            <Package className="w-4 h-4 mr-2 text-purple-400" />
            GLB Model Upload
          </h3>
          <Badge variant="outline" className="border-purple-500 text-purple-400">
            Max 30MB
          </Badge>
        </div>

        {/* Upload Area */}
        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-slate-600 hover:border-purple-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <File className="w-8 h-8 text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium text-slate-200">{selectedFile.name}</div>
                    <div className="text-sm text-slate-400">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <div className="text-sm text-slate-400">
                      Uploading... {uploadProgress}%
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2 justify-center">
                  <Button 
                    onClick={uploadModel}
                    disabled={isUploading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload Model'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearSelection}
                    disabled={isUploading}
                    className="border-slate-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-slate-400" />
                <div>
                  <div className="text-slate-300 font-medium mb-1">
                    Drop your GLB model here
                  </div>
                  <div className="text-sm text-slate-400 mb-3">
                    or click to browse files
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-600"
                  >
                    <File className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".glb"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* File Requirements */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="text-slate-300 font-medium mb-1">Requirements:</div>
              <ul className="text-slate-400 space-y-1 text-xs">
                <li>• File format: .glb only</li>
                <li>• Maximum size: 30MB</li>
                <li>• Model will be customizable with all avatar options</li>
                <li>• Textures and materials will be preserved</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Uploaded Models List */}
        {uploadedModels.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-slate-300 text-sm">Uploaded Models</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadedModels.map((model, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    currentModel === model.url 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-slate-600 bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-medium text-slate-200 text-sm">{model.name}</div>
                      <div className="text-xs text-slate-400">
                        {formatFileSize(model.size)} • {new Date(model.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {currentModel === model.url && (
                      <Badge className="bg-green-500/20 border-green-500 text-green-400 text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onModelUploaded(model.url, model.name)}
                      className="border-slate-600 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeModel(model)}
                      className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Model Info */}
        {currentModel && (
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <div className="text-sm text-green-400">
                Custom GLB model loaded and ready for customization
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}