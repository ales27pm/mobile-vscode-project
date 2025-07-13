import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../state/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import AuthScreen from '../screens/AuthScreen';
import WorkspaceScreen from '../screens/WorkspaceScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, loadToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      await loadToken();
      setIsLoading(false);
    };
    bootstrapAsync();
  }, [loadToken]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          <>
            <Stack.Screen
              name="WorkspaceSelector"
              component={WorkspaceScreen}
              options={{ title: 'Select Workspace' }}
            />
            <Stack.Screen
              name="MainApp"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ title: 'Pair with VS Code' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
