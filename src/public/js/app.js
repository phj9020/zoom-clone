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
    await getMedia(camerasSelect.value);
    if(myPeerConnection) {
        // get current track
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        // send my current track
        videoSender.replaceTrack(videoTrack);
    }
};

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form : choose a room
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    // hide welcome and show call, getMedia
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    // step 1
    makeConnection();
};

async function handleRoomEnter(e) {
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    // 백엔드에 이벤트 보내기
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
};

welcomeForm.addEventListener("submit", handleRoomEnter);


// socket code

// runs in Browser A 
socket.on("welcome", async()=> {
    // console.log("someone joined");
    // step 3: create offer
    const offer = await myPeerConnection.createOffer();
    // step 4: Browser A : setlocaldescription
    myPeerConnection.setLocalDescription(offer);
    console.log("send the offer", offer);
    // step 5: send offer to server (Browser A send offer) 
    socket.emit("offer", offer, roomName);
});

// runs in Browser B 
// get offer in Browser B
socket.on("offer", async(offer) => {
    console.log("get offer from Browser A", offer);
    // Step 7 : setRemoteDescription     get offer and put it in setRemoteDescription
    myPeerConnection.setRemoteDescription(offer);
    // step 8 : create answer
    const answer = await myPeerConnection.createAnswer();
    // step 9 : Browser B also setLocalDescription
    myPeerConnection.setLocalDescription(answer);
    // step 10 : send the answer to Browser A 
    socket.emit('answer', answer, roomName);
    console.log("send the answer from Browser B to server")
});

// step 12 : Browser A gets answer
socket.on("answer", (answer)=> {
    console.log("answer from browser B", answer);
    // Browser A will have remoteDescription as well
    myPeerConnection.setRemoteDescription(answer);
});

// step 16: get candidate from ice event from Server and addIceCandidate()
socket.on("ice", (candidate)=> {
    console.log("received candidate")
    myPeerConnection.addIceCandidate(candidate);
});

// RTC code : make connection 
// step 2 : create peer connection & addTrack 
function makeConnection() {
    // peer connection on each browser
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    // step 13: addEventListener with icecandidate
    myPeerConnection.addEventListener("icecandidate", handleIce);
    // step 17 : add addstream event 
    myPeerConnection.addEventListener("addstream", handleAddStream);
    // console.log(myStream.getTracks())
    // 각 브라우저에서 카메라, 오디오 데이터 스트림을 받아서 myPeerConnnection안에 집어 넣었다.
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream))
};

// step 14 : send Candidate
function handleIce(data){
    console.log("send candidate");
    socket.emit("ice", data.candidate, roomName);
};

// step 18 : handleAddStream
function handleAddStream(data) {
    console.log("got stream from peer");
    console.log("peer stream", data.stream)
    console.log("my stream", myStream)
    const peerStream = document.getElementById("peerFace");
    peerStream.srcObject = data.stream;
};