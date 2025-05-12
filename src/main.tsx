import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PhysicsProvider } from './PhysicsContent.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhysicsProvider>
      <App />
    </PhysicsProvider>
  </StrictMode>,
)
