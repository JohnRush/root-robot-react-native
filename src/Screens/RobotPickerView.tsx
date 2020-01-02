import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import * as robotFinder from '../RootByRobot/RobotFinder';
import {BleDeviceInformation, Robot} from '../RootByRobot';

const currentStatusText = (status?: robotFinder.Status): string => {
  if (!status) {
    return 'Initializing';
  }

  if (!status.isPoweredOn) {
    return 'Waiting for Bluetooth';
  }

  return status.isScanning ? 'Scanning' : 'Not Scanning';
};

interface FindAllRobotsViewProps {
  onConnect: (robot: Robot) => void;
}

const RobotPickerView = ({onConnect}: FindAllRobotsViewProps) => {
  const [autoStarted, setautoStarted] = useState<boolean>(false);
  const [finder, setFinder] = useState<robotFinder.RobotFinder>();
  const [allRobots, setAllRobots] = useState<BleDeviceInformation[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<BleDeviceInformation>();
  const [finderStatus, setFinderStatus] = useState<robotFinder.Status>();

  const connectToRobot = async (info: BleDeviceInformation) => {
    if (finder) {
      finder.stopScanning();
    }
    const robot = new Robot(info);
    await robot.connect();
    onConnect(robot);
  };

  useEffect(() => {
    if (!finder) {
      setFinder(new robotFinder.RobotFinder());
    }
  }, []);

  useEffect(() => {
    if (finder) {
      finder.emitter.on('status', (status: robotFinder.Status) => {
        setFinderStatus(status);
      });
      finder.emitter.on('robots', (robots: BleDeviceInformation[]) => {
        setAllRobots(robots);
      });
    }
  }, [finder]);

  useEffect(() => {
    if (finder && finderStatus) {
      const status = finderStatus;
      if (status.isPoweredOn && !status.isScanning && !autoStarted) {
        setautoStarted(true);
        finder.startScanning();
      }
    }
  }, [finderStatus]);

  let detailsPanel;
  if (selectedRobot) {
    detailsPanel = (
      <>
        <Text>{'Id: ' + selectedRobot.id}</Text>
        <Text>{'Name: ' + selectedRobot.name}</Text>
        <Text>{'Local Name: ' + selectedRobot.localName}</Text>
        <Text>
          {'serviceUUIDs: ' + JSON.stringify(selectedRobot.serviceUUIDs)}
        </Text>
        <Button
          onPress={() => {
            connectToRobot(selectedRobot);
          }}
          title={`Connect to ${selectedRobot.name}`}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text
                style={{
                  ...styles.sectionTitle,
                  textAlign: 'center',
                  backgroundColor: 'lightblue',
                }}>
                {currentStatusText(finderStatus)}
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text
                style={
                  styles.sectionTitle
                }>{`Robots (${allRobots.length})`}</Text>
              <View>
                {allRobots.map(device => (
                  <TouchableOpacity
                    key={device.id}
                    onPress={() => setSelectedRobot(device)}>
                    <Text
                      style={{
                        fontWeight:
                          device === selectedRobot ? 'bold' : 'normal',
                      }}>{`${device.name} [${device.id}]`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Details</Text>
              {detailsPanel}
            </View>
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

export default RobotPickerView;
