CREATE TABLE matchmaking_queue(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_control VARCHAR(20) NOT NULL,
    increment INTEGER NOT NULL,
    initial_time INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);