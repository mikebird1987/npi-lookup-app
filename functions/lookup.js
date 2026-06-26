function redirectTo(url) {
return Response.redirect(url, 302);
}
export async function onRequestGet(context) {
const url = new URL(context.request.url);
const params = url.searchParams;
const npi = params.get("npi") || params.get("number");
if (npi && /^\d{10}$/.test(npi.trim())) {
return redirectTo(`${url.origin}/npi/${npi.trim()}`);
}
const search = new URL(`${url.origin}/search`);
const first = params.get("first") || params.get("first_name");
const last = params.get("last") || params.get("last_name");
const org = params.get("org") || params.get("organization") || params.get("organization_name");
const state = params.get("state");
const city = params.get("city");
const postal = params.get("zip") || params.get("postal_code");
const taxonomy = params.get("taxonomy") || params.get("taxonomy_description");
const limit = params.get("limit") || "10";
if (first) search.searchParams.set("first_name", first);
if (last) search.searchParams.set("last_name", last);
if (org) search.searchParams.set("organization_name", org);
if (state) search.searchParams.set("state", state.toUpperCase());
if (city) search.searchParams.set("city", city);
if (postal) search.searchParams.set("postal_code", postal);
if (taxonomy) search.searchParams.set("taxonomy_description", taxonomy);
search.searchParams.set("limit", limit);
const hasSearch = first || last || org || city || postal || taxonomy;
if (hasSearch) return redirectTo(search.toString());
return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>NPI Lookup Router</title><meta name="robots" content="index,follow"></head><body><main><h1>NPI Lookup Router</h1><p>Use one of these URLformats:</p><ul><li><code>/lookup?npi=1234567890</code></li><li><code>/lookup?first=John&last=Smith&state=NY</code></li><li><code>/lookup?org=Mount%20Sinai&state=NY</code></li></ul></main></body></html>`, {
headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
});
}
