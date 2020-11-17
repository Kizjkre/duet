# Duet
## Creating music and connecting people

Duet is a WebRTC-powered video chat app that plays background music. Depending on various factors of your stream as well as your partner's stream, Duet will generate chords and melodies with a Markov chain. Using Hooktheory's Trends API, Duet will average the RGB values of your stream to determine the chord, duration, and BPM. The melody is generated with your partner's video stream with a lookup table that matches chords to consonant notes. These notes and their durations are independent of the chords. To mimic an actual piece, we used piano, guzheng, and drum samples.

### Setup
1. `git clone https://www.github.com/Kizjkre/duet`
2. `yarn` or `npm i` (`yarn` recommended)
3. `yarn start` or `npm start` to run dev server.

### Music 15N Final Project