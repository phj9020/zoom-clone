const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

// stream : video audio combined
let myStream;
let mute = false;
let cameraOff = false;
call.hidden = true;
let roomName;
let myPeerConnection;

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
};

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form : choose a room
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia(){
    // hide welcome and show call, getMedia
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    // step 1
    makeConnection();
};

function handleRoomEnter(e) {
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    // 백엔드에 이벤트 보내기
    socket.emit("join_room", input.value, startMedia);
    roomName = input.value;
    input.value = "";
};

welcomeForm.addEventListener("submit", handleRoomEnter);


// socket code


socket.on("welcome", async()=> {
    // console.log("someone joined");
    // step 3: create offer
    const offer = await myPeerConnection.createOffer();
    // step 4: setlocaldescription
    myPeerConnection.setLocalDescription(offer);
    console.log("send the offer", offer);
    // step 5: send offer to server (Browser A send offer) 
    socket.emit("offer", offer, roomName);
});

// get offer in Browser B
socket.on("offer", (offer) => {
    console.log("offer", offer)
})

// RTC code : make connection 
// step 2 : create peer connection & addTrack 
function makeConnection() {
    // peer connection on each browser
    myPeerConnection = new RTCPeerConnection();
    // console.log(myStream.getTracks())
    // 각 브라우저에서 카메라, 오디오 데이터 스트림을 받아서 myPeerConnnection안에 집어 넣었다.
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream))
};