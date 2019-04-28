import * as ReactDOM from 'react-dom'
import * as React from 'react'

export class Main extends React.Component
{
    constructor(props)
    {
        // ANNOYING HUH
        super(props)
    }

    render()
    {
        // MAIN PARENT
        return (
            <h1>Hello</h1>
        )
    }
}

// RENDER REACT
ReactDOM.render(<Main/>, document.body.getElementsByTagName('main')[0])
