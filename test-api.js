const fs = require('fs');
const path = require('path');

async function testUploadAndList() {
  const baseURL = 'http://localhost:3000/api/v1';

  // 1. Login as Lawyer
  const loginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'lawyer@evault.in', password: 'Password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;
  const user = loginData.data.user;

  // 2. Upload Document
  const form = new FormData();
  form.append('title', 'API Test Doc');
  form.append('caseNo', 'TEST-001');
  
  // create dummy file
  const dummyFile = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(dummyFile, 'hello world');
  const fileBlob = new Blob([fs.readFileSync(dummyFile)], { type: 'text/plain' });
  form.append('file', fileBlob, 'dummy.txt');

  const uploadRes = await fetch(`${baseURL}/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });
  const uploadData = await uploadRes.json();
  console.log('Upload Result:', JSON.stringify(uploadData.data, null, 2));

  // 3. List Documents
  const listRes = await fetch(`${baseURL}/documents`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listData = await listRes.json();
  console.log('List Documents Count:', listData.data.documents.length);
  
  // Find our uploaded document in the list
  const doc = listData.data.documents.find(d => d.id === uploadData.data.id);
  if (doc) {
    console.log('Found document in list! ownerId:', doc.ownerId, 'matches user.id?', doc.ownerId === user.id);
  } else {
    console.log('Document NOT FOUND in list!');
    console.log('Returned docs:', JSON.stringify(listData.data.documents.map(d => ({id: d.id, ownerId: d.ownerId})), null, 2));
  }
}

testUploadAndList().catch(console.error);
