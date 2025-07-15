import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useErrorAlert } from '../hooks/useErrorAlert';
import { GetLaunchConfigurationsDocument, StartDebuggingDocument, StopDebuggingDocument, DebuggerEventDocument } from 'shared/src/types';
import { useDebugStore } from '../state/debugStore';

export default function Debug({ route }) {
  const { workspaceUri } = route.params;
  const [selectedConfig, setSelectedConfig] = React.useState<string | null>(null);

  const { data, loading } = useQuery(GetLaunchConfigurationsDocument, { variables: { workspaceUri } });

  React.useEffect(() => {
    if (
      data &&
      data?.getLaunchConfigurations?.length &&
      !selectedConfig
    ) {
      setSelectedConfig(data.getLaunchConfigurations[0].name);
    }
  }, [data, selectedConfig]);
  const startError = useErrorAlert('Failed to start debugging');
  const stopError = useErrorAlert('Failed to stop debugging');
  const [start, { loading: startLoading }] = useMutation(StartDebuggingDocument, {
    onError: startError,
  });
  const [stop, { loading: stopLoading }] = useMutation(StopDebuggingDocument, {
    onError: stopError,
  });

  const { logs, appendLog, clearLogs, setActive, isActive } = useDebugStore();

  useSubscription(DebuggerEventDocument, {
    onSubscriptionData: ({ subscriptionData }) => {
      const event = subscriptionData.data?.debuggerEvent;
      if (!event) return;
      if (event.event === 'start') { setActive(true); clearLogs(); }
      if (event.event === 'stop') setActive(false);
      appendLog(`[${event.event}] ${event.body}`);
    },
  });

  if (loading) return <ActivityIndicator />;

  const configs = data?.getLaunchConfigurations ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Picker
          selectedValue={selectedConfig}
          onValueChange={(v) => setSelectedConfig(v)}
          style={{ flex: 1 }}
        >
          {configs.map(c => <Picker.Item key={c.name} label={c.name} value={c.name} />)}
        </Picker>
        {!isActive ? (
          <Button
            title="Start"
            onPress={() => selectedConfig && start({ variables: { workspaceUri, configName: selectedConfig } })}
            disabled={!selectedConfig || startLoading}
          />
        ) : (
          <Button
            title="Stop"
            onPress={() => stop()}
            disabled={stopLoading}
            color="red"
          />
        )}
      </View>
      <FlatList
        data={logs}
        renderItem={({ item }) => <Text style={styles.log}>{item}</Text>}
        keyExtractor={(_, idx) => String(idx)}
        style={styles.logContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 8, gap: 8 },
  logContainer: { flex: 1, backgroundColor: '#1e1e1e', marginTop: 8, padding: 4 },
  log: { color: 'white', fontFamily: 'monospace', fontSize: 12 },
});
