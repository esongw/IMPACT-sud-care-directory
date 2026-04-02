// Edit Facility Functions

// Parse hours from stored data — handles both legacy string and new array format
function parseHoursData(hours) {
    if (!hours) return [];
    if (Array.isArray(hours)) return hours;
    if (typeof hours === 'string' && hours.trim()) {
        return [{ description: '', hours: hours.trim() }];
    }
    return [];
}

function showEditFacilityModal(facilityId) {
    currentEditingFacilityId = facilityId;
    const facility = allFacilities.find((f) => f.id == facilityId);
    if (!facility) return;

    document.getElementById("editFacilityName").textContent = facility.name;

    const allOptions = extractAllOptions();
    const customData = getFacilityCustomData(facilityId);

    // Medications
    const currentMedications = customData?.medications || extractMedicationsFromFacility(facility);
    document.getElementById("editPharmacotherapiesContainer").innerHTML =
        allOptions.pharmacotherapies.map((med) => `
            <label class="checkbox-label">
                <input type="checkbox" class="edit-facility-medication" value="${med}" ${currentMedications.some((m) => m === med) ? "checked" : ""}>
                <span>${med}</span>
            </label>
        `).join("");

    // Service Settings
    const currentServiceSettings = customData?.service_settings || facility.services?.service_settings || [];
    document.getElementById("editServiceSettingsContainer").innerHTML =
        allOptions.serviceSettings.map((setting) => `
            <label class="checkbox-label">
                <input type="checkbox" class="edit-facility-service" value="${setting}" ${currentServiceSettings.some((s) => s === setting) ? "checked" : ""}>
                <span>${setting}</span>
            </label>
        `).join("");

    // Payment Options
    const currentPaymentOptions = customData?.payment_options || facility.services?.payment_options || [];
    document.getElementById("editPaymentOptionsContainer").innerHTML =
        allOptions.paymentOptions.map((payment) => `
            <label class="checkbox-label">
                <input type="checkbox" class="edit-facility-payment" value="${payment}" ${currentPaymentOptions.some((p) => p === payment) ? "checked" : ""}>
                <span>${payment}</span>
            </label>
        `).join("");

    // Special Programs
    const currentSpecialPrograms = customData?.special_programs || facility.services?.special_programs || [];
    document.getElementById("editFacilitySpecialPrograms").value = currentSpecialPrograms.join("\n");

    // Hours (array of {description, hours})
    const currentHours = parseHoursData(customData?.hours);
    renderEditHoursRows(currentHours.length > 0 ? currentHours : [{ description: '', hours: '' }]);

    // General Contacts
    const defaultContacts = [];
    if (facility.contact.phone) defaultContacts.push({ type: "Phone", notes: "", info: facility.contact.phone });
    if (facility.contact.intake_phone) defaultContacts.push({ type: "Intake Phone", notes: "", info: facility.contact.intake_phone });
    if (facility.contact.hotline) defaultContacts.push({ type: "Hotline", notes: "", info: facility.contact.hotline });
    const contacts = customData?.contacts ?? defaultContacts;
    renderEditContacts(contacts);

    // Staff Contacts
    const staffContacts = customData?.staff_contacts ?? [];
    renderEditStaffContacts(staffContacts);

    document.getElementById("editFacilityModal").classList.add("show");
}

function closeEditFacilityModal() {
    document.getElementById("editFacilityModal").classList.remove("show");
    currentEditingFacilityId = null;
}

// --- Hours Rows ---

function renderEditHoursRows(rows = []) {
    const container = document.getElementById("editFacilityHoursRows");
    if (rows.length === 0) {
        container.innerHTML = '<p style="color: #6b5f54; font-style: italic; font-size: 13px;">No hours added yet. Click "Add Hours Row" below.</p>';
        return;
    }
    container.innerHTML = rows.map((row, i) => `
        <div style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f0ebe3; border-radius: 4px;" data-hours-index="${i}">
            <input type="text" class="search-box hours-description" value="${row.description || ''}" placeholder="Description (e.g. Office)" data-index="${i}">
            <input type="text" class="search-box hours-value" value="${row.hours || ''}" placeholder="Hours (e.g. Mon–Fri 9am–5pm)" data-index="${i}">
            <button class="btn btn-secondary" style="padding: 8px 12px; background: #a94842;" onclick="removeHoursRow(${i})">🗑</button>
        </div>
    `).join('');
}

function addHoursRow() {
    const rows = _collectHoursRows();
    rows.push({ description: '', hours: '' });
    renderEditHoursRows(rows);
}

function removeHoursRow(index) {
    const rows = _collectHoursRows();
    rows.splice(index, 1);
    renderEditHoursRows(rows);
}

function _collectHoursRows() {
    const container = document.getElementById("editFacilityHoursRows");
    return Array.from(container.querySelectorAll('.hours-description')).map((input, i) => ({
        description: input.value,
        hours: container.querySelector(`.hours-value[data-index="${i}"]`)?.value || '',
    }));
}

// --- General Contacts ---

function renderEditContacts(contacts = []) {
    const container = document.getElementById("editContactsList");
    if (contacts.length === 0) {
        container.innerHTML = '<p style="color: #6b5f54; font-style: italic; font-size: 13px;">No general contacts added yet. Click "Add General Contact" below.</p>';
        return;
    }
    container.innerHTML = contacts.map((contact, index) => `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f0ebe3; border-radius: 4px;">
            <input type="text" class="search-box contact-type" value="${contact.type}" placeholder="Type (e.g., Phone)" data-index="${index}">
            <input type="text" class="search-box contact-notes" value="${contact.notes || ''}" placeholder="Notes" data-index="${index}">
            <input type="text" class="search-box contact-info" value="${contact.info}" placeholder="Contact info" data-index="${index}">
            <button class="btn btn-secondary" style="padding: 8px 12px; background: #a94842;" onclick="removeContactRow(${index})">🗑</button>
        </div>
    `).join('');
}

function addContactRow() {
    const contacts = _collectContacts('editContactsList', 'contact-type', 'contact-notes', 'contact-info');
    contacts.push({ type: '', notes: '', info: '' });
    renderEditContacts(contacts);
}

function removeContactRow(index) {
    const contacts = _collectContacts('editContactsList', 'contact-type', 'contact-notes', 'contact-info');
    contacts.splice(index, 1);
    renderEditContacts(contacts);
}

// --- Staff Contacts ---

function renderEditStaffContacts(contacts = []) {
    const container = document.getElementById("editStaffContactsList");
    if (contacts.length === 0) {
        container.innerHTML = '<p style="color: #6b5f54; font-style: italic; font-size: 13px;">No staff contacts added yet. Click "Add Staff Contact" below.</p>';
        return;
    }
    container.innerHTML = contacts.map((contact, index) => `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background: #eef0f5; border-radius: 4px;">
            <input type="text" class="search-box staff-contact-type" value="${contact.type}" placeholder="Type (e.g., Director)" data-index="${index}">
            <input type="text" class="search-box staff-contact-notes" value="${contact.notes || ''}" placeholder="Notes" data-index="${index}">
            <input type="text" class="search-box staff-contact-info" value="${contact.info}" placeholder="Contact info" data-index="${index}">
            <button class="btn btn-secondary" style="padding: 8px 12px; background: #a94842;" onclick="removeStaffContactRow(${index})">🗑</button>
        </div>
    `).join('');
}

function addStaffContactRow() {
    const contacts = _collectContacts('editStaffContactsList', 'staff-contact-type', 'staff-contact-notes', 'staff-contact-info');
    contacts.push({ type: '', notes: '', info: '' });
    renderEditStaffContacts(contacts);
}

function removeStaffContactRow(index) {
    const contacts = _collectContacts('editStaffContactsList', 'staff-contact-type', 'staff-contact-notes', 'staff-contact-info');
    contacts.splice(index, 1);
    renderEditStaffContacts(contacts);
}

// --- Shared contact collector ---

function _collectContacts(containerId, typeClass, notesClass, infoClass) {
    const container = document.getElementById(containerId);
    return Array.from(container.querySelectorAll(`.${typeClass}`)).map((input, i) => ({
        type: input.value,
        notes: container.querySelector(`.${notesClass}[data-index="${i}"]`)?.value || '',
        info: container.querySelector(`.${infoClass}[data-index="${i}"]`)?.value || '',
    }));
}

// --- Preview & Confirm ---

function previewFacilityEdits() {
    const facility = allFacilities.find((f) => f.id == currentEditingFacilityId);
    if (!facility) return;

    const newMedications = Array.from(document.querySelectorAll(".edit-facility-medication:checked")).map((cb) => cb.value);
    const newServiceSettings = Array.from(document.querySelectorAll(".edit-facility-service:checked")).map((cb) => cb.value);
    const newPaymentOptions = Array.from(document.querySelectorAll(".edit-facility-payment:checked")).map((cb) => cb.value);
    const newSpecialProgramsText = document.getElementById("editFacilitySpecialPrograms").value.trim();
    const newSpecialPrograms = newSpecialProgramsText ? newSpecialProgramsText.split("\n").filter((p) => p.trim()) : [];

    // Hours rows
    const newHours = _collectHoursRows().filter(r => r.hours.trim());

    // General contacts
    const newContacts = _collectContacts('editContactsList', 'contact-type', 'contact-notes', 'contact-info')
        .filter((c) => c.type && c.info);

    // Staff contacts
    const newStaffContacts = _collectContacts('editStaffContactsList', 'staff-contact-type', 'staff-contact-notes', 'staff-contact-info')
        .filter((c) => c.type && c.info);

    const customData = getFacilityCustomData(currentEditingFacilityId);
    const currentMedications = customData?.medications || extractMedicationsFromFacility(facility);
    const currentServiceSettings = customData?.service_settings || facility.services?.service_settings || [];
    const currentPaymentOptions = customData?.payment_options || facility.services?.payment_options || [];
    const currentSpecialPrograms = customData?.special_programs || facility.services?.special_programs || [];
    const currentContacts = customData?.contacts || [];
    const currentStaffContacts = customData?.staff_contacts || [];
    const currentHours = parseHoursData(customData?.hours);

    const changes = [];

    // Medications diff
    const addedMeds = newMedications.filter((m) => !currentMedications.some((cm) => cm.toLowerCase().includes(m.toLowerCase())));
    const removedMeds = currentMedications.filter((cm) => !newMedications.some((m) => cm.toLowerCase().includes(m.toLowerCase())));
    if (addedMeds.length > 0) changes.push({ type: "add", category: "Pharmacotherapies", items: addedMeds });
    if (removedMeds.length > 0) changes.push({ type: "remove", category: "Pharmacotherapies", items: removedMeds });

    // Service settings diff
    const addedServices = newServiceSettings.filter((s) => !currentServiceSettings.some((cs) => cs.toLowerCase() === s.toLowerCase()));
    const removedServices = currentServiceSettings.filter((cs) => !newServiceSettings.some((s) => cs.toLowerCase() === s.toLowerCase()));
    if (addedServices.length > 0) changes.push({ type: "add", category: "Service Settings", items: addedServices });
    if (removedServices.length > 0) changes.push({ type: "remove", category: "Service Settings", items: removedServices });

    // Payment diff
    const addedPayments = newPaymentOptions.filter((p) => !currentPaymentOptions.some((cp) => cp.toLowerCase().includes(p.toLowerCase())));
    const removedPayments = currentPaymentOptions.filter((cp) => !newPaymentOptions.some((p) => cp.toLowerCase().includes(p.toLowerCase())));
    if (addedPayments.length > 0) changes.push({ type: "add", category: "Payment Options", items: addedPayments });
    if (removedPayments.length > 0) changes.push({ type: "remove", category: "Payment Options", items: removedPayments });

    // Special programs diff
    const addedPrograms = newSpecialPrograms.filter((p) => !currentSpecialPrograms.includes(p));
    const removedPrograms = currentSpecialPrograms.filter((p) => !newSpecialPrograms.includes(p));
    if (addedPrograms.length > 0) changes.push({ type: "add", category: "Special Programs", items: addedPrograms });
    if (removedPrograms.length > 0) changes.push({ type: "remove", category: "Special Programs", items: removedPrograms });

    // General contacts diff
    if (newContacts.length > currentContacts.length) {
        changes.push({ type: "add", category: "General Contacts", items: [`${newContacts.length - currentContacts.length} new contact(s)`] });
    } else if (newContacts.length < currentContacts.length) {
        changes.push({ type: "remove", category: "General Contacts", items: [`${currentContacts.length - newContacts.length} contact(s)`] });
    } else if (JSON.stringify(newContacts) !== JSON.stringify(currentContacts)) {
        changes.push({ type: "add", category: "General Contacts", items: ["Contact details updated"] });
    }

    // Staff contacts diff
    if (newStaffContacts.length > currentStaffContacts.length) {
        changes.push({ type: "add", category: "Staff Contacts", items: [`${newStaffContacts.length - currentStaffContacts.length} new contact(s)`] });
    } else if (newStaffContacts.length < currentStaffContacts.length) {
        changes.push({ type: "remove", category: "Staff Contacts", items: [`${currentStaffContacts.length - newStaffContacts.length} contact(s)`] });
    } else if (JSON.stringify(newStaffContacts) !== JSON.stringify(currentStaffContacts)) {
        changes.push({ type: "add", category: "Staff Contacts", items: ["Staff contact details updated"] });
    }

    // Hours diff
    if (JSON.stringify(newHours) !== JSON.stringify(currentHours)) {
        if (newHours.length > 0) {
            changes.push({ type: "add", category: "Hours", items: newHours.map(r => r.description ? `${r.description}: ${r.hours}` : r.hours) });
        } else {
            changes.push({ type: "remove", category: "Hours", items: ["Hours removed"] });
        }
    }

    if (changes.length === 0) {
        alert("No changes detected.");
        return;
    }

    pendingFacilityEdits = {
        medications: newMedications,
        service_settings: newServiceSettings,
        payment_options: newPaymentOptions,
        special_programs: newSpecialPrograms,
        contacts: newContacts,
        staff_contacts: newStaffContacts,
        hours: newHours,
    };

    showEditConfirmation(facility.name, changes);
}

function showEditConfirmation(facilityName, changes) {
    const content = document.getElementById("editConfirmContent");
    let html = `<p style="margin-bottom: 15px;"><strong>Facility:</strong> ${facilityName}</p>`;

    const additions = changes.filter((c) => c.type === "add");
    const removals = changes.filter((c) => c.type === "remove");

    if (additions.length > 0) {
        html += '<div style="margin-bottom: 20px; padding: 15px; background: #e8f4e8; border-left: 4px solid #5a8a72; border-radius: 2px;">';
        html += '<strong style="color: #2d5170;">✓ Additions / Updates:</strong>';
        additions.forEach((change) => {
            html += `<div style="margin-top: 10px;">
                <strong>${change.category}:</strong>
                <ul style="margin: 5px 0 0 20px;">
                    ${change.items.map((item) => `<li>${item}</li>`).join("")}
                </ul>
            </div>`;
        });
        html += "</div>";
    }

    if (removals.length > 0) {
        html += '<div style="padding: 15px; background: #ffe8e8; border-left: 4px solid #a94842; border-radius: 2px;">';
        html += '<strong style="color: #a94842;">✗ Removals:</strong>';
        removals.forEach((change) => {
            html += `<div style="margin-top: 10px;">
                <strong>${change.category}:</strong>
                <ul style="margin: 5px 0 0 20px;">
                    ${change.items.map((item) => `<li>${item}</li>`).join("")}
                </ul>
            </div>`;
        });
        html += "</div>";
    }

    content.innerHTML = html;
    document.getElementById("editFacilityModal").classList.remove("show");
    document.getElementById("editConfirmModal").classList.add("show");
}

function closeEditConfirmModal() {
    document.getElementById("editConfirmModal").classList.remove("show");
    document.getElementById("editFacilityModal").classList.add("show");
}

function confirmFacilityEdits() {
    if (!pendingFacilityEdits || !currentEditingFacilityId) return;

    facilityCustomData[currentEditingFacilityId] = {
        ...(facilityCustomData[currentEditingFacilityId] || {}),
        ...pendingFacilityEdits,
    };
    saveFacilityCustomData(currentEditingFacilityId);

    const facility = allFacilities.find((f) => f.id == currentEditingFacilityId);
    if (facility) {
        if (!facility.services) facility.services = {};
        facility.services.medications = pendingFacilityEdits.medications;
        facility.services.service_settings = pendingFacilityEdits.service_settings;
        facility.services.payment_options = pendingFacilityEdits.payment_options;
        facility.services.special_programs = pendingFacilityEdits.special_programs;
    }

    document.getElementById("editConfirmModal").classList.remove("show");

    const detailsCell = document.querySelector(`#facility-${currentEditingFacilityId} .facility-details-cell`);
    if (detailsCell) {
        detailsCell.innerHTML = createFacilityDetails(facility);
        const textarea = document.getElementById(`notes-${currentEditingFacilityId}`);
        if (textarea) {
            textarea.addEventListener("input", (e) => {
                updateNote(currentEditingFacilityId, e.target.value);
                updateTimestamp(currentEditingFacilityId);
            });
        }
        const patientTextarea = document.getElementById(`patient-notes-${currentEditingFacilityId}`);
        if (patientTextarea) {
            patientTextarea.addEventListener("input", (e) => updatePatientNote(currentEditingFacilityId, e.target.value));
        }
    }

    alert("✓ Facility updated successfully!");
    currentEditingFacilityId = null;
    pendingFacilityEdits = null;
}

function extractMedicationsFromFacility(facility) {
    const medications = [];
    if (facility.services?.other_services?.length > 0) {
        facility.services.other_services.forEach((service) => {
            if ((service.code === "OM" || service.code === "PHR") && service.values) {
                medications.push(...service.values);
            }
        });
    }
    return medications;
}
