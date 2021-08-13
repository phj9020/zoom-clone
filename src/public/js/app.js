const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

// stream : video audio combined
let myStream;
let mute = false;
let cameraOff = false;


async function getCameras(){
    try {
        const devices =  await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            // 카메라 옵션이 현재 선택된 카메라와 같은 label을 가지고 있다면 그것을 사용해라 
            if(currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e)
    }
};

async function getMedia(deviceId) {
    // when deviceId not exist, use initialConstrains
    const initialConstrains = {
        audio: true,
        video: { facingMode : "user"}
    };
    // when deviceId use cameraConstrain
    const cameraConstrains = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    };

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        // put stream as srcObject in myFace element
        myFace.srcObject = myStream;
        
        // call getCameras fn
        if(!deviceId) {
            await getCameras();
        }
    } catch (err) {
        console.log(err)
    }
};

getMedia();


function handleMute(){
    myStream.getAudioTracks().forEach((track) => track.enabled = !track.enabled);
    if(!mute) {
        muteBtn.innerText = "Unmute";
        mute = true;
    } else {
        muteBtn.innerText = "Mute";
        mute = false;
    }
};

function handleCamera(){
    myStream.getVideoTracks().forEach((track) => track.enabled = !track.enabled)
    if(cameraOff) {
        camera.innerText = "Camera Off";
        cameraOff = false;
    } else {
        camera.innerText = "Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
camerasSelect.addEventListener("input", handleCameraChange)