## Spotify Lyrics

### About
I always though of Spotify Lyrics to be a simple animation, it could not be farther from the truth, animating the
lyrics based on time is quite a trivial task, but trnslation and time scroll synchronization proved to be very
difficult to implement.

I had to write my own scroll logic as the Expo GO would crash, ScrollView had huge performance issues when an animation
was taking place at the same time scroll occured.

### Footage

https://github.com/user-attachments/assets/b6cb360d-eb7a-440a-b2bf-e516ee81999e

### Libraries
- Reanimated
- Gesture Handler
- Skia

### How to run
```sh
# If the project is not running the latest Expo SDK, run the two following commands
yarn add expo
npx expo install --fix

yarn install
npx expo start --clear
```
