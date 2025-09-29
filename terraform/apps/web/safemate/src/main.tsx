import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { hederaConfig } from './amplify-config'
import App from './App'
import './index.css'

// Configure Amplify with the correct User Pool settings
Amplify.configure(hederaConfig)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
