const NPI_API_BASE = "https://npiregistry.cms.hhs.gov/api/";
function escapeHtml(value) {
return String(value ?? "")
.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
.replaceAll(">", "&gt;").replaceAll('"', "&quot;")
.replaceAll("'", "&#039;");
}
function pageResponse(html, status = 200) {
return new Response(html, {
status,
headers: {
"Content-Type": "text/html; charset=utf-8",
"Cache-Control": "no-store"
}
});
}
function getProviderName(result) {
const basic = result.basic || {};
if (basic.organization_name) return basic.organization_name;
return [basic.first_name, basic.middle_name, basic.last_name, basic.credential].filter(Boolean).join(" ");
}
function renderResult(result) {
const basic = result.basic || {};
const addresses = result.addresses || [];
const taxonomies = result.taxonomies || [];
const name = getProviderName(result);
const primaryAddress = addresses.find((a) => a.address_purpose === "LOCATION") || addresses[0] || {};
const primaryTaxonomy = taxonomies.find((t) => t.primary) || taxonomies[0] || {};
return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(name)} - NPI ${escapeHtml(result.number)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index,follow">
<meta name="description" content="NPI Registry result for ${escapeHtml(name)}, NPI ${escapeHtml(result.number)}.">
</head>
<body>
<main>
<h1>NPI Registry Result</h1>
<section>
<h2>${escapeHtml(name)}</h2>
<p><strong>NPI:</strong> ${escapeHtml(result.number)}</p>
<p><strong>Enumeration Type:</strong> ${escapeHtml(result.enumeration_type)}</p>
<p><strong>Status:</strong> ${escapeHtml(basic.status)}</p>
<p><strong>Credential:</strong> ${escapeHtml(basic.credential)}</p>
<p><strong>Gender:</strong> ${escapeHtml(basic.gender)}</p>
<p><strong>Enumeration Date:</strong> ${escapeHtml(basic.enumeration_date)}</p>
<p><strong>Last Updated:</strong> ${escapeHtml(basic.last_updated)}</p>
</section>
<section>
<h2>Primary Taxonomy</h2>
<p><strong>Code:</strong> ${escapeHtml(primaryTaxonomy.code)}</p>
<p><strong>Description:</strong> ${escapeHtml(primaryTaxonomy.desc)}</p>
<p><strong>State:</strong> ${escapeHtml(primaryTaxonomy.state)}</p>
<p><strong>License:</strong> ${escapeHtml(primaryTaxonomy.license)}</p>
<p><strong>Primary:</strong> ${escapeHtml(primaryTaxonomy.primary)}</p>
</section>
<section>
<h2>Primary Address</h2>
<p>${escapeHtml(primaryAddress.address_1)}</p>
<p>${escapeHtml(primaryAddress.address_2)}</p>
<p>${escapeHtml(primaryAddress.city)}, ${escapeHtml(primaryAddress.state)} ${escapeHtml(primaryAddress.postal_code)}</p>
<p><strong>Country:</strong> ${escapeHtml(primaryAddress.country_name || primaryAddress.country_code)}</p>
<p><strong>Phone:</strong> ${escapeHtml(primaryAddress.telephone_number)}</p>
<p><strong>Fax:</strong> ${escapeHtml(primaryAddress.fax_number)}</p>
</section>
<section>
<h2>All Taxonomies</h2>
<ul>${taxonomies.map((t) => `<li>${escapeHtml(t.code)} - ${escapeHtml(t.desc)} ${t.primary ? "(Primary)" : ""}</li>`).join("")}</ul>
</section>
<section>
<h2>Source</h2>
<p>Data is retrieved from the public NPPES NPI Registry API. Issuance of an NPI does not validate that the provider is licensed or credentialed.</p>
</section>
</main>
</body>
</html>`;
}
export async function onRequestGet(context) {
const number = context.params.number;
if (!number || !/^[0-9]{10}$/.test(number)) {
return pageResponse("<!doctype html><html><body><main><h1>NPI Lookup</h1><p>Use a 10-digit NPI number in the URL. Example: <code>/npi/1234567890</code></p></main></body></html>", 400);
}
const upstreamUrl = new URL(NPI_API_BASE);
upstreamUrl.searchParams.set("version", "2.1");
upstreamUrl.searchParams.set("number", number);
try {
const response = await fetch(upstreamUrl.toString(), { method: "GET", cache: "no-store", headers: { Accept: "application/json" } });
const data = await response.json();
const result = data.results?.[0];
if (!result) {
return pageResponse(`<!doctype html><html><head><meta name="robots" content="noindex"></head><body><main><h1>No NPI Result Found</h1><p>No NPI Registry result was found for ${escapeHtml(number)}.</p></main></body></html>`, 404);
}
return pageResponse(renderResult(result));
} catch (error) {
return pageResponse(`<!doctype html><html><head><meta name="robots" content="noindex"></head><body><main><h1>NPI Lookup Error</h1><p>The NPI Registry lookup failed.</p><p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p></main></body></html>`, 502);
}
}
