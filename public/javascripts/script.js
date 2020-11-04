const socket = io('/');
const peer = new Peer(undefined, {
  host: '/',
  port: 3001
});
const peers = {};

const addUser = (video, stream, i) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  document.getElementsByClassName('video-container')[i].append(video);
  video.classList.add('has-ratio');
};

const connect = (user, stream) => {
  const call = peer.call(user, stream);
  const video = document.createElement('video');
  call.on('stream', incoming => addUser(video, incoming, 1));
  call.on('close', () => video.remove());
  peers[user] = call;
};

peer.on('open', id => socket.emit('join', new URL(document.location).pathname.replace('/room/', ''), id));

socket.on('disconnected', user => peers[user].close());

const video = document.createElement('video');
video.muted = true;

navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true }).then(stream => {
  addUser(video, stream, 0);
  peer.on('call', call => {
    const incomingVideo = document.createElement('video');
    call.answer(stream);
    call.on('stream', incoming => addUser(incomingVideo, incoming, 1));
  });
  socket.on('connected', user => connect(user, stream));
});