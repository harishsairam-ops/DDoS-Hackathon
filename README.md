
# Bot Traffic Detection Platform

A complete web-based security project to detect and block bot traffic in real-time. This system monitors traffic to a demo carpenter shop website and provides a dashboard for visualization and control.

## 🏗️ Project Structure

```
DDoS-Hackathon/
├── Demo_website/          # Demo website (protected target)
│   ├── index.html
│   └── styles.css
├── security-platform/       # Security monitoring system
│   ├── backend/            # Flask API + Bot Detection
│   │   ├── app.py         # Main Flask application
│   │   ├── detector.py    # Bot detection logic
│   │   └── store.py       # In-memory data storage
│   └── frontend/          # React Dashboard
│       └── src/
├── bot-simulator/          # Traffic simulation tool
│   └── attack_sim.py
└── README.md
```

## 🚀 Quick Start Guide

### Prerequisites

- **Python 3.8+** (for backend and bot simulator)
- **Node.js 16+** (for React frontend)
- **pip** (Python package manager)
- **npm** (Node package manager)

### Step 1: Install Backend Dependencies

```bash
cd security-platform/backend
pip install flask flask-cors
```

### Step 2: Install Frontend Dependencies

```bash
cd security-platform/frontend
npm install
```

### Step 3: Install Bot Simulator Dependencies

```bash
cd bot-simulator
pip install requests
```

## 🎯 Running the Application

You'll need **3 terminal windows** to run the complete system:

### Terminal 1: Start the Backend Server

```bash
cd security-platform/backend
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

> **Note:** The backend serves both the carpenter shop website (on `/`) and the security API (on `/api/*`)

### Terminal 2: Start the Frontend Dashboard

```bash
cd security-platform/frontend
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Terminal 3: Run the Bot Simulator (Optional)

```bash
cd bot-simulator
python attack_sim.py
```

**Interactive Menu:**
```
Select Simulation Mode:
1. Normal Traffic (Slow, Valid UAs)
2. Bot Attack (Fast, Bad UAs)
3. Mixed Traffic (Concurrent streams)
Enter mode (1/2/3):
```

Or run directly with a mode:
```bash
python attack_sim.py 1  # Normal traffic
python attack_sim.py 2  # Bot attack
python attack_sim.py 3  # Mixed traffic
```

## 📊 Accessing the Application

| Component | URL | Description |
|-----------|-----|-------------|
| **Demo Website** | http://localhost:5000/ | Demo website being protected |
| **Security Dashboard** | http://localhost:5173/ | Real-time monitoring dashboard |
| **Backend API** | http://localhost:5000/api/stats | API endpoints |

## 🎮 How to Use

### 1. Monitor Normal Traffic

1. Open the **Security Dashboard** at http://localhost:5173/
2. Open the **Demo Website** at http://localhost:5000/ in another tab
3. Browse the Demo Website normally
4. Watch the dashboard update with traffic logs

### 2. Simulate Bot Attacks

1. Run the bot simulator in Terminal 3
2. Choose mode **2** (Bot Attack) or **3** (Mixed Traffic)
3. Watch the dashboard detect and flag suspicious traffic
4. See IPs get auto-blocked when rate limits are exceeded

### 3. Block/Unblock IPs

- **Auto-blocking:** IPs are automatically blocked when they exceed rate limits
- **Manual blocking:** Use the "Block" button on the dashboard for any IP
- **Unblocking:** Use the "Unblock" button to restore access

## 🔍 Features

### Bot Detection Methods

1. **User-Agent Analysis** - Detects suspicious or bot-like user agents
2. **Rate Limiting** - Blocks IPs making too many requests per minute
3. **Request Pattern Analysis** - Identifies abnormal traffic patterns

### Dashboard Features

- **Real-time Traffic Table** - Shows all incoming requests
- **Bot Detection List** - Displays detected bots with reasons
- **Statistics Panel** - Total requests, blocked IPs, detected bots
- **IP Management** - Block/unblock IPs with one click
- **Threat Level Indicators** - Color-coded (LOW/MEDIUM/HIGH)

## 🛠️ Configuration

### Backend Configuration

Edit `security-platform/backend/app.py`:
- **Port:** Line 128 - `app.run(port=5000, debug=True)`
- **CORS:** Line 9 - Configure allowed origins

### Rate Limiting

Edit `security-platform/backend/detector.py`:
- Adjust rate limit thresholds
- Modify bot detection patterns

### Frontend Configuration

Edit `security-platform/frontend/src/App.jsx`:
- **API URL:** Update fetch URLs if backend port changes
- **Refresh Rate:** Modify polling interval

## 🧪 Testing Scenarios

### Scenario 1: Normal User Behavior
```bash
python attack_sim.py 1
```
- Slow requests (1 second delay)
- Valid user agents
- Should NOT be blocked

### Scenario 2: Bot Attack
```bash
python attack_sim.py 2
```
- Fast requests (0.1 second delay)
- Suspicious user agents
- Should be detected and blocked

### Scenario 3: Mixed Traffic
```bash
python attack_sim.py 3
```
- Concurrent normal and bot traffic
- Tests detection accuracy
- Demonstrates real-world scenario

## 📝 API Endpoints

### GET `/api/stats`
Returns traffic statistics and logs

**Response:**
```json
{
  "total_requests": 150,
  "blocked_ips": 5,
  "detected_bots": 12,
  "logs": [...],
  "detections": {...}
}
```

### POST `/api/block`
Manually block an IP address

**Request:**
```json
{
  "ip": "192.168.1.100"
}
```

### POST `/api/unblock`
Unblock an IP address

**Request:**
```json
{
  "ip": "192.168.1.100"
}
```

## 🐛 Troubleshooting

### Backend won't start
- **Error:** `ModuleNotFoundError: No module named 'flask'`
- **Solution:** Run `pip install flask flask-cors`

### Frontend won't start
- **Error:** `Cannot find module`
- **Solution:** Run `npm install` in the frontend directory

### Bot simulator fails
- **Error:** `Connection refused`
- **Solution:** Make sure the backend is running on port 5000

### Dashboard shows no data
- **Issue:** Dashboard is empty
- **Solution:** 
  1. Check if backend is running
  2. Verify API URL in frontend code
  3. Check browser console for CORS errors

### Port already in use
- **Error:** `Address already in use`
- **Solution:** 
  - Kill the process using the port
  - Or change the port in the configuration

## 🎓 Hackathon Tips

1. **Demo Flow:**
   - Start with clean dashboard
   - Show normal traffic first
   - Launch bot attack
   - Show real-time detection
   - Demonstrate blocking feature

2. **Key Talking Points:**
   - Real-time detection and visualization
   - Explainable AI (shows detection reasons)
   - Low latency response
   - Easy IP management

3. **Potential Enhancements:**
   - Add machine learning for better detection
   - Implement IP reputation scoring
   - Add geographic visualization
   - Create alert notifications
   - Export traffic reports

## 📄 License

This project is for educational and hackathon purposes.

# DDoS-Hackathon
>>>>>>> 862a8e46ba0ab110bd8da0acf721a09c8503308c
