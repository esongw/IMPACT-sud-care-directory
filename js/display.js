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
                    <th onclick="sortFacilities('county')" style="cursor: pointer;">County <span id="sort-county">↕</span></th>
                    <th>Street Address</th>
                    <th onclick="sortFacilities('city')" style="cursor: pointer;">City <span id="sort-city">↕</span></th>
                    <th>State</th>
                    <th>Hours</th>
                    <th>Website</th>
                </tr>
            </thead>
            <tbody>
    `;

    facilities.forEach((facility) => {
        const regionLabel = facility.county || "Unknown";

        const facilityId = `facility-${facility.id}`;

        html += `
            <tr onclick="toggleFacilityDetails('${facilityId}')">
                <td class="facility-name-cell">
                    <span class="expand-icon" id="icon-${facilityId}">▶</span>
                    ${facility.name}
                </td>
                <td style="color: #6b5f54; font-style: italic;">${facility.name_secondary || ""}</td>
                <td>${regionLabel}</td>
                <td>${facility.address.street1 || "N/A"}</td>
                <td>${facility.address.city}</td>
                <td>${facility.address.state}</td>
                <td style="white-space: pre-line; font-size: 13px;">${getFacilityCustomData(facility.id)?.hours || facility.hours || ''}</td>
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
                <td colspan="8" class="facility-details-cell"></td>
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
                const textarea = cell.querySelector(`#notes-${facility.id}`);
                if (textarea) {
                    textarea.addEventListener("input", (e) => {
                        updateNote(facility.id, e.target.value);
                        updateTimestamp(facility.id);
                    });
                }
            }
        }
        detailsRow.classList.add("show");
        icon.classList.add("expanded");
        parentRow.classList.add("expanded");
    }
}

// Create detailed facility information
function createFacilityDetails(facility) {
    const typeLabels = {
        SA: "Substance Abuse",
        MH: "Mental Health",
        BOTH: "Both SA & MH",
    };

    const note = getNote(facility.id);
    const documents = getFacilityDocuments(facility.id);
    const hours = getFacilityCustomData(facility.id)?.hours || facility.hours || '';

    return `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
            <!-- Column 1: Address, Website, Contact, Notes, Documents -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #2d2520;">${facility.name}</h3>
                    ${isAdmin() ? `<button class="btn btn-secondary" style="padding: 6px 14px; font-size: 13px;" onclick="event.stopPropagation(); showEditFacilityModal('${facility.id}')">✏️ Edit</button>` : ""}
                </div>
                ${facility.name_secondary ? `<p style="color: #6b5f54; font-style: italic; margin-bottom: 15px;">${facility.name_secondary}</p>` : ""}

                <div style="margin-bottom: 20px;">
                    <h4 style="color: #4a7ba7; margin-bottom: 10px; font-size: 16px;">📍 Address</h4>
                    <p style="margin: 5px 0;">${facility.address.street1}</p>
                    ${facility.address.street2 ? `<p style="margin: 5px 0;">${facility.address.street2}</p>` : ""}
                    <p style="margin: 5px 0;">${facility.address.city}, ${facility.address.state} ${facility.address.zip}</p>
                </div>

                ${hours ? `<div style="margin-bottom: 20px;">
                    <h4 style="color: #4a7ba7; margin-bottom: 10px; font-size: 16px;">🕐 Hours of Operation</h4>
                    <p style="margin: 5px 0; white-space: pre-line;">${hours}</p>
                </div>` : ""}

                ${
                    facility.contact.website &&
                    facility.contact.website !== "https://" &&
                    facility.contact.website !== "http://"
                        ? `<div style="margin-bottom: 20px;">
                        <h4 style="color: #4a7ba7; margin-bottom: 10px; font-size: 16px;">🌐 Website</h4>
                        <p style="margin: 5px 0;"><a href="${facility.contact.website}" target="_blank" class="facility-website-link">${facility.contact.website}</a></p>
                    </div>`
                        : ""
                }

                <div style="margin-bottom: 20px;">
                    <h4 style="color: #4a7ba7; margin-bottom: 10px; font-size: 16px;">📞 Contact Information</h4>
                    ${createContactTable(facility)}
                </div>

                <div class="notes-section" style="margin-bottom: 20px;">
                    <div class="notes-title">📝 Your Notes</div>
                    <textarea
                        id="notes-${facility.id}"
                        class="notes-textarea"
                        style="min-height: 200px;"
                        placeholder="${isAdmin() ? "Add your notes about this facility..." : "Notes are read-only."}"
                        ${isAdmin() ? "" : "readonly"}
                    >${note.text}</textarea>
                    <div id="timestamp-${facility.id}" class="notes-timestamp">
                        ${note.timestamp ? `Last updated: ${new Date(note.timestamp).toLocaleString()}` : ""}
                    </div>
                </div>

                <div style="padding: 15px; background: #f0ebe3; border-radius: 4px;">
                    <h4 style="margin-bottom: 10px; color: #2d2520; font-size: 16px;">📄 Facility Documents</h4>
                    <div id="documents-list-${facility.id}" style="margin-bottom: 10px;">
                        ${
                            documents.length > 0
                                ? documents
                                      .map(
                                          (doc) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; margin-bottom: 5px; border-radius: 2px;">
                                    <span style="font-size: 14px; flex: 1;">${doc.name}</span>
                                    <div style="display: flex; gap: 5px;">
                                        <button class="btn btn-secondary" style="padding: 4px 12px; font-size: 12px;" onclick="event.stopPropagation(); downloadDocument('${facility.id}', '${doc.name.replace(/'/g, "\\'")}')">⬇ Download</button>
                                        ${isAdmin() ? `<button class="btn btn-secondary" style="padding: 4px 12px; font-size: 12px; background: #a94842;" onclick="event.stopPropagation(); deleteDocument('${facility.id}', '${doc.name.replace(/'/g, "\\'")}')">🗑 Delete</button>` : ""}
                                    </div>
                                </div>
                            `,
                                      )
                                      .join("")
                                : '<p style="font-size: 14px; color: #6b5f54; font-style: italic;">No documents uploaded yet.</p>'
                        }
                    </div>
                    ${isAdmin() ? `
                    <label for="upload-doc-${facility.id}" class="btn btn-primary" style="display: inline-block; cursor: pointer; padding: 8px 16px; font-size: 14px;">
                        📤 Upload Document
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

function createContactTable(facility) {
    // Get custom contacts if they exist
    const customData = getFacilityCustomData(facility.id);

    // If contacts have been saved (even as empty), use them exclusively.
    // Otherwise fall back to the defaults from the JSON data.
    let allContacts;
    if (customData?.contacts !== undefined) {
        allContacts = customData.contacts;
    } else {
        allContacts = [];
        if (facility.contact.phone)
            allContacts.push({
                type: "Phone",
                notes: "",
                info: facility.contact.phone,
            });
        if (facility.contact.intake_phone)
            allContacts.push({
                type: "Intake Phone",
                notes: "",
                info: facility.contact.intake_phone,
            });
        if (facility.contact.hotline)
            allContacts.push({
                type: "Hotline",
                notes: "",
                info: facility.contact.hotline,
            });
    }

    if (allContacts.length === 0) {
        return '<p style="color: #6b5f54; font-style: italic;">No contact information available.</p>';
    }

    return `
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="border-bottom: 2px solid #d4cfc4;">
                    <th style="text-align: left; padding: 8px; font-weight: 600; color: #4a4035;">Type</th>
                    <th style="text-align: left; padding: 8px; font-weight: 600; color: #4a4035;">Notes</th>
                    <th style="text-align: left; padding: 8px; font-weight: 600; color: #4a4035;">Contact Info</th>
                </tr>
            </thead>
            <tbody>
                ${allContacts
                    .map(
                        (contact) => `
                    <tr style="border-bottom: 1px solid #ede8dd;">
                        <td style="padding: 8px; vertical-align: top;">${contact.type}</td>
                        <td style="padding: 8px; vertical-align: top; color: #6b5f54;">${contact.notes || "—"}</td>
                        <td style="padding: 8px; vertical-align: top;">${contact.info}</td>
                    </tr>
                `,
                    )
                    .join("")}
            </tbody>
        </table>
    `;
}

function createCollapsibleServicesSection(facility) {
    // Check for custom data first
    const customData = getFacilityCustomData(facility.id);
    const services = facility.services;
    let html = "";

    // Extract medications - prefer custom data
    let medications = customData?.medications || [];
    if (
        medications.length === 0 &&
        services?.other_services?.length > 0
    ) {
        services.other_services.forEach((service) => {
            if (
                (service.code === "OM" || service.code === "PHR") &&
                service.values
            ) {
                medications.push(...service.values);
            }
        });
    }

    // Pharmacotherapies
    if (medications.length > 0) {
        html += createCollapsibleSection(
            facility.id,
            "pharmacotherapies",
            "💊 Pharmacotherapies Available",
            medications
                .map(
                    (med) =>
                        `<span class="service-tag medication-tag">${med}</span>`,
                )
                .join(""),
        );
    }

    // Service Settings - prefer custom data
    const serviceSettings =
        customData?.service_settings ||
        services?.service_settings ||
        [];
    if (serviceSettings.length > 0) {
        html += createCollapsibleSection(
            facility.id,
            "service-settings",
            "🏢 Service Settings",
            serviceSettings
                .map(
                    (setting) =>
                        `<span class="service-tag">${setting}</span>`,
                )
                .join(""),
        );
    }

    // Special Programs - prefer custom data
    const specialPrograms =
        customData?.special_programs ||
        services?.special_programs ||
        [];
    if (specialPrograms.length > 0) {
        html += createCollapsibleSection(
            facility.id,
            "special-programs",
            "⭐ Special Programs",
            specialPrograms
                .map(
                    (program) =>
                        `<span class="service-tag">${program}</span>`,
                )
                .join(""),
        );
    }

    // Payment Options - prefer custom data
    const paymentOptions =
        customData?.payment_options ||
        services?.payment_options ||
        [];
    if (paymentOptions.length > 0) {
        html += createCollapsibleSection(
            facility.id,
            "payment-options",
            "💳 Payment Options",
            paymentOptions
                .map(
                    (payment) =>
                        `<span class="service-tag">${payment}</span>`,
                )
                .join(""),
        );
    }

    return (
        html ||
        '<p style="color: #6b5f54; font-style: italic;">No service information available.</p>'
    );
}

function createCollapsibleSection(
    facilityId,
    sectionId,
    title,
    content,
) {
    const fullId = `${facilityId}-${sectionId}`;
    return `
        <div style="margin-bottom: 15px; border: 1px solid #d4cfc4; border-radius: 4px; overflow: hidden;">
            <div onclick="toggleServiceSection('${fullId}')" style="padding: 12px; background: #f0ebe3; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;">
                <span style="font-weight: 600; color: #2d2520;">${title}</span>
                <span id="toggle-${fullId}" style="font-size: 12px; transition: transform 0.2s;">▼</span>
            </div>
            <div id="content-${fullId}" class="collapsible-content" style="display: none; padding: 12px; background: white;">
                <div class="service-tags">
                    ${content}
                </div>
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

// Update timestamp display
function updateTimestamp(facilityId) {
    const note = getNote(facilityId);
    const timestampEl = document.getElementById(
        `timestamp-${facilityId}`,
    );
    if (timestampEl && note.timestamp) {
        const date = new Date(note.timestamp);
        timestampEl.textContent = `Last updated: ${date.toLocaleString()}`;
    }
}
