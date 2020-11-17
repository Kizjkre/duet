import Progression from './helper/progression.js';

const socket = io('/');

const peerTemplate = document.getElementById('peer');
const port = parseInt(peerTemplate.content.textContent);
peerTemplate.remove();

const peer = new Peer(undefined, {
  host: '/',
  port
});
const peers = {};
let users = 0;

const context = new AudioContext();
const progression = new Progression(context);
const noteProgression = new Progression(context, false);
let bpm;

const processImage = new Worker('/javascripts/workers/processImage.js');
const processIncomingImage = new Worker('/javascripts/workers/processIncomingImage.js');

const activkeyTemplate = document.getElementById('activkey');
const activkey = activkeyTemplate.content.textContent;
activkeyTemplate.remove();

const img = new Image();
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let capture, incomingCapture;
let first = true;

const start = () =>
  capture.takePhoto().then(blob => {
    img.src = URL.createObjectURL(blob);
    img.onload = async () => {
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
      processImage.postMessage({ pixels, activkey, first });
    };
  });

processImage.onmessage = async e => {
  if (first) {
    bpm = e.data.bpm;
    first = false;
    progression
      .addChord(e.data.chord, e.data.duration / (bpm / 60))
      .addChord(e.data.chord2, e.data.duration2 / (bpm / 60))
      .play(start);
    const drum = new Audio('/assets/drum.wav');
    drum.playbackRate = bpm / 69;
    drum.volume = 0.15;
    drum.loop = true;
    drum.play();
  } else {
    progression.addChord(e.data.chord, e.data.duration / (bpm / 60));
  }
};

let firstNote = true;

processIncomingImage.onmessage = async e => {
  if (firstNote) {
    firstNote = false;
    noteProgression
      .addChord(e.data.note, e.data.duration / (bpm / 60))
      .addChord(e.data.note, e.data.duration / (bpm / 60))
      .play(start);
  } else {
    noteProgression.addChord(e.data.note, e.data.duration / (bpm / 60));
  }
};

const addUser = (video, stream, i) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  document.getElementsByClassName('video-container')[i].append(video);
  video.classList.add('has-ratio', 'animate__animated', 'animate__fadeInUp');
};

const connect = (user, stream) => {
  const call = peer.call(user, stream);
  const video = document.createElement('video');
  call.on('stream', incoming => {
    const track = incoming.getVideoTracks()[0];
    incomingCapture = new ImageCapture(track);
    console.log(new Date().getTime() - window.currentChord.duration);
    setTimeout(handleStream, new Date().getTime() - window.currentChord.duration);
    addUser(video, incoming, 1);
  });
  call.on('close', () => {
    video.classList.add('animate__fadeOutDown');
    video.addEventListener('animationend', () => video.remove());
  });
  peers[user] = call;
};

const handleStream = () =>
  capture.takePhoto().then(blob => {
    console.log(1);
    img.src = URL.createObjectURL(blob);
    img.onload = async () => {
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
      processImage.postMessage({ pixels, first });
    };
  });

peer.on('open', id => socket.emit('join', new URL(document.location).pathname.replace('/room/', ''), id));

socket.on('disconnected', user => peers[user] && peers[user].close());

const video = document.createElement('video');
video.muted = true;

navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true }).then(stream => {
  addUser(video, stream, 0);
  peer.on('call', call => {
    if (++users === 2) {
      window.location.assign('/room/create/');
    }
    const incomingVideo = document.createElement('video');
    call.answer(stream);
    call.on('stream', incoming => {
      addUser(incomingVideo, incoming, 1);
    });
  });
  socket.on('connected', user => connect(user, stream));

  const track = stream.getVideoTracks()[0];
  capture = new ImageCapture(track);
  setTimeout(start, 2000);
});