import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFilesUploaded: (files: Array<{ name: string; url: string; type: string }>) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  bucketName?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxFiles = 5,
  bucketName = 'project-files'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    const newFiles: Array<{ name: string; url: string; type: string }> = [];

    try {
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        newFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type
        });
      }

      const allFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(allFiles);
      onFilesUploaded(allFiles);
      
      toast({
        title: "Success!",
        description: `${newFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [uploadedFiles, onFilesUploaded, bucketName, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploading || uploadedFiles.length >= maxFiles
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports images, PDFs, and documents (max {maxFiles} files)
                </p>
              </div>
            )}
            {uploading && (
              <p className="text-blue-600 mt-2">Uploading...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-blue-600" />
                    ) : (
                      <File className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};