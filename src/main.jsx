import React from 'react'
import ReactDOM from 'react-dom/client'
import './global.css'
import App from './App'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
