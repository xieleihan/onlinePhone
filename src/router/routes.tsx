// 导入React
import { lazy, Suspense } from 'react';

// 导入Antd组件
import { Spin } from 'antd';

const App = lazy(() => import('../App'));
const HomePages = lazy(() => import('../pages/HomePages.tsx'));

interface RouteType {
    path: string;
    element: React.ReactElement;
}

// 路由数组
const routes: RouteType[] = [
    {
        path: process.env.NODE_ENV === 'production' ? '/onlinePhone/' : '/',
        element: (
            <Suspense fallback={<Spin size="large" />}>
                <App />
            </Suspense>
        ),
    },
    {
        path: process.env.NODE_ENV === 'production' ? '/onlinePhone/home' : '/home',
        element: (
            <Suspense fallback={<Spin size="large" />}>
                <HomePages />
            </Suspense>
        ),
    },
];

export default routes;