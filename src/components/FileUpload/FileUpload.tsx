import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, File, X } from 'lucide-react';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from '../../config/constants';
import Button from '../UI/Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onFileRemove?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  selectedFile,
  onFileRemove 
}) => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <File className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={onFileRemove}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedFile.type.startsWith('image/') && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="max-h-48 w-auto rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-25'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop your file here' : 'Choose a file to upload'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop your document, or click to browse
        </p>
        <p className="text-xs text-gray-500">
          Supports JPG, PNG, PDF up to 10MB
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          icon={Camera}
          onClick={handleCameraCapture}
          className="sm:hidden"
        >
          Take Photo
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;