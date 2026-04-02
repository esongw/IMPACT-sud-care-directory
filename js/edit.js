// Edit Facility Functions
function showEditFacilityModal(facilityId) {
    currentEditingFacilityId = facilityId;
    const facility = allFacilities.find((f) => f.id == facilityId);
    if (!facility) return;

    // Set facility name
    document.getElementById("editFacilityName").textContent =
        facility.name;

    // Get all available options from data
    const allOptions = extractAllOptions();

    // Get custom data or use facility data
    const customData = getFacilityCustomData(facilityId);
    const currentMedications =
        customData?.medications ||
        extractMedicationsFromFacility(facility);
    const currentServiceSettings =
        customData?.service_settings ||
        facility.services?.service_settings ||
        [];
    const currentPaymentOptions =
        customData?.payment_options ||
        facility.services?.payment_options ||
        [];
    const currentSpecialPrograms =
        customData?.special_programs ||
        facility.services?.special_programs ||
        [];
    const defaultContacts = [];
    if (facility.contact.phone)
        defaultContacts.push({
            type: "Phone",
            notes: "",
            info: facility.contact.phone,
        });
    if (facility.contact.intake_phone)
        defaultContacts.push({
            type: "Intake Phone",
            notes: "",
            info: facility.contact.intake_phone,
        });
    if (facility.contact.hotline)
        defaultContacts.push({
            type: "Hotline",
            notes: "",
            info: facility.contact.hotline,
        });
    const contacts = customData?.contacts ?? defaultContacts;

    // Populate pharmacotherapies dynamically
    document.getElementById(
        "editPharmacotherapiesContainer",
    ).innerHTML = allOptions.pharmacotherapies
        .map(
            (med) => `
        <label class="checkbox-label">
            <input type="checkbox" class="edit-facility-medication" value="${med}" ${currentMedications.some((m) => m === med) ? "checked" : ""}>
            <span>${med}</span>
        </label>
    `,
        )
        .join("");

    // Populate service settings dynamically
    document.getElementById(
        "editServiceSettingsContainer",
    ).innerHTML = allOptions.serviceSettings
        .map(
            (setting) => `
        <label class="checkbox-label">
            <input type="checkbox" class="edit-facility-service" value="${setting}" ${currentServiceSettings.some((s) => s === setting) ? "checked" : ""}>
            <span>${setting}</span>
        </label>
    `,
        )
        .join("");

    // Populate payment options dynamically
    document.getElementById(
        "editPaymentOptionsContainer",
    ).innerHTML = allOptions.paymentOptions
        .map(
            (payment) => `
        <label class="checkbox-label">
            <input type="checkbox" class="edit-facility-payment" value="${payment}" ${currentPaymentOptions.some((p) => p === payment) ? "checked" : ""}>
            <span>${payment}</span>
        </label>
    `,
        )
        .join("");

    // Populate special programs
    document.getElementById("editFacilitySpecialPrograms").value =
        currentSpecialPrograms.join("\n");

    // Populate hours
    document.getElementById("editFacilityHours").value =
        customData?.hours || '';

    // Populate contacts
    renderEditContacts(contacts);

    document
        .getElementById("editFacilityModal")
        .classList.add("show");
}

function closeEditFacilityModal() {
    document
        .getElementById("editFacilityModal")
        .classList.remove("show");
    currentEditingFacilityId = null;
}

function renderEditContacts(contacts = []) {
    const container = document.getElementById("editContactsList");
    if (contacts.length === 0) {
        container.innerHTML =
            '<p style="color: #6b5f54; font-style: italic;">No custom contacts added yet. Click "Add Contact" below.</p>';
        return;
    }

    container.innerHTML = contacts
        .map(
            (contact, index) => `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f0ebe3; border-radius: 4px;">
            <input type="text" class="search-box contact-type" value="${contact.type}" placeholder="Type (e.g., Phone)" data-index="${index}">
            <input type="text" class="search-box contact-notes" value="${contact.notes || ""}" placeholder="Notes" data-index="${index}">
            <input type="text" class="search-box contact-info" value="${contact.info}" placeholder="Contact info" data-index="${index}">
            <button class="btn btn-secondary" style="padding: 8px 12px; background: #a94842;" onclick="removeContactRow(${index})">🗑</button>
        </div>
    `,
        )
        .join("");
}

function addContactRow() {
    const container = document.getElementById("editContactsList");
    const currentContacts = Array.from(
        container.querySelectorAll(".contact-type"),
    ).map((input, index) => ({
        type: input.value,
        notes: container.querySelector(
            `.contact-notes[data-index="${index}"]`,
        ).value,
        info: container.querySelector(
            `.contact-info[data-index="${index}"]`,
        ).value,
    }));

    currentContacts.push({ type: "", notes: "", info: "" });
    renderEditContacts(currentContacts);
}

function removeContactRow(index) {
    const container = document.getElementById("editContactsList");
    const currentContacts = Array.from(
        container.querySelectorAll(".contact-type"),
    ).map((input, i) => ({
        type: input.value,
        notes: container.querySelector(
            `.contact-notes[data-index="${i}"]`,
        ).value,
        info: container.querySelector(
            `.contact-info[data-index="${i}"]`,
        ).value,
    }));

    currentContacts.splice(index, 1);
    renderEditContacts(currentContacts);
}

function previewFacilityEdits() {
    const facility = allFacilities.find(
        (f) => f.id == currentEditingFacilityId,
    );
    if (!facility) return;

    // Collect new data
    const newMedications = Array.from(
        document.querySelectorAll(
            ".edit-facility-medication:checked",
        ),
    ).map((cb) => cb.value);
    const newServiceSettings = Array.from(
        document.querySelectorAll(".edit-facility-service:checked"),
    ).map((cb) => cb.value);
    const newPaymentOptions = Array.from(
        document.querySelectorAll(".edit-facility-payment:checked"),
    ).map((cb) => cb.value);
    const newSpecialProgramsText = document
        .getElementById("editFacilitySpecialPrograms")
        .value.trim();
    const newSpecialPrograms = newSpecialProgramsText
        ? newSpecialProgramsText.split("\n").filter((p) => p.trim())
        : [];
    const newHours = document
        .getElementById("editFacilityHours")
        .value.trim();

    // Collect contacts
    const container = document.getElementById("editContactsList");
    const newContacts = Array.from(
        container.querySelectorAll(".contact-type"),
    )
        .map((input, index) => ({
            type: input.value.trim(),
            notes:
                container
                    .querySelector(
                        `.contact-notes[data-index="${index}"]`,
                    )
                    ?.value.trim() || "",
            info:
                container
                    .querySelector(
                        `.contact-info[data-index="${index}"]`,
                    )
                    ?.value.trim() || "",
        }))
        .filter((c) => c.type && c.info); // Only keep contacts with type and info

    // Get current data
    const customData = getFacilityCustomData(
        currentEditingFacilityId,
    );
    const currentMedications =
        customData?.medications ||
        extractMedicationsFromFacility(facility);
    const currentServiceSettings =
        customData?.service_settings ||
        facility.services?.service_settings ||
        [];
    const currentPaymentOptions =
        customData?.payment_options ||
        facility.services?.payment_options ||
        [];
    const currentSpecialPrograms =
        customData?.special_programs ||
        facility.services?.special_programs ||
        [];
    const currentContacts = customData?.contacts || [];
    const currentHours = customData?.hours || '';

    // Build changes summary
    const changes = [];

    // Check medications
    const addedMeds = newMedications.filter(
        (m) =>
            !currentMedications.some((cm) =>
                cm.toLowerCase().includes(m.toLowerCase()),
            ),
    );
    const removedMeds = currentMedications.filter(
        (cm) =>
            !newMedications.some((m) =>
                cm.toLowerCase().includes(m.toLowerCase()),
            ),
    );
    if (addedMeds.length > 0)
        changes.push({
            type: "add",
            category: "Pharmacotherapies",
            items: addedMeds,
        });
    if (removedMeds.length > 0)
        changes.push({
            type: "remove",
            category: "Pharmacotherapies",
            items: removedMeds,
        });

    // Check service settings
    const addedServices = newServiceSettings.filter(
        (s) =>
            !currentServiceSettings.some(
                (cs) => cs.toLowerCase() === s.toLowerCase(),
            ),
    );
    const removedServices = currentServiceSettings.filter(
        (cs) =>
            !newServiceSettings.some(
                (s) => cs.toLowerCase() === s.toLowerCase(),
            ),
    );
    if (addedServices.length > 0)
        changes.push({
            type: "add",
            category: "Service Settings",
            items: addedServices,
        });
    if (removedServices.length > 0)
        changes.push({
            type: "remove",
            category: "Service Settings",
            items: removedServices,
        });

    // Check payment options
    const addedPayments = newPaymentOptions.filter(
        (p) =>
            !currentPaymentOptions.some((cp) =>
                cp.toLowerCase().includes(p.toLowerCase()),
            ),
    );
    const removedPayments = currentPaymentOptions.filter(
        (cp) =>
            !newPaymentOptions.some((p) =>
                cp.toLowerCase().includes(p.toLowerCase()),
            ),
    );
    if (addedPayments.length > 0)
        changes.push({
            type: "add",
            category: "Payment Options",
            items: addedPayments,
        });
    if (removedPayments.length > 0)
        changes.push({
            type: "remove",
            category: "Payment Options",
            items: removedPayments,
        });

    // Check special programs
    const addedPrograms = newSpecialPrograms.filter(
        (p) => !currentSpecialPrograms.includes(p),
    );
    const removedPrograms = currentSpecialPrograms.filter(
        (p) => !newSpecialPrograms.includes(p),
    );
    if (addedPrograms.length > 0)
        changes.push({
            type: "add",
            category: "Special Programs",
            items: addedPrograms,
        });
    if (removedPrograms.length > 0)
        changes.push({
            type: "remove",
            category: "Special Programs",
            items: removedPrograms,
        });

    // Check contacts
    if (newContacts.length > currentContacts.length) {
        changes.push({
            type: "add",
            category: "Contacts",
            items: [
                `${newContacts.length - currentContacts.length} new contact(s)`,
            ],
        });
    } else if (newContacts.length < currentContacts.length) {
        changes.push({
            type: "remove",
            category: "Contacts",
            items: [
                `${currentContacts.length - newContacts.length} contact(s)`,
            ],
        });
    }

    // Check hours
    if (newHours !== currentHours) {
        if (newHours) {
            changes.push({ type: "add", category: "Hours", items: [newHours] });
        } else {
            changes.push({ type: "remove", category: "Hours", items: ["Hours removed"] });
        }
    }

    if (changes.length === 0) {
        alert("No changes detected.");
        return;
    }

    // Store pending edits
    pendingFacilityEdits = {
        medications: newMedications,
        service_settings: newServiceSettings,
        payment_options: newPaymentOptions,
        special_programs: newSpecialPrograms,
        contacts: newContacts,
        hours: newHours,
    };

    // Display changes
    showEditConfirmation(facility.name, changes);
}

function showEditConfirmation(facilityName, changes) {
    const content = document.getElementById("editConfirmContent");

    let html = `<p style="margin-bottom: 15px;"><strong>Facility:</strong> ${facilityName}</p>`;

    const additions = changes.filter((c) => c.type === "add");
    const removals = changes.filter((c) => c.type === "remove");

    if (additions.length > 0) {
        html +=
            '<div style="margin-bottom: 20px; padding: 15px; background: #e8f4e8; border-left: 4px solid #5a8a72; border-radius: 2px;">';
        html +=
            '<strong style="color: #2d5170;">✓ Additions:</strong>';
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
        html +=
            '<div style="padding: 15px; background: #ffe8e8; border-left: 4px solid #a94842; border-radius: 2px;">';
        html +=
            '<strong style="color: #a94842;">✗ Removals:</strong>';
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
    document
        .getElementById("editFacilityModal")
        .classList.remove("show");
    document
        .getElementById("editConfirmModal")
        .classList.add("show");
}

function closeEditConfirmModal() {
    document
        .getElementById("editConfirmModal")
        .classList.remove("show");
    document
        .getElementById("editFacilityModal")
        .classList.add("show");
}

function confirmFacilityEdits() {
    if (!pendingFacilityEdits || !currentEditingFacilityId) return;

    // Save custom data
    facilityCustomData[currentEditingFacilityId] =
        pendingFacilityEdits;
    saveFacilityCustomData(currentEditingFacilityId);

    // Update the facility object in memory (for immediate display)
    const facility = allFacilities.find(
        (f) => f.id == currentEditingFacilityId,
    );
    if (facility) {
        if (!facility.services) facility.services = {};
        facility.services.medications =
            pendingFacilityEdits.medications;
        facility.services.service_settings =
            pendingFacilityEdits.service_settings;
        facility.services.payment_options =
            pendingFacilityEdits.payment_options;
        facility.services.special_programs =
            pendingFacilityEdits.special_programs;
        facility.hours = pendingFacilityEdits.hours;
    }

    // Close modals and refresh display
    document
        .getElementById("editConfirmModal")
        .classList.remove("show");

    // Refresh the facility details if currently open
    const detailsCell = document.querySelector(
        `#facility-${currentEditingFacilityId} .facility-details-cell`,
    );
    if (detailsCell) {
        detailsCell.innerHTML = createFacilityDetails(facility);

        // Reattach event listeners
        const textarea = document.getElementById(
            `notes-${currentEditingFacilityId}`,
        );
        if (textarea) {
            textarea.addEventListener("input", (e) => {
                updateNote(
                    currentEditingFacilityId,
                    e.target.value,
                );
                updateTimestamp(currentEditingFacilityId);
            });
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
            if (
                (service.code === "OM" || service.code === "PHR") &&
                service.values
            ) {
                medications.push(...service.values);
            }
        });
    }
    return medications;
}
