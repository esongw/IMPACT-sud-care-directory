#!/usr/bin/env python3
"""
Fetch Oregon and Washington substance use disorder treatment facilities from SAMHSA FindTreatment.gov API
and save to a JSON file suitable for web application use.
"""

import requests
import json
import time
from typing import List, Dict, Any
import urllib3

# Disable SSL warnings for government site
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# API Configuration
BASE_URL = "https://findtreatment.gov/locator/exportsAsJson/v2"
OREGON_STATE_ID = 46
WASHINGTON_STATE_ID = 15
PORTLAND_COORDS = "45.5152,-122.6784"  # Starting coordinates for Oregon
SEATTLE_COORDS = "47.6062,-122.3321"  # Starting coordinates for Washington

# Washington cities we want to focus on
WASHINGTON_TARGET_CITIES = [
    'Vancouver', 'Yakima', 'Aberdeen', 'Kelso', 'Longview', 'Tumwater', 
    'Kennewick', 'White Salmon', 'Spokane', 'Ocean Park', 'Olympia',
    'Richland', 'Pasco', 'Walla Walla', 'Centralia', 'Chehalis'
]

def fetch_facilities_page(state_id: int, coords: str, page: int = 1, page_size: int = 2000) -> Dict[str, Any]:
    """
    Fetch a single page of facilities from the API.
    
    Args:
        state_id: State ID (46 for Oregon, 15 for Washington)
        coords: Starting coordinates
        page: Page number to fetch (starts at 1)
        page_size: Number of results per page (max 2000)
    
    Returns:
        API response as dictionary
    """
    params = {
        'limitType': '0',  # State-based search
        'limitValue': state_id,
        'sAddr': coords,
        'pageSize': page_size,
        'page': page,
        'sType': 'SA'  # Substance abuse facilities
    }
    
    print(f"Fetching page {page} for state ID {state_id}...")
    print(f"Query params: {params}")
    
    try:
        # Disable SSL verification for government site with certificate issues
        response = requests.get(BASE_URL, params=params, timeout=30, verify=False)
        print(f"Response status: {response.status_code}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        raise

def parse_services(services: List[Dict]) -> Dict[str, Any]:
    """
    Parse the services array into organized categories.
    
    Args:
        services: List of service dictionaries from API
    
    Returns:
        Organized services dictionary
    """
    organized = {
        'medications': [],
        'type_of_care': [],
        'service_settings': [],
        'special_programs': [],
        'payment_options': [],
        'age_groups': [],
        'languages': [],
        'other_services': []
    }
    
    for service in services:
        category = service.get('f2', '')
        value = service.get('f3', '')
        
        if not value:
            continue
            
        # Split multiple values (separated by semicolons)
        values = [v.strip() for v in value.split(';')]
        
        # Categorize based on the f2 code
        if category == 'SA':  # Substance abuse medications
            organized['medications'].extend(values)
        elif category == 'TC':  # Type of care
            organized['type_of_care'].extend(values)
        elif category == 'SET':  # Service settings
            organized['service_settings'].extend(values)
        elif category == 'SG':  # Special groups/programs
            organized['special_programs'].extend(values)
        elif category == 'PAY':  # Payment options
            organized['payment_options'].extend(values)
        elif category == 'AGE':  # Age groups
            organized['age_groups'].extend(values)
        elif category == 'SL':  # Language services
            organized['languages'].extend(values)
        else:
            # Capture any other service types
            organized['other_services'].append({
                'category': service.get('f1', 'Unknown'),
                'code': category,
                'values': values
            })
    
    # Remove duplicates and empty lists
    for key in organized:
        if isinstance(organized[key], list) and organized[key]:
            if key != 'other_services':
                organized[key] = list(set(organized[key]))
    
    return organized

def transform_facility(facility: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform raw facility data into a clean format for web use.
    
    Args:
        facility: Raw facility data from API
    
    Returns:
        Cleaned and organized facility data
    """
    services = parse_services(facility.get('services', []))
    
    return {
        'id': facility.get('_irow'),
        'name': facility.get('name1', ''),
        'name_secondary': facility.get('name2'),
        'address': {
            'street1': facility.get('street1', ''),
            'street2': facility.get('street2'),
            'city': facility.get('city', ''),
            'state': facility.get('state', ''),
            'zip': facility.get('zip', '')
        },
        'contact': {
            'phone': facility.get('phone', ''),
            'intake_phone': facility.get('intake1'),
            'hotline': facility.get('hotline1'),
            'website': facility.get('website')
        },
        'location': {
            'latitude': float(facility.get('latitude', 0)) if facility.get('latitude') else None,
            'longitude': float(facility.get('longitude', 0)) if facility.get('longitude') else None
        },
        'facility_type': facility.get('type_facility', ''),  # SA, MH, or BOTH
        'services': services
    }

def fetch_all_facilities_for_state(state_id: int, coords: str, state_name: str) -> List[Dict[str, Any]]:
    """
    Fetch all facilities for a given state from the API (handles pagination).
    
    Args:
        state_id: State ID number
        coords: Starting coordinates
        state_name: State name for logging
    
    Returns:
        List of all facilities
    """
    all_facilities = []
    page = 1
    
    print(f"\n{'='*60}")
    print(f"Fetching {state_name} facilities...")
    print('='*60)
    
    while True:
        try:
            response = fetch_facilities_page(state_id, coords, page)
            
            total_pages = response.get('totalPages', 1)
            record_count = response.get('recordCount', 0)
            rows = response.get('rows', [])
            
            print(f"Page {page}/{total_pages}: Retrieved {len(rows)} facilities")
            print(f"Total records in response: {record_count}")
            
            if len(rows) == 0 and page == 1:
                print("\nNo facilities found. Response data:")
                print(json.dumps(response, indent=2)[:500])  # Print first 500 chars
            
            # Transform and add facilities
            for facility in rows:
                all_facilities.append(transform_facility(facility))
            
            # Check if we're done
            if page >= total_pages or len(rows) == 0:
                break
            
            page += 1
            time.sleep(0.5)  # Be nice to the API
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            break
        except Exception as e:
            print(f"Unexpected error on page {page}: {e}")
            import traceback
            traceback.print_exc()
            break
    
    return all_facilities

def fetch_all_oregon_facilities() -> List[Dict[str, Any]]:
    """Fetch all Oregon facilities."""
    return fetch_all_facilities_for_state(OREGON_STATE_ID, PORTLAND_COORDS, "Oregon")

def fetch_washington_facilities() -> List[Dict[str, Any]]:
    """
    Fetch Washington facilities and filter for target cities.
    """
    all_wa_facilities = fetch_all_facilities_for_state(WASHINGTON_STATE_ID, SEATTLE_COORDS, "Washington")
    
    # Filter for target cities
    filtered_facilities = []
    for facility in all_wa_facilities:
        city = facility.get('address', {}).get('city', '')
        if any(target_city.lower() in city.lower() for target_city in WASHINGTON_TARGET_CITIES):
            filtered_facilities.append(facility)
    
    print(f"\nFiltered Washington facilities: {len(filtered_facilities)} out of {len(all_wa_facilities)} total")
    print("Cities included:")
    cities = set(f['address']['city'] for f in filtered_facilities if f.get('address', {}).get('city'))
    for city in sorted(cities):
        count = sum(1 for f in filtered_facilities if f.get('address', {}).get('city') == city)
        print(f"  - {city}: {count}")
    
    return filtered_facilities

def save_to_supabase(facilities: List[Dict[str, Any]]) -> None:
    """
    Upsert facilities to Supabase. Reads SUPABASE_URL and SUPABASE_ANON_KEY
    from environment variables.
    """
    import os
    from supabase import create_client

    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_ANON_KEY')
    if not url or not key:
        print("SUPABASE_URL or SUPABASE_ANON_KEY not set — skipping Supabase upload.")
        return

    client = create_client(url, key)

    records = [{
        'id': str(f['id']),
        'name': f['name'],
        'name_secondary': f.get('name_secondary'),
        'address': f.get('address'),
        'contact': f.get('contact'),
        'location': f.get('location'),
        'facility_type': f.get('facility_type'),
        'services': f.get('services'),
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
    } for f in facilities]

    batch_size = 50
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        client.table('facilities').upsert(batch).execute()
        print(f"  Supabase: uploaded {i + 1}–{min(i + batch_size, len(records))} of {len(records)}")

    print(f"Supabase: {len(records)} facilities upserted.")


def save_facilities(facilities: List[Dict[str, Any]], filename: str = "oregon_sud_facilities.json"):
    """
    Save facilities to a JSON file.
    
    Args:
        facilities: List of facility dictionaries
        filename: Output filename
    """
    oregon_count = sum(1 for f in facilities if f.get('address', {}).get('state') == 'OR')
    washington_count = sum(1 for f in facilities if f.get('address', {}).get('state') == 'WA')
    
    output = {
        'metadata': {
            'states': 'Oregon and Washington',
            'oregon_facilities': oregon_count,
            'washington_facilities': washington_count,
            'total_facilities': len(facilities),
            'source': 'SAMHSA FindTreatment.gov API',
            'api_url': BASE_URL,
            'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'washington_cities_included': WASHINGTON_TARGET_CITIES
        },
        'facilities': facilities
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved {len(facilities)} facilities to {filename}")

def main():
    """Main execution function."""
    print("Fetching Oregon and Washington substance use disorder treatment facilities...")
    print(f"API: {BASE_URL}")
    print("Note: SSL verification is disabled due to government site certificate issues")
    print("-" * 60)
    
    # Fetch Oregon facilities
    oregon_facilities = fetch_all_oregon_facilities()
    
    # Fetch Washington facilities (filtered for target cities)
    washington_facilities = fetch_washington_facilities()
    
    # Combine all facilities
    all_facilities = oregon_facilities + washington_facilities
    
    print("-" * 60)
    print(f"Total Oregon facilities: {len(oregon_facilities)}")
    print(f"Total Washington facilities: {len(washington_facilities)}")
    print(f"Total facilities retrieved: {len(all_facilities)}")
    
    # Save to JSON and Supabase
    output_file = "oregon_sud_facilities.json"
    save_facilities(all_facilities, output_file)
    save_to_supabase(all_facilities)
    
    # Print summary statistics
    print("\n=== SUMMARY ===")
    
    # Count by facility type
    type_counts = {}
    med_counts = {}
    
    for facility in facilities:
        ftype = facility.get('facility_type', 'Unknown')
        type_counts[ftype] = type_counts.get(ftype, 0) + 1
        
        # Count medication availability
        medications = facility.get('services', {}).get('medications', [])
        for med in medications:
            med_counts[med] = med_counts.get(med, 0) + 1
    
    print(f"\nFacility Types:")
    for ftype, count in sorted(type_counts.items()):
        type_name = {
            'SA': 'Substance Abuse',
            'MH': 'Mental Health',
            'BOTH': 'Both SA & MH'
        }.get(ftype, ftype)
        print(f"  {type_name}: {count}")
    
    if med_counts:
        print(f"\nTop Medications Offered:")
        for med, count in sorted(med_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {med}: {count} facilities")
    
    print(f"\nData saved to: {output_file}")
    print("Ready for use in your web application!")

if __name__ == "__main__":
    main()
