import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TutoringApp from './tutoring-app.jsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TutoringApp />
  </StrictMode>,
)
