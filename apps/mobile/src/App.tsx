import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { NavigationContainer } from '@react-navigation/native';
import { client } from './apolloClient';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer>
        {/* AppNavigator sets up the main tab navigation */}
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </ApolloProvider>
  );
}
