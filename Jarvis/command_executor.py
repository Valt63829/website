import sys
import os
import webbrowser
import subprocess

command = sys.argv[1].lower()

# --------------------
# APPLICATION COMMANDS
# --------------------

if command == "open_chrome":
    os.system("start chrome")
    print("Chrome opened")

elif command == "open edge":
    os.system("start msedge")
    print("Edge opened")

elif command == "open notepad":
    os.system("start notepad")
    print("Notepad opened")

elif command == "open calculator":
    os.system("start calc")
    print("Calculator opened")

elif command == "open cmd":
    os.system("start cmd")
    print("Command Prompt opened")

# --------------------
# WEBSITE COMMANDS
# --------------------

elif command == "open youtube":
    webbrowser.open("https://www.youtube.com")
    print("YouTube opened")

elif command == "open google":
    webbrowser.open("https://www.google.com")
    print("Google opened")

elif command == "open whatsapp":
    webbrowser.open("https://web.whatsapp.com")
    print("WhatsApp Web opened")

elif command == "open github":
    webbrowser.open("https://github.com")
    print("GitHub opened")

# --------------------
# SYSTEM CONTROLS
# --------------------

elif command == "lock pc":
    os.system("rundll32.exe user32.dll,LockWorkStation")
    print("PC Locked")

elif command == "restart":
    print("Restart blocked for safety")

elif command == "shutdown":
    print("Shutdown blocked for safety")

# --------------------
# VOLUME CONTROL (Basic)
# --------------------

elif command == "volume up":
    for _ in range(5):
        os.system("nircmd.exe changesysvolume 2000")
    print("Volume Increased")

elif command == "volume down":
    for _ in range(5):
        os.system("nircmd.exe changesysvolume -2000")
    print("Volume Decreased")

# --------------------
# FILE EXPLORER
# --------------------

elif command == "open downloads":
    os.system("start C:\Users\shaik\Downloads")
    print("Downloads folder opened")

elif command == "open documents":
    os.system("start %USERPROFILE%\\Documents")
    print("Documents folder opened")

# --------------------
# UNKNOWN COMMAND
# --------------------

else:
    print("Unknown command")