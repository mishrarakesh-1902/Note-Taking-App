import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthForm } from './AuthForm'


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    
    <Routes>
      <Route path="/" element={<h1>Notes</h1>} />
      <Route path="/signup" element={<AuthForm key="signup" mode="signup" />} />
      <Route path="/login" element={<AuthForm key="login" mode="login" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  </BrowserRouter>,
)
