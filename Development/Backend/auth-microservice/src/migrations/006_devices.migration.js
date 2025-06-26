module.exports = {
    version: 6,
    name: 'create_devices_table',
    up: `
      CREATE TABLE devices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        device_id TEXT UNIQUE NOT NULL,
        user_agent TEXT,
        last_seen_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX idx_devices_user_id ON devices(user_id);
      CREATE INDEX idx_devices_device_id ON devices(device_id);
    `,
    down: `DROP TABLE IF EXISTS devices;`
};