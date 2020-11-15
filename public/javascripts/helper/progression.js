import createBufferMap from './createBufferMap.js';

export default class ChordProgression {
  constructor(context, source, gain) {
    this._context = context;
    this._source = source;
    this._amp = gain;
    this._progression = [];
    this._i = 0;

    this._amp[0].gain.value = 0.5;
    this._amp[1].gain.value = 0.5;

    this._source[0].connect(this._amp[0]).connect(this._context.destination);
    this._source[1].connect(this._amp[0]).connect(this._context.destination);

    this._audio = [new Audio(), new Audio()];
  }

  addChord(chord, duration) {
    this._progression.push({ chord, duration });
    return this;
  }

  async play(callback, recursive = false) {
    if (this._progression.length > 0) {
      if (!recursive) {
        this._audio[this._i % 2].src = `/assets/chords/${ this._progression[this._i].chord.chord_ID }.wav`;
      }
      this._audio[this._i % 2].play();
      if (this._i + 1 < this._progression.length) {
        this._audio[(this._i + 1) % 2].src = `/assets/chords/${ this._progression[this._i + 1].chord.chord_ID }.wav`;
        this._audio[(this._i + 1) % 2].load();
        console.log(this._progression[this._i + 1].chord.chord_ID);
      }
      setTimeout(callback, this._progression[this._i].duration * 1000 / 2);
      setTimeout(() => {
        this._audio[this._i++ % 2].pause();
        this.play(callback, true);
      }, this._progression[this._i].duration * 1000);
    }
    return this;
  }
}