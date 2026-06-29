-- Clients table: one row per user of your app
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,           -- client's login email
  email_address TEXT NOT NULL UNIQUE,   -- their assigned @yourdomain.com address
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules table: forwarding rules per client
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                   -- friendly name e.g. "Bank Alerts"
  match_type TEXT DEFAULT 'ANY',        -- ANY = OR logic, ALL = AND logic
  keywords TEXT[],                      -- array of keywords to match
  sender_filter TEXT,                   -- optional: match only from this sender
  destination JSONB NOT NULL,           -- array of {type, address} destinations
  priority INTEGER DEFAULT 0,           -- lower number = checked first
  enabled BOOLEAN DEFAULT TRUE,         -- pause without deleting
  schedule JSONB,                       -- optional: {days, start, end}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message log: history of every forwarded email
CREATE TABLE message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES rules(id) ON DELETE SET NULL,
  from_address TEXT NOT NULL,           -- who sent the original email
  subject TEXT,                         -- original email subject
  forwarded_to JSONB,                   -- where it was forwarded
  forwarded_at TIMESTAMPTZ DEFAULT NOW()
);
