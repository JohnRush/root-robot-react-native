import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  Robot,
  BumpersState,
  CliffSensorState,
  TouchSensorsState,
} from '../RootByRobot';
import * as Sequencer from '../Extras/sequencer';

export interface ActiveRobotProps {
  robot: Robot;
}

const Pill = (props: any) => (
  <View
    style={{
      margin: 1,
      padding: 5,
      backgroundColor: 'black',
      borderRadius: 10,
      alignSelf: 'flex-start',
    }}>
    <Text style={{fontSize: 10, fontWeight: 'bold', color: 'white'}}>
      {props!.children}
    </Text>
  </View>
);

const Button = (
  props: React.PropsWithChildren<{
    onPress: (event: GestureResponderEvent) => void;
  }>,
) => (
  <TouchableOpacity onPress={props.onPress} style={{alignItems: 'center'}}>
    <View style={styles.buttonStyle}>
      <Text style={styles.buttonText}>{props.children}</Text>
    </View>
  </TouchableOpacity>
);

const PressableButton = (
  props: React.PropsWithChildren<{
    onPress: (event: GestureResponderEvent) => void;
    onRelease: (event: GestureResponderEvent) => void;
  }>,
) => (
  <TouchableOpacity
    onPressIn={props.onPress}
    onPressOut={props.onRelease}
    style={{alignItems: 'center'}}>
    <View style={styles.buttonStyle}>
      <Text style={styles.buttonText}>{props.children}</Text>
    </View>
  </TouchableOpacity>
);

const ActiveRobot = (props: ActiveRobotProps) => {
  const {robot} = props;
  const [bumpers, setBumpers] = useState<BumpersState>();
  const [cliff, setCliff] = useState<boolean>(false);
  const [touchSensorsState, setTouchSensorsState] = useState<
    TouchSensorsState
  >();
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    robot.emitter.on('touch:touchChanged', setTouchSensorsState);
    robot.emitter.on('bumpers:bumpersChanged', setBumpers);
    robot.emitter.on('cliff:cliffChanged', (x: CliffSensorState) =>
      setCliff(x.isCliffDetected),
    );
  }, []);

  function updateBatteryLevel() {
    robot.devices.battery
      .getBatteryLevel()
      .then(({percent}) => setBatteryLevel(percent))
      .catch(() => setBatteryLevel(undefined));
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F0F0F0'}}>
      <View style={{backgroundColor: '#F0F0F0', padding: 3}}>
        <Text style={styles.sectionTitle}>{robot.name || 'Unnamed Robot'}</Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.body}>
          {/* <Button
            onPress={() => {
              robot.devices.colorSensor
                .getColorData(0, LightingOption.All)
                .then(console.log);
            }}>
            Get Color Data Bank 0
          </Button> */}
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
            onPress={() =>
              robot.devices.motors.setLeftAndRightMotorSpeed(-100, -100)
            }
            onRelease={() =>
              robot.devices.motors.setLeftAndRightMotorSpeed(0, 0)
            }>
            Drive Backwards
          </PressableButton>
          <PressableButton
            onPress={() => robot.devices.motors.setLeftMotorSpeed(75)}
            onRelease={() => robot.devices.motors.setLeftMotorSpeed(0)}>
            Turn Right
          </PressableButton>
          <PressableButton
            onPress={() => robot.devices.motors.setRightMotorSpeed(75)}
            onRelease={() => robot.devices.motors.setRightMotorSpeed(0)}>
            Turn Left
          </PressableButton>
          <Button onPress={updateBatteryLevel}>
            {'Get Battery Level' +
              (batteryLevel === undefined ? '' : ` (${batteryLevel}%)`)}
          </Button>
        </View>
      </ScrollView>
      <View style={styles.StatusBarView}>
        {bumpers && bumpers.isLeftBumperPressed && <Pill>LB</Pill>}
        {bumpers && bumpers.isRightBumperPressed && <Pill>RB</Pill>}
        {cliff && <Pill>Cliff</Pill>}
        {touchSensorsState && touchSensorsState.isFrontLeftSensorTouched && (
          <Pill>Touch-FL</Pill>
        )}
        {touchSensorsState && touchSensorsState.isFrontRighSensorTouched && (
          <Pill>Touch-FR</Pill>
        )}
        {touchSensorsState && touchSensorsState.isRearLeftSensorTouched && (
          <Pill>Touch-RL</Pill>
        )}
        {touchSensorsState && touchSensorsState.isRearRightSensorTouched && (
          <Pill>Touch-RR</Pill>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  StatusBarView: {
    flexDirection: 'row',
    alignSelf: 'center',
    height: 35,
    paddingTop: 10,
  },
  scrollView: {
    backgroundColor: 'white',
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  buttonStyle: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '80%',
    alignItems: 'center',
    backgroundColor: 'cornflowerblue',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
  },
});

export default ActiveRobot;
