CREATE TABLE quiz_tracking (
  session_id TEXT PRIMARY KEY,
  quiz_started BOOLEAN DEFAULT FALSE,
  quiz_completed BOOLEAN DEFAULT FALSE,
  start_timestamp TIMESTAMPTZ,
  completion_timestamp TIMESTAMPTZ
);