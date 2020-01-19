# root-robot-react-native
You can use this as a starting place to get a Root Robot by iRobot working on you Android phone. iRobot seems to have great tools for their current target audience, but I wanted to see what I could do on my own using my Windows PC and Android phone. If you are in the same boat, this might help you out.
## Warning
This is really rough and mostly untested. I don't know what to expect in terms of failure states and behaviors, so there are a lot of places that assume success. I have only tested this building on Windows 10 and running and a Samsung S10, so I suspect there all all kinds of problems running on other devices.
This is intended for experienced programmers. The Root Robot team say they are working on an Android App for everyone. If you don't want to hand-code the robot directly, you may want to wait for that.
## Root Robot Reference
This entire project is based on the specification provided here: https://github.com/RootRobotics/root-robot-ble-protocol
## Note to the Root Team
I had a lot of fun putting this together. My wife bought me a Root Robot for Christmas and I've been tinkering with it since then. I really love what you are doing to help educate the next generation and I appreaciate you making the BLE spec available to the community.
## Instructions
*Warning:* You probably need Android Studio installed and Java stuff configured and all kinds of stuff that React Native expects. So make sure you are comfortable working with React Native projects before tackling this.
* Clone this respository
* Connect an Android device to your development machine
```
yarn install
yarn run android
```
* Power-up your robot
* See what happens
