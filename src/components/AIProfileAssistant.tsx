import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIProfileAssistantProps {
  teamData: any;
  onSuggestion: (field: string, value: any) => void;
}

export function AIProfileAssistant({ teamData, onSuggestion }: AIProfileAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

const generateBio = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('ai-profile-assistant', {
      body: {
        action: 'generate_bio',
        data: {
          name: teamData.name,
          skills: teamData.skills,
          industry: teamData.industries?.[0],
          description: teamData.description
        }
      }
    });

    if (data?.success) {
      // 📝 Take bio string directly
      const bioText = data.bio ?? ''; // now the API sends "bio" as string
      const suggestedSkills = data.skills ?? [];

      // 📝 Put the bio into your description field:
      onSuggestion('description', bioText);

      // 📝 Put the skills array into your skills field:
      onSuggestion('skills', suggestedSkills);
    } else if (error) {
      console.error('Error from AI function:', error);
    }
  } catch (error) {
    console.error('Error generating bio:', error);
  }
  setLoading(false);
};



  const getSuggestions = async (field: string) => {
  setLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('ai-profile-assistant', {
      body: {
        action: 'suggest_skills',
        data: {
          description: teamData.description,
          industry: teamData.industries?.[0]
        }
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return;
    }

    if (data?.success) {
      // ✅ skills are at data.skills.skills
      const skillsArray = data.skills?.skills ?? [];
      setSuggestions(skillsArray);
    } else {
      console.warn('Function returned unsuccessfully:', data);
      setSuggestions([]);
    }
  } catch (error) {
    console.error('Error getting suggestions:', error);
    setSuggestions([]);
  } finally {
    setLoading(false);
  }
};


 const getProfileTips = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('ai-profile-assistant', {
      body: {
        action: 'checklist_tips',
        data: teamData
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return;
    }

    if (data?.success) {
      // ✅ tips are at data.tips.tips
      const tipsArray = data.tips?.tips ?? [];
      setTips(tipsArray);
    } else {
      console.warn('Function returned unsuccessfully:', data);
      setTips([]);
    }
  } catch (error) {
    console.error('Error getting tips:', error);
    setTips([]);
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Sparkles className="h-5 w-5" />
          AI Profile Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={generateBio}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Bio
          </Button>
          <Button
            onClick={() => getSuggestions('skills')}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-white"
          >
            Suggest Skills
          </Button>
          <Button
            onClick={getProfileTips}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-white"
          >
            <Lightbulb className="h-4 w-4" />
            Get Tips
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Suggested Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-200"
                  onClick={() => {
                    const currentSkills = teamData.skills || [];
                    if (!currentSkills.includes(skill)) {
                      onSuggestion('skills', [...currentSkills, skill]);
                    }
                  }}
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tips.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Profile Tips:</h4>
            <ul className="space-y-1 text-sm">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}