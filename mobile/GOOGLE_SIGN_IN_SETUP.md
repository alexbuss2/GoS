Google Sign-In Setup (BIRIKIO)

1) Google Cloud Console
   - Create a project (if needed)
   - Enable "Google Identity Services" / "OAuth consent"
   - Create OAuth Client ID (Web application)

2) Add the Android SHA-1 (debug)
   - SHA-1: 64:98:92:A9:92:C8:C4:C6:02:B8:EA:BD:05:9B:EE:C3:6C:13:9E:74
   - SHA-256: 3A:15:E6:95:38:DB:7D:61:90:F9:32:15:A3:36:7C:B1:64:4A:62:A4:D4:DC:D7:3A:57:E9:1C:57:8B:26:94:FB
   - Package name: com.celal.birikio

3) Backend environment
   - OIDC_ISSUER_URL=https://accounts.google.com
   - OIDC_CLIENT_ID=YOUR_GOOGLE_SERVER_CLIENT_ID
   - OIDC_SCOPE=openid email profile

4) Flutter constants
   - mobile/lib/core/constants.dart
   - googleServerClientId = YOUR_GOOGLE_SERVER_CLIENT_ID

Notes
- For release, add release SHA-1 from your release keystore.
- If you create a release keystore later, run: android/gradlew signingReport
