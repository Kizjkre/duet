// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

function xmur3(num) {
  for (var i = 0, h = 1779033703 ^ num; i < num; i++)
    h = Math.imul(h ^ num, 3432918353),
      h = h << 13 | h >>> 19;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}