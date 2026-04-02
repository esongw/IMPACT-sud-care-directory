// Import/Export Functions

let pendingImportData = null;
let uploadedCSVContent = null;

function showImportModal() {
    document.getElementById("importModal").classList.add("show");
}

function closeImportModal() {
    document.getElementById("importModal").classList.remove("show");
    resetImportModal();
}

function resetImportModal() {
    document.getElementById("csvFileInput").value = "";
    document.getElementById("selectedFileName").textContent = "";
    document.getElementById("importPreview").style.display = "none";
    document.getElementById("uploadBtn").style.display = "none";
    document.getElementById("importFooterInitial").style.display = "flex";
    document.getElementById("importFooterConfirm").style.display = "none";
    document.getElementById("importInstructions").style.display = "block";
    document.getElementById("fileSelectSection").style.display = "block";
    pendingImportData = null;
    uploadedCSVContent = null;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
        alert("Please select a CSV file.");
        document.getElementById("csvFileInput").value = "";
        return;
    }

    document.getElementById("selectedFileName").textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedCSVContent = e.target.result;
        document.getElementById("uploadBtn").style.display = "inline-block";
    };
    reader.onerror = function () {
        alert("Error reading file. Please try again.");
        document.getElementById("csvFileInput").value = "";
        document.getElementById("selectedFileName").textContent = "";
    };
    reader.readAsText(file);
}

function processUploadedFile() {
    if (!uploadedCSVContent) {
        alert("No file selected. Please choose a CSV file first.");
        return;
    }

    try {
        const lines = uploadedCSVContent.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
            alert("CSV file must have at least a header row and one data row.");
            return;
        }

        const header = lines[0].toLowerCase();
        if (!header.includes("id") || !header.includes("notes")) {
            alert('CSV file must contain "ID" and "Notes" columns. Please use the exported template format.');
            return;
        }

        const dataLines = lines.slice(1);
        const updates = [];
        const notFound = [];

        dataLines.forEach((line) => {
            if (!line.trim()) return;

            const fields = parseCSVLine(line);

            if (fields.length >= 7) {
                const id = fields[0].trim();
                const facilityName = fields[1].trim();
                const notes = fields[6].trim();

                if (!id || !notes) return;

                let facility = allFacilities.find((f) => f.id == id);

                if (!facility && facilityName) {
                    const city = fields[3].trim();
                    const state = fields[4].trim();
                    facility = allFacilities.find(
                        (f) =>
                            f.name.toLowerCase() === facilityName.toLowerCase() &&
                            f.address.city.toLowerCase() === city.toLowerCase() &&
                            f.address.state.toUpperCase() === state.toUpperCase(),
                    );
                }

                if (facility) {
                    const currentNote = facilityNotes[facility.id];
                    const currentNoteText = currentNote ? currentNote.text : "";

                    if (currentNoteText !== notes) {
                        updates.push({
                            id: facility.id,
                            name: facility.name,
                            city: facility.address.city,
                            state: facility.address.state,
                            oldNotes: currentNoteText || "(none)",
                            newNotes: notes,
                        });
                    }
                } else {
                    notFound.push({ id, name: facilityName || "Unknown" });
                }
            }
        });

        if (updates.length === 0 && notFound.length === 0) {
            alert("No changes detected. All notes are already up to date.");
            return;
        }

        if (updates.length === 0 && notFound.length > 0) {
            alert(`No valid updates found. ${notFound.length} facilities could not be matched.\n\nPlease ensure the CSV file matches the current facility list.`);
            return;
        }

        pendingImportData = updates;

        let previewHTML = "";

        if (updates.length > 0) {
            previewHTML += `<div style="margin-bottom: 15px;">
                <strong style="color: #2d5170;">✓ ${updates.length} facility notes will be updated:</strong>
            </div>`;

            previewHTML += updates.map((u) => `
                <div style="margin-bottom: 12px; padding: 12px; background: white; border-left: 4px solid #5b8fc4; border-radius: 2px;">
                    <strong style="color: #2d2520;">${u.name}</strong>
                    <small style="color: #6b5f54; display: block; margin-top: 4px;">${u.city}, ${u.state}</small>
                    <div style="margin-top: 8px; font-size: 13px;">
                        <div style="margin-bottom: 4px;">
                            <strong>Current:</strong> <span style="color: #a94842;">${u.oldNotes.substring(0, 100)}${u.oldNotes.length > 100 ? "..." : ""}</span>
                        </div>
                        <div>
                            <strong>New:</strong> <span style="color: #5a8a72;">${u.newNotes.substring(0, 100)}${u.newNotes.length > 100 ? "..." : ""}</span>
                        </div>
                    </div>
                </div>
            `).join("");
        }

        if (notFound.length > 0) {
            previewHTML += `<div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 2px;">
                <strong style="color: #856404;">⚠ ${notFound.length} facilities could not be matched and will be skipped:</strong>
                <ul style="margin: 8px 0 0 20px; font-size: 13px;">
                    ${notFound.slice(0, 5).map((nf) => `<li>${nf.name} (ID: ${nf.id})</li>`).join("")}
                    ${notFound.length > 5 ? `<li><em>...and ${notFound.length - 5} more</em></li>` : ""}
                </ul>
            </div>`;
        }

        document.getElementById("importPreviewList").innerHTML = previewHTML;
        document.getElementById("importPreview").style.display = "block";
        document.getElementById("importInstructions").style.display = "none";
        document.getElementById("fileSelectSection").style.display = "none";
        document.getElementById("importFooterInitial").style.display = "none";
        document.getElementById("importFooterConfirm").style.display = "flex";
    } catch (error) {
        console.error("CSV parsing error:", error);
        alert("Error processing CSV file: " + error.message + "\n\nPlease ensure the file is properly formatted.");
    }
}

function parseCSVLine(line) {
    const fields = [];
    let current = "";
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
        } else if (char === "," && !inQuotes) {
            fields.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    fields.push(current);
    return fields;
}

function cancelImportChanges() {
    if (confirm("Are you sure you want to cancel? All changes will be discarded.")) {
        closeImportModal();
    }
}

async function confirmImport() {
    if (!pendingImportData || pendingImportData.length === 0) {
        alert("No data to import.");
        closeImportModal();
        return;
    }

    let updatedCount = 0;
    pendingImportData.forEach((update) => {
        facilityNotes[update.id] = {
            text: update.newNotes,
            timestamp: new Date().toISOString(),
        };
        updatedCount++;
    });

    for (const update of pendingImportData) {
        await _supabase.from('notes').upsert({
            facility_id: String(update.id),
            text: update.newNotes,
            updated_at: new Date().toISOString()
        });
    }

    pendingImportData.forEach((update) => {
        const textarea = document.getElementById(`notes-${update.id}`);
        const timestampDiv = document.getElementById(`timestamp-${update.id}`);
        if (textarea) textarea.value = update.newNotes;
        if (timestampDiv) timestampDiv.textContent = `Last updated: ${new Date().toLocaleString()}`;
    });

    alert(`✓ Successfully imported ${updatedCount} note${updatedCount !== 1 ? "s" : ""}!`);
    closeImportModal();
}

// Add Facility Modal Functions
function showAddFacilityModal() {
    const allOptions = extractAllOptions();

    document.getElementById("addPharmacotherapiesContainer").innerHTML = allOptions.pharmacotherapies.map((med) => `
        <label class="checkbox-label">
            <input type="checkbox" class="new-facility-medication" value="${med}">
            <span>${med}</span>
        </label>
    `).join("");

    document.getElementById("addServiceSettingsContainer").innerHTML = allOptions.serviceSettings.map((setting) => `
        <label class="checkbox-label">
            <input type="checkbox" class="new-facility-service" value="${setting}">
            <span>${setting}</span>
        </label>
    `).join("");

    document.getElementById("addPaymentOptionsContainer").innerHTML = allOptions.paymentOptions.map((payment) => `
        <label class="checkbox-label">
            <input type="checkbox" class="new-facility-payment" value="${payment}">
            <span>${payment}</span>
        </label>
    `).join("");

    document.getElementById("addFacilityModal").classList.add("show");
}

function closeAddFacilityModal() {
    document.getElementById("addFacilityModal").classList.remove("show");
    document.getElementById("newFacilityName").value = "";
    document.getElementById("newFacilityNameSecondary").value = "";
    document.getElementById("newFacilityStreet").value = "";
    document.getElementById("newFacilityCity").value = "";
    document.getElementById("newFacilityState").value = "OR";
    document.getElementById("newFacilityZip").value = "";
    document.getElementById("newFacilityPhone").value = "";
    document.getElementById("newFacilityWebsite").value = "";
    document.getElementById("newFacilityType").value = "SA";
    document.getElementById("newFacilitySpecialPrograms").value = "";
    document.querySelectorAll(".new-facility-medication, .new-facility-service, .new-facility-payment").forEach((cb) => (cb.checked = false));
}

async function saveNewFacility() {
    const name = document.getElementById("newFacilityName").value.trim();
    const nameSecondary = document.getElementById("newFacilityNameSecondary").value.trim();
    const street = document.getElementById("newFacilityStreet").value.trim();
    const city = document.getElementById("newFacilityCity").value.trim();
    const state = document.getElementById("newFacilityState").value;
    const zip = document.getElementById("newFacilityZip").value.trim();
    const phone = document.getElementById("newFacilityPhone").value.trim();
    const website = document.getElementById("newFacilityWebsite").value.trim();
    const facilityType = document.getElementById("newFacilityType").value;

    const medications = Array.from(document.querySelectorAll(".new-facility-medication:checked")).map((cb) => cb.value);
    const serviceSettings = Array.from(document.querySelectorAll(".new-facility-service:checked")).map((cb) => cb.value);
    const paymentOptions = Array.from(document.querySelectorAll(".new-facility-payment:checked")).map((cb) => cb.value);
    const specialProgramsText = document.getElementById("newFacilitySpecialPrograms").value.trim();
    const specialPrograms = specialProgramsText ? specialProgramsText.split("\n").filter((p) => p.trim()) : [];

    if (!name || !street || !city || !zip) {
        alert("Please fill in all required fields (marked with *)");
        return;
    }

    const newId = "custom-" + Date.now();
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
            other_services: medications.length > 0 ? [{ category: "Pharmacotherapies", code: "PHR", values: medications }] : [],
        },
    };

    allFacilities.push(newFacility);
    await _supabase.from('custom_facilities').upsert({ id: newFacility.id, data: newFacility });

    filterFacilities();
    closeAddFacilityModal();
    alert("Facility added successfully!");
}

function exportNotesTemplate() {
    let csv = "ID,Facility Name,Street Address,City,State,Zip,Notes\n";

    allFacilities.forEach((facility) => {
        const note = facilityNotes[facility.id];
        const noteText = note ? note.text.replace(/"/g, '""').replace(/\n/g, " ") : "";

        csv += `"${facility.id}",`;
        csv += `"${facility.name.replace(/"/g, '""')}",`;
        csv += `"${facility.address.street1 || ""}",`;
        csv += `"${facility.address.city}",`;
        csv += `"${facility.address.state}",`;
        csv += `"${facility.address.zip}",`;
        csv += `"${noteText}"\n`;
    });

    const dataBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `facilities-template-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Close import modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById("importModal");
    if (event.target === modal) {
        closeImportModal();
    }
};
