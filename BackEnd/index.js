const express = require("express");
const { ExpressPeerServer } = require("peer");
const http = require("http");
const path = require("path");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// 创建 PeerServer
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: "/",
    expires: 60000,
});

app.use("/audio", peerServer);

// 静态文件服务
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the PeerJS server" });
});

server.on("upgrade", (req, socket, head) => {
    console.log("📡 WebSocket Upgrade 请求:", req.url);
    if (req.url.startsWith("/audio")) {
        console.log("✅ 路径匹配");
    } else {
        socket.destroy();
    }
});

// 启动服务器
server.listen(port, "0.0.0.0", () => {
    console.log(`服务运行中`);
});