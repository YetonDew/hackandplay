# Steps to run the backend

0. Go to server folder
```bash
cd server
```

1. Create virtual environment
```bash
python3 -m venv .venv
```

2. Source the env
```bash
source .venv/bin/activate
```

3. Install requirements
```bash
pip install -r requirements.txt
```

4. Run the server (you must be in server folder)
```bash
fastapi dev main.py
```
