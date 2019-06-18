import * as ReactDOM from 'react-dom'
import * as React from 'react'

export class Main extends React.Component
{
    render()
    {
        return ( <h1>Hello</h1> )
    }
}

// RENDER REACT
ReactDOM.render(<Main/>, document.body.getElementsByTagName('main')[0])
