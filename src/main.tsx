import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadFonts } from './lib/fonts'
import { initFirebase } from './lib/firebase'
import './index.css'
import App from './App'

loadFonts()
initFirebase()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
