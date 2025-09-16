import React, { useState } from 'react';
import { Upload, File, Folder, Download, Trash2, Search, Grid, List, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AIFileSearch } from './AIFileSearch';
import { AIFileAnalyzer } from './AIFileAnalyzer';
import { FileViewer } from './FileViewer';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  category: string;
  tags: string[];
  url?: string;
  mimeType?: string;
}

export const AdvancedFileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'Project Specs.pdf', type: 'file', size: 2048000, modified: new Date(), category: 'documents', tags: ['specs', 'requirements'], url: '/placeholder.svg', mimeType: 'application/pdf' },
    { id: '2', name: 'Design Assets', type: 'folder', modified: new Date(), category: 'design', tags: ['ui', 'assets'] },
    { id: '3', name: 'Meeting Notes.docx', type: 'file', size: 1024000, modified: new Date(), category: 'documents', tags: ['meetings', 'notes'], url: '/placeholder.svg', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    uploadedFiles.forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: 'file',
        size: file.size,
        modified: new Date(),
        category: 'documents',
        tags: []
      };
      setFiles(prev => [newFile, ...prev]);
    });
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'file' && file.url) {
      setSelectedFile(file);
      setIsViewerOpen(true);
    }
  };

  const categories = ['all', 'documents', 'design', 'code', 'media'];
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">File Manager</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </label>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="search">AI Search</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        
        <TabsContent value="files" className="mt-4">
          <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredFiles.map(file => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                  viewMode === 'grid' ? 'text-center' : 'flex items-center justify-between'
                }`}
              >
                <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col' : 'gap-3'}`}>
                  {file.type === 'folder' ? (
                    <Folder className="w-8 h-8 text-blue-500" />
                  ) : (
                    <File className="w-8 h-8 text-gray-500" />
                  )}
                  <div className={viewMode === 'grid' ? 'mt-2' : ''}>
                    <p className="font-medium text-sm">{file.name}</p>
                    {file.size && (
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    )}
                    <div className="flex gap-1 mt-1">
                      {file.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {viewMode === 'list' && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="search" className="mt-4">
          <AIFileSearch />
        </TabsContent>
        
        <TabsContent value="recent">
          <p className="text-center text-gray-500 py-8">Recent files will appear here</p>
        </TabsContent>
        
        <TabsContent value="shared">
          <p className="text-center text-gray-500 py-8">Shared files will appear here</p>
        </TabsContent>
      </Tabs>

      {selectedFile && (
        <FileViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          fileName={selectedFile.name}
          fileUrl={selectedFile.url || ''}
          fileType={selectedFile.mimeType || 'application/octet-stream'}
          fileSize={selectedFile.size}
        />
      )}
    </Card>
  );
};