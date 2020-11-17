(async () => {
  importScripts('./prng.js');

  const sigmoid = (input, { min, max, center, coefficient } = { min: 0, max: 1, center: 0, coefficient: 1 }) =>
    (max - min) / (1 + Math.E ** (-coefficient * (input - center))) + min;

  const lookup = await (await fetch('../../assets/lookup.json')).json();

  addEventListener('message', async e => {
    const { pixels, chord } = e.data;
    let avg = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
      avg += (r + g + b) / 3;
    }
    avg /= pixels.length / 4;

    const rng = mulberry32(xmur3(avg)());
    const duration = Math.round(sigmoid(rng(), { min: 1, max: 3, center: 0.5, coefficient: 10 }));
    console.log(chord);
    const level = Math.round(rng() * (lookup[chord.chord_ID].length - 1));
    const notes = lookup[chord.chord_ID][level];
    const note = lookup[chord.chord_ID][level][Math.round(rng() * (notes.length - 1))];
    let length;
    switch (level) {
      case 0:
        length = Math.round(sigmoid(rng(), { min: 0.25, max: 1, center: 0.5, coefficient: 10 }) * 8) / 8;
        break;
      case 1:
        length = Math.round(sigmoid(rng(), { min: 0.125, max: 0.5, center: 0.5, coefficient: 10 }) * 8) / 8;
        break;
      case 2:
        length = Math.round(sigmoid(rng(), { min: 0.125, max: 0.25, center: 0.5, coefficient: 10 }) * 8) / 8;
        break;
    }
    console.log(note, duration);
    postMessage({ note, duration });
  });
})();