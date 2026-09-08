const handleLogin = async (e) => {
  e.preventDefault();
  const res = await loginUser(credentials);

  if (res.success) {
    // Agar user Super Admin hai
    if (res.user.role === 'super-admin') {
      navigate('/super-admin'); // Direct super-admin route par bhejein
    } else {
      navigate('/dashboard');
    }
  }
};