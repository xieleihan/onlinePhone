import { Button, Modal, message, Input } from "antd";
import '@/styles/components/sidercom.scss';
import { AudioOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import type { MediaConnection } from "peerjs";

function SiderCom() {
    const [peerId, setPeerId] = useState("");
    const [remotePeerId, setRemotePeerId] = useState("");
    const [isCalling, setIsCalling] = useState(false);
    const [isReceivingCall, setIsReceivingCall] = useState(false);
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [receiveCallModalOpen, setReceiveCallModalOpen] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false); // ✅ 是否视频通话
    const [messageApi, contextHolder] = message.useMessage();

    const peerRef = useRef<Peer | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null); // ✅ 远程视频
    const localVideoRef = useRef<HTMLVideoElement | null>(null); // ✅ 本地视频
    const currentCallRef = useRef<MediaConnection | null>(null);

    useEffect(() => {
        const peer = new Peer(
            `${Math.floor(Math.random() * 2 ** 18).toString(36).padStart(4, "0")}`,
            {
                host: import.meta.env.VITE_PEER_HOST || 'localhost',
                port: import.meta.env.VITE_PEER_PORT || 8000,
                path: "/audio",
                debug: 1,
            });

        peerRef.current = peer;

        peer.on('open', (id) => {
            console.log("✅ 我的 Peer ID 是:", id);
            setPeerId(id);
        });

        // ✅ 监听来电
        peer.on('call', (call) => {
            console.log("📞 收到呼叫:", call.peer);
            currentCallRef.current = call;
            setIsReceivingCall(true);
            setReceiveCallModalOpen(true);
        });
    }, []);

    // ✅ 获取本地媒体流（支持音频/视频）
    const getMediaStream = async (video: boolean) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: video
            });
            localStreamRef.current = stream;

            // 如果是视频通话，显示本地画面
            if (video && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play().catch(err => console.error("本地视频播放失败:", err));
            }
            return stream;
        } catch (err) {
            console.error("❌ 获取媒体流失败:", err);
            messageApi.error("无法访问摄像头/麦克风");
            return null;
        }
    };

    // 发起呼叫
    const startCall = async () => {
        if (!peerRef.current) return;

        const stream = await getMediaStream(isVideoCall); // ✅ 根据模式获取流
        if (!stream) return;

        if (!remotePeerId) {
            messageApi.error("请输入对方的 Peer ID");
            return;
        }

        setIsCalling(true);
        setCallModalOpen(false);

        console.log(`📞 正在呼叫 ${remotePeerId}...`);
        const call = peerRef.current.call(remotePeerId, stream);

        call.on('stream', (remoteStream) => {
            console.log("🔊 收到远程媒体流");
            if (isVideoCall && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(err => console.error("远程视频播放失败:", err));
            } else if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStream;
                remoteAudioRef.current.play().catch(err => console.error("远程音频播放失败:", err));
            }
        });

        call.on('close', hangUp);
        call.on('error', (err) => {
            console.error("❌ 通话错误:", err);
            hangUp();
        });

        currentCallRef.current = call;
    };

    // 接听来电
    const answerCall = async () => {
        if (!peerRef.current || !currentCallRef.current) return;

        // ✅ 判断是否是视频通话（根据 remote 是否请求了视频轨道）
        const wantVideo = true; // 简单起见，默认视频也开

        const stream = await getMediaStream(wantVideo);
        if (!stream) return;

        setReceiveCallModalOpen(false);
        console.log("✅ 接听来电...");

        currentCallRef.current.answer(stream);

        currentCallRef.current.on('stream', (remoteStream) => {
            console.log("🔊 接听后收到远程媒体流");
            if (wantVideo && remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(err => console.error("远程视频播放失败:", err));
            } else if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStream;
                remoteAudioRef.current.play().catch(err => console.error("远程音频播放失败:", err));
            }
        });

        currentCallRef.current.on('close', hangUp);
        currentCallRef.current.on('error', (err) => {
            console.error("❌ 通话错误:", err);
            hangUp();
        });
    };

    // 挂断
    const hangUp = () => {
        if (currentCallRef.current) {
            currentCallRef.current.close();
            currentCallRef.current = null;
        }
        setIsCalling(false);
        setIsReceivingCall(false);
        setCallModalOpen(false);
        setReceiveCallModalOpen(false);
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        console.log("📴 挂断电话");
    };

    return (
        <>
            {contextHolder}
            {/* 隐藏的音频播放器 */}
            <audio ref={remoteAudioRef} autoPlay controls={false} style={{ display: 'none' }} />

            {/* 视频窗口 */}
            <div className="video-container">
                <video ref={localVideoRef} muted autoPlay playsInline style={{ width: "200px", display: isVideoCall ? "block" : "none" }} />
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "400px", display: isVideoCall ? "block" : "none" }} />
            </div>

            <div className="top">
                <Button
                    type="primary"
                    className="btn"
                    icon={<AudioOutlined />}
                    onClick={() => {
                        if (!peerId) {
                            messageApi.error("请等待 Peer ID 获取完成");
                            return;
                        }
                        setIsVideoCall(false); // ✅ 音频模式
                        setCallModalOpen(true);
                    }}
                    disabled={!peerId}
                >
                    语音电话
                </Button>

                <Button
                    type="primary"
                    className="btn"
                    icon={<VideoCameraOutlined />}
                    onClick={() => {
                        if (!peerId) {
                            messageApi.error("请等待 Peer ID 获取完成");
                            return;
                        }
                        setIsVideoCall(true); // ✅ 视频模式
                        setCallModalOpen(true);
                    }}
                    disabled={!peerId}
                >
                    视频电话
                </Button>
            </div>
            <div className="personal">
                <p>我的 Peer ID: <strong>{peerId || "正在连接..."}</strong></p>
                {(isCalling || isReceivingCall) && (
                    <Button
                        danger
                        size="large"
                        style={{ marginTop: '20px' }}
                        onClick={hangUp}
                    >
                        挂断电话
                    </Button>
                )}
            </div>
            <div className="copyright">
                <p>Copyright© 2025 SouthAki, All Rights Reserved.</p>
            </div>

            {/* 发起呼叫模态框 */}
            <Modal
                title="发起呼叫"
                open={callModalOpen}
                onOk={startCall}
                onCancel={() => setCallModalOpen(false)}
                okText="呼叫"
                cancelText="取消"
            >
                <Input
                    placeholder="请输入对方的 Peer ID"
                    value={remotePeerId}
                    onChange={(e) => setRemotePeerId(e.target.value)}
                />
            </Modal>

            {/* 接收来电模态框 */}
            <Modal
                title="收到呼叫"
                open={receiveCallModalOpen}
                onOk={answerCall}
                onCancel={hangUp}
                okText="接听"
                cancelText="挂断"
            >
                <p>来自 <strong>{currentCallRef.current?.peer}</strong> 的呼叫</p>
            </Modal>
        </>
    );
}

export default SiderCom;