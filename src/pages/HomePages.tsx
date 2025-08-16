import LayoutPages from "@/layout/LayoutPages";
import '@/styles/HomePages.scss';
import { Modal } from "antd";
import { useEffect, useState } from "react";
import { getUserMedia } from '@/utils/getUserMedia';

function HomePages() {
    const [isModelOpen, setIsModelOpen] = useState(false);

    useEffect(() => {
        setIsModelOpen(true);
        return () => {
            setIsModelOpen(false);
        }
    },[])

    return (
        <>
            <div className="home-pages">
                <LayoutPages />
            </div>
            <Modal
                open={isModelOpen}
                onCancel={() => setIsModelOpen(false)}
                title="欢迎使用Wifi calling"
                onOk={async () => {
                    await getUserMedia();
                    setIsModelOpen(false);
                }}
            >
                <p className="modalTitle">本网页需要获取你的摄像头和麦克风,请点击确认授权网页获取你的摄像头和麦克风权限</p>
                <span className="modalDesc">*请知悉,点击查看隐私政策</span>
            </Modal>
        </>
    );
}

export default HomePages;