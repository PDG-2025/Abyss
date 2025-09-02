import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useTheme } from '@react-navigation/native';
import { listMedia, createMedia, deleteMedia } from '../../services/media';
import * as ImagePicker from 'expo-image-picker';

type Params = { DiveMedia: { dive_id: number } };

export default function DiveMediaScreen() {
  const route = useRoute<RouteProp<Params, 'DiveMedia'>>();
  const dive_id = route.params.dive_id;

  const { colors, dark } = useTheme();
  const palette = useMemo(
    () => ({
      bg: colors.background,
      card: colors.card,
      text: colors.text,
      sub: dark ? '#96A2AE' : '#475569',
      border: colors.border,
      badge: dark ? '#1B2430' : '#EDF2F7',
      danger: dark ? '#F87171' : '#B91C1C',
      hint: dark ? '#6B7280' : '#94A3B8',
    }),
    [colors, dark]
  );

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ajout par URL
  const [url, setUrl] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  // Upload local
  const [uploading, setUploading] = useState<boolean>(false);

  const load = async () => {
    try {
      setLoading(true);
      const r = await listMedia(dive_id, 1, 100); // GET /dives/:dive_id/media?page=&limit= [1]
      setItems(r.data || []);
    } catch (e: any) {
      Alert.alert('Médias', e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [dive_id]); // [1]

  // Ajout par URL directe
  const onAddUrl = async () => {
    try {
      const clean = url.trim();
      if (!clean) return Alert.alert('Médias', 'URL requise');
      const created = await createMedia(dive_id, {
        media_type: inferTypeFromUrl(clean),
        url: clean,
        description: desc || null,
        timestamp_taken: new Date().toISOString(),
      }); // POST /dives/:dive_id/media [1]
      setItems((lst) => [created, ...lst]);
      setUrl('');
      setDesc('');
    } catch (e: any) {
      Alert.alert('Médias', e?.message || 'Erreur ajout URL');
    }
  };

  // Sélection locale + upload → createMedia
  const onPickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        return Alert.alert('Médias', 'Permission galerie refusée');
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });
      if (picked.canceled) return;

      setUploading(true);
      const asset = picked.assets?.[0];
      if (!asset) return;

      // 1) Upload multipart vers votre API (POST /uploads → { url })
      const uploadedUrl = await uploadFileToBackend(
        asset.uri,
        asset.fileName || `upload_${Date.now()}.jpg`,
        asset.mimeType || 'image/jpeg'
      );

      // 2) Créer l’entrée média avec l’URL retournée
      const created = await createMedia(dive_id, {
        media_type: 'image',
        url: uploadedUrl,
        description: desc || null,
        timestamp_taken: new Date().toISOString(),
      }); // POST /dives/:dive_id/media [1]
      setItems((lst) => [created, ...lst]);
      setDesc('');
    } catch (e: any) {
      Alert.alert('Médias', e?.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (media_id: number) => {
    try {
      await deleteMedia(media_id); // DELETE /media/:media_id [1]
      setItems((lst) => lst.filter((m) => m.media_id !== media_id));
    } catch (e: any) {
      Alert.alert('Médias', e?.message || 'Erreur suppression');
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: palette.card,
    color: palette.text,
    marginBottom: 12,
  } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Médias</Text>

      {/* Ajout URL */}
      <Text style={{ color: palette.sub, marginBottom: 6 }}>Ajouter via URL</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="https://… (image ou vidéo)"
        placeholderTextColor={palette.hint}
        autoCapitalize="none"
        style={inputStyle}
      />
      <Text style={{ color: palette.sub, marginBottom: 6 }}>Description (optionnel)</Text>
      <TextInput
        value={desc}
        onChangeText={setDesc}
        placeholder="Légende…"
        placeholderTextColor={palette.hint}
        style={[inputStyle, { height: 80 }]}
        multiline
      />

      <Button title={loading ? 'Chargement…' : 'Ajouter (URL)'} onPress={onAddUrl} disabled={loading} color={colors.primary} />

      <View style={{ height: 18 }} />
      <View style={{ height: 1, backgroundColor: palette.border }} />
      <View style={{ height: 18 }} />

      {/* Ajout local + upload */}
      <Text style={{ color: palette.sub, marginBottom: 8 }}>Ou sélectionner une image depuis l’appareil</Text>
      <Button title={uploading ? 'Upload…' : 'Choisir une image'} onPress={onPickAndUpload} disabled={uploading} color={colors.primary} />

      <View style={{ height: 16 }} />
      {loading ? (
        <ActivityIndicator />
      ) : items.length ? (
        items.map((m) => (
          <View
            key={m.media_id}
            style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              {m.media_type === 'image' ? (
                <Image source={{ uri: m.url }} style={{ width: 96, height: 64, borderRadius: 8, backgroundColor: palette.badge }} />
              ) : (
                <View style={{ width: 96, height: 64, borderRadius: 8, backgroundColor: palette.badge, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: palette.text }}>Vidéo</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: palette.text }}>{m.url}</Text>
                {m.description ? <Text numberOfLines={1} style={{ color: palette.sub }}>{m.description}</Text> : null}
              </View>
            </View>
            <TouchableOpacity onPress={() => onDelete(m.media_id)}>
              <Text style={{ color: palette.danger }}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={{ color: palette.sub }}>Aucun média pour l’instant.</Text>
      )}
    </ScrollView>
  );
}

// Heuristique simple pour déduire le type depuis l’URL
function inferTypeFromUrl(u: string): 'image' | 'video' {
  const s = u.toLowerCase();
  if (s.endsWith('.mp4') || s.endsWith('.mov') || s.endsWith('.webm')) return 'video';
  return 'image';
}

// Upload multipart vers votre API: POST /uploads → { url }
async function uploadFileToBackend(uri: string, name: string, type: string): Promise<string> {
  const form = new FormData();
  form.append('file', { uri, name, type } as any);
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/uploads`, {
    method: 'POST',
    // headers: { Authorization: `Bearer ${token}` }, // si nécessaire
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Upload échoué (${res.status}) ${txt}`);
  }
  const json = await res.json();
  if (!json?.url) throw new Error('Réponse upload invalide (url manquante)');
  return json.url as string;
}
