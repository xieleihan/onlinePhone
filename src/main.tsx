import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
const App = lazy(() => import('./App'));
import { Spin } from "antd";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<Spin size="large" />}>
      <App />
    </Suspense>
  </StrictMode>,
)
