const socket = io('/');

const peerTemplate = document.getElementById('peer');
const port = parseInt(peerTemplate.content.textContent);
peerTemplate.remove();

const peer = new Peer(undefined, {
  host: '/',
  port
});
const peers = {};

const processImage = new Worker('/javascripts/workers/processImage.js');

const activkeyTemplate = document.getElementById('activkey');
const activkey = activkeyTemplate.content.textContent;
activkeyTemplate.remove();

const addUser = (video, stream, i) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  document.getElementsByClassName('video-container')[i].append(video);
  video.classList.add('has-ratio', 'animate__animated', 'animate__fadeInUp');
};

const connect = (user, stream) => {
  const call = peer.call(user, stream);
  const video = document.createElement('video');
  call.on('stream', incoming => addUser(video, incoming, 1));
  call.on('close', () => video.remove());
  peers[user] = call;
};

peer.on('open', id => socket.emit('join', new URL(document.location).pathname.replace('/room/', ''), id));

socket.on('disconnected', user => peers[user] && peers[user].close());

const video = document.createElement('video');
video.muted = true;
video.classList.add('animate__animated', 'animate__fadeInUp');

const img = new Image();
const canvas = document.createElement('canvas');

navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true }).then(stream => {
  addUser(video, stream, 0);
  peer.on('call', call => {
    const incomingVideo = document.createElement('video');
    call.answer(stream);
    call.on('stream', incoming => addUser(incomingVideo, incoming, 1));
  });
  socket.on('connected', user => connect(user, stream));

  const track = stream.getVideoTracks()[0];
  const capture = new ImageCapture(track);
  setTimeout(() => capture.takePhoto().then(blob => {
    img.src = URL.createObjectURL(blob);
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
      processImage.postMessage({ pixels, activkey });
    }
  }), 2000);
});