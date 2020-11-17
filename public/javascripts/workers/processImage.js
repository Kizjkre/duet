(async () => {
  importScripts('./prng.js');

  const sigmoid = (input, { min, max, center, coefficient } = { min: 0, max: 1, center: 0, coefficient: 1 }) =>
    (max - min) / (1 + Math.E ** (-coefficient * (input - center))) + min;

  let path = '';

  const findChord = async (value, activkey) => {
    try {
      if (path.split(',').length > 4) {
        path = '';
        return await findChord(value, activkey);
      }
      const chords = await (await fetch(`https://api.hooktheory.com/v1/trends/nodes${ path.length === 0 ? '' : `?cp=${ path }` }`, {
        headers: {
          Authorization : `Bearer ${ activkey }`
        }
      })).json();
      let total = 0;
      let chord;
      for (const c of chords) {
        total += c.probability * 1000;
        if (total > sigmoid(value, { min: 0, max: 1, center: 0.75 * 255, coefficient: 0.05 }) * 1000) {
        // if (total > value * 1000) {
          console.log(c);
          path = c.child_path;
          chord = c;
          break;
        }
      }
      return chord;
    } catch {
      path = '';
      return await findChord(value, activkey);
    }
  };

  addEventListener('message', async e => {
    const { pixels, activkey, first } = e.data;
    let avg = 0;
    let hue = 0;
    let colors = { r: 0, g: 0, b: 0 };
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
      avg += (r + g + b) / 3;
      colors.r += r / 255;
      colors.g += g / 255;
      colors.b += b / 255;
    }
    avg /= pixels.length / 4;
    colors.r /= pixels.length / 4;
    colors.g /= pixels.length / 4;
    colors.b /= pixels.length / 4;
    const max = Math.max(colors.r, colors.g, colors.b);
    const min = Math.min(colors.r, colors.g, colors.b);
    switch (max) {
      case colors.r:
        hue = 60 * (colors.g - colors.b) / (max - min);
        break;
      case colors.g:
        hue = 60 * (2 + (colors.b - colors.r)) / (max - min);
        break;
      case colors.b:
        hue = 60 * (4 + (colors.r - colors.g)) / (max - min);
        break;
    }
    hue = hue < 0 ? hue + 360 : hue;

    const rng = mulberry32(xmur3(avg)());
    const chord = await findChord(hue, activkey, path);
    // const duration = Math.round(sigmoid(rng(), { min: 2, max: 4, center: 0.5, coefficient: 10 }));
    const duration = rng() > 0.5 ? 2 : 4;
    console.log(duration);

    if (first) {
      const bpm = Math.round(sigmoid(avg, { min: 60, max: 100, center: 0.75 * 255, coefficient: 0.05 }));
      path = chord.child_path;
      const chord2 = await findChord(rng(), activkey);
      postMessage({ bpm, chord, duration, chord2, duration2: duration });
    } else {
      postMessage({ chord, duration });
    }
  });
})();