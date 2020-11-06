const socket = io('/');

const peerTemplate = document.getElementById('peer');
const port = parseInt(peerTemplate.content.textContent);
peerTemplate.remove();

const peer = new Peer(undefined, {
  host: '/',
  port
});
const peers = {};

const activkeyTemplate = document.getElementById('activkey');
const activkey = activkeyTemplate.content.textContent;
activkeyTemplate.remove();

const sigmoid = (input, { min, max, center, coefficient } = { min: 0, max: 1, center: 0, coefficient: 1 }) =>
  (max - min) / (1 + Math.E ** (-coefficient * (input - center))) + min;

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

socket.on('disconnected', user => peers[user] && peers[user].close());

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

  const track = stream.getVideoTracks()[0];
  const capture = new ImageCapture(track);
  setTimeout(() =>
    capture.takePhoto().then(blob => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      img.src = URL.createObjectURL(blob);
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
        let avg = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
          avg += (r + g + b) / 3;
        }
        avg /= pixels.length / 4;

        const bpm = Math.round(sigmoid(avg, { min: 60, max: 100, center: 0.75 * 255, coefficient: 0.05 }));

        const rng = new Math.seedrandom(avg);
        const chords = await (await fetch('https://api.hooktheory.com/v1/trends/nodes', {
          headers: {
            Authorization : `Bearer ${ activkey }`
          }
        })).json();
        const choices = [rng(), rng(), rng()];
        let total = 0;
        let chord;
        for (const c of chords) {
          total += c.probability * 1000;
          if (total > choices[0] * 1000) {
            chord = c;
            break;
          }
        }
        console.log(chords);
        const duration = Math.round(sigmoid(choices[1], { min: 0.5, max: 2, center: 0.5, coefficient: 10 }) * 2) / 2;
      };
    }), 2000);
});