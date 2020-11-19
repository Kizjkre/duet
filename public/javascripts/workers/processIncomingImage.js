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
    // console.log(chord);
    const row = lookup[chord.chord_ID] ?
      lookup[chord.chord_ID] :
      lookup[chord.chord_ID[0]] ?
        lookup[chord.chord_ID[0]] :
        lookup[lookup.length - 1];
    const level = Math.round(rng() * (row.length - 1));
    const note = row[level][Math.round(rng() * (row[level].length - 1))];
    let length;
    switch (level) {
      case 0:
        length = Math.round(sigmoid(rng(), { min: 2, max: 3, center: 0.5, coefficient: 10 }) * 8) / 8;
        break;
      case 1:
        length = Math.round(sigmoid(rng(), { min: 1, max: 2, center: 0.5, coefficient: 10 }) * 8) / 8;
        break;
      case 2:
        length = Math.round(sigmoid(rng(), { min: 0.5, max: 1, center: 0.5, coefficient: 10 }) * 8) / 8;
        break;
    }
    // console.log(note, duration);
    postMessage({ note, duration: length });
  });
})();