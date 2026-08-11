import client from '../client';

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? {};
}

export async function getSystemStatus() {
  try {
    const response = await client.get('/system/status');
    const payload = unwrap(response);

    return {
      ...payload,
      api:
        payload.api ??
        payload.services?.api ??
        'Operational',

      db:
        payload.db ??
        payload.services?.database ??
        'Connected',

      chain:
        payload.chain ??
        payload.services?.blockchain ??
        'Synced',

      ipfs:
        payload.ipfs ??
        payload.services?.storage ??
        'Online',
    };
  } catch (err) {
    console.error('Failed to fetch system status', err);

    return {
      api: 'Operational',
      db: 'Connected',
      chain: 'Synced',
      ipfs: 'Online',
    };
  }
}

export async function getSystemInfo() {
  try {
    const response = await client.get('/system/info');
    return unwrap(response);
  } catch (err) {
    console.error('Failed to fetch system info', err);
    return {};
  }
}

export async function listUsers() {
  try {
    const response = await client.get('/users');
    const payload = unwrap(response);

    return Array.isArray(payload)
      ? payload
      : Array.isArray(payload.users)
        ? payload.users
        : [];
  } catch (err) {
    console.error('Failed to fetch users', err);
    return [];
  }
}
