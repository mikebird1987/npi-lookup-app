import "./style.css";
const npiNumberInput = document.querySelector("#npiNumber");
const firstNameInput = document.querySelector("#firstName");
const lastNameInput = document.querySelector("#lastName");
const organizationNameInput = document.querySelector("#organizationName");
const stateInput = document.querySelector("#state");
const searchByNumberButton = document.querySelector("#searchByNumber");
const searchByNameButton = document.querySelector("#searchByName");
const statusEl = document.querySelector("#status");
const resultsEl = document.querySelector("#results");
function setStatus(message) {
statusEl.textContent = message;
  }
function showResults(data) {
resultsEl.textContent = JSON.stringify(data, null, 2);
}
async function fetchNpi(params) {
const query = new URLSearchParams();
for (const [key, value] of Object.entries(params)) {
if (value !== undefined && value !== null && String(value).trim() !== "") {
query.set(key, String(value).trim());
}
}
setStatus("Searching...");
showResults({});
const response = await fetch(`/api/npi?${query.toString()}`, {
method: "GET",
headers: { Accept: "application/json" }
});
const data = await response.json();
if (!response.ok) {
throw new Error(data.error || "NPI lookup failed.");
}
return data;
}
searchByNumberButton.addEventListener("click", async () => {
const number = npiNumberInput.value.trim();
if (!/^\d{10}$/.test(number)) {
setStatus("Please enter a valid 10-digit NPI number.");
return;
}
try {
const data = await fetchNpi({ number });
setStatus(`Found ${data.results_count ?? 0} result(s).`);
showResults(data);
} catch (error) {
setStatus(error.message);
}
});
searchByNameButton.addEventListener("click", async () => {
const first_name = firstNameInput.value.trim();
const last_name = lastNameInput.value.trim();
const organization_name = organizationNameInput.value.trim();return;
}
try {
const data = await fetchNpi({ first_name, last_name, organization_name, state, limit: "25" });
setStatus(`Found ${data.results_count ?? 0} result(s).`);
showResults(data);
} catch (error) {
setStatus(error.message);
}
});
const state = stateInput.value.trim().toUpperCase();
if (!first_name && !last_name && !organization_name) {
setStatus("Enter a name or organization to search.");
