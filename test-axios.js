const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
async function test() {
  const { data: loginData } = await axios.post('http://localhost:3000/api/v1/auth/login', {
    email: 'lawyer@evault.in', password: 'Password123'
  });
  const token = loginData.data.accessToken;

  const form = new FormData();
  form.append('title', 'API Test Doc 2');
  form.append('caseNo', 'TEST-002');
  form.append('file', fs.createReadStream('dummy.txt'));

  try {
    const res = await axios.post('http://localhost:3000/api/v1/documents/upload', form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Success:', res.data);
  } catch (e) {
    console.log('Axios error status:', e.response?.status);
    console.log('Axios error data:', e.response?.data);
  }
}
test();
