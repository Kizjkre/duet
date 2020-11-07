importScripts('./prng.js');

const sigmoid = (input, { min, max, center, coefficient } = { min: 0, max: 1, center: 0, coefficient: 1 }) =>
  (max - min) / (1 + Math.E ** (-coefficient * (input - center))) + min;

addEventListener('message', async e => {
  const { pixels, activkey } = e.data;
  let avg = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
    avg += (r + g + b) / 3;
  }
  avg /= pixels.length / 4;

  const bpm = Math.round(sigmoid(avg, { min: 60, max: 100, center: 0.75 * 255, coefficient: 0.05 }));
  const rng = mulberry32(xmur3(avg)());
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
  console.log(chord);
  const duration = Math.round(sigmoid(choices[1], { min: 0.5, max: 2, center: 0.5, coefficient: 10 }) * 2) / 2;
});