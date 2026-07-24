import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import WorkspaceScreen from '../screens/WorkspaceScreen';
import { useAuthStore } from '../state/authStore';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  WorkspaceList: undefined;
  MainApp: { workspaceUri: string; workspaceName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const token = useAuthStore(state => state.token);
  const isHydrated = useAuthStore(state => state.isHydrated);
  const loadToken = useAuthStore(state => state.loadToken);

  useEffect(() => {
    void loadToken();
  }, [loadToken]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {token ? (
        <>
          <Stack.Screen
            name="WorkspaceList"
            component={WorkspaceScreen}
            options={{ title: 'Workspaces' }}
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
          options={{ title: 'Pair Device' }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
