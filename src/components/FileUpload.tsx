import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, Download, Trash2 } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  type: string;
}

const FileUpload: React.FC = () => {
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Project Requirements.pdf',
      size: '2.4 MB',
      uploadedBy: 'You',
      uploadedAt: '2024-01-10',
      type: 'pdf'
    },
    {
      id: '2',
      name: 'Design Mockups.figma',
      size: '15.2 MB',
      uploadedBy: 'Sarah Chen',
      uploadedAt: '2024-01-12',
      type: 'figma'
    },
    {
      id: '3',
      name: 'API Documentation.docx',
      size: '1.8 MB',
      uploadedBy: 'Mike Rodriguez',
      uploadedAt: '2024-01-14',
      type: 'docx'
    }
  ]);

  const handleFileUpload = () => {
    // Handle file upload logic
    console.log('File upload triggered');
  };

  const getFileIcon = (type: string) => {
    return <File className="w-5 h-5 text-blue-600" />;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Project Files</h3>
        <Button onClick={handleFileUpload} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-sm text-gray-500">Supports: PDF, DOC, DOCX, PNG, JPG, FIGMA</p>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {file.size} • Uploaded by {file.uploadedBy} on {file.uploadedAt}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Download className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FileUpload;