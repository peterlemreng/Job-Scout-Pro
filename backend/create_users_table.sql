CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  premium_status VARCHAR(50) DEFAULT 'inactive',
  ad_post_credits INT DEFAULT 0,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  email_verification_code VARCHAR(10) DEFAULT NULL,
  email_verification_expires_at DATETIME DEFAULT NULL,
  phone_verified TINYINT(1) NOT NULL DEFAULT 0,
  phone_verification_code VARCHAR(10) DEFAULT NULL,
  phone_verification_expires_at DATETIME DEFAULT NULL,
  password_reset_otp VARCHAR(10) DEFAULT NULL,
  password_reset_expires_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
