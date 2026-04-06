import os

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "harbor_of_hope")
DB_USER = os.environ.get("DB_USER", "waylansmac")
DB_PASS = os.environ.get("DB_PASS", "")
CONNECTION_STRING = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
