CREATE DATABASE IF NOT EXISTS inz_dev;

-- Create the user with a password
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';

-- Grant privileges on the database
GRANT ALL PRIVILEGES ON inz_dev.* TO 'user'@'%';

-- Apply the changes
FLUSH PRIVILEGES;