import React from 'react';
import { TrainingPortal } from '@/components/TrainingPortal';
import TrainingAcademy from '@/components/TrainingAcademy';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Training: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="portal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portal">Training Portal</TabsTrigger>
              <TabsTrigger value="academy">Learn from the Best</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portal">
              <TrainingPortal />
            </TabsContent>
            
            <TabsContent value="academy">
              <TrainingAcademy />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Training;