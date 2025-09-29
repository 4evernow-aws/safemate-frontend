/**
 * SafeMate Modern Login Component
 * Handles user authentication with enhanced security features
 * Updated: 2025-01-15 - Added email verification requirement for all users (new and existing) as extra security layer
 */

import React, { useState, useEffect } from 'react';
import { signIn, signUp, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Alert,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  styled,
  useTheme
} from '@mui/material';
import { 
  Eye,
  EyeOff,
  Shield,
  Lock,
  FileText,
  Users,
  Zap,
  CheckCircle,
  Heart,
  Home,
  Baby,
  GraduationCap,
  Building2,
  Briefcase,
  TrendingUp,
  UserCheck,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Palette,
  Music,
  Camera,
  Sparkles
} from 'lucide-react';

import OnboardingModal from './OnboardingModal';

// Styled components for the layout
const LeftPanel = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.background.default, // White background like right panel
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

const MobileContentPanel = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const ContentCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #1e3a8a 100%)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  maxWidth: 480,
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(6),
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  background: theme.palette.background.default,
}));

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '#e0e0e0' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score += checks.length ? 1 : 0;
    score += checks.lowercase ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.numbers ? 1 : 0;
    score += checks.symbols ? 1 : 0;
    
    // Bonus for longer passwords
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    const strengthMap = [
      { label: 'Very Weak', color: '#ff4444' },
      { label: 'Weak', color: '#ff8800' },
      { label: 'Fair', color: '#ffaa00' },
      { label: 'Good', color: '#88cc00' },
      { label: 'Strong', color: '#44cc44' },
      { label: 'Very Strong', color: '#00aa00' },
      { label: 'Excellent', color: '#008800' }
    ];
    
    const index = Math.min(score, strengthMap.length - 1);
    return { score, label: strengthMap[index].label, color: strengthMap[index].color };
  };
  
  const strength = getPasswordStrength(password);
  const width = Math.max(10, (strength.score / 7) * 100);
  
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            flex: 1,
            height: 6,
            backgroundColor: '#f0f0f0',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              width: `${width}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${strength.color} 0%, ${strength.color}dd 100%)`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: 3,
              boxShadow: `0 0 8px ${strength.color}40`
            }}
          />
        </Box>
        {password && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: strength.color, 
              fontWeight: 700, 
              minWidth: 90,
              fontSize: '0.75rem',
              textAlign: 'right'
            }}
          >
            {strength.label}
          </Typography>
        )}
      </Box>
      {password && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary', 
            mt: 0.5, 
            display: 'block',
            fontSize: '0.7rem',
            lineHeight: 1.3
          }}
        >
          {strength.score < 3 && '🔴 Add uppercase, numbers, and symbols for better security'}
          {strength.score >= 3 && strength.score < 5 && '🟡 Good! Consider adding more complexity'}
          {strength.score >= 5 && '🟢 Excellent password strength!'}
        </Typography>
      )}
    </Box>
  );
};

// Password match indicator component
const PasswordMatchIndicator = ({ password, confirmPassword }: { password: string; confirmPassword: string }) => {
  const getMatchStatus = () => {
    if (!confirmPassword) return { matches: false, label: '', color: '#e0e0e0', message: '' };
    if (!password) return { matches: false, label: 'Enter password first', color: '#ff8800', message: 'Please enter your password first' };
    
    const matches = password === confirmPassword;
    return {
      matches,
      label: matches ? 'Passwords Match' : 'Passwords Do Not Match',
      color: matches ? '#44cc44' : '#ff4444',
      message: matches ? '🟢 Your passwords match perfectly!' : '🔴 Passwords do not match. Please try again.'
    };
  };
  
  const status = getMatchStatus();
  
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            flex: 1,
            height: 6,
            backgroundColor: '#f0f0f0',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              width: confirmPassword ? '100%' : '0%',
              height: '100%',
              background: `linear-gradient(90deg, ${status.color} 0%, ${status.color}dd 100%)`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: 3,
              boxShadow: `0 0 8px ${status.color}40`
            }}
          />
        </Box>
        {confirmPassword && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: status.color, 
              fontWeight: 700, 
              minWidth: 90,
              fontSize: '0.75rem',
              textAlign: 'right'
            }}
          >
            {status.label}
          </Typography>
        )}
      </Box>
      {confirmPassword && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary', 
            mt: 0.5, 
            display: 'block',
            fontSize: '0.7rem',
            lineHeight: 1.3
          }}
        >
          {status.message}
        </Typography>
      )}
    </Box>
  );
};

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 30px rgba(34, 211, 238, 0.3)',
}));

const LogoBadge = styled(Box)(() => ({
  position: 'absolute',
  top: -4,
  right: -4,
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: '#10b981',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

interface ModernLoginProps {
  onAuthSuccess?: () => void;
  onOnboardingNeeded?: () => void;
  forceShowOnboarding?: boolean;
}

const accountTypeOptions = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Family', value: 'Family' },
  { label: 'Business', value: 'Business' },
  { label: 'Community', value: 'Community' },
  { label: 'Sporting Team', value: 'Sporting Team' },
  { label: 'Cultural', value: 'Cultural' },
];

// Default features for general/no selection
const defaultFeatures = [
  {
    icon: Shield,
    title: 'Blockchain Security',
    description: 'Your documents are secured with enterprise-grade blockchain technology, ensuring immutable and tamper-proof storage.'
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Organize, share, and manage your important files with intuitive folder structures and powerful search capabilities.'
  },
  {
    icon: Users,
    title: 'Collaborative Sharing',
    description: 'Create secure groups and share documents with family, teams, or communities with granular permission controls.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Hedera Hashgraph for instant transactions and real-time document access with minimal fees.'
  }
];

// Account type specific features
const accountTypeFeatures = {
  Personal: [
    {
      icon: Shield,
      title: 'Personal Document Vault',
      description: 'Securely store your personal documents, certificates, and important files with military-grade blockchain encryption.'
    },
    {
      icon: FileText,
      title: 'Smart Organization',
      description: 'Automatically categorize and tag your documents for easy retrieval. Never lose track of important paperwork again.'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your personal information remains completely private. Only you control who has access to your documents.'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Access your documents from anywhere, anytime with lightning-fast blockchain technology and real-time sync.'
    }
  ],
  Family: [
    {
      icon: Home,
      title: 'Family Document Hub',
      description: 'Create a secure digital vault for your family\'s important documents, from birth certificates to insurance policies.'
    },
    {
      icon: Heart,
      title: 'Shared Family Archive',
      description: 'Build a lasting family legacy by safely storing photos, memories, and genealogy records for future generations.'
    },
    {
      icon: Baby,
      title: 'Child-Safe Sharing',
      description: 'Safely share school records, medical information, and achievements with family members and authorized caregivers.'
    },
    {
      icon: GraduationCap,
      title: 'Education & Growth',
      description: 'Track academic progress, store educational achievements, and maintain complete academic records securely.'
    }
  ],
  Business: [
    {
      icon: Building2,
      title: 'Corporate Document Security',
      description: 'Protect sensitive business documents, contracts, and intellectual property with enterprise-grade blockchain security.'
    },
    {
      icon: Briefcase,
      title: 'Professional Workflow',
      description: 'Streamline document approval processes, maintain audit trails, and ensure regulatory compliance effortlessly.'
    },
    {
      icon: TrendingUp,
      title: 'Scale with Confidence',
      description: 'Grow your business while maintaining document security. Our platform scales with your organization\'s needs.'
    },
    {
      icon: UserCheck,
      title: 'Team Collaboration',
      description: 'Enable secure document sharing between departments with role-based access controls and permission management.'
    }
  ],
  Community: [
    {
      icon: Users,
      title: 'Community Hub',
      description: 'Create a centralized repository for community documents, meeting minutes, and important announcements.'
    },
    {
      icon: MapPin,
      title: 'Local Resources',
      description: 'Store and share local resources, community guidelines, and neighborhood information accessible to all members.'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Organize community events by securely storing permits, planning documents, and coordination materials.'
    },
    {
      icon: Heart,
      title: 'Transparent Governance',
      description: 'Maintain transparency with immutable records of community decisions, budgets, and important communications.'
    }
  ],
  'Sporting Team': [
    {
      icon: Trophy,
      title: 'Team Achievement Hub',
      description: 'Document your team\'s journey with secure storage of game footage, statistics, and championship records.'
    },
    {
      icon: Target,
      title: 'Performance Analytics',
      description: 'Store training data, performance metrics, and coaching materials to track team development and success.'
    },
    {
      icon: Users,
      title: 'Team Coordination',
      description: 'Share schedules, playbooks, and team communications securely with players, coaches, and support staff.'
    },
    {
      icon: Shield,
      title: 'Compliance & Safety',
      description: 'Maintain player registrations, medical clearances, and insurance documents in one secure, accessible location.'
    }
  ],
  Cultural: [
    {
      icon: Palette,
      title: 'Cultural Heritage Preservation',
      description: 'Preserve and protect cultural artifacts, historical documents, and traditional knowledge for future generations.'
    },
    {
      icon: Music,
      title: 'Creative Collaboration',
      description: 'Securely share artistic works, cultural projects, and creative content with community members and collaborators.'
    },
    {
      icon: Camera,
      title: 'Digital Archive',
      description: 'Create a permanent digital archive of cultural events, ceremonies, and important community gatherings.'
    },
    {
      icon: Sparkles,
      title: 'Cultural Legacy',
      description: 'Build an immutable record of cultural traditions, stories, and practices using blockchain technology.'
    }
  ]
};

const getAccountTypeContent = (accountType: string) => {
  const features = accountTypeFeatures[accountType as keyof typeof accountTypeFeatures] || defaultFeatures;
  
  const titles = {
    Personal: 'Your Personal Digital Vault',
    Family: 'Secure Family Document Hub', 
    Business: 'Enterprise Document Solutions',
    Community: 'Community Resource Center',
    'Sporting Team': 'Team Management Platform',
    Cultural: 'Cultural Heritage Platform'
  };

  const descriptions = {
    Personal: 'Keep your personal documents secure and accessible with blockchain technology designed for individual privacy and convenience.',
    Family: 'Protect your family\'s most important documents and memories with secure sharing designed for modern families.',
    Business: 'Streamline your business operations with enterprise-grade document security and collaborative workflow management.',
    Community: 'Unite your community with transparent, secure document sharing and collaborative resource management.',
    'Sporting Team': 'Elevate your team\'s performance with secure storage for training materials, records, and team coordination.',
    Cultural: 'Preserve and celebrate your cultural heritage with immutable blockchain storage designed for lasting legacy.'
  };

  return {
    title: titles[accountType as keyof typeof titles] || 'Secure Blockchain Document Storage',
    description: descriptions[accountType as keyof typeof descriptions] || 'Secure blockchain document storage with enterprise-grade encryption and collaborative features.',
    features
  };
};

export default function ModernLogin({ onAuthSuccess, onOnboardingNeeded, forceShowOnboarding }: ModernLoginProps) {
  const theme = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup' | 'confirm' | 'confirmed' | 'verify' | 'signin-verify' | 'reset-password' | 'reset-confirm' | 'reset-new-password'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(forceShowOnboarding || false);
  const [onboardingAccountType, setOnboardingAccountType] = useState('personal');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationUsername, setVerificationUsername] = useState('');
  const [storedPassword, setStoredPassword] = useState('');

  // Handle forceShowOnboarding prop changes
  useEffect(() => {
    if (forceShowOnboarding) {
      setShowOnboarding(true);
    }
  }, [forceShowOnboarding]);

  // Handle forceShowOnboarding prop changes
  useEffect(() => {
    if (forceShowOnboarding) {
      setShowOnboarding(true);
    }
  }, [forceShowOnboarding]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    confirmationCode: ''
  });

  // Password reset form data
  const [resetFormData, setResetFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    newPassword: '',
    confirmNewPassword: '',
    resetCode: ''
  });

  // Get dynamic content based on selected account type
  // If no account type is selected, show default content for signup mode
  const accountTypeForContent = formData.accountType || (mode === 'signup' ? 'Personal' : '');
  const currentContent = getAccountTypeContent(accountTypeForContent);
  // Content debug logging disabled for cleaner console

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSelectChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      accountType: event.target.value
    }));
    setError('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    // Tab change logging disabled for cleaner console
    setMode(newValue as 'signin' | 'signup');
    setError('');
    setSuccess('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting sign in process with email verification...');
      
      // For security, ALL users (new and existing) must go through email verification
      // Store credentials and proceed directly to verification step
      console.log('🔍 Starting enhanced security verification flow...');
      
      // Store the password for later use after verification
      setStoredPassword(formData.password);
      setVerificationUsername(formData.username);
      
      // Send verification code for extra security layer
      const { EmailVerificationService } = await import('../services/emailVerificationService');
      await EmailVerificationService.sendVerificationCode(formData.username);
      
      console.log('📧 Email verification code sent for security verification');
      setSuccess('Verification code sent to your email. Please enter the code to complete sign-in.');
      setMode('signin-verify');
      
      // Don't proceed to dashboard yet - wait for verification
      return;
      
    } catch (err: any) {
      console.error('❌ Sign in process error:', err);
      setError(err.message || 'Failed to process sign-in request');
    } finally {
      setLoading(false);
    }
  };



  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      setLoading(false);
      return;
    }

    if (!formData.accountType) {
      setError('Please select an account type');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Attempting signup with account type:', formData.accountType);
      console.log('🔍 Email/Username:', formData.username);
      
      const signUpResult = await signUp({
        username: formData.username,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.username, // Add email attribute since username is email
            given_name: formData.firstName,
            family_name: formData.lastName,
            'custom:account_type': formData.accountType
          }
        }
      });
      
      console.log('✅ Signup successful with custom attribute');
      console.log('🔍 SignUp result:', signUpResult);
      console.log('🔍 Delivery details:', signUpResult.nextStep);
      
      if (signUpResult.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        const deliveryDetails = signUpResult.nextStep.codeDeliveryDetails;
        console.log('📧 Code delivery method:', deliveryDetails?.deliveryMedium);
        console.log('📧 Code sent to:', deliveryDetails?.destination);
        
        setSuccess(`Verification code sent to ${deliveryDetails?.destination || 'your email'}. Please check your inbox.`);
      } else {
        setSuccess('Account created! Please check your email for verification code.');
      }
      
      setMode('confirm');
    } catch (err: any) {
      console.error('❌ Signup error details:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error code:', err.code || err.name);
      
      // Provide more specific error messages
      if (err.message?.includes('unauthorized attribute')) {
        setError('Account type configuration issue. Please try again or contact support.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Confirm the user account
      await confirmSignUp({
        username: formData.username,
        confirmationCode: formData.confirmationCode
      });
      
      setSuccess('Account confirmed! You have been verified.');
      console.log('✅ Account confirmed successfully');
      
      // Automatically sign in the user after successful confirmation
      console.log('🔄 Attempting automatic sign-in after confirmation...');
      
      try {
        await signIn({
          username: formData.username,
          password: formData.password
        });
        
        console.log('✅ Automatic sign-in successful after confirmation');
        setSuccess('Account confirmed and signed in! Setting up your wallet...');
        
        // Brief delay for authentication to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger onboarding with the account type from signup
        console.log('🔄 Triggering onboarding with account type:', formData.accountType);
        setOnboardingAccountType(formData.accountType || 'personal');
        
        // Notify parent that onboarding is needed (this prevents auto-redirect to dashboard)
        if (onOnboardingNeeded) {
          onOnboardingNeeded();
        }
        
        setShowOnboarding(true);
        console.log('✅ Onboarding modal should now be visible after confirmation!');
        
      } catch (signInError) {
        console.log('⚠️ Automatic sign-in failed, user will need to sign in manually:', signInError);
        // Fall back to manual sign-in
        setMode('confirmed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm account');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Resending verification code to:', formData.username);
      
      const resendResult = await resendSignUpCode({
        username: formData.username
      });
      
      console.log('✅ Resend successful');
      console.log('🔍 Resend result:', resendResult);
      
      if (resendResult.destination) {
        setSuccess(`New verification code sent to ${resendResult.destination}. Please check your inbox.`);
      } else {
        setSuccess('New verification code sent! Please check your email.');
      }
    } catch (err: any) {
      console.error('❌ Resend code error:', err);
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignInCode = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Resending verification code for sign-in to:', verificationUsername);
      
      // Import the email verification service
      const { EmailVerificationService } = await import('../services/emailVerificationService');
      
      const resendResult = await EmailVerificationService.sendVerificationCode(verificationUsername);
      
      console.log('✅ Resend successful for sign-in verification');
      console.log('🔍 Resend result:', resendResult);
      
      if (resendResult.destination) {
        setSuccess(`New verification code sent to ${resendResult.destination}. Please check your inbox.`);
      } else {
        setSuccess('New verification code sent! Please check your email.');
      }
    } catch (err: any) {
      console.error('❌ Resend code error for sign-in:', err);
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Processing sign-in verification for user:', verificationUsername);
      
      // Verify the email verification code first
      const { EmailVerificationService } = await import('../services/emailVerificationService');
      await EmailVerificationService.verifyCode(verificationUsername, formData.confirmationCode);
      
      console.log('✅ Email verification successful, proceeding with sign-in...');
      setSuccess('Email verified successfully! Signing you in...');
      
      // Now proceed with the actual sign-in using stored password
      await signIn({
        username: verificationUsername,
        password: storedPassword
      });
      
      console.log('✅ Sign-in successful after verification, proceeding to dashboard...');
      
      // Wait for authentication to be properly established
      console.log('⏳ Waiting for authentication to be established...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user has a wallet, if not show onboarding
      try {
        const { SecureWalletService } = await import('../services/secureWalletService');
        
        console.log('🔍 Checking if user has secure wallet...');
        const hasWallet = await SecureWalletService.hasSecureWallet();
        console.log('🔍 hasSecureWallet result:', hasWallet);
        
        if (!hasWallet) {
          console.log('🔄 No wallet found, showing onboarding...');
          setOnboardingAccountType('personal'); // Default for existing users
          
          if (onOnboardingNeeded) {
            onOnboardingNeeded();
          }
          
          setShowOnboarding(true);
        } else {
          console.log('✅ User has wallet, proceeding to dashboard...');
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        }
      } catch (walletError) {
        console.error('❌ Error checking wallet:', walletError);
        // If wallet check fails, still allow sign-in
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }
      
    } catch (err: any) {
      console.error('❌ Sign-in verification error:', err);
      setError(err.message || 'Failed to verify and sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Processing verification for user:', verificationUsername);
      
      // For security verification, we'll require the user to enter their password again
      // This adds an extra layer of security for existing users
      if (!formData.password) {
        setError('Please enter your password for verification');
        setLoading(false);
        return;
      }

      // Re-authenticate the user with their password
      await signIn({
        username: verificationUsername,
        password: formData.password
      });
      
      console.log('✅ Verification successful, proceeding to dashboard...');
      setSuccess('Identity verified successfully!');
      
      // Wait briefly for authentication to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user has a wallet, if not show onboarding
      try {
        const { SecureWalletService } = await import('../services/secureWalletService');
        
        console.log('🔍 Checking if user has secure wallet...');
        const hasWallet = await SecureWalletService.hasSecureWallet();
        console.log('🔍 hasSecureWallet result:', hasWallet);
        
        if (!hasWallet) {
          console.log('🔄 No wallet found, showing onboarding...');
          setOnboardingAccountType('personal'); // Default for existing users
          
          if (onOnboardingNeeded) {
            onOnboardingNeeded();
          }
          
          setShowOnboarding(true);
          console.log('✅ Onboarding modal should now be visible!');
        } else {
          console.log('✅ User already has wallet, proceeding to dashboard...');
          
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('🔄 Calling onAuthSuccess to proceed to dashboard...');
          onAuthSuccess?.();
        }
      } catch (walletErr) {
        console.log('⚠️ Wallet check failed, showing onboarding as fallback:', walletErr);
        setOnboardingAccountType('personal');
        
        if (onOnboardingNeeded) {
          onOnboardingNeeded();
        }
        
        setShowOnboarding(true);
        console.log('✅ Onboarding modal should now be visible (fallback)!');
      }
      
    } catch (err: any) {
      console.error('❌ Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      // Reset to signin mode if verification fails
      setMode('signin');
      setNeedsVerification(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAfterConfirmation = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Starting login after confirmation...');
      await signIn({
        username: formData.username,
        password: formData.password
      });
      
      console.log('✅ Login successful, waiting for authentication...');
      setSuccess('Successfully signed in! Creating your secure wallet...');
      
      // Wait a moment for authentication to be fully established
      console.log('⏳ Waiting for authentication to be established...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show onboarding modal instead of automatic wallet creation
      console.log('🔍 Setting onboarding account type:', formData.accountType);
      setOnboardingAccountType(formData.accountType);
      console.log('🔍 Setting showOnboarding to true...');
      setShowOnboarding(true);
      console.log('✅ Onboarding modal should now be visible!');
      
      // DO NOT call onAuthSuccess here - let the onboarding modal handle it
      // The onAuthSuccess will be called in handleOnboardingComplete after wallet creation
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Failed to sign in');
      // If login fails, go back to signin mode so user can try again
      setMode('signin');
    } finally {
      setLoading(false);
    }
  };



  const handleOnboardingComplete = async () => {
    console.log('🔄 Onboarding complete, proceeding to dashboard...');
    setShowOnboarding(false);
    
    // The OnboardingModal has already created the wallet, so we just proceed to dashboard
    setSuccess('Secure wallet created successfully!');
    
    // Give a moment for state to settle before calling onAuthSuccess
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Call onAuthSuccess to proceed to dashboard
    console.log('🚀 Proceeding to dashboard...');
    if (onAuthSuccess) {
      console.log('🔄 Calling onAuthSuccess after onboarding completion...');
      onAuthSuccess();
    } else {
      console.log('⚠️ No onAuthSuccess callback provided');
    }
  };

  const handleOnboardingCancel = () => {
    console.log('❌ Onboarding cancelled by user');
    setShowOnboarding(false);
    
    // User cancelled onboarding, but they're still authenticated
    // They can access the dashboard without a wallet
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  // Password reset handlers
  const handleResetPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!resetFormData.email.trim() || !resetFormData.firstName.trim() || !resetFormData.lastName.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Initiating password reset for:', resetFormData.email);
      
      // Call the real Cognito forgotPassword API
      const result = await resetPassword({
        username: resetFormData.email
      });
      
      console.log('✅ Password reset initiated:', result);
      
      setSuccess('Password reset code sent to your email. Please check your inbox.');
      
      setMode('reset-confirm');
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err.message || 'Failed to send reset code. Please check that the email address is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!resetFormData.resetCode.trim()) {
      setError('Please enter the reset code');
      setLoading(false);
      return;
    }

    try {
      // Verify the reset code by storing it temporarily
      console.log('🔍 Reset code received:', resetFormData.resetCode);
      
      setSuccess('Reset code verified. Please enter your new password.');
      setMode('reset-new-password');
    } catch (err: any) {
      console.error('❌ Reset code verification error:', err);
      setError(err.message || 'Invalid reset code. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!resetFormData.newPassword.trim() || !resetFormData.confirmNewPassword.trim()) {
      setError('Please fill in all password fields');
      setLoading(false);
      return;
    }

    if (resetFormData.newPassword !== resetFormData.confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (resetFormData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Update the password using the real Cognito API
      console.log('🔍 Updating password for:', resetFormData.email);
      
      await confirmResetPassword({
        username: resetFormData.email,
        confirmationCode: resetFormData.resetCode,
        newPassword: resetFormData.newPassword
      });
      
      setSuccess('Password updated successfully! You can now sign in with your new password.');
      
      // Reset form data and return to sign in
      setResetFormData({
        email: '',
        firstName: '',
        lastName: '',
        newPassword: '',
        confirmNewPassword: '',
        resetCode: ''
      });
      setMode('signin');
    } catch (err: any) {
      console.error('❌ Password update error:', err);
      setError(err.message || 'Failed to update password. Please check your reset code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    setError('');
    setSuccess('');
    setResetFormData({
      email: '',
      firstName: '',
      lastName: '',
      newPassword: '',
      confirmNewPassword: '',
      resetCode: ''
    });
  };

  const handleResendResetCode = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Resending password reset code to:', resetFormData.email);
      
      // Call the real Cognito resetPassword API again
      const result = await resetPassword({
        username: resetFormData.email
      });
      
      console.log('✅ Password reset code resent successfully:', result);
      
      setSuccess('New password reset code sent to your email. Please check your inbox.');
    } catch (err: any) {
      console.error('❌ Resend reset code error:', err);
      setError(err.message || 'Failed to resend reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    return (
    <>
      {/* Desktop Layout - Side by side panels */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, minHeight: '100vh' }}>
        {/* Left Panel - Features (show only for signup and related modes, not for signin) */}
        {(() => {
          const shouldShowLeftPanel = (mode === 'signup' || mode === 'confirm' || mode === 'confirmed');
          // Left panel debug logging disabled for cleaner console
          return shouldShowLeftPanel;
        })() && (
          <Box sx={{ width: '50%' }}>
            <LeftPanel>
              <ContentCard>
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 20px,
                      rgba(255,255,255,0.05) 20px,
                      rgba(255,255,255,0.05) 40px
                    )`
                  }}
                />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {/* Logo */}
                  <Box sx={{ mb: 6 }}>
                    <LogoContainer>
                      <LogoIcon>
                        <Shield size={24} color="white" />
                        <LogoBadge>
                          <Lock size={8} color="white" />
                        </LogoBadge>
                      </LogoIcon>
                      <Box>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                          SafeMate
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#22d3ee' }}>
                          Portal
                        </Typography>
                      </Box>
                    </LogoContainer>
                                         <Typography variant="h6" sx={{ 
                       color: 'white', 
                       mb: 2, 
                       fontWeight: 600,
                       [theme.breakpoints.up('md')]: {
                         variant: 'h5',
                       },
                     }}>
                       {currentContent.title}
                     </Typography>
                     <Typography 
                       variant="body1" 
                       sx={{ 
                         color: 'rgba(255, 255, 255, 0.8)', 
                         lineHeight: 1.6,
                         fontWeight: 400,
                         [theme.breakpoints.up('md')]: {
                           variant: 'h6',
                         },
                       }}
                     >
                       {currentContent.description}
                     </Typography>
                   </Box>

                   {/* Features */}
                   <Box>
                     {currentContent.features.map((feature, index) => (
                       <FeatureBox key={index}>
                         <FeatureIcon>
                           <feature.icon size={20} color="#22d3ee" />
                         </FeatureIcon>
                         <Box>
                           <Typography variant="h6" sx={{ color: 'white', mb: 0.5, fontWeight: 600 }}>
                             {feature.title}
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                             {feature.description}
                           </Typography>
                         </Box>
                       </FeatureBox>
                     ))}
                   </Box>

                   {/* Footer */}
                   <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                     <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                       Secured by blockchain technology • End-to-end encrypted
                     </Typography>
                   </Box>
                 </Box>
               </ContentCard>
             </LeftPanel>
           </Box>
         )}

         {/* Right Panel - Form */}
         <Box sx={{ width: (mode === 'signin' || mode === 'verify' || mode === 'signin-verify' || mode === 'reset-password' || mode === 'reset-confirm' || mode === 'reset-new-password') ? '100%' : '50%' }}>
          <RightPanel>
            <Container maxWidth="sm">
                             {/* Mobile Logo - always show on mobile, and show on desktop when in signin mode */}
               <Box sx={{ 
                 display: { 
                   xs: 'block', 
                   md: (mode === 'signin' || mode === 'reset-password' || mode === 'reset-confirm' || mode === 'reset-new-password') ? 'block' : 'none',
                   lg: (mode === 'signin' || mode === 'reset-password' || mode === 'reset-confirm' || mode === 'reset-new-password') ? 'block' : 'none' 
                 }, 
                 textAlign: 'center', 
                 mb: 4 
               }}>
                <LogoContainer sx={{ justifyContent: 'center' }}>
                  <LogoIcon>
                    <Shield size={20} color="white" />
                    <LogoBadge>
                      <Lock size={6} color="white" />
                    </LogoBadge>
                  </LogoIcon>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    SafeMate Portal
                  </Typography>
                </LogoContainer>
              </Box>

              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  width: '100%',
                  maxWidth: 400,
                  mx: 'auto'
                }}
              >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                  <Typography variant="h4" gutterBottom fontWeight={700}>
                  {mode === 'signin' && 'Welcome back'}
                  {mode === 'signup' && 'Create your account'}
                  {mode === 'confirm' && 'Verify your account'}
                  {mode === 'verify' && 'Security Verification'}
                  {mode === 'signin-verify' && 'Verify your identity'}
                  {mode === 'reset-password' && 'Reset Password'}
                  {mode === 'reset-confirm' && 'Enter Reset Code'}
                  {mode === 'reset-new-password' && 'Set New Password'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mode === 'signin' && 'Sign in to access your secure documents'}
                  {mode === 'signup' && `Join thousands securing their ${formData.accountType?.toLowerCase() || ''} documents on blockchain`}
                  {mode === 'confirm' && 'Enter the verification code sent to your email'}
                  {mode === 'verify' && 'Please verify your identity to continue'}
                  {mode === 'signin-verify' && 'Enter the verification code sent to your email for enhanced security'}
                  {mode === 'reset-password' && 'Enter your email and personal information to receive a reset code'}
                  {mode === 'reset-confirm' && 'Enter the verification code sent to your email'}
                  {mode === 'reset-new-password' && 'Create a new secure password for your account'}
                </Typography>
                </Box>

                {/* Tab Navigation */}
                {mode !== 'confirm' && mode !== 'confirmed' && mode !== 'verify' && mode !== 'signin-verify' && mode !== 'reset-password' && mode !== 'reset-confirm' && mode !== 'reset-new-password' && (
                  <Tabs
                    value={mode}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ mb: 3 }}
                  >
                    <Tab label="Sign In" value="signin" />
                    <Tab label="Create Account" value="signup" />
                  </Tabs>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}

                {/* Sign In Form */}
                {mode === 'signin' && (
                  <Box component="form" onSubmit={handleSignIn} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      name="username"
                      label="Username (email address)"
                      value={formData.username}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />
                    
                    <TextField
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    {/* Reset Password Link */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setMode('reset-password')}
                        sx={{ 
                          color: 'text.secondary',
                          textTransform: 'none',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        Forgot your password?
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Verification Form for Existing Users */}
                {mode === 'verify' && (
                  <Box component="form" onSubmit={handleVerification} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Security Verification Required</strong><br />
                        For your security, please verify your identity by entering your password again.
                      </Typography>
                    </Alert>

                    <TextField
                      name="username"
                      label="Username"
                      value={verificationUsername}
                      fullWidth
                      disabled
                      variant="outlined"
                      sx={{ backgroundColor: 'grey.100' }}
                    />
                    
                    <TextField
                      name="password"
                      label="Password for Verification"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Verifying...' : 'Verify Identity'}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      size="medium"
                      onClick={() => {
                        setMode('signin');
                        setNeedsVerification(false);
                        setError('');
                        setSuccess('');
                      }}
                      fullWidth
                    >
                      ← Back to Sign In
                    </Button>
                  </Box>
                )}

                {/* Sign In Email Verification Form */}
                {mode === 'signin-verify' && (
                  <Box component="form" onSubmit={handleSignInVerification} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Email Verification Required</strong><br />
                        For enhanced security, please enter the verification code sent to your email.
                      </Typography>
                    </Alert>

                    <TextField
                      name="username"
                      label="Username"
                      value={verificationUsername}
                      fullWidth
                      disabled
                      variant="outlined"
                      sx={{ backgroundColor: 'grey.100' }}
                    />
                    
                    <TextField
                      name="confirmationCode"
                      label="Verification Code"
                      value={formData.confirmationCode}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Enter the 6-digit code from your email"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Verifying...' : 'Verify & Sign In'}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      size="medium"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          await resendSignUpCode({
                            username: verificationUsername
                          });
                          setSuccess('New verification code sent to your email!');
                        } catch (err: any) {
                          setError(err.message || 'Failed to resend code');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      fullWidth
                    >
                      Resend Verification Code
                    </Button>

                    <Button
                      type="button"
                      variant="text"
                      size="medium"
                      onClick={() => {
                        setMode('signin');
                        setNeedsVerification(false);
                        setError('');
                        setSuccess('');
                      }}
                      fullWidth
                    >
                      ← Back to Sign In
                    </Button>
                  </Box>
                )}

                {/* Password Reset Request Form */}
                {mode === 'reset-password' && (
                  <Box component="form" onSubmit={handleResetPasswordRequest} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Password Reset</strong><br />
                        Enter your email address and personal information to receive a password reset code.
                      </Typography>
                    </Alert>

                    <TextField
                      name="email"
                      label="Email Address"
                      type="email"
                      value={resetFormData.email}
                      onChange={handleResetPasswordInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />

                    <TextField
                      name="firstName"
                      label="First Name"
                      value={resetFormData.firstName}
                      onChange={handleResetPasswordInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />

                    <TextField
                      name="lastName"
                      label="Last Name"
                      value={resetFormData.lastName}
                      onChange={handleResetPasswordInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
                    </Button>

                    <Button
                      type="button"
                      variant="text"
                      size="medium"
                      onClick={handleBackToSignIn}
                      fullWidth
                    >
                      ← Back to Sign In
                    </Button>
                  </Box>
                )}

                {/* Password Reset Code Confirmation Form */}
                {mode === 'reset-confirm' && (
                  <Box component="form" onSubmit={handleResetPasswordConfirm} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Enter Reset Code</strong><br />
                        Please enter the verification code sent to your email address.
                      </Typography>
                    </Alert>

                    <TextField
                      name="resetCode"
                      label="Reset Code"
                      value={resetFormData.resetCode}
                      onChange={handleResetPasswordInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      placeholder="Enter the 6-digit code from your email"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      size="medium"
                      onClick={handleResendResetCode}
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Sending...' : 'Resend Reset Code'}
                    </Button>

                    <Button
                      type="button"
                      variant="text"
                      size="medium"
                      onClick={handleBackToSignIn}
                      fullWidth
                    >
                      ← Back to Sign In
                    </Button>
                  </Box>
                )}

                {/* New Password Form */}
                {mode === 'reset-new-password' && (
                  <Box component="form" onSubmit={handleResetPasswordNewPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Set New Password</strong><br />
                        Please enter your new password. It must be at least 8 characters long.
                      </Typography>
                    </Alert>

                    <TextField
                      name="newPassword"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      value={resetFormData.newPassword}
                      onChange={handleResetPasswordInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <PasswordStrengthIndicator password={resetFormData.newPassword} />

                    <TextField
                      name="confirmNewPassword"
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      value={resetFormData.confirmNewPassword}
                      onChange={handleResetPasswordInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <PasswordMatchIndicator password={resetFormData.newPassword} confirmPassword={resetFormData.confirmNewPassword} />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Updating Password...' : 'Update Password'}
                    </Button>

                    <Button
                      type="button"
                      variant="text"
                      size="medium"
                      onClick={handleBackToSignIn}
                      fullWidth
                    >
                      ← Back to Sign In
                    </Button>
                  </Box>
                )}

                {/* Sign Up Form */}
                {mode === 'signup' && (
                  <Box component="form" onSubmit={handleSignUp} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />
                    
                    <TextField
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />
                    
                    <TextField
                      name="username"
                      label="Username (email address)"
                      value={formData.username}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                    />
                    
                    <TextField
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <PasswordStrengthIndicator password={formData.password} />

                    <TextField
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <PasswordMatchIndicator password={formData.password} confirmPassword={formData.confirmPassword} />

                    <FormControl fullWidth required>
                      <InputLabel>Account Type</InputLabel>
                      <Select
                        name="accountType"
                        value={formData.accountType}
                        label="Account Type"
                        onChange={handleSelectChange}
                      >
                        {accountTypeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </Box>
                )}

                {/* Confirmation Form */}
                {mode === 'confirm' && (
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: 'success.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <CheckCircle size={32} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        We've sent a 6-digit verification code to your email address.
                      </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleConfirmSignUp} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        name="confirmationCode"
                        label="Verification Code"
                        value={formData.confirmationCode}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        variant="outlined"
                        inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em' } }}
                        placeholder="000000"
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        fullWidth
                        color="success"
                      >
                        {loading ? 'Verifying...' : 'Verify account'}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Button
                        onClick={handleResendCode}
                        disabled={loading}
                        color="primary"
                        size="small"
                      >
                        Resend verification code
                      </Button>

                      <Button
                        onClick={() => setMode('signin')}
                        color="inherit"
                        size="small"
                      >
                        ← Back to sign in
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Confirmed Account - Login Option */}
                {mode === 'confirmed' && (
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: 'success.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <CheckCircle size={32} />
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        You have been verified!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your account has been successfully verified. Please sign in to access your account and create your secure wallet.
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        onClick={handleLoginAfterConfirmation}
                        variant="contained"
                        size="large"
                        disabled={loading}
                        fullWidth
                        color="primary"
                      >
                        {loading ? 'Signing in...' : 'Sign in'}
                      </Button>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Button
                          onClick={() => setMode('signin')}
                          color="inherit"
                          size="small"
                        >
                          ← Back to sign in page
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Footer */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Typography>
              </Paper>
            </Container>
          </RightPanel>
        </Box>
      </Box>

      {/* Mobile Layout - Stacked panels */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* Form Panel */}
        <RightPanel>
          <Container maxWidth="sm">
            {/* Mobile Logo - always show on mobile */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LogoContainer sx={{ justifyContent: 'center' }}>
                <LogoIcon>
                  <Shield size={20} color="white" />
                  <LogoBadge>
                    <Lock size={6} color="white" />
                  </LogoBadge>
                </LogoIcon>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  SafeMate Portal
                </Typography>
              </LogoContainer>
            </Box>

            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                width: '100%',
                maxWidth: 400,
                mx: 'auto'
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                  {mode === 'signin' && 'Welcome back'}
                  {mode === 'signup' && 'Create your account'}
                  {mode === 'confirm' && 'Verify your account'}
                  {mode === 'verify' && 'Security Verification'}
                  {mode === 'signin-verify' && 'Verify your identity'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mode === 'signin' && 'Sign in to access your secure documents'}
                  {mode === 'signup' && `Join thousands securing their ${formData.accountType?.toLowerCase() || ''} documents on blockchain`}
                  {mode === 'confirm' && 'Enter the verification code sent to your email'}
                  {mode === 'verify' && 'Please verify your identity to continue'}
                  {mode === 'signin-verify' && 'Enter the verification code sent to your email for enhanced security'}
                </Typography>
              </Box>

              {/* Tab Navigation */}
              {mode !== 'confirm' && mode !== 'confirmed' && mode !== 'verify' && mode !== 'signin-verify' && (
                <Tabs
                  value={mode}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ mb: 3 }}
                >
                  <Tab label="Sign In" value="signin" />
                  <Tab label="Create Account" value="signup" />
                </Tabs>
              )}

              {/* Error/Success Messages */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              {/* Sign In Form */}
              {mode === 'signin' && (
                <Box component="form" onSubmit={handleSignIn} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    name="username"
                    label="Username (email address)"
                    value={formData.username}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                  
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                  
                  {/* Onboarding will trigger automatically for users without wallets */}
      
                  {/* Temporary debug button - remove after testing */}

                </Box>
              )}

              {/* Verification Form for Existing Users - Mobile */}
              {mode === 'verify' && (
                <Box component="form" onSubmit={handleVerification} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Security Verification Required</strong><br />
                      For your security, please verify your identity by entering your password again.
                    </Typography>
                  </Alert>

                  <TextField
                    name="username"
                    label="Username"
                    value={verificationUsername}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={{ backgroundColor: 'grey.100' }}
                  />
                  
                  <TextField
                    name="password"
                    label="Password for Verification"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {loading ? 'Verifying...' : 'Verify Identity'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    size="medium"
                    onClick={() => {
                      setMode('signin');
                      setNeedsVerification(false);
                      setError('');
                      setSuccess('');
                    }}
                    fullWidth
                  >
                    ← Back to Sign In
                  </Button>
                </Box>
              )}

              {/* Sign In Email Verification Form - Mobile */}
              {mode === 'signin-verify' && (
                <Box component="form" onSubmit={handleSignInVerification} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Email Verification Required</strong><br />
                      For enhanced security, please enter the verification code sent to your email.
                    </Typography>
                  </Alert>

                  <TextField
                    name="username"
                    label="Username"
                    value={verificationUsername}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={{ backgroundColor: 'grey.100' }}
                  />
                  
                  <TextField
                    name="confirmationCode"
                    label="Verification Code"
                    value={formData.confirmationCode}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="Enter the 6-digit code from your email"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    size="medium"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await resendSignUpCode({
                          username: verificationUsername
                        });
                        setSuccess('New verification code sent to your email!');
                      } catch (err: any) {
                        setError(err.message || 'Failed to resend code');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    fullWidth
                  >
                    Resend Verification Code
                  </Button>

                  <Button
                    type="button"
                    variant="text"
                    size="medium"
                    onClick={() => {
                      setMode('signin');
                      setNeedsVerification(false);
                      setError('');
                      setSuccess('');
                    }}
                    fullWidth
                  >
                    ← Back to Sign In
                  </Button>
                </Box>
              )}

              {/* Sign Up Form */}
              {mode === 'signup' && (
                <Box component="form" onSubmit={handleSignUp} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                  
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                  
                  <TextField
                    name="username"
                    label="Username (email address)"
                    value={formData.username}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                  
                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <PasswordStrengthIndicator password={formData.password} />

                  <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <PasswordMatchIndicator password={formData.password} confirmPassword={formData.confirmPassword} />

                  <FormControl fullWidth required>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      name="accountType"
                      value={formData.accountType}
                      label="Account Type"
                      onChange={handleSelectChange}
                    >
                      {accountTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </Box>
              )}

              {/* Confirmation Form */}
              {mode === 'confirm' && (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'success.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <CheckCircle size={32} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      We've sent a 6-digit verification code to your email address.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleConfirmSignUp} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      name="confirmationCode"
                      label="Verification Code"
                      value={formData.confirmationCode}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em' } }}
                      placeholder="000000"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      color="success"
                    >
                      {loading ? 'Verifying...' : 'Verify account'}
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Button
                      onClick={handleResendCode}
                      disabled={loading}
                      color="primary"
                      size="small"
                    >
                      Resend verification code
                    </Button>

                    <Button
                      onClick={() => setMode('signin')}
                      color="inherit"
                      size="small"
                    >
                      ← Back to sign in
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Confirmed Account - Login Option */}
              {mode === 'confirmed' && (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'success.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <CheckCircle size={32} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      You have been verified!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your account has been successfully verified. Please sign in to access your account and create your secure wallet.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      onClick={handleLoginAfterConfirmation}
                      variant="contained"
                      size="large"
                      disabled={loading}
                      fullWidth
                      color="primary"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Button
                        onClick={() => setMode('signin')}
                        color="inherit"
                        size="small"
                      >
                        ← Back to sign in page
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Footer */}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Paper>
          </Container>
        </RightPanel>

                 {/* Mobile Content Panel - Show below form only for signup and related modes */}
         {(() => {
           const shouldShowContentPanel = (mode === 'signup' || mode === 'confirm' || mode === 'confirmed');
           return shouldShowContentPanel;
         })() && (
          <MobileContentPanel>
            <ContentCard>
              {/* Background Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.1,
                  background: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 20px,
                    rgba(255,255,255,0.05) 20px,
                    rgba(255,255,255,0.05) 40px
                  )`
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <Box sx={{ mb: 4 }}>
                  <LogoContainer>
                    <LogoIcon>
                      <Shield size={24} color="white" />
                      <LogoBadge>
                        <Lock size={8} color="white" />
                      </LogoBadge>
                    </LogoIcon>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                        SafeMate
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#22d3ee' }}>
                        Portal
                      </Typography>
                    </Box>
                  </LogoContainer>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                    {currentContent.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    {currentContent.description}
                  </Typography>
                </Box>

                {/* Features */}
                <Box>
                  {currentContent.features.map((feature, index) => (
                    <FeatureBox key={index}>
                      <FeatureIcon>
                        <feature.icon size={20} color="#22d3ee" />
                      </FeatureIcon>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', mb: 0.5, fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </FeatureBox>
                  ))}
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Secured by blockchain technology • End-to-end encrypted
                  </Typography>
                </Box>
              </Box>
            </ContentCard>
          </MobileContentPanel>
        )}
      </Box>
      
      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
        accountType={onboardingAccountType}
      />
    </>
  );
} 