// Supabase client (credentials injected via __CONFIG__ defined in index.html)
const _supabase = window.supabase?.createClient(__CONFIG__.supabaseUrl, __CONFIG__.supabaseKey) ?? null;

// Debounce helper for note saves
const _debounceTimers = {};
function debounce(key, fn, delay = 1000) {
    clearTimeout(_debounceTimers[key]);
    _debounceTimers[key] = setTimeout(fn, delay);
}

// Global state variables
let allFacilities = [];
let filteredFacilities = [];
let facilityNotes = {};
let facilityDocuments = {};
let facilityCustomData = {}; // Stores custom edits for facilities
let currentSort = { field: null, direction: "asc" };
let currentEditingFacilityId = null;
let pendingFacilityEdits = null;
