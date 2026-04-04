// Generate List Functions

const GENERATE_FIELDS = [
    { id: 'address',          label: 'Address',            checked: true  },
    { id: 'phone',            label: 'Phone / Contact',    checked: true  },
    { id: 'website',          label: 'Website',            checked: true  },
    { id: 'hours',            label: 'Hours',              checked: false },
    { id: 'patient_notes',    label: 'Information for Patients', checked: false },
    { id: 'service_settings', label: 'Service Settings',   checked: false },
    { id: 'payment_options',  label: 'Payment Options',    checked: false },
    { id: 'special_programs', label: 'Special Programs',   checked: false },
];

let _genSelectedIds = new Set();

// Toggle the AVS panel from the toolbar
function toggleAVSPanel() {
    const panel = document.getElementById('avsPanel');
    const btn = document.getElementById('avsPanelBtn');
    const open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : '';
    btn.classList.toggle('active', !open);
    if (!open) {
        _initAVSFields();
        _renderGenSelectedPanel();
    }
}

// Initialize field checkboxes once
function _initAVSFields() {
    const container = document.getElementById('generateFieldCheckboxes');
    if (!container || container.dataset.initialized) return;
    container.innerHTML = GENERATE_FIELDS.map(f => `
        <label class="checkbox-label">
            <input type="checkbox" id="gen-field-${f.id}" ${f.checked ? 'checked' : ''}>
            <span>${f.label}</span>
        </label>
    `).join('');
    container.dataset.initialized = '1';
}

// Called from main table checkbox
function _avsToggle(cb) {
    if (cb.checked) _genSelectedIds.add(String(cb.value));
    else _genSelectedIds.delete(String(cb.value));
    _renderGenSelectedPanel();
}

function _syncAVSBadge() {
    const badge = document.getElementById('avs-count-badge');
    if (!badge) return;
    const count = _genSelectedIds.size;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function clearAVSSelection() {
    _genSelectedIds.clear();
    document.querySelectorAll('.avs-facility-cb').forEach(cb => cb.checked = false);
    _renderGenSelectedPanel();
    document.getElementById('generateOutputSection').style.display = 'none';
}

function _renderGenSelectedPanel() {
    _syncAVSBadge();
    const panel = document.getElementById('genSelectedPanel');
    const countEl = document.getElementById('generateSelectedCount');
    if (!panel) return;
    if (_genSelectedIds.size === 0) {
        panel.innerHTML = '<p style="font-size: 13px; color: #6b5f54; font-style: italic;">No facilities selected yet. Check boxes in the facility list below.</p>';
        if (countEl) countEl.textContent = '';
        return;
    }
    const selectedFacilities = allFacilities.filter(f => _genSelectedIds.has(String(f.id)));
    if (countEl) countEl.textContent = `— ${selectedFacilities.length} selected`;
    panel.innerHTML = selectedFacilities.map(f => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; margin-bottom: 3px; background: #edf3f9; border-radius: 3px; font-size: 13px;">
            <span>${f.name}${f.address?.city ? ` <span style="color: #6b5f54;">(${f.address.city})</span>` : ''}</span>
            <button onclick="_genDeselect('${String(f.id).replace(/'/g, "\\'")}')" style="background: none; border: none; cursor: pointer; color: #a94842; font-size: 15px; line-height: 1; padding: 0 2px;" title="Remove">✕</button>
        </div>
    `).join('');
}

function _genDeselect(facilityId) {
    _genSelectedIds.delete(String(facilityId));
    const cb = document.querySelector(`.avs-facility-cb[value="${facilityId}"]`);
    if (cb) cb.checked = false;
    _renderGenSelectedPanel();
}

function generateList() {
    const fields = {};
    GENERATE_FIELDS.forEach(f => {
        fields[f.id] = document.getElementById(`gen-field-${f.id}`)?.checked || false;
    });

    const selected = allFacilities.filter(f => _genSelectedIds.has(String(f.id)));

    if (selected.length === 0) {
        alert('Please select at least one facility using the checkboxes in the list below.');
        return;
    }

    const blocks = selected.map((f, i) => {
        const customData = getFacilityCustomData(f.id);
        const rows = [];

        rows.push(`<strong>${i + 1}. ${f.name}</strong>`);
        if (f.name_secondary) rows.push(`  Also known as: ${f.name_secondary}`);
        if (fields.address && f.address) {
            const a = f.address;
            rows.push(`  Address: ${a.street1}${a.street2 ? ', ' + a.street2 : ''}, ${a.city}, ${a.state} ${a.zip}`);
        }
        if (fields.phone) {
            const contactLines = customData?.contacts
                ? customData.contacts.map(c => `${c.type}: ${c.info}${c.notes ? ` (${c.notes})` : ''}`)
                : [
                    f.contact?.phone        ? `Phone: ${f.contact.phone}`        : null,
                    f.contact?.intake_phone ? `Intake: ${f.contact.intake_phone}` : null,
                    f.contact?.hotline      ? `Hotline: ${f.contact.hotline}`     : null,
                  ].filter(Boolean);
            contactLines.forEach(c => rows.push(`  ${c}`));
        }
        if (fields.website && f.contact?.website && f.contact.website !== 'https://' && f.contact.website !== 'http://') {
            rows.push(`  Website: ${f.contact.website}`);
        }
        const hoursData = parseHoursData(customData?.hours ?? f.hours);
        if (fields.hours && hoursData.length > 0) {
            hoursData.forEach(r => rows.push(`  ${r.description ? r.description + ': ' : 'Hours: '}${r.hours}`));
        }
        const patientNotes = customData?.patient_notes || '';
        if (fields.patient_notes && patientNotes) rows.push(`  Notes: ${patientNotes}`);
        const meds = customData?.medications || extractMedicationsFromFacility(f);
        if (fields.medications && meds.length) rows.push(`  Pharmacotherapies: ${meds.join(', ')}`);
        const settings = customData?.service_settings || f.services?.service_settings || [];
        if (fields.service_settings && settings.length) rows.push(`  Service Settings: ${settings.join(', ')}`);
        const payments = customData?.payment_options || f.services?.payment_options || [];
        if (fields.payment_options && payments.length) rows.push(`  Payment Options: ${payments.join(', ')}`);
        const programs = customData?.special_programs || f.services?.special_programs || [];
        if (fields.special_programs && programs.length) rows.push(`  Special Programs: ${programs.join(', ')}`);

        return rows.join('\n');
    });

    const DIVIDER = '─'.repeat(48);
    document.getElementById('generatedListText').innerHTML = blocks.join(`\n\n${DIVIDER}\n\n`);
    document.getElementById('generateOutputSection').style.display = '';
    document.getElementById('generatedListText').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyGeneratedList() {
    const el = document.getElementById('generatedListText');
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = original, 2000);
}
