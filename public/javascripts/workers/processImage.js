importScripts('./prng.js');

const sigmoid = (input, { min, max, center, coefficient } = { min: 0, max: 1, center: 0, coefficient: 1 }) =>
  (max - min) / (1 + Math.E ** (-coefficient * (input - center))) + min;

addEventListener('message', async e => {
  const { pixels, activkey } = e.data;
  let avg = 0;
  let luminance = 0;
  let hue = 0;
  let colors = { r: 0, g: 0, b: 0 };
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    avg += (r + g + b) / 3;
    luminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    colors.r += r / 255;
    colors.g += g / 255;
    colors.b += b / 255;
  }
  avg /= pixels.length / 4;
  luminance /= pixels.length / 4;
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

  const bpm = Math.round(sigmoid(avg, { min: 60, max: 100, center: 0.75 * 255, coefficient: 0.05 }));
  const chords = await (await fetch('https://api.hooktheory.com/v1/trends/nodes', {
    headers: {
      Authorization : `Bearer ${ activkey }`
    }
  })).json();
  let total = 0;
  let chord;
  for (const c of chords) {
    total += c.probability * 1000;
    if (total > sigmoid(luminance, { min: 0, max: 1, center: 0.75 * 255, coefficient: 0.05 }) * 1000) {
      chord = c;
      break;
    }
  }
  const duration = Math.round(sigmoid(hue, { min: 0.5, max: 2, center: 0.5, coefficient: 10 }) * 2) / 2;
  const rng = mulberry32(xmur3(avg)());
  const lookup = await (await fetch('../../assets/lookup.json')).json();
  const level = Math.round(rng() * (lookup[chord.chord_ID].length - 1));
  const notes = lookup[chord.chord_ID][level];
  const note = lookup[chord.chord_ID][level][Math.round(rng() * (notes.length - 1))];
  console.dir(chords);
  console.log(bpm, chord, duration, note);
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
});