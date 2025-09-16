import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIFileAnalyzer } from './AIFileAnalyzer';
import { X, Download, Share, Eye } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileType,
  fileSize
}) => {
  const [activeTab, setActiveTab] = useState('preview');

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (fileType.startsWith('image/')) {
      return (
        <div className="flex justify-center p-4">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="max-w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      );
    }
    
    if (fileType === 'application/pdf') {
      return (
        <div className="h-96 w-full">
          <iframe 
            src={fileUrl} 
            className="w-full h-full border rounded-lg"
            title={fileName}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Preview not available for this file type</p>
          <p className="text-sm mt-2">Click download to view the file</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {fileSize && (
            <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4 overflow-auto">
            {renderPreview()}
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-4 overflow-auto">
            <AIFileAnalyzer
              fileName={fileName}
              fileUrl={fileUrl}
              fileType={fileType}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};