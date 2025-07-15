import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Explorer from '../screens/Explorer';
import Git from '../screens/Git';
import Extensions from '../screens/Extensions';
import Search from '../screens/Search';
import Debug from '../screens/Debug';

const Tab = createBottomTabNavigator();

const iconMap: Record<string, string> = {
  Explorer: 'file-tree',
  Search: 'magnify',
  Git: 'source-branch',
  Extensions: 'puzzle',
  Debug: 'bug',
};

export default function MainTabNavigator({ route }) {
  const { workspaceUri } = route.params;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Icon name={iconMap[route.name]} size={size} color={color} />
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explorer" component={Explorer} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Search" component={Search} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Git" component={Git} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Extensions" component={Extensions} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Debug" component={Debug} initialParams={{ workspaceUri }} />
    </Tab.Navigator>
  );
}
