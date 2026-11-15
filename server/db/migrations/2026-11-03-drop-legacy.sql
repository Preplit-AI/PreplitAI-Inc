-- Drop tables left over from the earlier product.
--
-- The pilot is Learn and Remember: courses, lectures, cards, review_logs.
-- Video lectures, podcasts, credits, Stripe subscriptions, grounded chat,
-- uploaded-document RAG and the analytics dashboard were removed on 2026-11-03.
-- These tables are no longer read or written by any code.
--
-- THIS SCRIPT IS NOT RUN AUTOMATICALLY AND DESTROYS DATA.
--
-- Before running it:
--   1. Take a backup: pg_dump "$DATABASE_URL" > before-drop-legacy.sql
--   2. Confirm nothing reads these tables:
--        grep -rnE "spaces|documents|generated_outputs|credit_|subscription|usage_events|chat_" server/ --include=*.js
--
-- Run with:  psql "$DATABASE_URL" -f server/db/migrations/2026-11-03-drop-legacy.sql

BEGIN;

DROP TABLE IF EXISTS study_activities;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS document_chunks;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS generated_outputs;
DROP TABLE IF EXISTS user_uploads;
DROP TABLE IF EXISTS spaces;

DROP TABLE IF EXISTS usage_events;
DROP TABLE IF EXISTS billing_periods;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS plan_capabilities;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS capabilities;
DROP TABLE IF EXISTS provider_models;
DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS credit_reservations;
DROP TABLE IF EXISTS credit_transactions;
DROP TABLE IF EXISTS credit_packages;

DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS oauth_accounts;
DROP TABLE IF EXISTS password_reset_tokens;

ALTER TABLE users DROP COLUMN IF EXISTS credit_balance;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;

COMMIT;
