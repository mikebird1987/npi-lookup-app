const NPI_API_BASE = "https://npiregistry.cms.hhs.gov/api/";
const ALLOWED_PARAMS = new Set([
"number", "enumeration_type", "taxonomy_description", "name_purpose",
"first_name", "use_first_name_alias", "last_name", "organization_name",
"address_purpose", "city", "state", "postal_code", "country_code",
"limit", "skip", "pretty"
]);
function jsonResponse(data, status = 200, headers = {}) {
return new Response(JSON.stringify(data), {
status,
headers: {
"Content-Type": "application/json; charset=utf-8",
"Cache-Control": "no-store",
...headers
}
});
}
export async function onRequestOptions() {
return new Response(null, {
status: 204,
headers: {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type",
"Access-Control-Max-Age": "86400"
}
});
}
export async function onRequestGet(context) {
const requestUrl = new URL(context.request.url);
const upstreamUrl = new URL(NPI_API_BASE);
upstreamUrl.searchParams.set("version", "2.1");
for (const [key, value] of requestUrl.searchParams.entries()) {
if (ALLOWED_PARAMS.has(key) && value.trim() !== "") {
upstreamUrl.searchParams.set(key, value.trim());
}
}
const limit = Number(upstreamUrl.searchParams.get("limit") || "10");
const skip = Number(upstreamUrl.searchParams.get("skip") || "0");
if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
return jsonResponse({ error: "Invalid limit. Use a value from 1 to 200." }, 400, { "Access-Control-Allow-Origin": "*" });
}
  if (!Number.isInteger(skip) || skip < 0 || skip > 1000) {
return jsonResponse({ error: "Invalid skip. Use a value from 0 to 1000." }, 400, { "Access-Control-Allow-Origin": "*" });
}
const hasValidCriteria =
upstreamUrl.searchParams.has("number") || upstreamUrl.searchParams.has("first_name") ||
upstreamUrl.searchParams.has("last_name") || upstreamUrl.searchParams.has("organization_name") ||
upstreamUrl.searchParams.has("taxonomy_description") || upstreamUrl.searchParams.has("city") ||
upstreamUrl.searchParams.has("postal_code") || upstreamUrl.searchParams.has("country_code");
if (!hasValidCriteria) {
return jsonResponse({ error: "Missing search criteria.", example: "/api/npi?number=1234567890" }, 400, { "Access-Control-Allow-Origin": "*" });
}
try {
const upstreamResponse = await fetch(upstreamUrl.toString(), {
method: "GET",
cache: "no-store",
headers: { Accept: "application/json" }
});
const body = await upstreamResponse.text();
return new Response(body, {
status: upstreamResponse.status,
headers: {
"Content-Type": "application/json; charset=utf-8",
"Cache-Control": "no-store",
"Access-Control-Allow-Origin": "*"
}
});
} catch (error) {
return jsonResponse({
error: "NPI Registry request failed.",
detail: error instanceof Error ? error.message : String(error)
}, 502, { "Access-Control-Allow-Origin": "*" });
}
}
