import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color:red;padding:20px">ERROR: #root element not found</h1>'
} else {
  // StrictMode is intentionally removed — it double-invokes effects which
  // breaks Leaflet's direct DOM manipulation (causes removeChild errors)
  createRoot(rootElement).render(<App />)
}
