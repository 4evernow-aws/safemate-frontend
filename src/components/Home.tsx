import { type AuthUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface HomeProps {
  user?: AuthUser;
}

export function Home({ user }: HomeProps) {
  const { logout } = useUser();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h1 style={{ color: '#333', fontSize: '2rem', margin: 0 }}>
          SafeMate Dashboard
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#495057', marginBottom: '1rem' }}>Welcome!</h2>
        <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
          You have successfully authenticated using AWS Amplify and Cognito.
        </p>
        
        {user && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ color: '#495057', marginBottom: '0.5rem' }}>User Information:</h3>
                         <div style={{ 
               backgroundColor: 'white', 
               padding: '1rem', 
               borderRadius: '4px',
               border: '1px solid #dee2e6'
             }}>
               <p><strong>Username (Email):</strong> {user.username}</p>
               <p><strong>User ID:</strong> {user.userId}</p>
               <p><strong>Sign In Details:</strong> {user.signInDetails?.loginId}</p>
             </div>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ color: '#495057', marginBottom: '1rem' }}>Getting Started</h3>
                 <ul style={{ color: '#6c757d', paddingLeft: '1.5rem' }}>
           <li>This application is deployed on AWS ECS with Fargate</li>
           <li>Authentication is handled by AWS Amplify and Cognito</li>
           <li>The frontend is built with React and TypeScript</li>
           <li>All infrastructure is managed with Terraform</li>
         </ul>
      </div>
    </div>
  );
} 