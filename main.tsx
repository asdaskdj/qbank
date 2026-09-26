import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import { StoreProvider } from './store/StoreProvider'
import { useStore } from './store/useStore'
import Login from './pages/Login'
import Step1 from './pages/Step1'
import Step2 from './pages/Step2'
import Step3 from './pages/Step3'
import PrintPaper from './pages/PrintPaper'
import Problems from './pages/Problems'
import Naesin from './pages/Naesin'

function RequireAuth() {
  const { state } = useStore()
  if (!state.user) return <Navigate to="/login" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Step1 /> },
          { path: 'wizard/2', element: <Step2 /> },
          { path: 'wizard/3', element: <Step3 /> },
          { path: 'problems', element: <Problems /> },
          { path: 'naesin', element: <Naesin /> },
        ],
      },
      { path: '/print/:paperId', element: <PrintPaper /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
)
