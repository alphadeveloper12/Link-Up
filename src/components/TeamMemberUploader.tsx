import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, User, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import PdfToText from 'react-pdftotext';

interface TeamMemberUploaderProps {
  memberIndex: number;
  member: any;
  onMemberChange: (index: number, field: string, value: string) => void;
  onMemberUpdate: (index: number, data: any) => void;
}

export const TeamMemberUploader: React.FC<TeamMemberUploaderProps> = ({
  memberIndex,
  member,
  onMemberChange,
  onMemberUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // Public URLs
  const [uploadedFileObjects, setUploadedFileObjects] = useState<File[]>([]); // Original File objects

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${memberIndex}.${fileExt}`;
      const filePath = `team-member-files/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Save both File object and public URL
      setUploadedFiles(prev => [...prev, publicUrl]);
      setUploadedFileObjects(prev => [...prev, file]);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded for ${member.name || `Member ${memberIndex + 1}`}`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const generateProfile = async () => {
    if (!member.name && uploadedFileObjects.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide a name or upload files to generate profile",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      let combinedText = '';

      // Extract text from uploaded PDF files
      for (const file of uploadedFileObjects) {
        try {
          const text = await PdfToText(file);
          console.log('Extracted text from file:', file.name, text);
          combinedText += text + '\n\n';
        } catch (err) {
          console.error('PDF extraction failed for', file.name, err);
        }
      }

      console.log('Combined extracted text:', combinedText);

      // Call AI function with extracted text
      const { data, error } = await supabase.functions.invoke('ai-profile-assistant', {
        body: {
          type: 'generate_member_profile',
          memberData: {
            name: member.name,
            role: member.role,
            uploadedFiles: combinedText.trim()
          }
        }
      });

      if (error) throw error;

      if (data?.profile) {
        onMemberUpdate(memberIndex, {
          ...member,
          name: data.profile.name || member.name,
          bio: data.profile.bio || member.bio,
          role: data.profile.role || member.role,
          skills: data.profile.skills || [],
          experience: data.profile.experience || ''
        });

        toast({
          title: "Profile generated!",
          description: "AI has enhanced the member profile based on extracted CV text"
        });
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          Member {memberIndex + 1}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateProfile}
            disabled={generating}
            className="ml-auto"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            AI Generate Profile
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Member Name</Label>
            <Input
              placeholder="Full name"
              value={member.name}
              onChange={(e) => onMemberChange(memberIndex, 'name', e.target.value)}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input
              placeholder="Position/Role"
              value={member.role}
              onChange={(e) => onMemberChange(memberIndex, 'role', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Upload CV/Resume/Portfolio</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              id={`file-${memberIndex}`}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label
              htmlFor={`file-${memberIndex}`}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload files'}
              </span>
              <span className="text-xs text-gray-400">
                PDF, DOC, Images (Max 10MB)
              </span>
            </label>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div>
            <Label>Uploaded Files</Label>
            <div className="space-y-2">
              {uploadedFiles.map((fileUrl, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-sm truncate">File {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Bio/Description</Label>
          <Textarea
            placeholder="Brief bio or let AI generate based on uploaded files"
            value={member.bio || ''}
            onChange={(e) => onMemberChange(memberIndex, 'bio', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label>Avatar URL (Optional)</Label>
          <Input
            placeholder="Profile photo URL"
            value={member.avatar}
            onChange={(e) => onMemberChange(memberIndex, 'avatar', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
