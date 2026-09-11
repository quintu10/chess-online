CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_player_id UUID REFERENCES users(id),
    black_player_id UUID REFERENCES users(id),
    time_control VARCHAR(20) NOT NULL,
    increment INTEGER NOT NULL DEFAULT 0,
    white_time INTEGER NOT NULL,
    black_time INTEGER NOT NULL,
    board_state JSONB NOT NULL,
    turn VARCHAR(10) NOT NULL CHECK(turn in ('white', 'black')),
    status VARCHAR(10) NOT NULL
        CHECK(status IN ('WAITING','PLAYING','FINISHED')),
    result VARCHAR(10)
        CHECK(result IN ('WHITE','BLACK','DRAW')),
    result_reason VARCHAR(20)
        CHECK(result_reason IN ('CHECKMATE', 'TIMEOUT', 'RESIGNATION', 'DRAW')),
    last_move_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);