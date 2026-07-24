import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ExplorerScreen from '../screens/Explorer';
import SearchScreen from '../screens/Search';
import GitScreen from '../screens/Git';
import ExtensionsScreen from '../screens/Extensions';
import DebugScreen from '../screens/Debug';
import type { RootStackParamList } from './AppNavigator';

type MainTabParamList = {
  Explorer: { workspaceUri: string; workspaceName: string };
  Search: { workspaceUri: string };
  Git: { workspaceUri: string };
  Extensions: undefined;
  Debug: { workspaceUri: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'MainApp'>;

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, React.ComponentProps<typeof Ionicons>['name']> = {
  Explorer: 'folder',
  Search: 'search',
  Git: 'git-branch',
  Extensions: 'extension-puzzle',
  Debug: 'bug',
};

export default function MainTabNavigator({ route }: Props) {
  const { workspaceUri, workspaceName } = route.params;

  return (
    <Tab.Navigator
      initialRouteName="Explorer"
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[tabRoute.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Explorer"
        component={ExplorerScreen as React.ComponentType<any>}
        initialParams={{ workspaceUri, workspaceName }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen as React.ComponentType<any>}
        initialParams={{ workspaceUri }}
      />
      <Tab.Screen
        name="Git"
        component={GitScreen as React.ComponentType<any>}
        initialParams={{ workspaceUri }}
      />
      <Tab.Screen name="Extensions" component={ExtensionsScreen} />
      <Tab.Screen
        name="Debug"
        component={DebugScreen as React.ComponentType<any>}
        initialParams={{ workspaceUri }}
      />
    </Tab.Navigator>
  );
}
