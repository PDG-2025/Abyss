import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { initPageState, loadNextPage, PageState } from '../../utils/paginate';
import { listDives } from '../../services/dives';
import type { Dive } from '../../types/dto';
import { useNavigation } from '@react-navigation/native';

export default function DivesListScreen() {
  const [state, setState] = useState<PageState<Dive>>(initPageState<Dive>(20));
  const nav = useNavigation<any>();

  const fetcher = (page: number, limit: number) => listDives({ page, limit });

  useEffect(() => {
    loadNextPage(state, setState, fetcher);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => loadNextPage(state, setState, fetcher);

  if (!state.items.length && state.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={state.items}
        keyExtractor={(d) => String(d.dive_id)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.getParent()?.navigate('DiveDetail', { dive_id: item.dive_id })}>
            <View style={{ padding: 12, borderBottomWidth: 1 }}>
              <Text>{new Date(item.date).toLocaleString()}</Text>
              <Text>Max {item.depth_max} m — Moy {item.average_depth} m</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={state.loading ? <ActivityIndicator /> : null}
      />
      {state.error && <Text style={{ color: 'red', padding: 12 }}>{state.error}</Text>}
    </View>
  );
}
