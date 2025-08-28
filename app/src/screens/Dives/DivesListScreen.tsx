import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import type { Dive, Paged } from '../../types/dto';
import { useNavigation } from '@react-navigation/native';

export default function DivesListScreen() {
  const [data, setData] = useState<Dive[]>([]);
  const [page, setPage] = useState(1);
  const nav = useNavigation<any>();

  const load = async (p = 1) => {
    const res = await api.get(`/dives?page=${p}&limit=20`);
    if (res.status === 200) {
      const payload = res.data as Paged<Dive>;
      setData(p === 1 ? payload.data : [...data, ...payload.data]);
      setPage(p);
    }
  };

  useEffect(() => { load(1); }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => `${item.dive_id}`}
        onEndReached={() => load(page + 1)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.navigate('DiveDetail', { dive_id: item.dive_id })}>
            <View style={{ padding: 12, borderBottomWidth: 1 }}>
              <Text>{new Date(item.date).toLocaleString()}</Text>
              <Text>Max: {item.depth_max} m — Avg: {item.average_depth} m</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
