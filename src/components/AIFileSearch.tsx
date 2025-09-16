import React, { useState } from 'react';
import { Search, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  type: 'file' | 'chat';
  title: string;
  content: string;
  date: string;
  relevance: number;
}

export const AIFileSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query, context: 'files_and_chat' }
      });

      if (error) throw error;
      
      // Mock results for demonstration
      const mockResults: SearchResult[] = [
        {
          type: 'file',
          title: 'Project Requirements.pdf',
          content: 'Contains detailed specifications for the mobile app project...',
          date: '2024-01-15',
          relevance: 95
        },
        {
          type: 'chat',
          title: 'Team Discussion - UI Design',
          content: 'Discussion about color schemes and user interface elements...',
          date: '2024-01-14',
          relevance: 87
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files and conversations with AI..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {result.type === 'file' ? <FileText className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    {result.title}
                  </CardTitle>
                  <Badge variant="secondary">{result.relevance}% match</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{result.content}</p>
                <p className="text-xs text-muted-foreground">{result.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};