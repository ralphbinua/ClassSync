import os
from dotenv import load_dotenv

load_dotenv()  # reads .env into environment variables

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]