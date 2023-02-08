# TinyBLEStat_MobileApp

This react-native project is designed for use with the TinyBLEStat PCB Devices. Contact tfanelli@clarkson.edu for help and more info.

## Prerequisites
  1.  Install `node` and either `npm` or `yarn` 
  1.  Install Android Studio (alternatively, IntelliJ IDEA Community Edition with Android plugins)
  1.  Install Android SDK 33
  1.  Install OpenJDK 11

## Quick Start
  1.  Add the following to your environment:  
       ```
       export JAVA_HOME=/path/to/java-11-openjdk/
       export ANDROID_SDK_ROOT=/path/to/android-sdk/
       export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools/
       ```
  1. `cd` to your project directory
  1. Install the node modules: `yarn install`
  1. Launch the Metro CLI: `yarn start`
  1. In another terminal, build and deploy the app to your phone: `yarn run android`
  
Please note that bluetooth /is not/ supported in the Android Emulator. You must run this on device for testing. See documentation here: https://reactnative.dev/docs/running-on-device

https://user-images.githubusercontent.com/109687210/217391740-c9fef47a-7da1-4606-971e-ffbee8b7e85e.mp4

