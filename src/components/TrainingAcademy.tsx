import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Star, Clock, Users, Trophy, Play, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  industry: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  enrollments: number;
  lessons: number;
  featured: boolean;
  createdBy: string;
  tags: string[];
}

const TrainingAcademy: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [featuredModules, setFeaturedModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTrainingModules();
  }, []);

  const loadTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const moduleData = data || [];
      setModules(moduleData);
      setFeaturedModules(moduleData.filter(m => m.featured));
    } catch (error) {
      console.error('Error loading training modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockModules: TrainingModule[] = [
    {
      id: '1',
      title: 'High-Performance E-commerce Development',
      description: 'Learn from top-rated teams how to build scalable e-commerce platforms',
      industry: 'E-commerce',
      difficulty: 'Advanced',
      duration: '4 hours',
      rating: 4.9,
      enrollments: 1250,
      lessons: 12,
      featured: true,
      createdBy: 'AI Analytics',
      tags: ['React', 'Node.js', 'AWS', 'Performance']
    },
    {
      id: '2',
      title: 'Healthcare App Security Best Practices',
      description: 'HIPAA-compliant development workflows from industry leaders',
      industry: 'Healthcare',
      difficulty: 'Intermediate',
      duration: '3 hours',
      rating: 4.8,
      enrollments: 890,
      lessons: 8,
      featured: true,
      createdBy: 'AI Analytics',
      tags: ['Security', 'HIPAA', 'Compliance', 'Database']
    },
    {
      id: '3',
      title: 'Fintech MVP Development Strategy',
      description: 'Rapid prototyping techniques from successful fintech teams',
      industry: 'Finance',
      difficulty: 'Beginner',
      duration: '2.5 hours',
      rating: 4.7,
      enrollments: 2100,
      lessons: 6,
      featured: false,
      createdBy: 'AI Analytics',
      tags: ['MVP', 'Fintech', 'Strategy', 'Agile']
    }
  ];

  const filteredModules = selectedCategory === 'all' 
    ? mockModules 
    : mockModules.filter(m => m.industry.toLowerCase() === selectedCategory);

  const categories = ['all', 'e-commerce', 'healthcare', 'finance', 'saas'];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Training Academy</h1>
        <p className="text-gray-600">Learn from the best teams and proven workflows</p>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100">
          <Trophy className="w-3 h-3 mr-1" />
          AI-Curated Content
        </Badge>
      </div>

      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="masterclasses">Masterclasses</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid gap-6">
            {mockModules.filter(m => m.featured).map((module) => (
              <Card key={module.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{module.title}</h3>
                      <p className="opacity-90">{module.description}</p>
                    </div>
                    <Badge className="bg-white text-purple-600">
                      <Star className="w-3 h-3 mr-1" />
                      {module.rating}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-medium">{module.duration}</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-medium">{module.lessons} lessons</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-medium">{module.enrollments}</div>
                    </div>
                    <div className="text-center">
                      <Trophy className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-medium">{module.difficulty}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {module.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Created by {module.createdBy}
                    </div>
                    <Button>
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="flex gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{module.industry}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm">{module.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{module.duration}</span>
                    <span>{module.lessons} lessons</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {module.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <Button className="w-full" size="sm">
                    <Play className="w-3 h-3 mr-1" />
                    Start Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="masterclasses" className="space-y-6">
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">Exclusive Masterclasses</h3>
            <p className="text-gray-600 mb-4">
              Deep-dive sessions with industry experts and top-performing teams
            </p>
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingAcademy;