import numpy as np
import ml_engine
from store import block_ip, is_blocked, ip_stats

SUSPICIOUS_USER_AGENTS = [
    "Bot", "Crawler", "Spider", "Scraper", "Python", "curl", "wget"
]

RATE_LIMIT_THRESHOLD = 50  # requests per minute

def analyze_request(ip, headers):
    """
    Analyzes the request for bot-like behavior.
    Returns (verdict, reason, ml_score).
    Verdict: 'ALLOW', 'BLOCK', 'MONITOR'
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
    
    return 'ALLOW', 'Clean', ml_confidence

def check_rate_limit(ip, request_count):
    if request_count > RATE_LIMIT_THRESHOLD:
        return True
    return False
