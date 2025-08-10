// App.tsx
import './App.scss';
import { Button, message, Modal, Input } from "antd";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { getUserMedia } from './utils/getUserMedia';
import type { MediaConnection } from "peerjs";

function App() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState(""); // 对方 ID
  const [isCalling, setIsCalling] = useState(false); // 是否正在呼叫
  const [isReceivingCall, setIsReceivingCall] = useState(false); // 是否收到呼叫
  const [callModalOpen, setCallModalOpen] = useState(false); // 呼叫模态框
  const [receiveCallModalOpen, setReceiveCallModalOpen] = useState(false); // 来电模态框
  const [messageApi, contextHolder] = message.useMessage();

  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null); // 本地媒体流
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null); // 远程音频播放元素
  const currentCallRef = useRef<MediaConnection | null>(null); // 当前通话对象

  // 获取本地媒体流
  useEffect(() => {
    getUserMedia({ video: false, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        console.log("✅ 本地麦克风访问成功");
      })
      .catch(err => {
        console.error("❌ 无法访问麦克风:", err);
        messageApi.open({
          type: 'error',
          content: '无法访问麦克风，请检查浏览器权限设置',
        });
      });
  }, []);

  // 初始化 Peer 连接
  useEffect(() => {

    const peer = new Peer(
      `${Math.floor(Math.random() * 2 ** 18)
        .toString(36)
        .padStart(4, "0")}`,
      {
      host: window.location.hostname,
      port: 8000,
      path: "/audio",
      debug: 1,
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log("✅ 我的 Peer ID 是:", id);
      setPeerId(id);
    });

    // 监听来自其他 Peer 的连接请求
    peer.on('connection', (conn) => {
      console.log("🔗 收到数据连接请求:", conn.peer);
    });

    // 监听来电
    peer.on('call', (call) => {
      console.log("📞 收到来电，来自:", call.peer);
      setIsReceivingCall(true);
      setReceiveCallModalOpen(true);
      currentCallRef.current = call;

      // 自动接听（或弹窗让用户确认）
      // 这里我们弹窗让用户选择是否接听
    });

    peer.on('error', (err) => {
      console.error("❌ Peer 错误:", err);
      messageApi.open({
        type: 'error',
        content: `Peer 错误: ${err.type}`,
      });
    });

    return () => {
      if (peer) {
        peer.destroy();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [messageApi]); // 注意依赖项

  // 发起呼叫
  const startCall = () => {
    if (!peerRef.current || !localStreamRef.current) {
      messageApi.open({
        type: 'error',
        content: '系统未准备好，请稍后再试',
      });
      return;
    }
    if (!remotePeerId) {
      messageApi.open({
        type: 'error',
        content: '请输入对方的 Peer ID',
      });
      return;
    }

    setIsCalling(true);
    setCallModalOpen(false);

    console.log(`📞 正在呼叫 ${remotePeerId}...`);
    const call = peerRef.current.call(remotePeerId, localStreamRef.current);

    call.on('stream', (remoteStream) => {
      console.log("🔊 收到远程音频流");
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(err => {
          console.error("❌ 播放远程音频失败:", err);
        });
      }
    });

    call.on('close', () => {
      console.log("📴 通话已结束");
      setIsCalling(false);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    });

    call.on('error', (err) => {
      console.error("❌ 通话错误:", err);
      setIsCalling(false);
      messageApi.open({
        type: 'error',
        content: '通话连接失败',
      });
    });

    currentCallRef.current = call;
  };

  // 接听来电
  const answerCall = () => {
    if (!peerRef.current || !localStreamRef.current) {
      messageApi.open({
        type: 'error',
        content: '系统未准备好，无法接听',
      });
      return;
    }

    setReceiveCallModalOpen(false);
    console.log("✅ 接听来电...");

    if (currentCallRef.current) {
      currentCallRef.current.answer(localStreamRef.current);

      currentCallRef.current.on('stream', (remoteStream) => {
        console.log("🔊 接听后收到远程音频流");
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(err => {
            console.error("❌ 播放远程音频失败:", err);
          });
        }
      });

      currentCallRef.current.on('close', () => {
        console.log("📴 通话已结束");
        setIsReceivingCall(false);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = null;
        }
      });

      currentCallRef.current.on('error', (err) => {
        console.error("❌ 通话错误:", err);
        setIsReceivingCall(false);
        messageApi.open({
          type: 'error',
          content: '通话连接失败',
        });
      });
    }
  };

  // 挂断通话
  const hangUp = () => {
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setIsCalling(false);
    setIsReceivingCall(false);
    setCallModalOpen(false);
    setReceiveCallModalOpen(false);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    console.log("挂断电话");
  };

  return (
    <>
      {contextHolder}
      {/* 隐藏的音频播放器 */}
      <audio ref={remoteAudioRef} autoPlay controls={false} style={{ display: 'none' }} />

      <div className="app">
        <div className="container">
          <div className="title">在线电话</div>
          <div className="content">
            <p>我的 Peer ID: <strong>{peerId || "正在连接..."}</strong></p>
            <Button
              type="primary"
              size="large"
              className="call-button"
              onClick={() => {
                if (!peerId) {
                  messageApi.open({
                    type: 'error',
                    content: '请等待 Peer ID 获取完成',
                  });
                  return;
                }
                setCallModalOpen(true);
              }}
              disabled={!peerId}
            >
              开始通话
            </Button>
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
        </div>
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

export default App;
