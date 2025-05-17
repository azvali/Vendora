import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './screens/register.jsx'
import Dashboard from './screens/dashboard.jsx'
import ForgotPassword from './screens/forgotpassword.jsx'


const router = createBrowserRouter([
  {path: `/`, element: <App />},
  {path: `/screens/register`, element: <Register />},
  {path: `/screens/dashboard`, element: <Dashboard />},
  {path: `/screens/forgot-password`, element: <ForgotPassword />}
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
