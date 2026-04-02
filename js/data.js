// Custom Data Management Functions
function getFacilityCustomData(facilityId) {
    return facilityCustomData[facilityId] || null;
}

async function saveFacilityCustomData(facilityId) {
    const data = facilityCustomData[facilityId];
    if (!data) return;
    const { error } = await _supabase.from('facility_edits').upsert({
        facility_id: String(facilityId),
        data,
        updated_at: new Date().toISOString()
    });
    if (error) console.error('Error saving facility edit:', error);
}

async function loadFacilityCustomData() {
    const { data, error } = await _supabase.from('facility_edits').select('*');
    if (error) { console.error('Error loading facility edits:', error); return; }
    facilityCustomData = {};
    data.forEach(row => { facilityCustomData[row.facility_id] = row.data; });
}

// Document Management Functions
function getFacilityDocuments(facilityId) {
    return facilityDocuments[facilityId] || [];
}

async function loadFacilityDocuments() {
    const { data, error } = await _supabase.from('documents').select('facility_id, name, storage_path, uploaded_at');
    if (error) { console.error('Error loading documents:', error); return; }
    facilityDocuments = {};
    data.forEach(row => {
        if (!facilityDocuments[row.facility_id]) facilityDocuments[row.facility_id] = [];
        facilityDocuments[row.facility_id].push({ name: row.name, storagePath: row.storage_path, uploadedAt: row.uploaded_at });
    });
}

async function handleDocumentUpload(event, facilityId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
    }

    // Check for duplicate
    const existing = (facilityDocuments[facilityId] || []).find(d => d.name === file.name);
    if (existing) {
        if (!confirm(`A document named "${file.name}" already exists. Replace it?`)) return;
        await _supabase.storage.from('facility-documents').remove([existing.storagePath]);
        await _supabase.from('documents').delete().eq('facility_id', String(facilityId)).eq('name', file.name);
    }

    const storagePath = `${facilityId}/${file.name}`;
    const { error: uploadError } = await _supabase.storage.from('facility-documents').upload(storagePath, file, { upsert: true });
    if (uploadError) { alert('Upload failed: ' + uploadError.message); return; }

    const { error: dbError } = await _supabase.from('documents').upsert({
        facility_id: String(facilityId), name: file.name,
        storage_path: storagePath, uploaded_at: new Date().toISOString()
    });
    if (dbError) { alert('Failed to save document metadata: ' + dbError.message); return; }

    if (!facilityDocuments[facilityId]) facilityDocuments[facilityId] = [];
    const idx = facilityDocuments[facilityId].findIndex(d => d.name === file.name);
    const entry = { name: file.name, storagePath, uploadedAt: new Date().toISOString() };
    if (idx >= 0) facilityDocuments[facilityId][idx] = entry;
    else facilityDocuments[facilityId].push(entry);

    // Refresh the display
    const facility = allFacilities.find(f => f.id == facilityId);
    if (facility) {
        const detailsCell = document.querySelector(`#facility-${facilityId} .facility-details-cell`);
        if (detailsCell) {
            detailsCell.innerHTML = createFacilityDetails(facility);
            const textarea = document.getElementById(`notes-${facilityId}`);
            if (textarea) {
                textarea.addEventListener("input", (e) => {
                    updateNote(facilityId, e.target.value);
                    updateTimestamp(facilityId);
                });
            }
        }
    }
    alert("Document uploaded successfully!");
}

async function downloadDocument(facilityId, documentName) {
    const docs = facilityDocuments[facilityId];
    if (!docs) return;
    const doc = docs.find(d => d.name === documentName);
    if (!doc) return;
    const { data, error } = await _supabase.storage.from('facility-documents').download(doc.storagePath);
    if (error) { alert('Download failed: ' + error.message); return; }
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function deleteDocument(facilityId, documentName) {
    if (!confirm(`Are you sure you want to delete "${documentName}"?`)) return;

    const docs = facilityDocuments[facilityId];
    if (!docs) return;
    const doc = docs.find(d => d.name === documentName);
    if (!doc) return;

    await _supabase.storage.from('facility-documents').remove([doc.storagePath]);
    await _supabase.from('documents').delete().eq('facility_id', String(facilityId)).eq('name', documentName);

    const index = docs.findIndex(d => d.name === documentName);
    if (index >= 0) {
        docs.splice(index, 1);

        // Refresh the display
        const facility = allFacilities.find(
            (f) => f.id == facilityId,
        );
        if (facility) {
            const detailsCell = document.querySelector(
                `#facility-${facilityId} .facility-details-cell`,
            );
            if (detailsCell) {
                detailsCell.innerHTML =
                    createFacilityDetails(facility);

                // Reattach notes event listener
                const textarea = document.getElementById(
                    `notes-${facilityId}`,
                );
                if (textarea) {
                    textarea.addEventListener("input", (e) => {
                        updateNote(facilityId, e.target.value);
                        updateTimestamp(facilityId);
                    });
                }
            }
        }

        alert("Document deleted successfully!");
    }
}

// City-to-county mapping (Oregon and Washington)
const cityToCounty = {
    // Oregon
    "Albany": "Linn, OR",
    "Ashland": "Jackson, OR",
    "Astoria": "Clatsop, OR",
    "Beaverton": "Washington, OR",
    "Bend": "Deschutes, OR",
    "Boardman": "Morrow, OR",
    "Canby": "Clackamas, OR",
    "Christmas Valley": "Lake, OR",
    "Clackamas": "Clackamas, OR",
    "Condon": "Gilliam, OR",
    "Corvallis": "Benton, OR",
    "Cottage Grove": "Lane, OR",
    "Enterprise": "Wallowa, OR",
    "Eugene": "Lane, OR",
    "Florence": "Lane, OR",
    "Fossil": "Wheeler, OR",
    "Gladstone": "Clackamas, OR",
    "Grants Pass": "Josephine, OR",
    "Happy Valley": "Clackamas, OR",
    "Harrisburg": "Linn, OR",
    "Heppner": "Morrow, OR",
    "Hermiston": "Umatilla, OR",
    "Hillsboro": "Washington, OR",
    "Hines": "Harney, OR",
    "Hood River": "Hood River, OR",
    "Jefferson": "Marion, OR",
    "John Day": "Grant, OR",
    "Klamath Falls": "Klamath, OR",
    "La Grande": "Union, OR",
    "Lakeview": "Lake, OR",
    "Lincoln City": "Lincoln, OR",
    "Madras": "Jefferson, OR",
    "McMinnville": "Yamhill, OR",
    "Medford": "Jackson, OR",
    "Milwaukie": "Clackamas, OR",
    "Monmouth": "Polk, OR",
    "Newberg": "Yamhill, OR",
    "Newport": "Lincoln, OR",
    "North Bend": "Coos, OR",
    "Ontario": "Malheur, OR",
    "Oregon City": "Clackamas, OR",
    "Pendleton": "Umatilla, OR",
    "Phoenix": "Jackson, OR",
    "Portland": "Multnomah, OR",
    "Prineville": "Crook, OR",
    "Redmond": "Deschutes, OR",
    "Roseburg": "Douglas, OR",
    "Saint Helens": "Columbia, OR",
    "Salem": "Marion, OR",
    "Sandy": "Clackamas, OR",
    "Scappoose": "Columbia, OR",
    "Seaside": "Clatsop, OR",
    "Shedd": "Linn, OR",
    "Siletz": "Lincoln, OR",
    "Springfield": "Lane, OR",
    "Sweet Home": "Linn, OR",
    "The Dalles": "Wasco, OR",
    "Tillamook": "Tillamook, OR",
    "Tualatin": "Washington, OR",
    "Woodburn": "Marion, OR",
    // Washington
    "Aberdeen": "Grays Harbor, WA",
    "Chehalis": "Lewis, WA",
    "Kelso": "Cowlitz, WA",
    "Kennewick": "Benton, WA",
    "Longview": "Cowlitz, WA",
    "Ocean Park": "Pacific, WA",
    "Olympia": "Thurston, WA",
    "Pasco": "Franklin, WA",
    "Richland": "Benton, WA",
    "Spokane": "Spokane, WA",
    "Tumwater": "Thurston, WA",
    "Vancouver": "Clark, WA",
    "Walla Walla": "Walla Walla, WA",
    "Yakima": "Yakima, WA",
};

// Load notes from Supabase
async function loadNotes() {
    const { data, error } = await _supabase.from('notes').select('*');
    if (error) { console.error('Error loading notes:', error); return; }
    facilityNotes = {};
    data.forEach(row => {
        facilityNotes[row.facility_id] = { text: row.text, timestamp: row.updated_at };
    });
}

// Update note for a facility (debounced save to Supabase)
function updateNote(facilityId, noteText) {
    facilityNotes[facilityId] = {
        text: noteText,
        timestamp: new Date().toISOString(),
    };
    debounce(`note-${facilityId}`, async () => {
        const { error } = await _supabase.from('notes').upsert({
            facility_id: String(facilityId),
            text: noteText,
            updated_at: new Date().toISOString()
        });
        if (error) console.error('Error saving note:', error);
    });
}

// Get note for a facility
function getNote(facilityId) {
    return (
        facilityNotes[facilityId] || { text: "", timestamp: null }
    );
}

// Determine county for a city
function getCityCounty(city) {
    return cityToCounty[city] || null;
}

// Load facility data from Supabase
async function loadFacilities() {
    try {
        const { data, error } = await _supabase
            .from('facilities')
            .select('*')
            .limit(1000);
        if (error) throw error;

        allFacilities = data || [];

        // Add county to each facility
        allFacilities.forEach((facility) => {
            facility.county = getCityCounty(facility.address?.city);
        });

        // Load custom facilities from Supabase
        const { data: customRows } = await _supabase.from('custom_facilities').select('data');
        if (customRows && customRows.length > 0) {
            allFacilities = allFacilities.concat(customRows.map(r => r.data));
        }

        filteredFacilities = allFacilities;
        displayFacilities(filteredFacilities);
        updateStats();
    } catch (error) {
        document.getElementById("facilitiesList").innerHTML = `
            <div class="error">
                <h3>⚠️ Error Loading Data</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}
