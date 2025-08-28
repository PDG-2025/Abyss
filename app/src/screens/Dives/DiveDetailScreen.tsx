import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { api } from '../../services/api';
import type { Dive } from '../../types/dto';

export default function DiveDetailScreen({ route }: any) {
  const { dive_id } = route.params as { dive_id: number };
  const [dive, setDive] = useState<Dive | null>(null);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/dives/${dive_id}`);
      if (res.status === 200) setDive(res.data as Dive);
    })();
  }, [dive_id]);

  if (!dive) return <View style={{ padding: 16 }}><Text>Chargement...</Text></View>;

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Plongée #{dive.dive_id}</Text>
      <Text>Date: {new Date(dive.date).toLocaleString()}</Text>
      <Text>Durée: {dive.duration} min</Text>
      <Text>Profondeur max: {dive.depth_max} m</Text>
      <Text>Profondeur moyenne: {dive.average_depth} m</Text>
      {dive.ndl_limit != null && <Text>NDL: {dive.ndl_limit} min</Text>}
    </View>
  );
}
