## Telegram QR Code Generator

### About
Telegram is one of my favorite apps by a long shot, I really love the way they made the QR codes to go from boring and planes squaares to a delightful look and feel, so I tried my best to recreate this awesome UI the best of my abilities.

Pay attention, colors rotate as time passes by.

### Footage
https://github.com/user-attachments/assets/42c1b0fb-e3e2-4f98-a04b-3c7fe67d17b1

### Important Notes
- I have taken the code of [react-native-qr-svg](https://github.com/exzos28/react-native-qr-svg) and [simple-noise](https://github.com/jwagner/simplex-noise.js) libraries and modified them to meet my particular needs for this project.

### Libraries used
- react-native-reanimated
- @shopify/react-native-skia
- fbemitter
- react-native-qr-svg (modified)
- simplex-noise (modified, just add worklet directive)

### How to run
```sh
yarn install
npx expo start --clear
```
