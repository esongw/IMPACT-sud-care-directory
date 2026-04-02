#!/usr/bin/env python3
"""
One-time script to upload oregon_sud_facilities.json to Supabase.
Run with SUPABASE_URL and SUPABASE_ANON_KEY set as environment variables.
"""
import json
import os
from supabase import create_client

SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_ANON_KEY']

client = create_client(SUPABASE_URL, SUPABASE_KEY)

with open('oregon_sud_facilities.json', encoding='utf-8') as f:
    data = json.load(f)

facilities = data['facilities']
print(f"Uploading {len(facilities)} facilities to Supabase...")

records = [{
    'id': str(f['id']),
    'name': f['name'],
    'name_secondary': f.get('name_secondary'),
    'address': f.get('address'),
    'contact': f.get('contact'),
    'location': f.get('location'),
    'facility_type': f.get('facility_type'),
    'services': f.get('services'),
} for f in facilities]

batch_size = 50
for i in range(0, len(records), batch_size):
    batch = records[i:i + batch_size]
    client.table('facilities').upsert(batch).execute()
    print(f"  Uploaded {i + 1}–{min(i + batch_size, len(records))} of {len(records)}")

print(f"Done. {len(records)} facilities uploaded.")
