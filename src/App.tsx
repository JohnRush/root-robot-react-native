import React, {useState, useEffect} from 'react';
import RobotInstantiator2 from './Screens/RobotPickerView';
import RobotInstantiator from './Screens/FindFirstRobotView';
import ActiveRobot from './Screens/ActiveRobot';
import {Robot} from './RootByRobot';

declare var global: {HermesInternal: null | {}};

const App = () => {
  const [robot, setRobot] = useState<Robot>();

  if (robot) {
    return <ActiveRobot robot={robot} />;
  }
  return <RobotInstantiator onConnect={setRobot} />;
};

export default App;
