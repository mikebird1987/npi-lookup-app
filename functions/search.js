const NPI_API_BASE = "https://npiregistry.cms.hhs.gov/api/";
const ALLOWED_PARAMS = new Set([
"number", "enumeration_type", "taxonomy_description", "name_purpose",
"first_name", "use_first_name_alias", "last_name", "organization_name",
"address_purpose", "city", "state", "postal_code", "country_code",
"limit", "skip"
]);
function escapeHtml(value) {
return String(value ?? "")
.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
.replaceAll(">", "&gt;").replaceAll('"', "&quot;")
.replaceAll("'", "&#039;");
}
function pageResponse(html, status = 200) {
return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
function getProviderName(result) {
const basic = result.basic || {};
if (basic.organization_name) return basic.organization_name;
return [basic.first_name, basic.middle_name, basic.last_name, basic.credential].filter(Boolean).join(" ");
}
function getPrimaryTaxonomy(result) {
const taxonomies = result.taxonomies || [];
return taxonomies.find((t) => t.primary) || taxonomies[0] || {};
}
function getPrimaryAddress(result) {
const addresses = result.addresses || [];
return addresses.find((a) => a.address_purpose === "LOCATION") || addresses[0] || {};
}
function renderSearchForm() {
return `<form method="get" action="/search">
<p><label>NPI Number<br><input name="number" inputmode="numeric" maxlength="10"></label></p>
<p><label>First Name<br><input name="first_name"></label></p>
<p><label>Last Name<br><input name="last_name"></label></p>
<p><label>Organization Name<br><input name="organization_name"></label></p>
<p><label>State<br><input name="state" maxlength="2"></label></p>
<p><label>City<br><input name="city"></label></p>
<p><label>ZIP / Postal Code<br><input name="postal_code"></label></p>
<p><label>Limit<br><input name="limit" type="number" min="1" max="200" value="25"></label></p>
<button type="submit">Search</button>
</form>`;
}
function renderResults(data) {
const results = data.results || [];
if (!results.length) return "<p>No matching NPI Registry results were found.</p>";
return `<p><strong>Results count:</strong> ${escapeHtml(data.results_count)}</p><ol>${results.map((result) => {
const name = getProviderName(result);
const taxonomy = getPrimaryTaxonomy(result);
const address = getPrimaryAddress(result);
return `<li><h2><a href="/npi/${escapeHtml(result.number)}">${escapeHtml(name || "Unknown Provider")}</a></h2>
<p><strong>NPI:</strong> ${escapeHtml(result.number)}</p>
<p><strong>Type:</strong> ${escapeHtml(result.enumeration_type)}</p>
<p><strong>Taxonomy:</strong> ${escapeHtml(taxonomy.desc)}</p>
<p><strong>Location:</strong> ${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.postal_code)}</p>
<p><a href="/npi/${escapeHtml(result.number)}">View readable NPI page</a></p></li>`;
}).join("")}</ol>`;
}
export async function onRequestGet(context) {
const requestUrl = new URL(context.request.url);
const upstreamUrl = new URL(NPI_API_BASE);
upstreamUrl.searchParams.set("version", "2.1");
for (const [key, value] of requestUrl.searchParams.entries()) {
if (ALLOWED_PARAMS.has(key) && value.trim() !== "") upstreamUrl.searchParams.set(key, value.trim());
}
const hasCriteria = upstreamUrl.searchParams.has("number") || upstreamUrl.searchParams.has("first_name") ||
upstreamUrl.searchParams.has("last_name") || upstreamUrl.searchParams.has("organization_name") ||
upstreamUrl.searchParams.has("taxonomy_description") || upstreamUrl.searchParams.has("city") ||
upstreamUrl.searchParams.has("postal_code") || upstreamUrl.searchParams.has("country_code");
const limit = Number(upstreamUrl.searchParams.get("limit") || "25");
let body = "";
if (hasCriteria) {
if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
body = "<p>Invalid limit. Use a number from 1 to 200.</p>";
} else {
try {
const response = await fetch(upstreamUrl.toString(), { method: "GET", cache: "no-store", headers: { Accept: "application/json" } });
const data = await response.json();
body = renderResults(data);
} catch (error) {
body = `<p>NPI Registry search failed: ${escapeHtml(error instanceof Error ? error.message : String(error))}</p>`;
}
}
} else {
body = "<p>Enter search criteria below.</p>";
}
return pageResponse(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>NPI Registry Search</title><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="index,follow"><meta name="description" content="Search public NPI Registry records through a readable Cloudflare-hostedpage."></head><body><main><h1>NPI Registry Search</h1>${renderSearchForm()}<section><h2>Search Results</h2>${body}</section><section><h2>Example Searches</h2><ul><li><a href="/search?last_name=Smith&state=NY&limit=10">Search Smith in NY</a></li><li><a href="/search?organization_name=Mount%20Sinai&state=NY&limit=10">Search Mount Sinai in NY</a></li></ul></section><section><h2>Source</h2><p>Data is retrieved from the public NPPES NPI Registry API. Issuance of an NPI does not validate that the provider is licensed or credentialed.</p></section></main></body></html>`);
}
