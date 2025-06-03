import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccordionDemo } from '../components/AccordionDemo';
import { AlertDemo } from '../components/AlertDemo';
import { ButtonDemo } from '../components/ButtonDemo';
import { AlertDialogDemo } from '../components/AlertDialogDemo';
import { SonnerDemo } from '../components/SonnerDemo';

const tabItems = [
    // Agrega más tabs según sea necesario
    { value: 'AccordionDemo', title: 'Accordion', component: <AccordionDemo /> },
    { value: 'AlertDemo', title: 'AlertDemo', component: <AlertDemo /> },
    { value: 'ButtonDemo', title: 'ButtonDemo', component: <ButtonDemo /> },
    { value: 'AlertDialogDemo', title: 'AlertDialogDemo', component: <AlertDialogDemo /> },
    { value: 'SonnerDemo', title: 'SonnerDemo', component: <SonnerDemo /> },
].sort((a, b) => a.title.localeCompare(b.title));




export const ShadcnIndex = () => {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">

            <h1 className="mb-4 text-2xl font-bold">Demo de componentes de Shadcn</h1>
            <Tabs orientation="horizontal" defaultValue="AccordionDemo" className="w-full">
                <TabsList >
                    {tabItems.map((item) => (
                        <TabsTrigger className="sm:w-full md:w-[130px]" key={item.value} value={item.value}>
                            {item.title}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {tabItems.map((item) => (
                    <TabsContent key={item.value} value={item.value}>
                        <div className="w-3/5 m-8">{item.component}</div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
