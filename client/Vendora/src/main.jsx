import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './screens/Register.jsx'
import Dashboard from './screens/Dashboard.jsx'
import ForgotPassword from './screens/ForgotPassword.jsx'
import PasswordReset from './screens/PasswordReset.jsx'
import Sell from './screens/Sell.jsx'


const router = createBrowserRouter([
  {path: `/`, element: <App />},
  {path: `/screens/register`, element: <Register />},
  {path: `/screens/dashboard`, element: <Dashboard />},
  {path: `/screens/forgot-password`, element: <ForgotPassword />},
  {path: `/screens/PasswordReset`, element: <PasswordReset/>},
  {path: `/screens/Sell`, element: <Sell/>}
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
