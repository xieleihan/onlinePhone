import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 导入路由内置组件
import { BrowserRouter } from "react-router-dom";
import './index.css'
import Router from './router/index';

// 导入Lenis
import "lenis/dist/lenis.css";
import Lenis from "lenis";
const lenis = new Lenis();
function raf(time: DOMHighResTimeStamp) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </StrictMode>
);
