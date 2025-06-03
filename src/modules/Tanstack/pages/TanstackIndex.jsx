import React from 'react';
import { Tabs } from '@radix-ui/react-tabs';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TraditionalFetch } from '../components/TraditionalFetch';
import { Tanstack } from '../components/Tanstack';

const tabItems = [
  { value: 'TraditionalFetch', title: 'TraditionalFetch', component: <TraditionalFetch /> },
  { value: 'Tanstack', title: 'Tanstack', component: <Tanstack /> },
];

export const TanstackIndex = () => {


  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="mb-4 text-2xl font-bold">Gestión de asincronía con Tanstack Query</h1>
        <Tabs
          orientation="horizontal"
          defaultValue="TraditionalFetch" // Configura la pestaña predeterminada `TanstackFetch`
          className="w-full"
        //onValueChange={handleTabChange}
        >
          <TabsList>
            {tabItems.map((item) => (
              <TabsTrigger className="sm:w-full md:w-full" key={item.value} value={item.value}>
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabItems.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              <div className="mt-8">{item.component}</div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};