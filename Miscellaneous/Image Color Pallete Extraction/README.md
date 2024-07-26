## Extract Color Pallete From Image

### About
Skia provides an API for reading the pixels of an image, after learning such a thing I looked for libraries and or tutorials on image color extraction, but none satisfied my needs and requirements with the exception of the popular [color thief](https://github.com/lokesh/color-thief) library, the problem with this one is that is browser based, so I made small modifications to the source code in order to be used with React Native Skia.

### Footage
https://github.com/user-attachments/assets/d51c8fe6-49fd-4eba-b6be-5097ac3e408d

### Libraries
- @shopify/react-native-skia
- color-thief (modified to work with skia)

### How to run
```sh
yarn install
npx expo start --clear
```
