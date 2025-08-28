import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { api } from '../../services/api';
import type { Device } from '../../types/dto';
// BLE: import { BleManager } from 'react-native-ble-plx';

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  // const manager = useMemo(() => new BleManager(), []);

  const load = async () => {
    const res = await api.get('/devices');
    if (res.status === 200) setDevices(res.data as Device[]);
  };

  useEffect(() => { load(); }, []);

  const onPair = async () => {
    // Pseudo-implémentation:
    // 1) Demander permissions (Android)
    // 2) Scanner devices BLE et détecter le vôtre (par nom/UUID)
    // 3) Connecter -> lire caractéristiques -> obtenir serial / firmware si dispo
    // 4) POST /devices pour enregistrer
    Alert.alert('Pairage', 'Implémenter le scan BLE et enregistrement /devices.');
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Button title="Appairer un ordinateur" onPress={onPair} />
      <FlatList
        data={devices}
        keyExtractor={(d) => `${d.device_id}`}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '600' }}>{item.model} — FW {item.firmware_version}</Text>
            <Text>Serial: {item.serial_number}</Text>
          </View>
        )}
      />
    </View>
  );
}
