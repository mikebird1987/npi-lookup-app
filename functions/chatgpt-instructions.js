export async function onRequestGet(context) {
const origin = new URL(context.request.url).origin;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ChatGPT Instructions for NPI Lookup</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index,follow">
</head>
<body>
<main>
<h1>ChatGPT Instructions for NPI Lookup</h1>
<p>Use this site as the Cloudflare-backed readable NPI Registry lookup source.</p>
<h2>Base site</h2>
<p><code>${origin}</code></p>
<h2>URL patterns</h2>
<ul>
<li>NPI number: <code>${origin}/npi/1234567890</code></li>
<li>Simple router: <code>${origin}/lookup?npi=1234567890</code></li>
<li>Person search: <code>${origin}/lookup?first=John&last=Smith&state=NY</code></li>
<li>Organization search: <code>${origin}/lookup?org=Mount%20Sinai&state=NY</code></li>
<li>Direct search: <code>${origin}/search?last_name=Smith&state=NY&limit=10</code></li>
</ul>
<h2>Summary fields</h2>
<p>When summarizing results, include provider or organization name, NPI number, enumeration type, status, primary taxonomy, practice location, phone number if available, and last updated date if available.</p>
<h2>Disclaimer</h2>
<p>Data comes from the public NPPES NPI Registry API. Issuance of an NPI does not validate that the provider is licensed or credentialed.</p>
</main>
</body>
</html>`;
return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
