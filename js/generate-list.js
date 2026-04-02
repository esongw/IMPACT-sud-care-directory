// Generate List Functions

const GENERATE_FIELDS = [
    { id: 'name',             label: 'Name',               checked: true  },
    { id: 'name_secondary',   label: 'Secondary Name',     checked: false },
    { id: 'facility_type',    label: 'Facility Type',      checked: false },
    { id: 'county',           label: 'County',             checked: true  },
    { id: 'address',          label: 'Address',            checked: true  },
    { id: 'phone',            label: 'Phone / Contact',    checked: true  },
    { id: 'website',          label: 'Website',            checked: true  },
    { id: 'hours',            label: 'Hours',              checked: false },
    { id: 'patient_notes',    label: 'Patient Notes',      checked: false },
    { id: 'medications',      label: 'Pharmacotherapies',  checked: false },
    { id: 'service_settings', label: 'Service Settings',   checked: false },
    { id: 'payment_options',  label: 'Payment Options',    checked: false },
    { id: 'special_programs', label: 'Special Programs',   checked: false },
];

// Modal-local filter state
let _genCurrentFacilities = []; // current filtered list shown in modal
let _genSelectedIds = new Set(); // persists across filter changes within one modal session

function showGenerateListModal() {
    // Render field checkboxes
    document.getElementById('generateFieldCheckboxes').innerHTML = GENERATE_FIELDS.map(f => `
        <label class="checkbox-label">
            <input type="checkbox" id="gen-field-${f.id}" ${f.checked ? 'checked' : ''}>
            <span>${f.label}</span>
        </label>
    `).join('');

    // Reset search/filter inputs
    document.getElementById('generateFacilitySearch').value = '';
    document.getElementById('generateCitySearch').value = '';

    // Reset filter checkboxes inside the modal
    document.querySelectorAll('.gen-county-filter, .gen-type-filter, .gen-service-filter, .gen-med-filter, .gen-payment-filter, .gen-special-filter').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.gen-county-group-checkbox').forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });

    // Reset filter count badges inside modal
    document.querySelectorAll('.gen-filter-count').forEach(badge => {
        badge.style.display = 'none';
    });

    // Reset selection for a fresh session
    _genSelectedIds = new Set();

    // Start from all facilities (independent of main page filters)
    _genCurrentFacilities = allFacilities.slice();
    renderGenerateFacilityList(_genCurrentFacilities);

    document.getElementById('generateOutputSection').style.display = 'none';
    document.getElementById('generateListModal').classList.add('show');
}

function renderGenerateFacilityList(facilities) {
    _genCurrentFacilities = facilities;
    document.getElementById('generateFacilityList').innerHTML = facilities.map(f => `
        <label class="checkbox-label" style="display: flex; padding: 4px 0; border-bottom: 1px solid #f0ebe3;">
            <input type="checkbox" class="gen-facility-cb" value="${f.id}" ${_genSelectedIds.has(String(f.id)) ? 'checked' : ''} style="margin-right: 8px;" onchange="_genSyncCheckbox(this)">
            <span style="font-size: 13px;">${f.name}${f.name_secondary ? ` <em style="color:#6b5f54;">(${f.name_secondary})</em>` : ''}</span>
        </label>
    `).join('');
    updateGenerateSelectedCount();
}

function _genSyncCheckbox(cb) {
    if (cb.checked) _genSelectedIds.add(String(cb.value));
    else _genSelectedIds.delete(String(cb.value));
    updateGenerateSelectedCount();
}

// Apply modal-local filters and re-render the facility list
function filterGenerateList() {
    const nameTerm = document.getElementById('generateFacilitySearch').value.toLowerCase();
    const cityTerm = document.getElementById('generateCitySearch').value.toLowerCase();

    const selectedCounties = Array.from(
        document.querySelectorAll('.gen-county-filter:checked')
    ).map(cb => cb.value);

    const selectedTypes = Array.from(
        document.querySelectorAll('.gen-type-filter:checked')
    ).map(cb => cb.value.toUpperCase());

    const selectedServices = Array.from(
        document.querySelectorAll('.gen-service-filter:checked')
    ).map(cb => cb.value.toLowerCase());

    const selectedMeds = Array.from(
        document.querySelectorAll('.gen-med-filter:checked')
    ).map(cb => cb.value.toLowerCase());

    const selectedPayments = Array.from(
        document.querySelectorAll('.gen-payment-filter:checked')
    ).map(cb => cb.value.toLowerCase());

    const selectedSpecial = Array.from(
        document.querySelectorAll('.gen-special-filter:checked')
    ).map(cb => cb.value.toLowerCase());

    const filtered = allFacilities.filter(f => {
        // Name search
        const matchesName = !nameTerm ||
            f.name.toLowerCase().includes(nameTerm) ||
            (f.name_secondary || '').toLowerCase().includes(nameTerm);

        // City search
        const matchesCity = !cityTerm ||
            (f.address?.city || '').toLowerCase().includes(cityTerm);

        // County filter
        const matchesCounty = selectedCounties.length === 0 ||
            selectedCounties.includes(f.county);

        // Facility type filter
        const matchesType = selectedTypes.length === 0 ||
            selectedTypes.includes((f.facility_type || '').toUpperCase());

        // Level of service filter
        const matchesService = selectedServices.length === 0 ||
            selectedServices.some(levelFilter =>
                f.services?.service_settings?.some(s =>
                    s.toLowerCase().includes(levelFilter)
                )
            );

        // Pharmacotherapy filter
        const matchesMed = selectedMeds.length === 0 ||
            selectedMeds.some(medFilter =>
                f.services?.other_services?.some(s =>
                    (s.code === 'OM' || s.code === 'PHR') &&
                    s.values?.some(v => v.toLowerCase().includes(medFilter))
                )
            );

        // Payment options filter
        const matchesPayment = selectedPayments.length === 0 ||
            selectedPayments.some(payFilter =>
                f.services?.payment_options?.some(p =>
                    p.toLowerCase().includes(payFilter)
                )
            );

        // Special programs filter
        const matchesSpecial = selectedSpecial.length === 0 ||
            selectedSpecial.some(spFilter =>
                f.services?.special_programs?.some(sp =>
                    sp.toLowerCase().includes(spFilter)
                )
            );

        return matchesName && matchesCity && matchesCounty && matchesType &&
               matchesService && matchesMed && matchesPayment && matchesSpecial;
    });

    renderGenerateFacilityList(filtered);
}

// Toggle a county group's checkboxes in the modal
function toggleGenCountyGroup(groupCheckbox) {
    const group = groupCheckbox.closest('.gen-county-group');
    group.querySelectorAll('.gen-county-filter').forEach(cb => {
        cb.checked = groupCheckbox.checked;
    });
    updateGenFilterCount('county');
}

// Sync group header checkbox state for modal county filters
function updateGenCountyFilter(countyCheckbox) {
    const group = countyCheckbox.closest('.gen-county-group');
    if (group) {
        const groupCheckbox = group.querySelector('.gen-county-group-checkbox');
        const countyCheckboxes = group.querySelectorAll('.gen-county-filter');
        const checkedCount = Array.from(countyCheckboxes).filter(cb => cb.checked).length;
        if (checkedCount === 0) {
            groupCheckbox.checked = false;
            groupCheckbox.indeterminate = false;
        } else if (checkedCount === countyCheckboxes.length) {
            groupCheckbox.checked = true;
            groupCheckbox.indeterminate = false;
        } else {
            groupCheckbox.indeterminate = true;
        }
    }
    updateGenFilterCount('county');
}

// Update a filter count badge in the modal and re-filter
function updateGenFilterCount(filterType) {
    const classMap = {
        county:      'gen-county-filter',
        type:        'gen-type-filter',
        service:     'gen-service-filter',
        medication:  'gen-med-filter',
        payment:     'gen-payment-filter',
        special:     'gen-special-filter',
    };

    const checkedCount = document.querySelectorAll(
        `.${classMap[filterType]}:checked`
    ).length;
    const badge = document.getElementById(`gen-${filterType}-count`);
    if (badge) {
        badge.textContent = checkedCount;
        badge.style.display = checkedCount > 0 ? 'inline-block' : 'none';
    }

    filterGenerateList();
}

// Toggle a filter dropdown inside the modal (scoped to avoid conflicting with main page)
function toggleGenFilterDropdown(button) {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains('show');

    // Close all modal dropdowns
    document.querySelectorAll('#generateListModal .filter-dropdown-content').forEach(d => {
        d.classList.remove('show');
    });
    document.querySelectorAll('#generateListModal .filter-dropdown-button').forEach(b => {
        b.classList.remove('active');
    });

    if (!isOpen) {
        content.classList.add('show');
        button.classList.add('active');
    }
}

// Clear all modal filters
function clearGenerateFilters() {
    document.getElementById('generateFacilitySearch').value = '';
    document.getElementById('generateCitySearch').value = '';

    document.querySelectorAll('.gen-county-filter, .gen-type-filter, .gen-service-filter, .gen-med-filter, .gen-payment-filter, .gen-special-filter').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.gen-county-group-checkbox').forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });
    document.querySelectorAll('.gen-filter-count').forEach(badge => {
        badge.style.display = 'none';
    });

    // Close any open modal dropdowns
    document.querySelectorAll('#generateListModal .filter-dropdown-content').forEach(d => {
        d.classList.remove('show');
    });
    document.querySelectorAll('#generateListModal .filter-dropdown-button').forEach(b => {
        b.classList.remove('active');
    });

    renderGenerateFacilityList(allFacilities.slice());
}

function setAllGenerateFacilities(checked) {
    document.querySelectorAll('.gen-facility-cb').forEach(cb => {
        cb.checked = checked;
        if (checked) _genSelectedIds.add(String(cb.value));
        else _genSelectedIds.delete(String(cb.value));
    });
    updateGenerateSelectedCount();
}

function updateGenerateSelectedCount() {
    const visible = document.querySelectorAll('.gen-facility-cb').length;
    document.getElementById('generateSelectedCount').textContent =
        `${_genSelectedIds.size} selected (${visible} shown)`;
}

function generateList() {
    const typeLabels = { SA: 'Substance Abuse', MH: 'Mental Health', BOTH: 'Both SA & MH' };

    // Which fields are checked
    const fields = {};
    GENERATE_FIELDS.forEach(f => {
        fields[f.id] = document.getElementById(`gen-field-${f.id}`)?.checked || false;
    });

    // Sync any visible checkbox changes that happened without onchange firing
    document.querySelectorAll('.gen-facility-cb').forEach(cb => {
        if (cb.checked) _genSelectedIds.add(String(cb.value));
        else _genSelectedIds.delete(String(cb.value));
    });

    // Build list from all facilities matching selected IDs (persists across filter changes)
    const selected = allFacilities.filter(f => _genSelectedIds.has(String(f.id)));

    if (selected.length === 0) {
        alert('Please select at least one facility.');
        return;
    }

    const blocks = selected.map((f, i) => {
        const customData = getFacilityCustomData(f.id);
        const rows = [];

        if (fields.name) rows.push(`<strong>${i + 1}. ${f.name}</strong>`);
        if (fields.name_secondary && f.name_secondary) rows.push(`  Also known as: ${f.name_secondary}`);
        if (fields.facility_type && f.facility_type) rows.push(`  Type: ${typeLabels[f.facility_type] || f.facility_type}`);
        if (fields.county && f.county) rows.push(`  County: ${f.county}`);
        if (fields.address && f.address) {
            const a = f.address;
            rows.push(`  Address: ${a.street1}${a.street2 ? ', ' + a.street2 : ''}, ${a.city}, ${a.state} ${a.zip}`);
        }
        if (fields.phone) {
            const contactLines = customData?.contacts
                ? customData.contacts.map(c => `${c.type}: ${c.info}${c.notes ? ` (${c.notes})` : ''}`)
                : [
                    f.contact?.phone        ? `Phone: ${f.contact.phone}`               : null,
                    f.contact?.intake_phone ? `Intake: ${f.contact.intake_phone}`        : null,
                    f.contact?.hotline      ? `Hotline: ${f.contact.hotline}`            : null,
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

    document.getElementById('generatedListText').innerHTML = blocks.join('\n\n');
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

function closeGenerateListModal() {
    document.getElementById('generateListModal').classList.remove('show');
}
