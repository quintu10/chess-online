CREATE TABLE google_pending_users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    google_id TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)