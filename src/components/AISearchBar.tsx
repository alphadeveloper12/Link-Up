import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface AISearchBarProps {
  placeholder?: string;
  onResults?: (results: any) => void;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({
  placeholder = "Ask AI about projects, teams, or features...",
  onResults
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query, context: 'platform' }
      });

      if (error) throw error;
      
      setResults(data);
      onResults?.(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults({
        answer: 'Sorry, search is temporarily unavailable.',
        suggestions: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={loading || !query.trim()}
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
      
      {results && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <CardContent className="p-4">
            <p className="text-sm mb-2">{results.answer}</p>
            {results.suggestions?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {results.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};