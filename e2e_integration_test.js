const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:8080/api/v1';

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) {
    if (body instanceof FormData) {
      options.body = body; // Let fetch set boundary and Content-Type automatically
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  let data;
  try { data = await res.json(); } catch(e) { data = null; }
  return { status: res.status, data };
}

async function run() {
  console.log("🚀 Starting FINAL PRESENTATION WORKFLOW\\n");

  let adminToken, clientToken, lawyerToken;
  let newClientId;
  const newClientEmail = `demo_client_${Date.now()}@evault.in`;

  console.log("--- 1. Admin login ---");
  const adminRes = await request('/auth/login', 'POST', { email: 'admin@evault.in', password: 'Password123' });
  if (adminRes.status === 200) adminToken = adminRes.data.data.accessToken;
  else throw new Error('Admin login failed');
  console.log("✅ Admin login successful");

  console.log("\\n--- 2. Client Registration ---");
  const regRes = await request('/auth/register', 'POST', { 
    email: newClientEmail, password: 'Password123', fullName: 'Demo Client', role: 'CLIENT' 
  });
  newClientId = regRes.data.data.id;
  console.log("✅ Client registered");

  console.log("\\n--- 3. Client approval ---");
  const approveRes = await request(`/users/${newClientId}/status`, 'PATCH', { status: 'APPROVED' }, adminToken);
  if (approveRes.status !== 200) throw new Error('Client approval failed');
  console.log("✅ Client approved by admin");

  console.log("\\n--- 4. Client login ---");
  const clientLoginRes = await request('/auth/login', 'POST', { email: newClientEmail, password: 'Password123' });
  if (clientLoginRes.status === 200) clientToken = clientLoginRes.data.data.accessToken;
  else throw new Error('Client login failed');
  console.log("✅ Client login successful");

  console.log("\\n--- 5. Lawyer login ---");
  const lawyerRes = await request('/auth/login', 'POST', { email: 'lawyer@evault.in', password: 'Password123' });
  if (lawyerRes.status === 200) lawyerToken = lawyerRes.data.data.accessToken;
  else throw new Error('Lawyer login failed');
  console.log("✅ Lawyer login successful");

  console.log("\\n--- 6. Document upload ---");
  const filePath = path.join(__dirname, 'dummy.pdf');
  const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'dummy.pdf');
  
  const uploadRes = await request('/documents/upload', 'POST', formData, lawyerToken);
  let docId;
  if (uploadRes.status === 201) {
    docId = uploadRes.data.data.id;
    console.log("✅ Document uploaded successfully. ID:", docId);
  } else throw new Error('Document upload failed');

  console.log("\\n--- 7. Document verification ---");
  const getDocRes = await request(`/documents/${docId}`, 'GET', null, lawyerToken);
  if (getDocRes.status === 200) console.log("✅ Document verified (Retrieved)");
  else throw new Error('Document verification failed');

  console.log("\\n--- 8. Version update ---");
  const updateData = new FormData();
  updateData.append('file', fileBlob, 'dummy_v2.pdf');
  const updateRes = await request(`/documents/${docId}`, 'PUT', updateData, lawyerToken);
  if (updateRes.status === 200) console.log("✅ Version updated successfully");
  else throw new Error('Version update failed');

  console.log("\\n--- 9. Access grant ---");
  const grantRes = await request(`/documents/${docId}/share`, 'POST', { userId: newClientId, permission: 'READ' }, lawyerToken);
  if (grantRes.status === 200) console.log("✅ Access granted successfully");
  else throw new Error('Access grant failed');

  console.log("\\n--- 10. Client access ---");
  const authorizedGetRes = await request(`/documents/${docId}/download`, 'GET', null, clientToken);
  if (authorizedGetRes.status === 200) console.log("✅ Client accessed document successfully");
  else throw new Error('Client access failed');

  console.log("\\n--- 11. Access revoke ---");
  const revokeRes = await request(`/documents/${docId}/revoke`, 'POST', { userId: newClientId }, lawyerToken);
  if (revokeRes.status === 200) console.log("✅ Access revoked successfully");
  else throw new Error('Access revoke failed');

  console.log("\\n--- 12. Client access after revoke (Should fail) ---");
  const revokedGetRes = await request(`/documents/${docId}/download`, 'GET', null, clientToken);
  if (revokedGetRes.status === 403 || revokedGetRes.status === 401) console.log("✅ Client correctly denied access after revoke");
  else throw new Error('Client access should have been denied but succeeded');

  console.log("\\n--- 13. Audit verification ---");
  const auditRes = await request(`/documents/${docId}/audit`, 'GET', null, lawyerToken);
  if (auditRes.status === 200 && auditRes.data.data.length >= 4) console.log(`✅ Audit trail verified. Entries: ${auditRes.data.data.length}`);
  else throw new Error('Audit verification failed');

  console.log("\\n--- 14. Logout / login ---");
  const refreshToken = clientLoginRes.data.data.refreshToken;
  const logoutRes = await request('/auth/logout', 'POST', { refreshToken }, clientToken);
  if (logoutRes.status === 200) console.log("✅ Logout successful");
  else throw new Error('Logout failed');
  
  const reLoginRes = await request('/auth/login', 'POST', { email: newClientEmail, password: 'Password123' });
  if (reLoginRes.status === 200) console.log("✅ Re-login successful");
  else throw new Error('Re-login failed');

  console.log("\\n🎉 ALL CRITICAL WORKFLOWS PASSED");
}

run().catch(err => {
  console.error("\\n❌ WORKFLOW FAILED:");
  console.error(err);
  process.exit(1);
});
