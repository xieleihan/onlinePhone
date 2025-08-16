// 需要获取摄像头和麦克风权限
export function getUserMedia(constraints = { video: true, audio: true }): Promise<MediaStream> {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    // 兼容旧版浏览器，类型断言为包含旧API的Navigator类型
    interface LegacyNavigator extends Navigator {
        getUserMedia?: (
            constraints: MediaStreamConstraints,
            successCallback: (stream: MediaStream) => void,
            errorCallback: (error) => void
        ) => void;
        webkitGetUserMedia?: (
            constraints: MediaStreamConstraints,
            successCallback: (stream: MediaStream) => void,
            errorCallback: (error) => void
        ) => void;
        mozGetUserMedia?: (
            constraints: MediaStreamConstraints,
            successCallback: (stream: MediaStream) => void,
            errorCallback: (error) => void
        ) => void;
    }
    const navAny = navigator as LegacyNavigator;
    const getMedia = navAny.getUserMedia || navAny.webkitGetUserMedia || navAny.mozGetUserMedia;
    if (!getMedia) {
        return Promise.reject(new Error('浏览器不支持 getUserMedia'));
    }

    return new Promise((resolve, reject) => {
        getMedia.call(navigator, constraints, resolve, reject);
    });
}