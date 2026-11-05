-- Drop the GKS feature's tables.
--
-- The GKS application-evaluation feature was removed from Preplit AI because it
-- is not part of the product described in the business plan — GKS appears there
-- only as a description of the founders ("GKS scholar"), never as a capability.
-- The pages, routes and API surface were removed on 2026-10-28.
--
-- THIS SCRIPT IS NOT RUN AUTOMATICALLY AND DESTROYS DATA.
--
-- Before running it:
--   1. Take a backup, or export anything you want to keep:
--        \copy (SELECT * FROM gks_applications) TO 'gks_applications.csv' CSV HEADER
--      (repeat per table)
--   2. Confirm nothing still reads these tables:
--        grep -rn "gks_" server/ --include=*.js
--
-- Run with:  psql "$DATABASE_URL" -f server/db/migrations/2026-10-28-drop-gks.sql

BEGIN;

-- Child tables first; each references gks_profiles or gks_applications.
DROP TABLE IF EXISTS gks_evaluations;
DROP TABLE IF EXISTS gks_documents;
DROP TABLE IF EXISTS gks_manual_reviews;
DROP TABLE IF EXISTS gks_applications;
DROP TABLE IF EXISTS gks_profiles;

COMMIT;
