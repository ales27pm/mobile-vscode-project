import React, { useEffect, useState } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import ExplorerScreen from '../screens/Explorer';
import EditorScreen from '../screens/Editor';
import SearchScreen from '../screens/Search';
import GitScreen from '../screens/Git';
import ExtensionsScreen from '../screens/Extensions';
import DebugScreen from '../screens/Debug';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  // (Optional) state or effect for handling navigation readiness, auth, etc.
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    // Any startup logic, e.g., check auth, then:
    setReady(true);
  }, []);

  if (!isReady) {
    // Could return a loading indicator
    return null;
  }

  return (
    <Tab.Navigator
      initialRouteName="Explorer"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Explorer':
              iconName = 'folder';
              break;
            case 'Editor':
              iconName = 'code-slash';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'Git':
              iconName = 'git-branch';
              break;
            case 'Extensions':
              iconName = 'extensions'; // hypothetical icon name
              break;
            case 'Debug':
              iconName = 'bug';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Explorer" component={ExplorerScreen} />
      <Tab.Screen name="Editor" component={EditorScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Git" component={GitScreen} />
      <Tab.Screen name="Extensions" component={ExtensionsScreen} />
      <Tab.Screen name="Debug" component={DebugScreen} />
    </Tab.Navigator>
  );
}
