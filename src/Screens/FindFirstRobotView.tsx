import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Robot} from '../RootByRobot';
import {FindFirstRobot} from '../Extras/FindFirstRobot';

interface Props {
  onConnect: (robot: Robot) => void;
}

/** Example of using the first robot we can find. */
const FindFirstRobotView = (props: Props) => {
  const [robot, setRobot] = useState<Robot>();

  useEffect(() => {
    (async () => {
      const finder = new FindFirstRobot();
      const robot = await finder.findFirstRobot();
      finder.dispose();
      setRobot(robot);
      props.onConnect(robot);
    })();
  }, []);

  let status;
  if (robot) {
    status = <Text style={styles.box}>Found</Text>;
  } else {
    status = <Text style={styles.box}>Looking...</Text>;
  }

  return <View style={styles.mainview}>{status}</View>;
};

const styles = StyleSheet.create({
  mainview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: 'lightgray',
    width: '80%',
    padding: 10,
    textAlign: 'center',
    borderRadius: 10,
  },
});

export default FindFirstRobotView;
