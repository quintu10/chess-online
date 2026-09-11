CREATE TABLE game_moves(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES users(id),
    move_number INTEGER NOT NULL,
    from_position VARCHAR(10) NOT NULL,
    to_position VARCHAR(10) NOT NULL,
    promotion VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);