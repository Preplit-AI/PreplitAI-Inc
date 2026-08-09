const { Pool } = require('pg');

const hasIndividualVars = process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD;

if (!hasIndividualVars && !process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: No database credentials found. Database operations will fail until PG credentials or DATABASE_URL are set.');
}

const poolConfig = hasIndividualVars
  ? {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '6543', 10),
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false }
    }
  : {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
      ssl: false
    };

const pool = new Pool(poolConfig);
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

const initializeDatabase = async () => {
  try {
    // Enable pgcrypto extension for gen_random_uuid()
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified_at TIMESTAMPTZ,
        password_hash VARCHAR(255),
        name VARCHAR(255),
        avatar_url TEXT,
        credit_balance INTEGER NOT NULL DEFAULT 100,
        stripe_customer_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMPTZ,
        UNIQUE(provider, provider_account_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        user_agent TEXT,
        ip_address VARCHAR(45)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        credits INTEGER NOT NULL,
        price_cents INTEGER NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'usd',
        stripe_price_id VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        amount INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        reference_type VARCHAR(50),
        reference_id UUID,
        stripe_payment_intent_id VARCHAR(255),
        idempotency_key VARCHAR(255) UNIQUE,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'held',
        reference_type VARCHAR(50),
        reference_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS spaces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL DEFAULT 'course_material',
        upload_method VARCHAR(50) DEFAULT 'file',
        raw_file_url TEXT,
        extracted_text TEXT,
        file_name VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS generated_outputs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        source_document_ids TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // ── V3.0 Enterprise Subscription Architecture Tables ──

    await pool.query(`
      CREATE TABLE IF NOT EXISTS capabilities (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        default_configuration JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id VARCHAR(50) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        annual_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        is_public BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'current',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (id, version)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS plan_capabilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id VARCHAR(50) NOT NULL,
        capability_id VARCHAR(50) REFERENCES capabilities(id) ON DELETE CASCADE,
        enabled BOOLEAN DEFAULT TRUE,
        limit_value INT DEFAULT NULL,
        period VARCHAR(20) DEFAULT 'billing_cycle',
        custom_configuration JSONB DEFAULT '{}'::jsonb,
        UNIQUE(plan_id, capability_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS models (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS provider_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id VARCHAR(50) REFERENCES providers(id) ON DELETE CASCADE,
        model_id VARCHAR(50) REFERENCES models(id) ON DELETE CASCADE,
        priority INT DEFAULT 1,
        cost_multiplier NUMERIC(10, 4) DEFAULT 1.0000,
        status VARCHAR(20) DEFAULT 'active',
        UNIQUE(provider_id, model_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) NOT NULL,
        plan_version INT NOT NULL DEFAULT 1,
        stripe_subscription_id VARCHAR(255),
        stripe_customer_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        current_period_start TIMESTAMPTZ DEFAULT now(),
        current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month'),
        cancel_at_period_end BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS billing_periods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        period_start TIMESTAMPTZ NOT NULL,
        period_end TIMESTAMPTZ NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS usage_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES subscriptions(id),
        capability_id VARCHAR(50) REFERENCES capabilities(id),
        provider_id VARCHAR(50) REFERENCES providers(id),
        model_id VARCHAR(50) REFERENCES models(id),
        tokens_input INT DEFAULT 0,
        tokens_output INT DEFAULT 0,
        execution_time_ms INT DEFAULT 0,
        internal_cost_units INT DEFAULT 1,
        estimated_cost_usd NUMERIC(10, 6) DEFAULT 0.000000,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(organization_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(255),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gks_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        track VARCHAR(50) DEFAULT 'embassy',
        degree_level VARCHAR(50) DEFAULT 'master',
        country VARCHAR(100),
        target_field VARCHAR(150),
        first_choice_university VARCHAR(150),
        second_choice_university VARCHAR(150),
        third_choice_university VARCHAR(150),
        academic_gpa VARCHAR(50),
        topik_level VARCHAR(20),
        english_score VARCHAR(50),
        english_test_type VARCHAR(50) DEFAULT 'IELTS',
        english_test_score VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gks_manual_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) NOT NULL,
        applicant_name VARCHAR(255) NOT NULL,
        applicant_email VARCHAR(255) NOT NULL,
        target_track VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gks_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID REFERENCES gks_profiles(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'draft',
        readiness_score INT DEFAULT 0,
        evaluation_summary JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gks_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID REFERENCES gks_applications(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255),
        file_url TEXT,
        extracted_text TEXT NOT NULL,
        word_count INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gks_evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID REFERENCES gks_applications(id) ON DELETE CASCADE,
        readiness_score INT NOT NULL,
        narrative_fit_score INT NOT NULL,
        academic_fit_score INT NOT NULL,
        korea_fit_score INT NOT NULL,
        feasibility_score INT NOT NULL,
        document_diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
        action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
        raw_ai_response JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Seed default subscription plans & capabilities if empty
    await pool.query(`
      INSERT INTO subscription_plans (id, version, name, description, monthly_price, annual_price, is_public, status)
      VALUES 
        ('free', 1, 'Free Plan', 'Essential study companion tools', 0.00, 0.00, true, 'current'),
        ('pro', 1, 'Pro Plan', 'Full AI study engine for active students', 19.00, 15.00, true, 'current'),
        ('max', 1, 'Max Plan', 'Unlimited study spaces & reasoning models', 49.00, 39.00, true, 'current')
      ON CONFLICT (id, version) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO capabilities (id, name, description, category)
      VALUES
        ('ai.chat', 'Grounded RAG Chat', 'Ask questions grounded in uploaded documents', 'AI'),
        ('ai.quiz', 'Quiz Generator', 'Generate fill-in-the-blank & multiple choice quizzes', 'AI'),
        ('ai.flashcards', 'Flashcard Generator', 'Generate front-and-back study flashcards', 'AI'),
        ('ai.summary', 'Summary Generator', 'Generate chapter summaries & key points', 'AI'),
        ('ai.podcast', 'Podcast Generator', 'Generate two-speaker educational dialogue', 'AI'),
        ('ai.expected_exam', 'Predicted Exam Questions', 'Pattern match past exams against course material', 'AI'),
        ('ai.video', 'Video Lecture Engine', 'Generate full video lectures from notes', 'AI'),
        ('export.pdf', 'Export PDF', 'Export generated study sets to PDF', 'Export')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Database initialized successfully with PreplitAI V3.0 Enterprise Subscription Architecture');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

initializeDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
