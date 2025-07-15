# 🤖 Ely Chatbot

**Ely Chatbot** is a reusable React Native component library developed for **Axis Max Life Insurance**. This package provides chatbot functionalities that can be easily integrated into other React Native projects within the organization.

---

## 📦 Installation

Install the library using either Yarn:

```sh
yarn add mlielychatbot
```

or npm:

```sh
npm install mlielychatbot
```

## 📂 Required Peer Dependencies

```sh
"@react-native-async-storage/async-storage": "^2.1.2",
"@react-native-clipboard/clipboard": "^1.16.2",
"@react-navigation/native": "^7.0.19",
"@react-navigation/stack": "^7.2.3",
"react-dom": "18.0.0",
"react-native-gesture-handler": "^2.24.0",
"react-native-paper": "^5.13.1",
"react-native-reanimated": "^3.17.1",
"react-native-safe-area-context": "^5.3.0",
"react-native-screens": "^4.10.0",
"react-native-svg-transformer": "^1.5.0",
"react-native-vector-icons": "^10.2.0",
"react-native-view-shot": "^4.0.3",
"react-native-webview": "^13.13.5",
"react-native-blob-util": "^0.21.2",
```

## ⚙️ Android Configuration

🧾 Add the following permissions to android/app/src/main/AndroidManifest.xml:

```sh
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

🧩 Update your android/app/build.gradle:

```sh
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn run android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn run ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).
