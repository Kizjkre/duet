import createBufferMap from './createBufferMap.js';

export default class Progression {
  constructor(context, chord = true) {
    this._context = context;
    this._source = [];
    this._amp = new GainNode(context);
    this._progression = [];
    this._i = 0;
    this._chord = chord;

    this._amp.gain.value = 0.3;
  }

  addChord(chord, duration) {
    this._progression.push({ chord, duration });
    return this;
  }

  async play(callback, recursive = false) {
    if (this._progression.length > 0) {
      if (!recursive) {
        this._source.push(new AudioBufferSourceNode(this._context));
        const buffer = await createBufferMap(this._context, [{
          key: 'map',
          url: this._chord ?
            `/assets/chords/${ this._progression[this._i].chord.chord_ID.replace('/', ':') }.wav` :
            `/assets/guzheng/${ this._progression[this._i] }.m4a`
        }]);
        this._source[this._i].buffer = buffer.map;
        this._source[this._i].connect(this._amp).connect(this._context.destination);
      }

      callback();

      window.currentChord = { chord: this._progression[this._i].chord, duration: this._progression[this._i].duration + new Date().getTime() };

      const now = this._context.currentTime;
      this._source[this._i].start();
      this._source[this._i].stop(now + this._progression[this._i].duration);
      if (this._i + 1 < this._progression.length) {
        console.log(this._progression);
        createBufferMap(this._context, [{
          key: 'map',
          url: this._chord ?
            `/assets/chords/${ this._progression[this._i + 1].chord.chord_ID.replace('/', ':') }.wav` :
            `/assets/guzheng/${ this._progression[this._i + 2] }.m4a`
        }]).then(res => {
          this._source.push(new AudioBufferSourceNode(this._context));
          this._source[this._i + 1].buffer = res.map;
          this._source[this._i + 1].connect(this._amp).connect(this._context.destination);
        }).catch(() => {
          createBufferMap(this._context, [{
            key: 'map',
            url: `/assets/chords/1.wav`
          }]).then(res => {
            this._source.push(new AudioBufferSourceNode(this._context));
            this._source[this._i + 1].buffer = res.map;
            this._source[this._i + 1].connect(this._amp).connect(this._context.destination);
          });
        });
      }
      if (this._i > 2) {
        delete this._source[this._i - 2];
      }
      this._source[this._i].onended = () => {
        this._i++;
        this.play(callback, true);
      };
    }
    return this;
  }
}