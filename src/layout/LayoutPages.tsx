import { Layout,Drawer } from "antd";
import { useEffect, useRef,useState } from "react";
import "@/styles/layout/LayoutPages.scss";
import SiderCom from "@/components/SiderCom";
import { SettingOutlined } from "@ant-design/icons";

function LayoutPages() {
    const videoRef = useRef<HTMLVideoElement>(null); // 获取video元素
    const canvasRef = useRef<HTMLCanvasElement>(null); // 获取canvas元素

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true); 
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("获取摄像头失败:", err);
            }
        }
        startCamera();
    }, []);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        const dpr = window.devicePixelRatio || 1; // 获取设备像素比
        function resizeCanvas() {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;
                canvasRef.current.style.width = window.innerWidth + "px";
                canvasRef.current.style.height = window.innerHeight + "px";
                ctx?.scale(dpr, dpr); // 缩放到设备像素比
            }
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        function draw() {
            if (videoRef.current && ctx && canvasRef.current) {
                const canvasWidth = canvasRef.current.width / dpr;
                const canvasHeight = canvasRef.current.height / dpr;

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(videoRef.current, 0, 0, canvasWidth, canvasHeight);
            }
            requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <Layout className="layout">
            {/* 隐藏的视频源 */}
            <video className="video" ref={videoRef} autoPlay playsInline muted />

            {/* 毛玻璃背景 */}
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="canvas"
            />

            {/* 前景内容 */}
            <div className="sider" >
                <SiderCom />
            </div>
            <div className="container">
                <SettingOutlined onClick={() => {
                    setIsDrawerOpen(true);  
                }} className="settings" />
            </div>

            <Drawer
                title="设置"
                placement="right"
                open={isDrawerOpen}
                loading={isLoading}
                onClose={() => {
                    setIsDrawerOpen(false);
                }}
            >
                <p>设置内容</p>
            </Drawer>
        </Layout>
    );
}

export default LayoutPages;