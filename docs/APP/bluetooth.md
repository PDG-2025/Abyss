# Bluetooth
## Introduction
- La couche BLE de l’app utilise react-native-ble-plx en mode Central (mobile) pour se connecter à l’ordinateur de plongée (Peripheral). Elle implémente un canal propriétaire sur GATT avec une caractéristique “contrôle” (écriture) et une “données” (notifications) pour échanger des trames encadrées par un protocole applicatif (opcodes + CRC).

## Pré-requis et permissions
- iOS: NSBluetoothAlwaysUsageDescription dans Info.plist.
- Android 12+: permissions BLUETOOTH_SCAN, BLUETOOTH_CONNECT et ACCESS_FINE_LOCATION; demander runtime avant le scan.
- MTU: requête à 185 octets (Android) si possible; sinon rester conservateur.

## Architecture mobile
- BleService (src/ble/BleService.ts): 
  - Fournit scan/connexion/discovery, read/write/notify, conversion base64↔bytes, events status/erreur.
- Protocol (src/ble/protocol.ts):
  - Définit opcodes et framing des trames: [Payload][CRC16:2]; CRC-16/CCITT sur header+payload.
- AbyssLink (src/ble/AbyssLink.ts):
  - Orchestrateur du protocole: handshake → getSession → pullChunks (mesures/alertes/compas) avec ACK par index.
- OTA (src/ble/ota.ts):
  - Mise à jour firmware chunkée: OTA_BEGIN(size,version) → OTA_DATA(offset,chunk) + OTA_ACK(offset) → OTA_END/OTA_DONE, avec retrys/timeouts et onProgress.
- Permissions (src/ble/permissions.ts):
  - Demandes runtime Android.

## Protocole applicatif
- Services/Characteristics (UUIDs):
  - Service principal: 0000ABCD-0000-1000-8000-00805F9B34FB
  - ctrlChar (écriture): 0000AB01-0000-1000-8000-00805F9B34FB
  - dataChar (notify): 0000AB02-0000-1000-8000-00805F9B34FB
  - otaChar/infoChar réservés si nécessaires.
- Opcodes:
  - 0x01 HANDSHAKE_REQ → 0x81 HANDSHAKE_ACK { TLV: model(0x01), serial(0x02), fw(0x03) }
  - 0x02 GET_SESSION { since_ts? } → 0x82 SESSION_META { dive_id, start_ts, duration, samples, alerts, compass }
  - 0x03 GET_NEXT_CHUNK { type(1=meas,2=alert,3=compass), index } → 0x83 CHUNK_DATA { type, index, data }
  - 0x04 ACK { type, index } / 0x05 NACK { type, index }
  - 0x06 OTA_BEGIN { size, version_str } → 0x86 OTA_READY
  - 0x07 OTA_DATA { offset, bytes } → 0x87 OTA_ACK { offset }
  - 0x08 OTA_END → 0x88 OTA_DONE
- Taille des paquets:
  - max payload conseillé 180 octets (MTU-Overhead) pour compatibilité; s’adapter si MTU négocié.
- Fiabilité:
  - CRC-16/CCITT pour détecter corruption; en cas d’échec, NACK côté firmware et retry côté app.
  - ACK par index/offset pour permettre la reprise: si coupure, reprendre à l’index/offset confirmé.

## Flux opérationnels
- Appairage:
  - scanAndConnect(d.name?.startsWith('Abyss')), discovery, requestMTU(185).
- Synchronisation plongée:
  - handshake → getSession → pullChunks(1..3) → parsing → POST /sync/dive.
- Mise à jour firmware:
  - handshake(model, fw) → GET /firmware/latest?model=... → téléchargement HTTPS → otaUpdate(bytes, version) → (optionnel) PATCH /devices/:device_id/firmware.
- Reprise:
  - Si déconnexion, reconnecter et reprendre au dernier ack (index/offset). L’app réessaie chaque opération (timeouts/ retrys).

Endpoints backend nécessaires
- GET /firmware/latest?model=...: version, url (HTTPS), checksum, size, notes, mandatory.
- PATCH /devices/:device_id/firmware: mise à jour de la version affichée après OTA.
- /sync/dive: déjà en place pour persister dive + séries.

## Gestion des erreurs
- Mobile:
  - Timeouts par opération (10–15s), retrys (x3–x5), toasts d’information.
  - Mapping d’erreurs Zod des endpoints (400 avec details.flatten()) vers UI.
- Firmware:
  - Émettre NACK en cas de CRC invalide ou index inattendu.
  - Conserver l’offset courant en OTA pour reprise.
- Backend:
  - Réponses 200/201 propres; 400 Validation error (Zod), 401/404/429/500 uniformes.

## Sécurité
- BLE:
  - Utiliser le chiffrement BLE si possible (pairing/bonding) côté firmware pour sécuriser les échanges.
- Firmware:
  - Distribuer via HTTPS; checksum SHA-256 fourni dans /firmware/latest et vérifié côté mobile avant OTA.
- API:
  - Auth Bearer obligatoire; rate limiting selon votre politique.

