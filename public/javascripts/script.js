const socket = io('/');
const peer = new Peer(undefined, {
  host: '/',
  port: 3001
});
const peers = {};

const addUser = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  document.body.append(video);
};

const connect = (user, stream) => {
  const call = peer.call(user, stream);
  const video = document.createElement('video');
  call.on('stream', incoming => addUser(video, incoming));
  call.on('close', () => video.remove());
  peers[user] = call;
};

peer.on('open', id => {
  socket.emit('join', new URL(document.location).pathname.replace('/room/', ''), id);
});

socket.on('disconnected', user => peers[user].close());

const video = document.createElement('video');
video.muted = true;

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
  addUser(video, stream);
  peer.on('call', call => {
    const incomingVideo = document.createElement('video');
    call.answer(stream);
    call.on('stream', incoming => addUser(incomingVideo, incoming));
  });
  socket.on('connected', user => connect(user, stream));
});