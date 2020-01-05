import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Robot, LightingOption, BumpersEvent} from '../RootByRobot';
import * as Sequencer from '../Extras/sequencer';

export interface ActiveRobotProps {
  robot: Robot;
}

const ActiveRobot = (props: ActiveRobotProps) => {
  const {robot} = props;
  const [bumpers, setBumpers] = useState<BumpersEvent>();

  useEffect(() => {
    robot.emitter.on('bumpers:Event', setBumpers);
  }, []);

  const Button = (
    props: React.PropsWithChildren<{
      onPress: (event: GestureResponderEvent) => void;
    }>,
  ) => (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          width: '80%',
          alignItems: 'center',
          backgroundColor: 'cornflowerblue',
          borderRadius: 10,
        }}>
        <Text>{props.children}</Text>
      </View>
    </TouchableOpacity>
  );

  const PressableButton = (
    props: React.PropsWithChildren<{
      onPress: (event: GestureResponderEvent) => void;
      onRelease: (event: GestureResponderEvent) => void;
    }>,
  ) => (
    <TouchableOpacity onPressIn={props.onPress} onPressOut={props.onRelease}>
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          width: '80%',
          alignItems: 'center',
          backgroundColor: 'cornflowerblue',
          borderRadius: 10,
        }}>
        <Text>{props.children}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text>
                <Text style={styles.sectionTitle}>{robot.name}</Text>
                {bumpers && bumpers.isLeftBumperPressed && <Text>LB</Text>}
                {bumpers &&
                  bumpers.isLeftBumperPressed &&
                  bumpers.isRightBumperPressed && <Text>-</Text>}
                {bumpers && bumpers.isRightBumperPressed && <Text>RB</Text>}
              </Text>
            </View>
            <Button
              onPress={() => {
                robot.devices.colorSensor.getColorData(0, LightingOption.All);
              }}>
              Get Color Data Bank 0
            </Button>
            <Button
              onPress={() => {
                robot.devices.motors.rotateAngle(900);
              }}>
              Rotate 90 Clockwise
            </Button>
            <Button
              onPress={() => {
                robot.devices.motors.rotateAngle(-900);
              }}>
              Rotate 90 Counter-Clockwise
            </Button>
            <PressableButton
              onPress={() =>
                robot.devices.motors.setLeftAndRightMotorSpeed(100, 100)
              }
              onRelease={() =>
                robot.devices.motors.setLeftAndRightMotorSpeed(0, 0)
              }>
              Drive Forward
            </PressableButton>
            <PressableButton
              onPress={() => robot.devices.motors.setLeftMotorSpeed(75)}
              onRelease={() => robot.devices.motors.setLeftMotorSpeed(0)}>
              Left Forward
            </PressableButton>
            <PressableButton
              onPress={() => robot.devices.motors.setRightMotorSpeed(75)}
              onRelease={() => robot.devices.motors.setRightMotorSpeed(0)}>
              Right Forward
            </PressableButton>
            <Button onPress={() => robot.devices.battery.getBatterLevel()}>
              Get Battery Level
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default ActiveRobot;
