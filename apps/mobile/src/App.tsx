import 'react-native-url-polyfill/auto';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { client } from './apolloClient';
import Explorer from './screens/Explorer';
import Git from './screens/Git';
import Extensions from './screens/Extensions';
import Search from './screens/Search';

const Tab = createBottomTabNavigator();

const iconMap: Record<string, string> = {
  Explorer: 'file-tree',
  Search: 'magnify',
  Git: 'source-branch',
  Extensions: 'puzzle',
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => (
              <Icon name={iconMap[route.name]} size={size} color={color} />
            ),
            headerShown: false,
          })}
        >
          <Tab.Screen name="Explorer" component={Explorer} />
          <Tab.Screen name="Search" component={Search} />
          <Tab.Screen name="Git" component={Git} />
          <Tab.Screen name="Extensions" component={Extensions} />
        </Tab.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
}
