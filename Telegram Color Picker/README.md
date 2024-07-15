## Telegram Color Picker

### About
A replica of Telegram's color pickers found under the image editor section of the app, it's not meant to be a one to one representation, but close enough to copy its more remarkable features.

### Footage
https://github.com/user-attachments/assets/29504733-c405-4b26-8837-e4306f81fc47

### Important Notes
- Skia images have a method called `readPixels` that can be used to get the color of a pixel at a given xy coordiantes.

### Libraries used
- react-native-reanimated
- react-native-gesture-handler
- @shopify/react-native-skia
- fbemitter

### How to run
```sh
npm install
npx expo start --clear
```
