import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '../estilos/base.css'
import './painel.css'
import { Painel } from './Painel'

createRoot(document.getElementById('painel')!).render(<StrictMode><Painel /></StrictMode>)
