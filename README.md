# NPI Lookup App
Cloudflare Pages app for searching the public NPPES NPI Registry API.
## Routes
JSON API proxy:
/api/npi?number=1234567890
Readable single NPI page:
/npi/1234567890
Readable search page:
/search?last_name=Smith&state=NY&limit=10
Simplified GPT router:
/lookup?npi=1234567890
/lookup?first=John&last=Smith&state=NY
/lookup?org=Mount%20Sinai&state=NY
GPT helper page:
/chatgpt-instructions
## Local development
npm install
npm run dev
## Production build
npm run build
## Cloudflare Pages settings
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
