import { Button } from '@/components/ui/button'
import React from 'react'

export const ButtonDemo = () => {
    return (
        <>
            <div className='flex gap-4'>
                <Button capitalize={true} variant="destructive">button</Button>
                <Button variant="success">button</Button>
                <Button variant="outline">button</Button>
                <Button variant="ghost">button</Button>
                <Button disabled >disabled</Button>
            </div>
        </>
    )
}
