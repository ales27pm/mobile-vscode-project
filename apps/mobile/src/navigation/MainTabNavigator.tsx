import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

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

type MainTabNavigatorProps = { route: { params?: { workspaceUri?: string } } };

export default function MainTabNavigator({ route }: MainTabNavigatorProps) {
  const { workspaceUri } = route.params || {};
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Icon
            name={(iconMap[route.name as keyof typeof iconMap] ?? 'file') as keyof typeof Icon.glyphMap}
            size={size}
            color={color}
          />
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explorer" component={Explorer as React.ComponentType<any>} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Search" component={Search as React.ComponentType<any>} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Git" component={Git as React.ComponentType<any>} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Extensions" component={Extensions as React.ComponentType<any>} initialParams={{ workspaceUri }} />
      <Tab.Screen name="Debug" component={Debug as React.ComponentType<any>} initialParams={{ workspaceUri }} />
    </Tab.Navigator>
  );
}
