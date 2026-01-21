import time
from collections import defaultdict, deque
from geo_utils import get_ip_geo

# In-memory storage using simple global variables
# In a real app, this would be Redis/Database

# Traffic Logs: list of {timestamp, ip, path, method, user_agent, status, threat_level, geo}
traffic_logs = deque(maxlen=2000)

# Blocked IPs: set of IPs that are blocked
blocked_ips = set()

# IP Stats: tracking request counts for rate limiting
# {ip: {
#   count: int, 
#   start_time: float, 
#   last_seen: float, 
#   timestamps: deque, 
#   paths: set,
#   geo: dict
# }}
ip_stats = defaultdict(lambda: {
    'count': 0, 
    'start_time': time.time(), 
    'last_seen': time.time(),
    # Increased maxlen for better spike detection history (last 100 reqs)
    'timestamps': deque(maxlen=100), 
    'paths': set(), # unique paths visited
    'geo': None
})

# Bot Detections: list of {ip, reason, timestamp}
bot_detections = []

def add_log(entry):
    traffic_logs.appendleft(entry)

def block_ip(ip, reason="Manual Block"):
    if ip not in blocked_ips:
        blocked_ips.add(ip)
        add_detection(ip, reason)
        return True
    return False

def add_detection(ip, reason):
    # Check if already in detections with same reason to avoid duplicates
    for d in bot_detections:
        if d['ip'] == ip and d['reason'] == reason:
            return
    bot_detections.append({
        'ip': ip,
        'reason': reason,
        'timestamp': time.time()
    })

def unblock_ip(ip):
    if ip in blocked_ips:
        blocked_ips.remove(ip)
        return True
    return False

def is_blocked(ip):
    return ip in blocked_ips

def record_request(ip, path='/'):
    stats = ip_stats[ip]
    now = time.time()
    
    # Reset window if > 1 minute
    if now - stats['start_time'] > 60:
        stats['count'] = 0
        stats['start_time'] = now
    
    if stats['geo'] is None:
        stats['geo'] = get_ip_geo(ip)

    stats['count'] += 1
    stats['last_seen'] = now
    stats['timestamps'].append(now)
    stats['paths'].add(path)
    
    return stats['count']
