async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@test.com', password: 'password123' })
    });
    const login = await loginRes.json();
    console.log('Login Response:', JSON.stringify(login, null, 2));

    const token = login.data?.token || login.data?.accessToken;
    if (!token) {
      console.log('No token found');
      return;
    }

    const cpRes = await fetch('http://localhost:5000/api/v1/users/settings/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword: 'password123', newPassword: 'password456' })
    });
    const cp = await cpRes.json();
    console.log('CP response:', cp);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
