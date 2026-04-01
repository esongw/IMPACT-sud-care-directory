# IMPACT SUD Care Directory

An interactive web directory of Substance Use Disorder (SUD) treatment facilities in Oregon and select Washington cities, built to support care coordination within the IMPACT program.

## Purpose

This tool helps care coordinators, clinicians, and patients quickly identify and filter SUD treatment facilities by location, services offered, medications available, payment options, and more. It is designed to streamline the referral process and reduce barriers to finding appropriate treatment.

## Features

- **Search** by facility name, city, or address
- **Filter** by:
  - Type of care (e.g., outpatient, residential, detox)
  - Medications offered (e.g., buprenorphine, methadone, naltrexone)
  - Payment options (e.g., Medicaid, sliding fee scale)
  - Special programs (e.g., pregnant women, adolescents, veterans)
  - Age groups served
  - Languages available
- **Facility cards** with contact information, address, phone, and website links
- Covers all of **Oregon** and targeted **Washington** cities (Vancouver, Spokane, Olympia, and others along the Columbia River corridor)

## Data Source

Facility data is sourced from the **SAMHSA FindTreatment.gov API** (`findtreatment.gov/locator/exportsAsJson/v2`) and is stored locally in `oregon_sud_facilities.json`.

## Updating the Data

To refresh the facility data, run the included Python script:

```bash
pip install requests
python fetch_oregon_facilities.py
```

This will re-fetch all Oregon facilities and the filtered Washington facilities, and overwrite `oregon_sud_facilities.json`.

> **Note:** The script disables SSL verification due to a known certificate issue with the SAMHSA government API endpoint. This is expected behavior and does not affect data integrity.

## Washington Coverage

Washington state facilities are filtered to cities relevant to the IMPACT program's catchment area, including:
Vancouver, Yakima, Aberdeen, Kelso, Longview, Tumwater, Kennewick, White Salmon, Spokane, Ocean Park, Olympia, Richland, Pasco, Walla Walla, Centralia, and Chehalis.

## Deployment

This is a static web application hosted via **GitHub Pages**. No backend or database is required — all data is loaded from the bundled JSON file.

Live site: [https://esongw.github.io/IMPACT-sud-care-directory/](https://esongw.github.io/IMPACT-sud-care-directory/)

## Considerations

- **Data currency:** Facility data reflects a point-in-time snapshot from SAMHSA. Re-run `fetch_oregon_facilities.py` periodically to keep listings up to date.
- **Not a clinical tool:** This directory is intended to support care coordination, not to replace clinical judgment or verified referral pathways.
- **SAMHSA data limitations:** Facility self-report to SAMHSA; services listed may not always reflect current availability. Always confirm directly with facilities before referring patients.
