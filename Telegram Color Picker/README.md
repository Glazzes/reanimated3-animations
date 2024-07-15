## Telegram Color Picker

### About
A replica of Telegram's color pickers found under the image editor section of the app.

It's not meant to be a one to one representation, but close enough to copy its more remarkable features.

### Footage
https://github.com/user-attachments/assets/e651593e-6147-437f-9fd2-b934bbe1cc25

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
