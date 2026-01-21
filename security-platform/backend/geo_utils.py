import hashlib

# High-Precision Continent Bounding Boxes (Lat, Lon)
# These are narrowed down to more land-heavy areas to avoid ocean markers in the demo.
CONTINENTS = {
    'NA': {'name': 'North America', 'lat': [30, 48], 'lon': [-118, -80]}, # Mostly USA
    'SA': {'name': 'South America', 'lat': [-25, -5], 'lon': [-65, -45]},  # Brazil area
    'EU': {'name': 'Europe',        'lat': [45, 55], 'lon': [5, 25]},     # Western/Central Europe
    'AF': {'name': 'Africa',        'lat': [0, 15], 'lon': [10, 30]},     # Central Africa
    'AS': {'name': 'Asia',          'lat': [20, 45], 'lon': [80, 120]},    # China/India area
    'OC': {'name': 'Oceania',       'lat': [-33, -25], 'lon': [135, 150]}, # SE Australia
}

CONTINENT_KEYS = list(CONTINENTS.keys())

def get_ip_geo(ip):
    """
    Deterministically maps an IP to a continent and specific Lat/Lon.
    Returns: { 'continent': str, 'lat': float, 'lng': float, 'name': str }
    """
    if ip == '127.0.0.1' or ip == 'localhost':
        # Localhost -> Main Data Center (Ashburn, VA)
        return {'continent': 'US', 'lat': 39.0438, 'lng': -77.4874, 'name': 'DC01-ASHBURN'}

    # Use hash of IP to get consistent random numbers
    hash_val = int(hashlib.md5(ip.encode()).hexdigest(), 16)
    
    # Select Continent
    continent_idx = hash_val % len(CONTINENT_KEYS)
    code = CONTINENT_KEYS[continent_idx]
    cont = CONTINENTS[code]
    
    # Generate Lat/Lon within range
    lat_range = cont['lat']
    lon_range = cont['lon']
    
    # Re-hash for coordinate randomness
    lat_hash = (hash_val >> 4) % 1000 / 1000.0
    lon_hash = (hash_val >> 8) % 1000 / 1000.0
    
    lat = lat_range[0] + lat_hash * (lat_range[1] - lat_range[0])
    lng = lon_range[0] + lon_hash * (lon_range[1] - lon_range[0])
    
    return {
        'continent': code,
        'name': cont['name'],
        'lat': lat,
        'lng': lng
    }
