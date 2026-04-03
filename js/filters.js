// Extract all unique options from all facilities
function extractAllOptions() {
    const options = {
        pharmacotherapies: new Set(),
        serviceSettings: new Set(),
        specialPrograms: new Set(),
        paymentOptions: new Set(),
    };

    allFacilities.forEach((facility) => {
        const services = facility.services;
        if (!services) return;

        // Pharmacotherapies from PHR code
        if (services.other_services) {
            services.other_services.forEach((service) => {
                if (service.code === "PHR" && service.values) {
                    service.values.forEach((val) =>
                        options.pharmacotherapies.add(val),
                    );
                }
            });
        }

        // Service settings
        if (services.service_settings) {
            services.service_settings.forEach((val) =>
                options.serviceSettings.add(val),
            );
        }

        // Special programs
        if (services.special_programs) {
            services.special_programs.forEach((val) =>
                options.specialPrograms.add(val),
            );
        }

        // Payment options
        if (services.payment_options) {
            services.payment_options.forEach((val) =>
                options.paymentOptions.add(val),
            );
        }
    });

    return {
        pharmacotherapies: Array.from(
            options.pharmacotherapies,
        ).sort(),
        serviceSettings: Array.from(options.serviceSettings).sort(),
        specialPrograms: Array.from(options.specialPrograms).sort(),
        paymentOptions: Array.from(options.paymentOptions).sort(),
    };
}

// Sort facilities
function sortFacilities(field) {
    // Toggle sort direction if clicking same field
    if (currentSort.field === field) {
        currentSort.direction =
            currentSort.direction === "asc" ? "desc" : "asc";
    } else {
        currentSort.field = field;
        currentSort.direction = "asc";
    }

    // Sort the filtered facilities
    filteredFacilities.sort((a, b) => {
        let aVal, bVal;

        if (field === "name") {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
        } else if (field === "secondaryName") {
            aVal = (a.name_secondary || "").toLowerCase();
            bVal = (b.name_secondary || "").toLowerCase();
        } else if (field === "county") {
            aVal = a.county || "zzz"; // Put unknown counties at end
            bVal = b.county || "zzz";
        } else if (field === "city") {
            aVal = a.address.city.toLowerCase();
            bVal = b.address.city.toLowerCase();
        }

        if (currentSort.direction === "asc") {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });

    // Update sort indicators
    document
        .querySelectorAll('[id^="sort-"]')
        .forEach((el) => (el.textContent = "↕"));
    const indicator = document.getElementById(`sort-${field}`);
    if (indicator) {
        indicator.textContent =
            currentSort.direction === "asc" ? "↑" : "↓";
    }

    // Redisplay
    displayFacilities(filteredFacilities);
}

// Toggle filter dropdown
function toggleFilterDropdown(button) {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains("show");

    // Close all other dropdowns
    document
        .querySelectorAll(".filter-dropdown-content")
        .forEach((dropdown) => {
            dropdown.classList.remove("show");
        });
    document
        .querySelectorAll(".filter-dropdown-button")
        .forEach((btn) => {
            btn.classList.remove("active");
        });

    // Toggle this dropdown
    if (!isOpen) {
        content.classList.add("show");
        button.classList.add("active");
    }
}

// Toggle all counties in a group when the group header checkbox is clicked
function toggleCountyGroup(groupCheckbox) {
    const group = groupCheckbox.closest('.county-group');
    group.querySelectorAll('.county-filter').forEach(cb => {
        cb.checked = groupCheckbox.checked;
    });
    updateFilterCount('county');
}

// Update group header checkbox state when an individual county is toggled
function updateCountyFilter(countyCheckbox) {
    const group = countyCheckbox.closest('.county-group');
    if (group) {
        const groupCheckbox = group.querySelector('.county-group-checkbox');
        const countyCheckboxes = group.querySelectorAll('.county-filter');
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
    updateFilterCount('county');
}

// Update filter count badge
function updateFilterCount(filterType) {
    const classMap = {
        type: "type-filter",
        payment: "payment-filter",
        county: "county-filter",
        medication: "medication-filter",
        service: "service-filter",
    };

    const checkedCount = document.querySelectorAll(
        `.${classMap[filterType]}:checked`,
    ).length;
    const countBadge = document.getElementById(
        `${filterType}-count`,
    );

    if (checkedCount > 0) {
        countBadge.textContent = checkedCount;
        countBadge.style.display = "inline-block";
    } else {
        countBadge.style.display = "none";
    }

    filterFacilities();
}

// Close dropdowns when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".filter-group")) {
        document
            .querySelectorAll(".filter-dropdown-content")
            .forEach((dropdown) => {
                dropdown.classList.remove("show");
            });
        document
            .querySelectorAll(".filter-dropdown-button")
            .forEach((btn) => {
                btn.classList.remove("active");
            });
    }
});

// Clear all filters
function clearAllFilters() {
    // Uncheck all checkboxes
    document
        .querySelectorAll(
            ".type-filter, .payment-filter, .county-filter, .medication-filter, .service-filter",
        )
        .forEach((checkbox) => {
            checkbox.checked = false;
        });

    // Reset county group header checkboxes
    document.querySelectorAll('.county-group-checkbox').forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });

    // Hide all count badges
    document.querySelectorAll(".filter-count").forEach((badge) => {
        badge.style.display = "none";
    });

    // Reset the filtered facilities
    filterFacilities();
}

// Filter facilities
function filterFacilities() {
    const searchTerm = document
        .getElementById("searchBox")
        .value.toLowerCase();
    const citySearchTerm = document
        .getElementById("citySearchBox")
        .value.toLowerCase();

    // Get checked checkboxes for each filter type
    const selectedPayments = Array.from(
        document.querySelectorAll(".payment-filter:checked"),
    ).map((cb) => cb.value.toLowerCase());
    const selectedCounties = Array.from(
        document.querySelectorAll(".county-filter:checked"),
    ).map((cb) => cb.value);
    const selectedMedications = Array.from(
        document.querySelectorAll(".medication-filter:checked"),
    ).map((cb) => cb.value.toLowerCase());
    const selectedServiceLevels = Array.from(
        document.querySelectorAll(".service-filter:checked"),
    ).map((cb) => cb.value.toLowerCase());

    // Support comma-separated terms (OR logic)
    const searchTerms = searchTerm.split(',').map(t => t.trim()).filter(Boolean);
    const citySearchTerms = citySearchTerm.split(',').map(t => t.trim()).filter(Boolean);

    filteredFacilities = allFacilities.filter((facility) => {
        // Search by name or secondary name (any term matches)
        const matchesSearch =
            searchTerms.length === 0 ||
            searchTerms.some(term =>
                facility.name.toLowerCase().includes(term) ||
                (facility.name_secondary &&
                    facility.name_secondary.toLowerCase().includes(term))
            );

        // Search by city (any term matches)
        const matchesCitySearch =
            citySearchTerms.length === 0 ||
            citySearchTerms.some(term =>
                facility.address.city.toLowerCase().includes(term)
            );

        // Payment filter - if nothing selected, show all; if selected, must accept at least one of the selected payment types
        const matchesPayment =
            selectedPayments.length === 0 ||
            selectedPayments.some((paymentFilter) =>
                facility.services.payment_options?.some((payment) =>
                    payment.toLowerCase().includes(paymentFilter),
                ),
            );

        // County filter - if nothing selected, show all; if selected, must match one of the selected counties
        const matchesCounty =
            selectedCounties.length === 0 ||
            selectedCounties.includes(facility.county);

        // Medication filter - if nothing selected, show all; if selected, must have at least one of the selected medications
        // Medications are in other_services array with code 'OM' (Opioid Medications) or 'PHR' (Pharmacotherapies)
        const matchesMedication =
            selectedMedications.length === 0 ||
            selectedMedications.some((medFilter) => {
                // Check in other_services for Opioid Medications (code: 'OM') or Pharmacotherapies (code: 'PHR')
                return facility.services.other_services?.some(
                    (service) =>
                        (service.code === "OM" ||
                            service.code === "PHR") &&
                        service.values?.some((val) =>
                            val.toLowerCase().includes(medFilter),
                        ),
                );
            });

        // Service level filter - if nothing selected, show all; if selected, must have at least one of the selected levels
        const matchesServiceLevel =
            selectedServiceLevels.length === 0 ||
            selectedServiceLevels.some((levelFilter) =>
                facility.services.service_settings?.some(
                    (setting) =>
                        setting.toLowerCase().includes(levelFilter),
                ),
            );

        return (
            matchesSearch &&
            matchesCitySearch &&
            matchesPayment &&
            matchesCounty &&
            matchesMedication &&
            matchesServiceLevel
        );
    });

    displayFacilities(filteredFacilities);
    updateStats();
}

// Update stats display
function updateStats() {
    document.getElementById("totalCount").textContent =
        allFacilities.length;
    document.getElementById("displayCount").textContent =
        filteredFacilities.length;
}

// Event listeners for search boxes
document
    .getElementById("searchBox")
    .addEventListener("input", filterFacilities);
document
    .getElementById("citySearchBox")
    .addEventListener("input", filterFacilities);

// Initialize app — load all shared data then render
async function initApp() {
    await Promise.all([loadNotes(), loadFacilityDocuments(), loadFacilityCustomData()]);
    await loadFacilities();
}
initApp();
