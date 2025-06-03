import React from 'react'
import { MiComponente } from '../components/MiComponente'
import { CardWithConfig } from '../components/CardWithConfig';
import Card from '../components/Card';

function withLoggin(Componente) {
    console.log("ya tengo login");

    return Componente
}

const NuevoComponente = withLoggin(MiComponente)

export const Patterns = () => {
    return (
        <>
            <MiComponente />
            <NuevoComponente />
            <CardWithConfig
                header="Esto es el Header"
                body="Esto el body"
                footer="El footer"
            />
            <Card variant="success">
                <icon></icon>
                <Card.Footer>Footer</Card.Footer>
                <Card.Header>Header</Card.Header>
            </Card>
        </>
    )
}
