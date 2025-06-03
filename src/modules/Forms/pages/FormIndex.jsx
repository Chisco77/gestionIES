import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UncontrolledForm } from '../components/UncontrolledForm';
import { ControlledForm } from '../components/ControlledForm';
import { RHForm } from '../components/RHForm';
import { ShadcnForm } from '../components/ShadcnForm';


const tabItems = [
    // Agrega más tabs según sea necesario
    { value: 'UncontrolledForm', title: 'UncontrolledForm', component: <UncontrolledForm /> },
    { value: 'ControlledForm', title: 'ControlledForm', component: <ControlledForm /> },
    { value: 'RHForm', title: 'RHForm', component: <RHForm /> },
    { value: 'ShadcnForm', title: 'ShadcnForm', component: <ShadcnForm /> },

]




export const FormIndex = () => {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">

            <h1 className="mb-4 text-2xl font-bold">Formularios</h1>
            <Tabs orientation="horizontal" defaultValue="UncontrolledForm" className="w-full">
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
