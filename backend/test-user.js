import axios from 'axios';

const testUserRegistration = async () => {
  try {
    console.log('Testing user registration...');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('Sending registration request...');
    const response = await axios.post('http://localhost:4000/api/user/register', userData);
    
    console.log('Registration response:', response.data);
    
    if (response.data.success) {
      console.log('User registered successfully!');
      
      // Test login
      console.log('Testing login...');
      const loginResponse = await axios.post('http://localhost:4000/api/user/login', {
        email: userData.email,
        password: userData.password
      });
      
      console.log('Login response:', loginResponse.data);
      
      if (loginResponse.data.success) {
        console.log('User logged in successfully!');
        
        // Test get current user
        console.log('Testing get current user...');
        const currentUserResponse = await axios.get('http://localhost:4000/api/user/me', {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        console.log('Current user response:', currentUserResponse.data);
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testUserRegistration();