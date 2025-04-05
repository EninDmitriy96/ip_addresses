import csv
import time
import json
import requests
from datetime import datetime

def send_packages():
    with open('/data/ip_addresses.csv', 'r') as f:
        reader = csv.DictReader(f)
        packages = [row for row in reader]
        print("Loaded packages:", len(packages))
    
    # Sort by timestamp
    packages.sort(key=lambda x: int(x['Timestamp']))
    
    start_time = datetime.now().timestamp()
    print("Start sending packages...")
    for pkg in packages:
        current_time = datetime.now().timestamp()
        pkg_time = int(pkg['Timestamp'])
        # Calculate delay
        delay = (pkg_time - (current_time - start_time)) * 10 ** -9
        if delay > 0:
            time.sleep(delay)
        
        # Send request
        # Замените блок отправки запроса на:
        response = requests.post(  # Используем POST вместо GET
            'http://backend:5000/receive',
            json=pkg,  # Отправляем данные как JSON в теле запроса
            timeout=5
        )
        print(f"Sent package: {pkg['ip address']} - Status: {response.status_code}")

if __name__ == "__main__":
    send_packages()