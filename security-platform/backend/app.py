import time
import os
from flask import Flask, request, jsonify, send_from_directory, abort, make_response
from flask_cors import CORS
from store import traffic_logs, blocked_ips, bot_detections, add_log, record_request, block_ip, unblock_ip, is_blocked, add_detection
from detector import analyze_request, check_rate_limit

app = Flask(__name__)
CORS(app)  # Allow React frontend to access API

# Configuration
CARPENTER_SHOP_DIR = os.path.abspath("../../carpenter-shop")

@app.before_request
def security_middleware():
    # Skip security checks for API routes and static assets for the dashboard if we were serving it
    if request.path.startswith('/api'):
        return

    # For demo purposes, allow mocking the IP via header
    client_ip = request.headers.get('X-Mock-IP', request.remote_addr)
    headers = request.headers
    
    # 1. Update Stats
    req_count = record_request(client_ip, request.path)
    
    # 2. Check Blocklist
    if is_blocked(client_ip):
        add_log({
            'timestamp': time.time(),
            'ip': client_ip,
            'path': request.path,
            'method': request.method,
            'user_agent': headers.get('User-Agent', 'Unknown'),
            'status': 403,
            'threat_level': 'HIGH',
            'ml_score': 1.0
        })
        abort(403, description="Access Denied: Your IP has been flagged as a bot.")

    # 3. Analyze Request
    verdict, reason, ml_score = analyze_request(client_ip, headers)
    
    # 4. Check Rate Limit
    rate_limited, limit_reason = check_rate_limit(client_ip, req_count)
    if rate_limited:
        verdict = 'SUSPICIOUS'
        reason = limit_reason
        ml_score = max(ml_score, 0.9) # High confidence if rate limiting triggers
        # Auto-block on rate limit for demo effect
        block_ip(client_ip, reason)

    if verdict == 'SUSPICIOUS':
        # In a strict mode, we might block immediately. 
        # For demo, let's log it as HIGH threat but maybe still allow if not rate limited?
        # Actually prompt says "Block Bot" button is separate, but auto-block makes for a better demo
        # if the attack is obvious (like rate limit).
        # Let's simple mark it as suspicious log, but only block if rate limit or manual.
        pass

    threat_level = 'LOW'
    if verdict == 'SUSPICIOUS':
        threat_level = 'MEDIUM'
        add_detection(client_ip, reason)
    if is_blocked(client_ip): # Re-check if it got blocked during rate limit check
        threat_level = 'HIGH'
    
    # High ML score = HIGH threat
    if ml_score > 0.8:
        threat_level = 'HIGH'

    # Determine final status
    final_status = 200
    if is_blocked(client_ip):
        final_status = 403

    # Log the request
    from store import ip_stats # ensure we have access
    add_log({
        'timestamp': time.time(),
        'ip': client_ip,
        'path': request.path,
        'method': request.method,
        'user_agent': headers.get('User-Agent', 'Unknown'),
        'status': final_status, 
        'threat_level': threat_level,
        'ml_score': ml_score,
        'geo': ip_stats[client_ip].get('geo')
    })
    
    if is_blocked(client_ip):
        abort(403, description="Access Denied: IP Blocked")

# --- Protected Website Routes ---
@app.route('/')
def serve_index():
    return send_from_directory(CARPENTER_SHOP_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(CARPENTER_SHOP_DIR, filename)

# --- Security Dashboard API ---

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_requests = len(traffic_logs)
    blocked_count = len(blocked_ips)
    bot_count = len(bot_detections)
    
    # Real vs Bot (simplified: blocked/suspicious = bot)
    # real_reqs = sum(1 for log in traffic_logs if log['threat_level'] == 'LOW')
    # bot_reqs = total_requests - real_reqs
    
    return jsonify({
        'total_requests': total_requests,
        'blocked_ips': blocked_count,
        'blocked_ips_list': list(blocked_ips),
        'detected_bots': bot_count,
        'logs': list(traffic_logs),
        'detections': bot_detections
    })

@app.route('/api/block', methods=['POST'])
def manual_block():
    data = request.json
    ip = data.get('ip')
    if ip:
        if block_ip(ip, "Manual Block"):
            return jsonify({'success': True, 'message': f'IP {ip} blocked'})
        return jsonify({'success': False, 'message': 'IP already blocked'})
    return jsonify({'success': False, 'message': 'IP required'}), 400

@app.route('/api/unblock', methods=['POST'])
def manual_unblock():
    data = request.json
    ip = data.get('ip')
    if ip:
        if unblock_ip(ip):
            return jsonify({'success': True, 'message': f'IP {ip} unblocked'})
        return jsonify({'success': False, 'message': 'IP not found'})
    return jsonify({'success': False, 'message': 'IP required'}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
