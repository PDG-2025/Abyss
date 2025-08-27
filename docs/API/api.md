# Doccumentation API
## Format des erreurs
- Format standard: { error: string, details?: object, requestId?: string }.
- Erreurs de validation Zod: 400 avec details = error.flatten().

## Sécurité
- Authentification JWT via Authorization: Bearer <token>.
- Limitation de débit: globale, plus stricte sur /auth et /sync.
- CORS strict: origines explicites uniquement.
- Compression activée.

## Middleware

### validate(schema)
- Rôle: valider body/params/query avec Zod, renvoyer 400 en cas d’invalidation avec details flatten(); remplace body/params/query par la version validée (avec defaults/coercion).
- Branchements: sur toutes les routes avec un schéma Zod (voir les sections de routes).
- Erreur: 400 Validation error.
- Exemple: POST /auth/register → validate(registerSchema).

### requireAuth
- Rôle: extraire/valider le JWT et attacher req.user = { user_id }.
- Branchements: toutes les routes privées (hors /auth).
- Erreur: 401 Unauthorized si token absent/invalide.

### errorHandler
- Rôle: capter toutes les erreurs, renvoyer JSON uniforme, détecter ZodError → 400, CORS → 403, RateLimit → 429; journaliser 5xx.
- Branchements: toujours en dernier.

### Rate limiting
- limiterGlobal: 100 req/15 min (toutes routes).
- limiterAuth: 10 req/15 min (sur /auth).
- limiterSync: 30 req/15 min (sur /sync).
- Réponse en dépassement: 429 { error: "Too Many Requests", retryAfter }.

### CORS strict
- Rôle: autoriser uniquement les origines listées (MOBILE_ORIGIN, ADMIN_ORIGIN), sinon 403 via error handler.

### Compression
- Rôle: compresser les réponses HTTP.

Schémas Zod (résumé d’usage)
- auth: registerSchema, loginSchema.
- users: updateProfileSchema, listUserDivesSchema.
- devices: createDeviceSchema, updateDeviceSchema, deviceIdSchema, listDeviceDivesSchema, createBatteryStatusSchema.
- gas: createGasSchema, gasIdSchema, listGasSchema.
- locations: createLocationSchema, updateLocationSchema, locationIdSchema, listLocationsSchema.
- dives: createDiveSchema, updateDiveSchema, diveIdSchema, listDivesSchema.
- measurements: bulkMeasurementsSchema.
- alerts: bulkAlertsSchema, acknowledgeAlertSchema.
- compass: bulkCompassSchema.
- weather: upsertWeatherSchema.
- equipment: upsertEquipmentSchema.
- media: createMediaSchema, listMediaForDiveSchema.
- surface intervals: createSurfaceIntervalSchema, listSurfaceIntervalsSchema, surfaceIntervalIdSchema.
- sync: syncDivePayloadSchema.

## Référence des routes

### Auth

POST /auth/register
- Objet: créer un utilisateur et renvoyer un JWT.
- Validation: registerSchema.
- Header: Content-Type: application/json.
- Body: { name, email, password }.
- 201: { user: { user_id, name, email }, token }.
- 409: email déjà utilisé.
- Exemple:
  curl -X POST https://api.example.com/auth/register -H "Content-Type: application/json" -d '{"name":"User","email":"u@test.local","password":"P@ssword123!"}'

POST /auth/login
- Objet: authentifier et renvoyer un JWT.
- Validation: loginSchema.
- Body: { email, password }.
- 200: { user, token }.
- 401: identifiants invalides.
- Exemple:
  curl -X POST https://api.example.com/auth/login -H "Content-Type: application/json" -d '{"email":"u@test.local","password":"P@ssword123!"}'

### Users

GET /users/me
- Objet: récupérer le profil.
- Auth: Bearer token.
- 200: { user_id, name, email }.
- Exemple:
  curl -H "Authorization: Bearer <token>" https://api.example.com/users/me

PATCH /users/me
- Objet: mettre à jour le profil (nom).
- Validation: updateProfileSchema.
- Auth: Bearer token.
- Body: { name? }.
- 200: profil mis à jour.
- Exemple:
  curl -X PATCH https://api.example.com/users/me -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"Nouveau Nom"}'

GET /users/me/dives?page=&limit=
- Objet: lister les plongées de l’utilisateur (résumé).
- Validation: listUserDivesSchema.
- Auth: Bearer token.
- 200: { page, limit, data: [...] }.
- Exemple:
  curl -H "Authorization: Bearer <token>" "https://api.example.com/users/me/dives?page=1&limit=20"

### Devices

POST /devices
- Objet: enregistrer un ordinateur de plongée.
- Validation: createDeviceSchema.
- Auth: Bearer token.
- Body: { serial_number, model, firmware_version }.
- 201: Device.
- 409: serial déjà utilisé pour cet utilisateur.
- Exemple:
  curl -X POST https://api.example.com/devices -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"serial_number":"SN123","model":"Abyss-One","firmware_version":"1.0.0"}'

GET /devices
- Objet: lister les appareils du user.
- Auth: Bearer token.

GET /devices/:device_id
- Validation: deviceIdSchema.
- Auth: Bearer token.

PATCH /devices/:device_id
- Validation: updateDeviceSchema.
- Auth: Bearer token.
- Body: { model?, firmware_version? }.

DELETE /devices/:device_id
- Validation: deviceIdSchema.
- Auth: Bearer token.

POST /devices/:device_id/battery
- Objet: ajouter un état batterie.
- Validation: createBatteryStatusSchema.
- Auth: Bearer token.
- Body: { percentage, status_date? }.

GET /devices/:device_id/battery
- Objet: journal des états batterie (tri desc).
- Validation: deviceIdSchema.
- Auth: Bearer token.

GET /devices/:device_id/dives?page=&limit=
- Objet: liste des plongées d’un device.
- Validation: listDeviceDivesSchema.
- Auth: Bearer token.

### Gas

POST /gas
- Objet: créer un gaz (AIR/EAN/Trimix).
- Validation: createGasSchema (somme O2+N2+He=100).
- Auth: Bearer token.

GET /gas
- Objet: lister les gaz.

GET /gas/:id
- Validation: gasIdSchema.

PATCH /gas/:id
- Validation: createGasSchema.merge(gasIdSchema).

DELETE /gas/:id
- Note: détache les plongées (SET NULL) avant suppression.

### Locations

POST /locations
- Validation: createLocationSchema.

GET /locations
- Validation: listLocationsSchema.

GET /locations/:id
- Validation: locationIdSchema.

PATCH /locations/:id
- Validation: updateLocationSchema.

DELETE /locations/:id
- Note: détache les plongées (SET NULL) avant suppression.

### Dives

GET /dives?from=&to=&device_id=&location_id=&gas_id=&page=&limit=
- Objet: liste filtrée des plongées (résumé).
- Validation: listDivesSchema.
- Auth: Bearer token.

POST /dives
- Objet: créer une plongée.
- Validation: createDiveSchema (average_depth ≤ depth_max).
- Auth: Bearer token.
- Body minimal: { date, duration, depth_max, average_depth }.

GET /dives/:id
- Validation: diveIdSchema.
- Auth: Bearer token.

PATCH /dives/:id
- Validation: updateDiveSchema.
- Auth: Bearer token.

DELETE /dives/:id
- Validation: diveIdSchema.
- Auth: Bearer token.

Exemple (création):
curl -X POST https://api.example.com/dives -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"date":"2025-08-26T10:00:00Z","duration":45,"depth_max":18.5,"average_depth":12.2,"ndl_limit":25}'

### Measurements

POST /measurements/bulk/:dive_id
- Objet: insertion bulk des mesures (séries temporelles).
- Validation: bulkMeasurementsSchema.
- Auth: Bearer token.
- Body: [{ timestamp, depth_current, ... }, ...] (max 10k).
- 201: { inserted: n }.
- Exemple:
  curl -X POST https://api.example.com/measurements/bulk/123 -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '[{"timestamp":"...","depth_current":10.1}]'

GET /dives/:dive_id/measurements?from=&to=&page=&limit=
- Objet: lecture fenêtrée des mesures.
- Auth: Bearer token.

### Alerts

POST /alerts/bulk/:dive_id
- Objet: insertion bulk d’alertes.
- Validation: bulkAlertsSchema.
- Auth: Bearer token.
- Body: [{ code, message?, severity?, acknowledged?, timestamp }, ...].

GET /dives/:dive_id/alerts?severity=&from=&to=
- Objet: lecture filtrée des alertes.

PATCH /alerts/:alert_id
- Objet: acknowledgement d’une alerte.
- Validation: acknowledgeAlertSchema.
- Auth: Bearer token.
- Body: { acknowledged: boolean }.

### Compass

POST /compass/bulk/:dive_id
- Objet: insertion bulk des cap (heading).
- Validation: bulkCompassSchema.
- Auth: Bearer token.

GET /dives/:dive_id/compass?from=&to=&page=&limit=
- Objet: lecture fenêtrée des cap.

### Decompression stops

POST /dives/:dive_id/stops
- Objet: remplace la liste des paliers (delete+insert).
- Body: [{ depth, duration }, ...].
- Auth: Bearer token.

GET /dives/:dive_id/stops
- Objet: récupérer les paliers.

DELETE /dives/:dive_id/stops
- Objet: supprimer les paliers.

### Weather

PUT /dives/:dive_id/weather
- Objet: upsert des conditions météo.
- Validation: upsertWeatherSchema.
- Auth: Bearer token.

GET /dives/:dive_id/weather
- Objet: récupérer la météo (0..1).

DELETE /dives/:dive_id/weather
- Objet: supprimer la météo.

### Equipment

PUT /dives/:dive_id/equipment
- Objet: upsert de l’équipement.
- Validation: upsertEquipmentSchema.
- Auth: Bearer token.

GET /dives/:dive_id/equipment
- Objet: récupérer l’équipement (0..1).

DELETE /dives/:dive_id/equipment
- Objet: supprimer l’équipement.

### Media

POST /dives/:dive_id/media
- Objet: ajouter un média (URL).
- Validation: createMediaSchema.
- Auth: Bearer token.

GET /dives/:dive_id/media?page=&limit=
- Objet: lister les médias d’une plongée.

DELETE /media/:media_id
- Objet: supprimer un média (ownership via join).

### Surface intervals

POST /surface-intervals
- Objet: créer un intervalle de surface.
- Validation: createSurfaceIntervalSchema.
- Auth: Bearer token.

GET /surface-intervals?page=&limit=
- Objet: lister les intervalles d’un user.
- Validation: listSurfaceIntervalsSchema.
- Auth: Bearer token.

DELETE /surface-intervals/:id
- Validation: surfaceIntervalIdSchema.
- Auth: Bearer token.

### Sync

POST /sync/dive
- Objet: synchroniser une plongée complète en transaction (dive + measurements + alerts + compass + weather + equipment + media).
- Validation: syncDivePayloadSchema (avec contrainte average_depth ≤ depth_max).
- Auth: Bearer token.
- Body: { dive, measurements?, alerts?, compass?, weather?, equipment?, media? }.
- 201: { dive_id }.



## Getting started
- Inscription puis login pour obtenir un token JWT.
- Créer une plongée minimale: date ISO, duration, depth_max, average_depth.
- Pousser des mesures en bulk (100–1000 points par requête selon taille).
- Optionnel: synchroniser via /sync/dive en une seule transaction.

Exemple:
- 1) Obtenir un token
  curl -X POST https://api.example.com/auth/login -H "Content-Type: application/json" -d '{"email":"u@test.local","password":"P@ssword123!"}'
- 2) Créer une plongée
  curl -X POST https://api.example.com/dives -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"date":"2025-08-26T10:00:00Z","duration":45,"depth_max":18.5,"average_depth":12.2}'
- 3) Envoyer des mesures
  curl -X POST https://api.example.com/measurements/bulk/123 -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '[{"timestamp":"2025-08-26T10:01:00Z","depth_current":10.1}]'

## Contrats de réponse
- Succès standard: 200/201 avec payload JSON propre et champs attendus (ex: Dive avec dive_id, date, duration, depth_max, average_depth).
- Erreur de validation: 400
  ```
  {
    "error": "Validation error",
    "details": {
      "fieldErrors": {
        "average_depth": ["average_depth ne peut pas dépasser depth_max"]
      }
    },
    "requestId": "op-xyz" // optionnel si middleware requestId activé
  }
  ```
- Auth manquante: 401
  { "error": "Unauthorized" }
- Accès refusé/ressource d’un autre compte (policy d’ownership): 404 (ressource introuvable)
  { "error": "Plongée introuvable" }
- CORS bloqué: 403
  { "error": "Origin non autorisée" }
- Rate limiting: 429
  { "error": "Too Many Requests", "retryAfter": "1693051200" }
- Erreur serveur: 500
  { "error": "Internal Server Error", "requestId": "op-abc" }

## Matrice de couverture des tests
- Auth
  - Register: succès, doublon email (409), validation email invalide (400)
  - Login: succès, mauvais mot de passe (401), rate limit (429 éventuel)
- Users
  - GET /users/me: profil
  - PATCH /users/me: maj nom + validation
  - GET /users/me/dives: pagination
- Devices
  - CRUD device + ownership
  - /battery: POST + GET tri desc + ownership
  - /devices/:device_id/dives: pagination
- Gas
  - CRUD, contraintes composition (somme = 100), conflits d’unicité
- Locations
  - CRUD, SET NULL sur Dive à la suppression
- Dives
  - CRUD complet, filtres (from, to, device_id, location_id, gas_id), pagination
  - Zod: average_depth ≤ depth_max
  - Trigger DB: patch invalidant la contrainte
  - Ownership: accès interdit inter-compte
- Measurements/Compass (bulk)
  - Insertion bulk (quantités diverses), limites, fenêtres de lecture (from/to/pagination)
- Alerts
  - Bulk + acknowledge, filtre par sévérité, fenêtre temporelle
- Stops
  - Remplacement (delete+insert), lecture, suppression
- Weather/Equipment
  - Upsert (delete+insert), lecture, suppression
- Media
  - POST/GET/DELETE avec ownership et pagination
- Surface intervals
  - POST/GET/DELETE avec ownership
- Sync
  - Transaction complète (dive + measurements + alerts + compass + weather + equipment + media)
  - Idempotence (option: source_uid)
- Sécurité transversale
  - CORS strict: origine non whitelistée
  - Rate limiting: /auth et /sync
  - Compression active (vérification entête Content-Encoding si nécessaire)

## Exécution des tests
- Variables (exemple .env.test)
  - TEST_DATABASE_URL=postgres://abyss:abyss@localhost:5433/abyss_test
  - DATABASE_URL=postgres://abyss:abyss@localhost:5433/abyss_test
  - JWT_SECRET=test-secret
  - MOBILE_ORIGIN=http://localhost:19006
  - ADMIN_ORIGIN=http://localhost:5173
- Commandes
  - npm run test:migrate    # appliquer les migrations sur la DB de test
  - npm test                # lance Jest en mode séquentiel (--runInBand)

## Bonnes pratiques d’usage
- Chunker les payloads bulk (1000 points max par appel pour limiter la taille JSON).
- Toujours passer des timestamps ISO 8601 (TIMESTAMPTZ côté DB).
- Utiliser les filtres from/to et pagination pour les lectures de séries.
- Préférer /sync/dive pour synchroniser une session complète post-plongée.

## Section “Changelog” (optionnelle)
- V1 26 aout 2025

