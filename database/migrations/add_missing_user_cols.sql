-- Add missing columns to users table for OTP and Security
-- Run this against your PostgreSQL database

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_otp VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_otp VARCHAR(10),
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(100),
ADD COLUMN IF NOT EXISTS reset_password_expiry TIMESTAMP;
