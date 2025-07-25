-- Create database if not exists
SELECT 'CREATE DATABASE hub_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hub_db');

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hub_db TO postgres;