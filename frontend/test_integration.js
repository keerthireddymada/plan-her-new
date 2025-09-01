// Simple test to verify frontend-backend integration
console.log('🧪 Testing Frontend-Backend Integration...');

// Test API connection
async function testAPI() {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    
    if (data.status === 'healthy') {
      console.log('✅ Backend is running and healthy');
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    return false;
  }
}

// Test authentication endpoint
async function testAuth() {
  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication endpoint working');
      return true;
    } else {
      console.log('❌ Authentication endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🔧 Starting integration tests...\n');
  
  const apiOk = await testAPI();
  const authOk = await testAuth();
  
  console.log('\n📊 Test Results:');
  console.log(`Backend Health: ${apiOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication: ${authOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (apiOk && authOk) {
    console.log('\n🎉 Frontend-Backend Integration Ready!');
    console.log('✅ Backend is running');
    console.log('✅ Authentication is working');
    console.log('✅ Frontend can connect to backend');
    console.log('\n🚀 Ready to test the full application!');
  } else {
    console.log('\n⚠️  Some integration tests failed');
    console.log('Please ensure the backend is running on http://localhost:8000');
  }
}

// Run the tests
runTests();
