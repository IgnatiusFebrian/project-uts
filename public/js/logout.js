document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');
  const logoutLinkHome = document.getElementById('logout-link-home');

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/auth/logout', { method: 'GET' });
      const data = await response.json();
      console.log(data.message);
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (logoutLink) {
    logoutLink.addEventListener('click', logoutHandler);
  }
  if (logoutLinkHome) {
    logoutLinkHome.addEventListener('click', logoutHandler);
  }
});
