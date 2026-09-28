import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/global.css'
import './styles/refresh.css'
import './styles/mobile-polish.css'
import './styles/internal-polish.css'
import './styles/job-list-v2.css'
import './styles/job-detail-v2.css'
import './styles/employer-cards-v2.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
