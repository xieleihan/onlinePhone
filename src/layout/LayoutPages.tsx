import { Layout } from "antd";
import { useEffect, useRef } from "react";
import "@/styles/layout/LayoutPages.scss";
import SiderCom from "@/components/SiderCom";

function LayoutPages() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
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

        function draw() {
            if (videoRef.current && ctx && canvasRef.current) {
                const width = canvasRef.current.width;
                const height = canvasRef.current.height;
                ctx.filter = "blur(12px)";
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(videoRef.current, 0, 0, width, height);
            }
            requestAnimationFrame(draw);
        }

        draw();
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

            </div>
        </Layout>
    );
}

export default LayoutPages;