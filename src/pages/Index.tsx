import React, { useState } from "react";
import { Timer } from "@/components/Timer";
import { TaskList } from "@/components/Task";
import { Settings } from "@/components/Settings";
import { DistractionTracker } from "@/components/DistractionTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabGroup } from "@/components/TabGroup";

const Index = () => {
  return (
    <div className="min-h-full bg-gradient-to-br from-secondary to-white p-4">
      <Settings />
      <div className="mx-auto">
        <h1 className="text-2xl font-bold text-primary text-center mb-4">
          Focus Flow
        </h1>
        
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-4">
            <Timer />
            <TabGroup />
          </TabsContent>

          <TabsContent value="analytics">
            <DistractionTracker />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;