import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { EmailPreviewModal } from './EmailPreviewModal';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  created_at: string;
  updated_at: string;
}

export function EmailConsoleTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: templateData.name,
            subject: templateData.subject,
            html_body: templateData.html_body,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: templateData.name,
            subject: templateData.subject,
            html_body: templateData.html_body
          });

        if (error) throw error;
      }

      fetchTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplate) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', deleteTemplate.id);

      if (error) throw error;
      
      fetchTemplates();
      setDeleteTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const openEditor = (template?: EmailTemplate) => {
    setEditingTemplate(template || null);
    setIsEditorOpen(true);
  };

  const openPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <Button onClick={() => openEditor()} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {loading ? (
              <p className="text-sm text-gray-500">Loading templates...</p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-gray-500">No templates found</p>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium">{template.name}</h5>
                        <p className="text-sm text-gray-600 mb-1">{template.subject}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditor(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Variables: {(template.html_body.match(/\{\{[^}]+\}\}/g) || []).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <EmailTemplateEditor
        template={editingTemplate}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
      />

      {previewTemplate && (
        <EmailPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewTemplate(null);
          }}
          subject={previewTemplate.subject}
          html={previewTemplate.html_body}
          variables={{}}
        />
      )}

      <AlertDialog open={!!deleteTemplate} onOpenChange={() => setDeleteTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}