/**
 * Test script to verify frontend can connect to backend
 * Run with: node test_backend_connection.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8001';

async function testBackendConnection() {
    console.log('=' .repeat(70));
    console.log('🔗 Testing Backend Connection');
    console.log('=' .repeat(70));
    
    try {
        // Test 1: Health check (root endpoint)
        console.log('\n1️⃣  Testing root endpoint...');
        const rootResponse = await axios.get(API_BASE_URL);
        console.log('✅ Root endpoint accessible');
        console.log('   Response:', rootResponse.data);
        
        // Test 2: Login
        console.log('\n2️⃣  Testing login...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        console.log('✅ Login successful');
        console.log('   User:', loginResponse.data.user.name);
        console.log('   Token:', loginResponse.data.access_token.substring(0, 20) + '...');
        
        const token = loginResponse.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };
        
        // Test 3: Get user profile
        console.log('\n3️⃣  Testing get profile...');
        const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers });
        console.log('✅ Profile retrieved');
        console.log('   Name:', profileResponse.data.name);
        console.log('   Email:', profileResponse.data.email);
        console.log('   Role:', profileResponse.data.role);
        
        // Test 4: Get candidates
        console.log('\n4️⃣  Testing get candidates...');
        const candidatesResponse = await axios.get(`${API_BASE_URL}/candidates`, { 
            headers,
            params: { limit: 5 }
        });
        console.log('✅ Candidates retrieved');
        console.log('   Total:', candidatesResponse.data.total);
        console.log('   Returned:', candidatesResponse.data.candidates.length);
        
        // Test 5: Get calls
        console.log('\n5️⃣  Testing get calls...');
        const callsResponse = await axios.get(`${API_BASE_URL}/calls`, { 
            headers,
            params: { limit: 5 }
        });
        console.log('✅ Calls retrieved');
        console.log('   Total:', callsResponse.data.total);
        console.log('   Returned:', callsResponse.data.calls.length);
        
        // Test 6: Get dashboard stats
        console.log('\n6️⃣  Testing get dashboard stats...');
        const statsResponse = await axios.get(`${API_BASE_URL}/candidates/stats`, { headers });
        console.log('✅ Stats retrieved');
        console.log('   Total Candidates:', statsResponse.data.total_candidates);
        console.log('   Interested:', statsResponse.data.interested_candidates);
        console.log('   Not Interested:', statsResponse.data.not_interested_candidates);
        
        console.log('\n' + '=' .repeat(70));
        console.log('✅ All tests passed! Frontend can connect to backend.');
        console.log('=' .repeat(70));
        
    } catch (error) {
        console.error('\n❌ Test failed!');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data);
        } else if (error.request) {
            console.error('   Network error - is backend running on port 8001?');
        } else {
            console.error('   Error:', error.message);
        }
        console.log('\n' + '=' .repeat(70));
        process.exit(1);
    }
}

testBackendConnection();
