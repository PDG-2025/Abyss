import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute, useNavigation, RouteProp, useTheme } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { getDive, listMeasurements } from '../../services/dives';
import { listMedia } from '../../services/media';
import { getWeather } from '../../services/weather';
import { getEquipment } from '../../services/equipment';
import { listAlerts } from '../../services/alerts';
import { listDecompressionStops } from '../../services/decompressionStops';
import { getGas } from '../../services/gas';

type RootStackParamList = { DiveDetail: { dive_id: number } };

export default function DiveDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'DiveDetail'>>();
  const dive_id = route.params.dive_id;
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent?.('RootStack');
  const { colors, dark } = useTheme();

  const palette = {
    bg: colors.background,
    card: colors.card,
    text: colors.text,
    sub: dark ? '#96A2AE' : '#475569',
    border: dark ? '#2B3540' : '#E2E8F0',
    accent: colors.primary,
    badge: dark ? '#1B2430' : '#EDF2F7',
  };

  const [loading, setLoading] = useState(true);
  const [dive, setDive] = useState<any | null>(null);
  const [measurementsState, setMeasurements] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [equipment, setEquipment] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [decoStops, setDecoStops] = useState<any[]>([]);
  const [gas, setGas] = useState<any | null>(null);
  const screenWidth = Dimensions.get('window').width - 32;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getDive(dive_id);
        setDive(d);
        const m = await listMeasurements(dive_id, { page: 1, limit: 5000 });
        setMeasurements(m.data || []);
        const w = await getWeather(dive_id);
        setWeather(w);
        const e = await getEquipment(dive_id);
        setEquipment(e);
        const med = await listMedia(dive_id, 1, 50);
        setMedia(med.data || []);
        const a = await listAlerts(dive_id);
        setAlerts(a.data || []);
        const dStops = await listDecompressionStops(dive_id);
        setDecoStops(dStops.data || []);
        const g = await getGas(dive_id);
        setGas(g);
      } catch (e: any) {
        Alert.alert('Détail plongée', e?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [dive_id]); // [attached_file:1]

  const chart = useMemo(() => {
    const measurements = measurementsState;
    if (!measurements.length) {
      return {
        labels: ['0 min', '10 min', '20 min', '30 min', '40 min', '50 min'],
        depthSeries: [],
        tempSeries: [],
        durationMin: 0,
        maxDepth: 0,
      };
    }
    const t0 = new Date(measurements[0].timestamp).getTime();
    const depths = measurements.map((p) => Number(p.depth_current || 0));
    const maxDepth = Math.max(...depths, 0);

    const depthSeries = depths.map((v) => maxDepth - v);

    const labels = ['0 min', '10 min', '20 min', '30 min', '40 min', '50 min'];
    const durationMin = Math.max(
      0,
      Math.round(
        (new Date(measurements[measurements.length - 1].timestamp).getTime() - t0) / 60000,
      ),
    );
    const temps = measurements
      .map((p) => (typeof p.temperature === 'number' ? Number(p.temperature) : NaN))
      .filter((v) => !Number.isNaN(v));
    return { labels, depthSeries, tempSeries: temps, durationMin, maxDepth };
  }, [measurementsState]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.bg,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }
  const hasCoordinates = dive?.latitude != null && dive?.longitude != null;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Bandeau Modifier */}
      <View
        style={{
          backgroundColor: palette.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.border,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>Modifier</Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button
            title="Infos générales"
            onPress={() => rootNav?.navigate('EditDiveInfo', { dive_id })}
          />
          <Button title="Météo" onPress={() => rootNav?.navigate('EditWeather', { dive_id })} />
          <Button
            title="Équipement"
            onPress={() => rootNav?.navigate('EditEquipment', { dive_id })}
          />
          <Button title="Médias" onPress={() => rootNav?.navigate('DiveMedia', { dive_id })} />
        </View>
      </View>{' '}
      <Text
        style={{
          color: palette.text,
          fontSize: 16,
          fontWeight: '700',
          marginBottom: 12,
        }}
      >
        {dive?.location_name || 'Pas de lieu'}
      </Text>
      {/* Statistiques */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 8,
        }}
      >
        Statistiques
      </Text>
      <View style={{ height: 1, backgroundColor: palette.border, marginBottom: 12 }} />
      <View style={{ rowGap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={{ color: palette.sub }}>Profondeur maximale</Text>
            <Text style={{ color: palette.text, marginTop: 2 }}>{dive?.depth_max ?? 0} m</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={{ color: palette.sub }}>Durée totale</Text>
            <Text style={{ color: palette.text, marginTop: 2 }}>{dive?.duration ?? 0} min</Text>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={{ color: palette.sub }}>Température de l’eau</Text>
            <Text style={{ color: palette.text, marginTop: 2 }}>
              {weather?.surface_temperature != null ? `${weather.surface_temperature}°C` : '—'}
            </Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={{ color: palette.sub }}>Consommation d’air</Text>
            <Text style={{ color: palette.text, marginTop: 2 }}>
              {equipment?.tank_pressure_start != null && equipment?.tank_pressure_end != null
                ? `${equipment.tank_pressure_start - equipment.tank_pressure_end} psi`
                : '—'}
            </Text>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: palette.border }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={{ color: palette.sub }}>Lieu</Text>
            <Text style={{ color: palette.text, marginTop: 2 }}>{dive?.location_name || '—'}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={{ color: palette.sub }}>Date</Text>
            <Text style={{ color: palette.text, marginTop: 2 }}>
              {dive?.date ? new Date(dive.date).toLocaleDateString() : '—'}
            </Text>
          </View>
        </View>
      </View>
      {/* Profil de profondeur */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        Profil de profondeur
      </Text>
      <Text style={{ color: palette.sub }}>Profondeur (m)</Text>
      <Text
        style={{
          color: palette.text,
          fontSize: 32,
          fontWeight: '800',
          marginTop: 4,
        }}
      >
        {dive?.depth_max ?? 0} m
      </Text>
      {chart.depthSeries.length ? (
        <View
          style={{
            backgroundColor: palette.bg,
            borderRadius: 12,
            paddingVertical: 8,
          }}
        >
          <LineChart
            data={{
              labels: chart.labels,
              datasets: [
                {
                  data: chart.depthSeries,
                  color: () => '#38BDF8',
                  strokeWidth: 2,
                  withDots: false,
                },
              ],
            }}
            width={screenWidth}
            height={200}
            withShadow={false}
            withInnerLines
            withOuterLines={false}
            yAxisSuffix=" m"
            fromZero
            formatYLabel={(val) => {
              // remettre les vraies profondeurs
              const inverted = chart.maxDepth - Number(val);
              return `${Math.round(inverted)}`;
            }}
            chartConfig={{
              backgroundColor: palette.bg,
              backgroundGradientFrom: palette.bg,
              backgroundGradientTo: palette.bg,
              decimalPlaces: 0,
              color: (opacity = 1) =>
                dark ? `rgba(234,242,248,${opacity})` : `rgba(15,23,42,${opacity})`,
              labelColor: (opacity = 1) =>
                dark ? `rgba(150,162,174,${opacity})` : `rgba(71,85,105,${opacity})`,
              propsForBackgroundLines: { stroke: palette.border },
              propsForDots: { r: '0' },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      ) : (
        <Text style={{ color: palette.sub }}>Pas encore de mesures pour tracer la courbe.</Text>
      )}
      {/* Alertes */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        Alertes
      </Text>
      {alerts.length ? (
        alerts.map((al) => (
          <View
            key={al.alert_id}
            style={{
              marginBottom: 8,
              padding: 8,
              backgroundColor: palette.badge,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>{al.code}</Text>
            <Text style={{ color: palette.sub }}>{al.message}</Text>
            <Text style={{ color: palette.sub, fontSize: 12 }}>
              {new Date(al.timestamp).toLocaleTimeString()} - {al.severity}
            </Text>
          </View>
        ))
      ) : (
        <Text style={{ color: palette.sub }}>Aucune alerte déclenchée</Text>
      )}
      {/* Gaz utilisé */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        Gaz utilisé
      </Text>
      {gas ? (
        <Text style={{ color: palette.text }}>
          {gas.name} (O₂: {gas.oxygen ?? '—'}%, N₂: {gas.nitrogen ?? '—'}%, He: {gas.helium ?? '—'}
          %)
        </Text>
      ) : (
        <Text style={{ color: palette.sub }}>Aucun gaz renseigné</Text>
      )}
      {equipment?.tank_pressure_start != null && equipment?.tank_pressure_end != null && (
        <Text style={{ color: palette.sub }}>
          Consommation: {equipment.tank_pressure_start - equipment.tank_pressure_end} psi
        </Text>
      )}
      {/* Paliers de décompression */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        Paliers de décompression
      </Text>
      {decoStops.length ? (
        decoStops.map((stop) => (
          <Text key={stop.stop_id} style={{ color: palette.sub }}>
            {stop.depth} m pendant {stop.duration} min
          </Text>
        ))
      ) : (
        <Text style={{ color: palette.sub }}>Aucun palier de décompression</Text>
      )}
      {/* Carte */}
      {hasCoordinates && (
        <>
          <Text
            style={{
              color: palette.text,
              fontSize: 18,
              fontWeight: '700',
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            Localisation
          </Text>
          <MapView
            style={{ width: '100%', height: 200, borderRadius: 12 }}
            initialRegion={{
              latitude: dive.latitude,
              longitude: dive.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: dive.latitude,
                longitude: dive.longitude,
              }}
              title={dive.location_name || 'Plongée'}
            />
          </MapView>
        </>
      )}
      {/* Notes (lecture seule si vide) */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        Notes
      </Text>
      <Text style={{ color: palette.text }}>{dive?.notes?.trim()?.length ? dive.notes : '—'}</Text>
      {/* Photos et vidéos */}
      <Text
        style={{
          color: palette.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        Photos et vidéos
      </Text>
      {media.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {media.slice(0, 6).map((m) =>
            m.media_type === 'image' ? (
              <Image
                key={m.media_id}
                source={{ uri: m.url }}
                style={{
                  width: (screenWidth - 12) / 2,
                  height: 140,
                  borderRadius: 12,
                  backgroundColor: palette.badge,
                }}
              />
            ) : (
              <View
                key={m.media_id}
                style={{
                  width: (screenWidth - 12) / 2,
                  height: 140,
                  borderRadius: 12,
                  backgroundColor: palette.badge,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: palette.text }}>Vidéo</Text>
              </View>
            ),
          )}
        </View>
      ) : (
        <Text style={{ color: palette.sub }}>Aucun média pour l’instant.</Text>
      )}
      <View style={{ height: 28 }} />
    </ScrollView>
  );
}
