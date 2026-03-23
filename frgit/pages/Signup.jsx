import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Signup is removed — we only use Google auth now.
// Redirect anyone who lands here to the login page.
function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}

export default Signup;