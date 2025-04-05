from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import json
from queue import Queue
import threading

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
data_queue = Queue()

@app.route('/')
def index():
    return "Backend server is running! Use /receive and /stream endpoints."

@app.route('/receive', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        print(">>> Вызван receive_data")
        print(">>> Полученные данные:", data)

        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['ip address', 'Latitude', 'Longitude', 'Timestamp', 'suspicious']
        for field in required_fields:
            if field not in data:
                print(f"!!! Отсутствует поле: {field}")
                return jsonify({"error": f"Missing field: {field}"}), 400

        data_queue.put(data)
        print(">>> Данные помещены в очередь")
        return jsonify({"status": "received"})

    except Exception as e:
        print("!!! Ошибка:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/stream')
def stream():
    def event_stream():
        while True:
            if not data_queue.empty():
                data = data_queue.get()
                yield f"data: {json.dumps(data)}\n\n"
    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True)