from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import webbrowser
import datetime
import subprocess
import psutil   # ✅ NEW

app = Flask(__name__)
CORS(app)

@app.route("/command", methods=["POST"])
def execute_command():
    command = request.json.get("command", "").lower().strip()

    print("Received:", command)

    # 🔹 Open Applications
    if command == "open chrome":
        os.system("start chrome")
        return jsonify({"message": "Opening Chrome 🚀"})

    elif command == "open edge":
        os.system("start msedge")
        return jsonify({"message": "Opening Microsoft Edge 🌐"})

    elif command == "open notepad":
        os.system("start notepad")
        return jsonify({"message": "Opening Notepad 📝"})

    elif command == "open calculator":
        os.system("start calc")
        return jsonify({"message": "Opening Calculator 🧮"})

    elif command == "open vscode":
        os.system("code")
        return jsonify({"message": "Opening VS Code 💻"})

    elif command == "open cmd":
        os.system("start cmd")
        return jsonify({"message": "Opening Command Prompt 🖥️"})

    elif command == "open whatsapp":
        os.system("start whatsapp:")
        return jsonify({"message": "Opening WhatsApp 💬"})

    # 🔹 Open Websites
    elif command == "open youtube":
        webbrowser.open("https://youtube.com")
        return jsonify({"message": "Opening YouTube ▶️"})

    elif command == "open google":
        webbrowser.open("https://google.com")
        return jsonify({"message": "Opening Google 🌍"})

    elif command == "open github":
        webbrowser.open("https://github.com")
        return jsonify({"message": "Opening GitHub 🧑‍💻"})

    elif command == "open instagram":
        webbrowser.open("https://instagram.com")
        return jsonify({"message": "Opening Instagram 📸"})

    elif command == "open facebook":
        webbrowser.open("https://facebook.com")
        return jsonify({"message": "Opening Facebook 👥"})

    elif command == "open chatgpt":
        webbrowser.open("https://chat.openai.com")
        return jsonify({"message": "Opening ChatGPT 🤖"})

    # 🔹 System Info
    elif command == "time":
        ist = pytz.timezone('Asia/Kolkata')
        now = datetime.datetime.now().strftime("%I:%M %p")
        return jsonify({"message": f"Current time is {now} ⏰"})

    elif command == "date":
        today = datetime.date.today().strftime("%B %d, %Y")
        return jsonify({"message": f"Today's date is {today} 📅"})

    elif command == "system info":
        return jsonify({"message": os.name})

    # 🔋 Battery Status (NEW FEATURE)
    elif command == "battery":
        battery = psutil.sensors_battery()
        if battery:
            percent = battery.percent
            charging = battery.power_plugged

            if charging:
                return jsonify({"message": f"Battery is {percent}% and charging 🔌"})
            else:
                return jsonify({"message": f"Battery is {percent}% and not charging 🔋"})
        else:
            return jsonify({"message": "Battery information not available ⚠️"})

    # 🔹 Search Command
    elif command.startswith("search "):
        query = command.replace("search ", "")
        webbrowser.open(f"https://www.google.com/search?q={query}")
        return jsonify({"message": f"Searching for {query} 🔍"})

    # 🔹 Play on YouTube
    elif command.startswith("play "):
        query = command.replace("play ", "")
        webbrowser.open(f"https://www.youtube.com/results?search_query={query}")
        return jsonify({"message": f"Playing {query} on YouTube 🎵"})

        # 🔹 Shutdown System
    elif command == "shutdown":
        os.system("shutdown /s /t 1")
        return jsonify({"message": "Shutting down system 💻⚡"})

    # 🔹 Restart System
    elif command == "restart":
        os.system("shutdown /r /t 1")
        return jsonify({"message": "Restarting system 🔄"})

    # 🔹 Sleep Mode
    elif command == "sleep":
        os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        return jsonify({"message": "System going to sleep 😴"})

    # 🔹 Sign Out / Log Off
    elif command == "sign out" or command == "logout":
        os.system("shutdown -l")
        return jsonify({"message": "Signing out user 👋"})

    else:
        return jsonify({"message": "Command not recognized 🤖"})

if __name__ == "__main__":

    app.run(debug=True)
