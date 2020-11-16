import createBufferMap from './createBufferMap.js';

export default class Progression {
  constructor(context, source, gain) {
    this._context = context;
    this._source = [];
    this._amp = gain;
    this._progression = [];
    this._i = 0;

    this._amp[0].gain.value = 0.3;
  }

  addChord(chord, duration) {
    this._progression.push({ chord, duration });
    return this;
  }

  async play(callback, recursive = false) {
    if (this._progression.length > 0) {
      if (!recursive) {
        this._source.push(new AudioBufferSourceNode(this._context));
        const buffer = await createBufferMap(this._context, [{ key: 'map', url: `/assets/chords/${ this._progression[this._i].chord.chord_ID.replace('/', ':') }.wav` }]);
        this._source[this._i].buffer = buffer.map;
        this._source[this._i].connect(this._amp[0]).connect(this._context.destination);
      }

      callback();

      const now = this._context.currentTime;
      this._source[this._i].start();
      this._source[this._i].stop(now + this._progression[this._i].duration);
      if (this._i + 1 < this._progression.length) {
        createBufferMap(this._context, [{ key: 'map', url: `/assets/chords/${ this._progression[this._i + 1].chord.chord_ID.replace('/', ':') }.wav` }]).then(res => {
          this._source.push(new AudioBufferSourceNode(this._context));
          this._source[this._i + 1].buffer = res.map;
          this._source[this._i + 1].connect(this._amp[0]).connect(this._context.destination);
        });
      }
      this._source[this._i].onended = () => {
        this._i++;
        this.play(callback, true);
      };
    }
    return this;
  }
}