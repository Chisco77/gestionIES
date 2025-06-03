import React from 'react'

export const CardWithConfig = ({ header, body, footer }) => {

    return (
        <>
            <div>{header}</div>
            <div>{body}</div>
            <div>{footer}</div>
        </>
    )
}
