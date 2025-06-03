import React from 'react'

function Card({ children }) {
    return (
        <div>{children}</div>
    )
}

function CardHeader({ children }) {
    return (
        <div>{children}</div>
    )
}

function CardBody({ children }) {
    return (
        <div>{children}</div>
    )
}
function CardFooter({ children }) {
    return (
        <div>{children}</div>
    )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer =CardFooter

export default Card

