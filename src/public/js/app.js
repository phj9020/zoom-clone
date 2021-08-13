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
        const cameras = devices.filter(device => device.kind === "videoinput")
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e)
    }
};

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            { 
                audio: true, 
                video: true 
            }
        );
        // put stream as srcObject in myFace element
        myFace.srcObject = myStream;
        
        // call getCameras fn
        await getCameras();
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

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
