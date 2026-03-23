import axios from 'axios';

// Test getting tasks with a dummy token
const testTasks = async () => {
  try {
    const response = await axios.get('http://localhost:4000/api/tasks/gp', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjYwZjYwZjYwZjYwZjYwZjYwZjYwIiwiaWF0IjoxNjI0NTA2MzQ1LCJleHAiOjE2MjQ1OTI3NDV9.7BZ8J3G2J3G2J3G2J3G2J3G2J3G2J3G2J3G2J3G2J3G'
      }
    });
    console.log('Tasks response:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
};

testTasks();