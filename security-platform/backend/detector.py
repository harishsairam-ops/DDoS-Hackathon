import time
import numpy as np
import ml_engine
from store import block_ip, is_blocked, ip_stats

SUSPICIOUS_USER_AGENTS = [
    "Bot", "Crawler", "Spider", "Scraper", "Python", "curl", "wget"
]

RATE_LIMIT_THRESHOLD = 50  # requests per minute
SPIKE_THRESHOLD = 5        # requests in last 2 seconds (aggressive burst)

def analyze_request(ip, headers):
    """
    Analyzes the request for bot-like behavior.
    Returns (verdict, reason, ml_score).
    Verdict: 'ALLOW', 'BLOCK', 'MONITOR', 'SUSPICIOUS'
    """
    if is_blocked(ip):
        return 'BLOCK', 'IP is already blocked', 1.0

    user_agent = headers.get('User-Agent', '')
    stats = ip_stats[ip]
    
    # --- Feature Extraction for ML ---
    # 1. Request Rate
    req_rate = stats['count']
    
    # 2. Path Diversity
    unique_paths = len(stats['paths'])
    total_reqs = max(1, req_rate) # avoid div by zero locally
    path_diversity = unique_paths / total_reqs
    
    # 3. User Agent Score
    ua_score = 1.0
    for agent in SUSPICIOUS_USER_AGENTS:
        if agent.lower() in user_agent.lower():
            ua_score = 0.0
            break
            
    # 4. Avg Time Diff
    time_diffs = []
    timestamps = list(stats['timestamps'])
    if len(timestamps) > 1:
        for i in range(1, len(timestamps)):
            time_diffs.append(timestamps[i] - timestamps[i-1])
        avg_time_diff = sum(time_diffs) / len(time_diffs)
    else:
        avg_time_diff = 10.0 # default generous value
        
    features = [req_rate, path_diversity, ua_score, avg_time_diff]
    
    # --- ML Prediction ---
    is_bot_ml, ml_confidence = ml_engine.predict_bot(features)
    
    # --- Rule-based Checks ---
    # Check 1: Suspicious User-Agent
    if ua_score == 0.0:
        return 'SUSPICIOUS', f'Suspicious User-Agent: {user_agent}', 0.95

    # If ML is very confident, flag it
    if is_bot_ml and ml_confidence > 0.8:
        return 'SUSPICIOUS', f'ML Detection (Confidence: {ml_confidence:.2f})', ml_confidence
    
    # Check 2: Coordinated Attack (Multiple IPs, same target, same time)
    if detect_coordinated_attack(ip):
        return 'SUSPICIOUS', 'Coordinated Attack Detected (DDoS Pattern)', 0.99
    
    return 'ALLOW', 'Clean', ml_confidence

def detect_traffic_spike(ip):
    """
    Detects sudden bursts of traffic (e.g. 5 reqs in 1 sec).
    """
    stats = ip_stats[ip]
    timestamps = list(stats['timestamps'])
    
    if len(timestamps) < SPIKE_THRESHOLD:
        return False
        
    now = time.time()
    # Check strictly recent requests
    recent_reqs = [t for t in timestamps if now - t < 2.0]
    
    if len(recent_reqs) >= SPIKE_THRESHOLD:
        return True
    return False

def detect_coordinated_attack(current_ip):
    """
    Checks if multiple IPs are hitting the system at once.
    (Simplified logic for demo: High global RPS + many unique IPs)
    """
    # This is expensive in real world, but fine for demo
    now = time.time()
    active_ips = 0
    total_load = 0
    
    for ip, stats in ip_stats.items():
        if now - stats['last_seen'] < 2.0:
            active_ips += 1
            
    # Arbitrary threshold: if > 5 active IPs at once, assume coordination check
    # In reality, this needs subnets/target analysis
    if active_ips > 10: 
        return True
    return False

def check_rate_limit(ip, request_count):
    # 1. Standard Minute Rate Limit
    if request_count > RATE_LIMIT_THRESHOLD:
        return True, f'Rate Limit Exceeded ({request_count} req/min)'
        
    # 2. Sudden Spike Detection
    if detect_traffic_spike(ip):
        return True, 'Sudden Traffic Spike Detected'
        
    return False, None
