## Drawing App Color Picker

### About
A HSL color model color picker inspired by this [photoshop plugin](https://exchange.adobe.com/apps/cc/100511/magicpicker-professional-photoshop-color-wheel), as far as I can tell this plugin is static, I can not exactly recall in which drawing desktop application I saw the selector being rotated, nonetheless I found the rotation to be a great addition as well as a learning excersise.

### Footage
https://github.com/user-attachments/assets/a81e9bbe-ab4b-446c-8772-2021db549cbd

### Important Notes
- Use a 2D rotation matrix to cancel the effect of transform property's `rotate` behaviour while panning.

### Libraries used
- react-native-reanimated
- react-native-gesture-handler
- @shopify/react-native-skia

### How to run
```sh
yarn install
npx expo start --clear
```
