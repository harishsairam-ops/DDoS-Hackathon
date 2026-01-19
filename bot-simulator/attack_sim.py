import requests
import time
import random
import threading
import sys

TARGET_URL = "http://localhost:5000/"

USER_AGENTS = {
    'normal': [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
    ],
    'bot': [
        "BadBot/1.0",
        "SuperSpider",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) - just kidding",
        "Python/3.9 requests",
        "Scraper v0.1"
    ]
}

def generate_ip():
    return f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"

def send_traffic(traffic_type, count, delay):
    print(f"Starting {traffic_type} traffic simulation...")
    
    # Keep the same IP for a session to simulate a user/bot
    ip = generate_ip()
    
    for i in range(count):
        try:
            ua = random.choice(USER_AGENTS[traffic_type])
            headers = {
                'User-Agent': ua,
                'X-Mock-IP': ip
            }
            
            response = requests.get(TARGET_URL, headers=headers)
            status = response.status_code
            print(f"[{traffic_type.upper()}] IP={ip} Status={status}")
            
            if status == 403:
                print(f"[{traffic_type.upper()}] IP={ip} BLOCKED!")
                break # Stop if blocked
                
            time.sleep(delay)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    print("Select Simulation Mode:")
    print("1. Normal Traffic (Slow, Valid UAs)")
    print("2. Bot Attack (Fast, Bad UAs)")
    print("3. Mixed Traffic (Concurrent streams)")
    
    if len(sys.argv) > 1:
        mode = sys.argv[1]
    else:
        mode = input("Enter mode (1/2/3): ")

    if mode == '1':
        send_traffic('normal', 20, 1.0)
    elif mode == '2':
        send_traffic('bot', 50, 0.1) # Fast rate
    elif mode == '3':
        # Launch multiple threads
        t1 = threading.Thread(target=send_traffic, args=('normal', 20, 1.0))
        t2 = threading.Thread(target=send_traffic, args=('bot', 50, 0.1))
        t3 = threading.Thread(target=send_traffic, args=('bot', 50, 0.2)) # Another bot
        
        t1.start()
        t2.start()
        t3.start()
        
        t1.join()
        t2.join()
        t3.join()
    else:
        print("Invalid mode")
