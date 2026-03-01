import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CheckInProvider } from './contexts/CheckInContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CheckInProvider>
        <App />
      </CheckInProvider>
    </BrowserRouter>
  </StrictMode>,
)
