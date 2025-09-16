import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, File, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProjectFile, listProjectFiles, deleteProjectFile } from '@/lib/projectFiles';

interface ProjectFile {
  id: string;
  name: string;
  size_bytes: number;
  created_at: string;
  url?: string;
}

interface ProjectFileManagerProps {
  projectId: string;
  userId: string;
}

export default function ProjectFileManager({ projectId, userId }: ProjectFileManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const data = await listProjectFiles(projectId);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadProjectFile(projectId, file);
      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    try {
      await deleteProjectFile(projectId, file.id, file.name);
      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image className="h-4 w-4" />;
    if (['pdf', 'doc', 'docx'].includes(ext || '')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="p-4">Loading files...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Project Files
          <div>
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No files uploaded yet. Upload your first file to get started.
            </p>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="font-medium">{file.name.split('_').slice(1).join('_')}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{file.name.split('.').pop()?.toUpperCase()}</Badge>
                  {file.url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteFile(file)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}