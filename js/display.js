// --- Minimalist icon helper (inline Lucide-style SVGs) ---
function _icon(name, size = 14) {
    const p = {
        'map-pin':     '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        'clock':       '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'globe':       '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        'phone':       '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.18 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17v-.08z"/>',
        'info':        '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        'lock':        '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'file-text':   '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
        'folder':      '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
        'edit':        '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
        'download':    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
        'trash':       '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
        'upload':      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
        'pill':        '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
        'building':    '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
        'star':        '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
        'users':       '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'note':        '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="13" y1="13" y2="13"/>',
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;">${p[name] || ''}</svg>`;
}

function _sectionHeader(iconName, label) {
    return `<div style="display:flex;align-items:center;gap:7px;font-weight:700;font-size:15px;color:#2d2520;margin-bottom:10px;">${_icon(iconName, 15)} ${label}</div>`;
}

// Display facilities
function displayFacilities(facilities) {
    const listContainer = document.getElementById("facilitiesList");

    if (facilities.length === 0) {
        listContainer.innerHTML = `
            <div class="no-results">
                <h3>No facilities found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="facilities-table">
            <thead>
                <tr>
                    <th onclick="sortFacilities('name')" style="cursor: pointer;">Name <span id="sort-name">↕</span></th>
                    <th onclick="sortFacilities('secondaryName')" style="cursor: pointer;">Secondary Name <span id="sort-secondaryName">↕</span></th>
                    <th>Street Address</th>
                    <th onclick="sortFacilities('city')" style="cursor: pointer;">City <span id="sort-city">↕</span></th>
                    <th>State</th>
                    <th>Website</th>
                </tr>
            </thead>
            <tbody>
    `;

    facilities.forEach((facility) => {
        const facilityId = `facility-${facility.id}`;

        html += `
            <tr onclick="toggleFacilityDetails('${facilityId}')">
                <td class="facility-name-cell">
                    <span class="expand-icon" id="icon-${facilityId}">▶</span>
                    ${facility.name}
                </td>
                <td style="color: #6b5f54; font-style: italic;">${facility.name_secondary || ""}</td>
                <td>${facility.address.street1 || "N/A"}</td>
                <td>${facility.address.city}</td>
                <td>${facility.address.state}</td>
                <td>${
                    facility.contact.website &&
                    facility.contact.website !== "https://" &&
                    facility.contact.website !== "http://"
                        ? `<a href="${facility.contact.website}" target="_blank" class="facility-website-link" onclick="event.stopPropagation()">${facility.contact.website}</a>`
                        : ""
                }
                </td>
            </tr>
            <tr class="facility-details-row" id="${facilityId}" data-facility-id="${facility.id}">
                <td colspan="6" class="facility-details-cell"></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    listContainer.innerHTML = html;
}

// Toggle facility details
function toggleFacilityDetails(facilityId) {
    const detailsRow = document.getElementById(facilityId);
    const icon = document.getElementById(`icon-${facilityId}`);
    const parentRow = detailsRow.previousElementSibling;

    if (detailsRow.classList.contains("show")) {
        detailsRow.classList.remove("show");
        icon.classList.remove("expanded");
        parentRow.classList.remove("expanded");
    } else {
        const cell = detailsRow.querySelector(".facility-details-cell");
        if (!cell.dataset.loaded) {
            const fid = detailsRow.dataset.facilityId;
            const facility = allFacilities.find(f => String(f.id) === String(fid));
            if (facility) {
                cell.innerHTML = createFacilityDetails(facility);
                cell.dataset.loaded = "true";
                _attachDetailEventListeners(facility.id, cell);
            }
        }
        detailsRow.classList.add("show");
        icon.classList.add("expanded");
        parentRow.classList.add("expanded");
    }
}

function _attachDetailEventListeners(facilityId, cell) {
    const staffNoteTextarea = cell.querySelector(`#notes-${facilityId}`);
    if (staffNoteTextarea) {
        staffNoteTextarea.addEventListener("input", (e) => {
            updateNote(facilityId, e.target.value);
            updateTimestamp(facilityId);
        });
    }
    const patientNoteTextarea = cell.querySelector(`#patient-notes-${facilityId}`);
    if (patientNoteTextarea) {
        patientNoteTextarea.addEventListener("input", (e) => {
            updatePatientNote(facilityId, e.target.value);
        });
    }
}

// Render hours as a table (matching contact table style)
function _renderHoursDisplay(hoursData) {
    if (!hoursData || hoursData.length === 0) return '';
    const TH = 'text-align:left;padding:8px;font-weight:600;color:#2d2520;background:transparent;font-size:14px;';
    const TD = 'padding:8px;vertical-align:top;font-size:14px;color:#2d2520;';
    const hasDescriptions = hoursData.some(r => r.description);
    if (!hasDescriptions) {
        return `<table style="width:100%;border-collapse:collapse;">
            <tbody>${hoursData.map(r => `<tr style="border-bottom:1px solid #ede8dd;"><td style="${TD}">${r.hours}</td></tr>`).join('')}</tbody>
        </table>`;
    }
    return `<table style="width:100%;border-collapse:collapse;">
        <thead><tr style="border-bottom:1px solid #d4cfc4;">
            <th style="${TH}">Description</th>
            <th style="${TH}">Hours</th>
        </tr></thead>
        <tbody>${hoursData.map(r => `
            <tr style="border-bottom:1px solid #ede8dd;">
                <td style="${TD}">${r.description || ''}</td>
                <td style="${TD}">${r.hours}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

// Create detailed facility information
function createFacilityDetails(facility) {
    const note = getNote(facility.id);
    const documents = getFacilityDocuments(facility.id);
    const customData = getFacilityCustomData(facility.id);
    const hoursData = parseHoursData(customData?.hours ?? facility.hours);
    const patientNotes = customData?.patient_notes || '';

    return `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
            <!-- Column 1 -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #2d2520;">${facility.name}</h3>
                    ${isAdmin() ? `<button class="btn btn-secondary" style="display:flex;align-items:center;gap:5px;padding:6px 14px;font-size:13px;" onclick="event.stopPropagation(); showEditFacilityModal('${facility.id}')">${_icon('edit', 13)} Edit</button>` : ""}
                </div>
                ${facility.name_secondary ? `<p style="color: #2d2520; font-style: italic; margin-bottom: 15px;">${facility.name_secondary}</p>` : ""}

                <div style="margin-bottom: 20px;">
                    ${_sectionHeader('map-pin', 'Address')}
                    <p style="margin: 5px 0; font-size: 14px; color: #2d2520;">${facility.address.street1}</p>
                    ${facility.address.street2 ? `<p style="margin: 5px 0; font-size: 14px; color: #2d2520;">${facility.address.street2}</p>` : ""}
                    <p style="margin: 5px 0; font-size: 14px; color: #2d2520;">${facility.address.city}, ${facility.address.state} ${facility.address.zip}</p>
                </div>

                ${facility.contact.website && facility.contact.website !== "https://" && facility.contact.website !== "http://"
                    ? `<div style="margin-bottom: 20px;">
                        ${_sectionHeader('globe', 'Website')}
                        <p style="margin: 5px 0; font-size: 14px;"><a href="${facility.contact.website}" target="_blank" class="facility-website-link">${facility.contact.website}</a></p>
                    </div>`
                    : ""}

                ${hoursData.length > 0 ? `<div style="margin-bottom: 20px;">
                    ${_sectionHeader('clock', 'Hours of Operation')}
                    ${_renderHoursDisplay(hoursData)}
                </div>` : ""}

                <!-- General Contacts -->
                <div style="margin-bottom: 20px;">
                    ${_sectionHeader('phone', 'Contact Information')}
                    ${createContactTable(facility, customData, false)}
                </div>

                <!-- Information for Patients -->
                <div class="notes-section" style="margin-bottom: 20px;">
                    <div class="notes-title" style="display:flex;align-items:center;gap:6px;">${_icon('info')} Information for Patients</div>
                    <textarea
                        id="patient-notes-${facility.id}"
                        class="notes-textarea"
                        style="min-height: 120px;"
                        placeholder="${isAdmin() ? "Add patient-facing notes (e.g. intake process, what to bring)..." : "Notes are read-only."}"
                        ${isAdmin() ? "" : "readonly"}
                    >${patientNotes}</textarea>
                </div>

                <!-- For Clinical Staff Reference box -->
                <div style="border:1px solid #d4cfc4;border-radius:4px;overflow:hidden;margin-bottom:20px;">
                    <div style="padding:10px 14px;background:#f7f4f0;border-bottom:1px solid #d4cfc4;display:flex;align-items:center;gap:6px;font-weight:600;font-size:14px;color:#2d2520;">
                        ${_icon('lock')} For Clinical Staff Reference
                    </div>
                    <div style="padding:14px;">
                        ${_renderStaffContactsSection(facility.id, customData)}
                        <div class="${customData?.staff_contacts?.length ? 'notes-section' : ''}" style="${customData?.staff_contacts?.length ? '' : ''}">
                            <div class="notes-title" style="display:flex;align-items:center;gap:6px;">${_icon('note')} Clinical Staff Notes</div>
                            <textarea
                                id="notes-${facility.id}"
                                class="notes-textarea"
                                style="min-height: 200px;"
                                placeholder="${isAdmin() ? "Add internal clinical staff notes..." : "Notes are read-only."}"
                                ${isAdmin() ? "" : "readonly"}
                            >${note.text}</textarea>
                            <div id="timestamp-${facility.id}" class="notes-timestamp">
                                ${note.timestamp ? `Last updated: ${new Date(note.timestamp).toLocaleString()}` : ""}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Documents -->
                <div style="padding: 15px; background: #f0ebe3; border-radius: 4px;">
                    <div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:14px;color:#2d2520;margin-bottom:8px;">${_icon('folder')} Facility Documents</div>
                    <div id="documents-list-${facility.id}" style="margin-bottom: 10px;">
                        ${documents.length > 0
                            ? documents.map((doc) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; margin-bottom: 5px; border-radius: 2px;">
                                    <span style="font-size: 14px; color: #2d2520; flex: 1;">${doc.name}</span>
                                    <div style="display: flex; gap: 5px;">
                                        <button class="btn btn-secondary" style="display:flex;align-items:center;gap:4px;padding:4px 12px;font-size:12px;" onclick="event.stopPropagation(); downloadDocument('${facility.id}', '${doc.name.replace(/'/g, "\\'")}'">${_icon('download', 12)} Download</button>
                                        ${isAdmin() ? `<button class="btn btn-secondary" style="display:flex;align-items:center;gap:4px;padding:4px 12px;font-size:12px;background:#a94842;" onclick="event.stopPropagation(); deleteDocument('${facility.id}', '${doc.name.replace(/'/g, "\\'")}'">${_icon('trash', 12)} Delete</button>` : ""}
                                    </div>
                                </div>
                            `).join("")
                            : '<p style="font-size: 14px; color: #2d2520; font-style: italic;">No documents uploaded yet.</p>'
                        }
                    </div>
                    ${isAdmin() ? `
                    <label for="upload-doc-${facility.id}" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;padding:8px 16px;font-size:14px;">
                        ${_icon('upload', 14)} Upload Document
                    </label>
                    <input type="file" id="upload-doc-${facility.id}" style="display: none;" onchange="handleDocumentUpload(event, '${facility.id}')">
                    ` : ""}
                </div>
            </div>

            <!-- Column 2: Services (Collapsible) -->
            <div>
                ${createCollapsibleServicesSection(facility)}
            </div>
        </div>
    `;
}

function _renderStaffContactsSection(facilityId, customData) {
    const staffContacts = customData?.staff_contacts || [];
    if (staffContacts.length === 0) return '';

    return `
        <div style="margin-bottom: 16px;">
            <div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:14px;color:#2d2520;margin-bottom:8px;">${_icon('users')} Contact Information for Staff</div>
            ${_renderContactTableRows(staffContacts)}
        </div>
    `;
}

function _renderContactTableRows(contacts) {
    const TH = 'text-align: left; padding: 8px; font-weight: 600; color: #2d2520; background: transparent; font-size: 14px;';
    const TD = 'padding: 8px; vertical-align: top; font-size: 14px; color: #2d2520;';
    return `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid #d4cfc4;">
                    <th style="${TH}">Type</th>
                    <th style="${TH}">Notes</th>
                    <th style="${TH}">Contact Info</th>
                </tr>
            </thead>
            <tbody>
                ${contacts.map(c => `
                    <tr style="border-bottom: 1px solid #ede8dd;">
                        <td style="${TD}">${c.type}</td>
                        <td style="${TD}">${c.notes || "—"}</td>
                        <td style="${TD}">${c.info}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function createContactTable(facility, customData, includeStaff) {
    let allContacts;
    if (customData?.contacts !== undefined) {
        allContacts = customData.contacts;
    } else {
        allContacts = [];
        if (facility.contact.phone) allContacts.push({ type: "Phone", notes: "", info: facility.contact.phone });
        if (facility.contact.intake_phone) allContacts.push({ type: "Intake Phone", notes: "", info: facility.contact.intake_phone });
        if (facility.contact.hotline) allContacts.push({ type: "Hotline", notes: "", info: facility.contact.hotline });
    }

    if (allContacts.length === 0) {
        return '<p style="font-size: 14px; color: #2d2520; font-style: italic;">No contact information available.</p>';
    }

    return _renderContactTableRows(allContacts);
}

function createCollapsibleServicesSection(facility) {
    const customData = getFacilityCustomData(facility.id);
    const services = facility.services;
    let html = "";

    let medications = customData?.medications || [];
    if (medications.length === 0 && services?.other_services?.length > 0) {
        services.other_services.forEach((service) => {
            if ((service.code === "OM" || service.code === "PHR") && service.values) {
                medications.push(...service.values);
            }
        });
    }

    if (medications.length > 0) {
        html += createCollapsibleSection(facility.id, "pharmacotherapies", _icon('pill') + " Pharmacotherapies Available",
            medications.map((med) => `<span class="service-tag medication-tag">${med}</span>`).join(""));
    }

    const serviceSettings = customData?.service_settings || services?.service_settings || [];
    if (serviceSettings.length > 0) {
        html += createCollapsibleSection(facility.id, "service-settings", _icon('building') + " Service Settings",
            serviceSettings.map((setting) => `<span class="service-tag">${setting}</span>`).join(""));
    }

    const specialPrograms = customData?.special_programs || services?.special_programs || [];
    if (specialPrograms.length > 0) {
        html += createCollapsibleSection(facility.id, "special-programs", _icon('star') + " Special Programs",
            specialPrograms.map((program) => `<span class="service-tag">${program}</span>`).join(""));
    }

    const paymentOptions = customData?.payment_options || services?.payment_options || [];
    if (paymentOptions.length > 0) {
        html += createCollapsibleSection(facility.id, "payment-options", _icon('credit-card') + " Payment Options",
            paymentOptions.map((payment) => `<span class="service-tag">${payment}</span>`).join(""));
    }

    return html || '<p style="color: #6b5f54; font-style: italic;">No service information available.</p>';
}

function createCollapsibleSection(facilityId, sectionId, title, content) {
    const fullId = `${facilityId}-${sectionId}`;
    return `
        <div style="margin-bottom: 15px; border: 1px solid #d4cfc4; border-radius: 4px; overflow: hidden;">
            <div onclick="toggleServiceSection('${fullId}')" style="padding: 12px; background: #f0ebe3; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                <span style="display:flex;align-items:center;gap:6px;font-weight:600;color:#2d2520;">${title}</span>
                <span id="toggle-${fullId}" style="font-size: 12px; transition: transform 0.2s;">▼</span>
            </div>
            <div id="content-${fullId}" class="collapsible-content" style="display: none; padding: 12px; background: white;">
                <div class="service-tags">${content}</div>
            </div>
        </div>
    `;
}

function toggleServiceSection(sectionId) {
    const content = document.getElementById(`content-${sectionId}`);
    const toggle = document.getElementById(`toggle-${sectionId}`);
    if (content.style.display === "none") {
        content.style.display = "block";
        toggle.style.transform = "rotate(180deg)";
    } else {
        content.style.display = "none";
        toggle.style.transform = "rotate(0deg)";
    }
}

function updateTimestamp(facilityId) {
    const note = getNote(facilityId);
    const timestampEl = document.getElementById(`timestamp-${facilityId}`);
    if (timestampEl && note.timestamp) {
        timestampEl.textContent = `Last updated: ${new Date(note.timestamp).toLocaleString()}`;
    }
}
