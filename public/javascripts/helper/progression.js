import createBufferMap from './createBufferMap.js';

export default class Progression {
  constructor(context, chord = true) {
    this._context = context;
    this._source = [];
    this._amp = new GainNode(context);
    this._progression = [];
    this._i = 0;
    this._chord = chord;

    this._amp.gain.value = chord ? 0.2 : 0.025;

    this._now = context.currentTime;
    this._total = this._now;
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
            `/assets/guzheng/${ this._progression[this._i].chord }.m4a`
        }]);
        this._source[this._i].buffer = buffer.map;
        this._source[this._i].connect(this._amp).connect(this._context.destination);
        this._total += this._context.currentTime;
      }

      callback();

      if (this._chord) {
        window.currentChord = { chord: this._progression[this._i].chord, duration: this._progression[this._i].duration + new Date().getTime() };
      } else {
        console.log(this._progression, this._i);
      }

      this._source[this._i].start(this._total);
      this._total += this._progression[this._i].duration;
      this._source[this._i].stop(this._total);
      if (this._i + 1 < this._progression.length) {
        createBufferMap(this._context, [{
          key: 'map',
          url: this._chord ?
            `/assets/chords/${ this._progression[this._i + 1].chord.chord_ID.replace('/', ':') }.wav` :
            `/assets/guzheng/${ this._progression[this._i + 1].chord }.m4a`
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
      if (this._i > 1) {
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