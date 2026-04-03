// Import/Export Functions

let pendingImportData = null;
let uploadedCSVContent = null;

// --- CSV format helpers ---

// Serialize hours array → "Description|Hours ;; Description|Hours"
function formatHoursCSV(hoursData) {
    if (!hoursData || hoursData.length === 0) return '';
    return hoursData.map(r => `${r.description || ''}|${r.hours || ''}`).join(' ;; ');
}

// Serialize contacts array → "Type|Info|Notes ;; Type|Info|Notes"
function formatContactsCSV(contacts) {
    if (!contacts || contacts.length === 0) return '';
    return contacts.map(c => `${c.type || ''}|${c.info || ''}|${c.notes || ''}`).join(' ;; ');
}

// Parse "Description|Hours ;; ..." back to array
function parseHoursCSV(str) {
    if (!str || !str.trim()) return [];
    return str.split(';;').map(entry => {
        const pipeIdx = entry.indexOf('|');
        if (pipeIdx === -1) {
            const h = entry.trim();
            return h ? { description: '', hours: h } : null;
        }
        return {
            description: entry.slice(0, pipeIdx).trim(),
            hours: entry.slice(pipeIdx + 1).trim(),
        };
    }).filter(r => r && r.hours);
}

// Parse "Type|Info|Notes ;; ..." back to array
function parseContactsCSV(str) {
    if (!str || !str.trim()) return [];
    return str.split(';;').map(entry => {
        const parts = entry.split('|');
        return {
            type: (parts[0] || '').trim(),
            info: (parts[1] || '').trim(),
            notes: (parts[2] || '').trim(),
        };
    }).filter(c => c.type && c.info);
}

// Escape a value for CSV
function csvEscape(val) {
    const s = (val == null ? '' : String(val)).replace(/"/g, '""').replace(/\n/g, ' ');
    return `"${s}"`;
}

// --- Export ---

function exportNotesTemplate() {
    const headers = [
        'ID', 'Name', 'Secondary Name', 'Street Address', 'City', 'State', 'County',
        'Hours', 'General Contacts', 'Staff Contacts', 'Patient Notes', 'Clinical Staff Notes'
    ];
    let csv = headers.map(h => `"${h}"`).join(',') + '\n';

    allFacilities.forEach(facility => {
        const customData = getFacilityCustomData(facility.id);
        const hoursData = parseHoursData(customData?.hours);
        const contacts = customData?.contacts || [];
        const staffContacts = customData?.staff_contacts || [];
        const patientNotes = customData?.patient_notes || '';
        const staffNote = (facilityNotes[facility.id] || {}).text || '';

        csv += [
            csvEscape(facility.id),
            csvEscape(facility.name),
            csvEscape(facility.name_secondary || ''),
            csvEscape(facility.address?.street1 || ''),
            csvEscape(facility.address?.city || ''),
            csvEscape(facility.address?.state || ''),
            csvEscape(facility.county || ''),
            csvEscape(formatHoursCSV(hoursData)),
            csvEscape(formatContactsCSV(contacts)),
            csvEscape(formatContactsCSV(staffContacts)),
            csvEscape(patientNotes),
            csvEscape(staffNote),
        ].join(',') + '\n';
    });

    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facilities-template-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// --- Import ---

function showImportModal() {
    resetImportModal();
    document.getElementById('importModal').classList.add('show');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('show');
    resetImportModal();
}

function resetImportModal() {
    document.getElementById('csvFileInput').value = '';
    document.getElementById('selectedFileName').textContent = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('uploadBtn').style.display = 'none';
    document.getElementById('importFooterInitial').style.display = 'flex';
    document.getElementById('importFooterConfirm').style.display = 'none';
    document.getElementById('importInstructions').style.display = 'block';
    document.getElementById('fileSelectSection').style.display = 'block';
    pendingImportData = null;
    uploadedCSVContent = null;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file.');
        document.getElementById('csvFileInput').value = '';
        return;
    }

    document.getElementById('selectedFileName').textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedCSVContent = e.target.result;
        document.getElementById('uploadBtn').style.display = 'inline-block';
    };
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
        document.getElementById('csvFileInput').value = '';
        document.getElementById('selectedFileName').textContent = '';
    };
    reader.readAsText(file);
}

function processUploadedFile() {
    if (!uploadedCSVContent) {
        alert('No file selected. Please choose a CSV file first.');
        return;
    }

    try {
        const lines = uploadedCSVContent.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            alert('CSV file must have at least a header row and one data row.');
            return;
        }

        const headerFields = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const idCol           = headerFields.indexOf('id');
        const nameCol         = headerFields.indexOf('name');
        const cityCol         = headerFields.indexOf('city');
        const stateCol        = headerFields.indexOf('state');
        const hoursCol        = headerFields.indexOf('hours');
        const genContactsCol  = headerFields.indexOf('general contacts');
        const staffContactsCol= headerFields.indexOf('staff contacts');
        const patientNotesCol = headerFields.indexOf('patient notes');
        const staffNotesCol   = headerFields.indexOf('clinical staff notes');

        if (idCol === -1 || nameCol === -1) {
            alert('CSV file must contain at least "ID" and "Name" columns. Please use the exported template format.');
            return;
        }

        const updates = [];
        const notFound = [];

        lines.slice(1).forEach(line => {
            if (!line.trim()) return;

            const fields = parseCSVLine(line);
            const id = (fields[idCol] || '').trim();
            const facilityName = (fields[nameCol] || '').trim();

            if (!id && !facilityName) return;

            let facility = allFacilities.find(f => f.id == id);
            if (!facility && facilityName) {
                const city = cityCol >= 0 ? (fields[cityCol] || '').trim() : '';
                const state = stateCol >= 0 ? (fields[stateCol] || '').trim() : '';
                facility = allFacilities.find(f =>
                    f.name.toLowerCase() === facilityName.toLowerCase() &&
                    (!city || f.address?.city?.toLowerCase() === city.toLowerCase()) &&
                    (!state || f.address?.state?.toUpperCase() === state.toUpperCase())
                );
            }

            if (!facility) {
                notFound.push({ id, name: facilityName || 'Unknown' });
                return;
            }

            const customData = getFacilityCustomData(facility.id) || {};
            const changed = {};
            const diffLines = [];

            // Hours
            if (hoursCol >= 0) {
                const newHours = parseHoursCSV(fields[hoursCol] || '');
                const currentHours = parseHoursData(customData.hours);
                if (JSON.stringify(newHours) !== JSON.stringify(currentHours)) {
                    changed.hours = newHours;
                    diffLines.push({
                        label: 'Hours',
                        before: formatHoursCSV(currentHours) || '(none)',
                        after: formatHoursCSV(newHours) || '(cleared)',
                    });
                }
            }

            // General Contacts
            if (genContactsCol >= 0) {
                const newContacts = parseContactsCSV(fields[genContactsCol] || '');
                const currentContacts = customData.contacts || [];
                if (JSON.stringify(newContacts) !== JSON.stringify(currentContacts)) {
                    changed.contacts = newContacts;
                    diffLines.push({
                        label: 'General Contacts',
                        before: formatContactsCSV(currentContacts) || '(none)',
                        after: formatContactsCSV(newContacts) || '(cleared)',
                    });
                }
            }

            // Staff Contacts
            if (staffContactsCol >= 0) {
                const newStaffContacts = parseContactsCSV(fields[staffContactsCol] || '');
                const currentStaffContacts = customData.staff_contacts || [];
                if (JSON.stringify(newStaffContacts) !== JSON.stringify(currentStaffContacts)) {
                    changed.staff_contacts = newStaffContacts;
                    diffLines.push({
                        label: 'Staff Contacts',
                        before: formatContactsCSV(currentStaffContacts) || '(none)',
                        after: formatContactsCSV(newStaffContacts) || '(cleared)',
                    });
                }
            }

            // Patient Notes
            if (patientNotesCol >= 0) {
                const newPatientNotes = (fields[patientNotesCol] || '').trim();
                const currentPatientNotes = customData.patient_notes || '';
                if (newPatientNotes !== currentPatientNotes) {
                    changed.patient_notes = newPatientNotes;
                    diffLines.push({
                        label: 'Patient Notes',
                        before: currentPatientNotes || '(none)',
                        after: newPatientNotes || '(cleared)',
                    });
                }
            }

            // Clinical Staff Notes
            if (staffNotesCol >= 0) {
                const newStaffNotes = (fields[staffNotesCol] || '').trim();
                const currentStaffNotes = (facilityNotes[facility.id] || {}).text || '';
                if (newStaffNotes !== currentStaffNotes) {
                    changed.staff_notes = newStaffNotes;
                    diffLines.push({
                        label: 'Clinical Staff Notes',
                        before: currentStaffNotes || '(none)',
                        after: newStaffNotes || '(cleared)',
                    });
                }
            }

            if (diffLines.length > 0) {
                updates.push({
                    id: facility.id,
                    name: facility.name,
                    city: facility.address?.city || '',
                    state: facility.address?.state || '',
                    changed,
                    diffLines,
                });
            }
        });

        if (updates.length === 0 && notFound.length === 0) {
            alert('No changes detected. All data is already up to date.');
            return;
        }

        if (updates.length === 0 && notFound.length > 0) {
            alert(`No valid updates found. ${notFound.length} facilities could not be matched.\n\nPlease ensure the CSV matches the current facility list.`);
            return;
        }

        pendingImportData = updates;

        let previewHTML = '';

        if (updates.length > 0) {
            previewHTML += `<div style="margin-bottom: 15px;">
                <strong style="color: #2d5170;">✓ ${updates.length} facilit${updates.length === 1 ? 'y' : 'ies'} will be updated:</strong>
            </div>`;

            previewHTML += updates.map(u => `
                <div style="margin-bottom: 14px; padding: 12px; background: white; border-left: 4px solid #5b8fc4; border-radius: 2px;">
                    <strong style="color: #2d2520;">${u.name}</strong>
                    <small style="color: #6b5f54; display: block; margin-top: 2px;">${u.city}, ${u.state}</small>
                    ${u.diffLines.map(d => `
                        <div style="margin-top: 9px; font-size: 13px;">
                            <strong>${d.label}:</strong>
                            <div style="margin-top: 3px; padding-left: 8px;">
                                <div><span style="color: #a94842;">Before:</span> ${d.before.substring(0, 120)}${d.before.length > 120 ? '…' : ''}</div>
                                <div><span style="color: #5a8a72;">After:</span> ${d.after.substring(0, 120)}${d.after.length > 120 ? '…' : ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        }

        if (notFound.length > 0) {
            previewHTML += `<div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 2px;">
                <strong style="color: #856404;">⚠ ${notFound.length} facilities could not be matched and will be skipped:</strong>
                <ul style="margin: 8px 0 0 20px; font-size: 13px;">
                    ${notFound.slice(0, 5).map(nf => `<li>${nf.name} (ID: ${nf.id})</li>`).join('')}
                    ${notFound.length > 5 ? `<li><em>...and ${notFound.length - 5} more</em></li>` : ''}
                </ul>
            </div>`;
        }

        document.getElementById('importPreviewList').innerHTML = previewHTML;
        document.getElementById('importPreview').style.display = 'block';
        document.getElementById('importInstructions').style.display = 'none';
        document.getElementById('fileSelectSection').style.display = 'none';
        document.getElementById('importFooterInitial').style.display = 'none';
        document.getElementById('importFooterConfirm').style.display = 'flex';

    } catch (error) {
        console.error('CSV parsing error:', error);
        alert('Error processing CSV file: ' + error.message + '\n\nPlease ensure the file is properly formatted.');
    }
}

function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    fields.push(current);
    return fields;
}

function cancelImportChanges() {
    if (confirm('Are you sure you want to cancel? All changes will be discarded.')) {
        closeImportModal();
    }
}

async function confirmImport() {
    if (!pendingImportData || pendingImportData.length === 0) {
        alert('No data to import.');
        closeImportModal();
        return;
    }

    let updatedCount = 0;

    for (const update of pendingImportData) {
        const { changed, id } = update;

        // Build facility_edits patch (everything except staff_notes)
        const editKeys = ['hours', 'contacts', 'staff_contacts', 'patient_notes'];
        const editPatch = {};
        editKeys.forEach(k => { if (k in changed) editPatch[k] = changed[k]; });

        if (Object.keys(editPatch).length > 0) {
            if (!facilityCustomData[id]) facilityCustomData[id] = {};
            Object.assign(facilityCustomData[id], editPatch);
            await _supabase.from('facility_edits').upsert({
                facility_id: String(id),
                data: facilityCustomData[id],
                updated_at: new Date().toISOString(),
            });
        }

        // Clinical staff notes → notes table
        if ('staff_notes' in changed) {
            facilityNotes[id] = {
                text: changed.staff_notes,
                timestamp: new Date().toISOString(),
            };
            await _supabase.from('notes').upsert({
                facility_id: String(id),
                text: changed.staff_notes,
                updated_at: new Date().toISOString(),
            });

            // Refresh visible textarea if expanded
            const textarea = document.getElementById(`notes-${id}`);
            const timestampDiv = document.getElementById(`timestamp-${id}`);
            if (textarea) textarea.value = changed.staff_notes;
            if (timestampDiv) timestampDiv.textContent = `Last updated: ${new Date().toLocaleString()}`;
        }

        // Refresh patient notes textarea if visible
        if ('patient_notes' in changed) {
            const pt = document.getElementById(`patient-notes-${id}`);
            if (pt) pt.value = changed.patient_notes;
        }

        updatedCount++;
    }

    alert(`✓ Successfully imported updates for ${updatedCount} facilit${updatedCount !== 1 ? 'ies' : 'y'}!`);
    closeImportModal();
}

// --- Add Facility Modal ---

function showAddFacilityModal() {
    const allOptions = extractAllOptions();

    document.getElementById('addPharmacotherapiesContainer').innerHTML = allOptions.pharmacotherapies.map(med => `
        <label class="checkbox-label">
            <input type="checkbox" class="new-facility-medication" value="${med}">
            <span>${med}</span>
        </label>
    `).join('');

    document.getElementById('addServiceSettingsContainer').innerHTML = allOptions.serviceSettings.map(setting => `
        <label class="checkbox-label">
            <input type="checkbox" class="new-facility-service" value="${setting}">
            <span>${setting}</span>
        </label>
    `).join('');

    document.getElementById('addPaymentOptionsContainer').innerHTML = allOptions.paymentOptions.map(payment => `
        <label class="checkbox-label">
            <input type="checkbox" class="new-facility-payment" value="${payment}">
            <span>${payment}</span>
        </label>
    `).join('');

    document.getElementById('addFacilityModal').classList.add('show');
}

function closeAddFacilityModal() {
    document.getElementById('addFacilityModal').classList.remove('show');
    document.getElementById('newFacilityName').value = '';
    document.getElementById('newFacilityNameSecondary').value = '';
    document.getElementById('newFacilityStreet').value = '';
    document.getElementById('newFacilityCity').value = '';
    document.getElementById('newFacilityState').value = 'OR';
    document.getElementById('newFacilityZip').value = '';
    document.getElementById('newFacilityPhone').value = '';
    document.getElementById('newFacilityWebsite').value = '';
    document.getElementById('newFacilityType').value = 'SA';
    document.getElementById('newFacilitySpecialPrograms').value = '';
    document.querySelectorAll('.new-facility-medication, .new-facility-service, .new-facility-payment').forEach(cb => (cb.checked = false));
}

async function saveNewFacility() {
    const name = document.getElementById('newFacilityName').value.trim();
    const nameSecondary = document.getElementById('newFacilityNameSecondary').value.trim();
    const street = document.getElementById('newFacilityStreet').value.trim();
    const city = document.getElementById('newFacilityCity').value.trim();
    const state = document.getElementById('newFacilityState').value;
    const zip = document.getElementById('newFacilityZip').value.trim();
    const phone = document.getElementById('newFacilityPhone').value.trim();
    const website = document.getElementById('newFacilityWebsite').value.trim();
    const facilityType = document.getElementById('newFacilityType').value;

    const medications = Array.from(document.querySelectorAll('.new-facility-medication:checked')).map(cb => cb.value);
    const serviceSettings = Array.from(document.querySelectorAll('.new-facility-service:checked')).map(cb => cb.value);
    const paymentOptions = Array.from(document.querySelectorAll('.new-facility-payment:checked')).map(cb => cb.value);
    const specialProgramsText = document.getElementById('newFacilitySpecialPrograms').value.trim();
    const specialPrograms = specialProgramsText ? specialProgramsText.split('\n').filter(p => p.trim()) : [];

    if (!name || !street || !city || !zip) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }

    const newId = 'custom-' + Date.now();
    const county = getCityCounty(city) || null;

    const newFacility = {
        id: newId,
        name,
        name_secondary: nameSecondary || null,
        address: { street1: street, street2: null, city, state, zip },
        contact: { phone: phone || null, intake_phone: null, hotline: null, website: website || null },
        location: { lat: null, lng: null },
        facility_type: facilityType,
        county,
        services: {
            medications,
            type_of_care: [],
            service_settings: serviceSettings,
            special_programs: specialPrograms,
            payment_options: paymentOptions,
            age_groups: [],
            languages: [],
            other_services: medications.length > 0 ? [{ category: 'Pharmacotherapies', code: 'PHR', values: medications }] : [],
        },
    };

    allFacilities.push(newFacility);
    await _supabase.from('custom_facilities').upsert({ id: newFacility.id, data: newFacility });

    filterFacilities();
    closeAddFacilityModal();
    alert('Facility added successfully!');
}

// Close import modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('importModal');
    if (event.target === modal) {
        closeImportModal();
    }
};
