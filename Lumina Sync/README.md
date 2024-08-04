## Lumina Sync

### About
Exploring Dribbble I came across this [beatiful design](https://dribbble.com/shots/23029213-Lumina-Sync) and I found
it very interesting and luckily for me around the same time frame I was watching William Candillon's
[video on shaders](https://www.youtube.com/watch?v=KgJUNYS7ZnA&t=1856s), the techniques showcased in the video
were very helpful for this shader development.

Although this shader could actually be a lot of particles using Skia's Atlas API, the amount of code
required for such a task is highly reduced by simple turning it into a shader.

### Footage
https://github.com/user-attachments/assets/1c25380a-8141-448b-99dc-f6d660c64347

### Topics
- Shaders
- Gestures

### Libraries
- react-native-reanimated
- react-native-gesture-handler
- @shopify/react-native-skia

### How to Run
```sh
yarn install
npx expo start --clear
```
