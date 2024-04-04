import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddRecord from './component/AddRecord';
import ViewRecords from './component/ViewRecords';
import RunningTracker from './component/RunningTrackerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Running Tracker" component={RunningTracker} />
        <Tab.Screen name="Add Record" component={AddRecord} />
        <Tab.Screen name="View Records" component={ViewRecords} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
