import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

// Import your existing services
import { UserService } from './services/userService'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Authenticator>
          {({ signOut, user }) => (
            <div>
              <h1>SafeMate</h1>
              <h2>Hello {user?.username}</h2>
              <button onClick={signOut}>Sign out</button>
            </div>
          )}
        </Authenticator>
      </Router>
    </ThemeProvider>
  )
}

export default App
