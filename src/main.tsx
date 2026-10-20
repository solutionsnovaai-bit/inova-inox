import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/archivo/wdth-italic.css'
import './estilos/index.css'
import App from './App'

/* Voltar para a página pelo cache do navegador também conta como carga nova. */
window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload() })

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
