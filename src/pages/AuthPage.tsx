import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/auth.store';
import { googleLogin, login, register } from '../api/auth.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              width?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with';
            },
          ) => void;
        };
      };
    };
  }
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Left side - brand panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-pink-700 flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md text-center">
            <h1 className="text-5xl font-bold mb-4">Nexcart</h1>
            <p className="text-2xl font-light mb-6">Looks that inspire.</p>
            <p className="text-lg opacity-80 leading-relaxed">
              Discover the latest fashion trends, top brands, and exclusive styles — all in one place.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4 opacity-70">
              {['👗', '👟', '💄', '🧢', '👜', '⌚'].map((emoji, i) => (
                <div key={i} className="text-4xl flex items-center justify-center h-16 w-16 bg-white/20 rounded-full mx-auto">
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-dark-surface">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-primary">Nexcart</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-dark-border mb-8">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'login'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'register'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text'
                }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm setAuth={setAuth} navigate={navigate} />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm setAuth={setAuth} navigate={navigate} onSwitch={() => setTab('login')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

interface FormProps {
  setAuth: (user: { id: string; name: string; email: string; role: string; avatar?: string }, token: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}

function LoginForm({ setAuth, navigate }: FormProps) {
  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await login(data);
      setAuth(res.user, res.accessToken);
      toast.success('Welcome back!');
      navigate(res.redirectTo || '/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted">Sign in to your Nexcart account</p>
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...reg('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...reg('password')}
      />
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in...' : 'Login'}
      </Button>
      <AuthDivider />
      <div className="flex justify-center">
        <GoogleAuthButton setAuth={setAuth} navigate={navigate} text="signin_with" />
      </div>
    </form>
  );
}

interface RegisterFormProps extends FormProps {
  onSwitch: () => void;
}

function RegisterForm({ setAuth, navigate }: RegisterFormProps) {
  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterFormData) {
    try {
      const res = await register(data);
      setAuth(res.user, res.accessToken);
      toast.success('Account created successfully!');
      navigate(res.redirectTo || '/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-1">Create account</h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted">Join Nexcart and start shopping</p>
      </div>
      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        error={errors.name?.message}
        {...reg('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...reg('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...reg('password')}
      />
      <Input
        label="Phone (optional)"
        type="tel"
        placeholder="+91 9876543210"
        error={errors.phone?.message}
        {...reg('phone')}
      />
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full mt-1">
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
      <AuthDivider />
      <div className="flex justify-center">
        <GoogleAuthButton setAuth={setAuth} navigate={navigate} text="signup_with" />
      </div>
    </form>
  );
}

function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400 dark:text-dark-muted">
      <span className="h-px flex-1 bg-gray-200 dark:bg-dark-border" />
      <span>or</span>
      <span className="h-px flex-1 bg-gray-200 dark:bg-dark-border" />
    </div>
  );
}

interface GoogleAuthButtonProps extends FormProps {
  text: 'signin_with' | 'signup_with';
}

function GoogleAuthButton({ setAuth, navigate, text }: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    if (window.google) {
      setIsReady(true);
      return;
    }

    const scriptId = 'google-identity-services';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => setIsReady(true), { once: true });
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !isReady || !window.google || !containerRef.current) return;

    containerRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        if (!credential) {
          toast.error('Google sign-in failed');
          return;
        }
        try {
          const res = await googleLogin(credential);
          setAuth(res.user, res.accessToken);
          toast.success('Welcome to Nexcart!');
          navigate(res.redirectTo || '/');
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Google sign-in failed';
          toast.error(message);
        }
      },
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      width: 384,
      text,
    });
  }, [clientId, isReady, navigate, setAuth, text]);

  if (!clientId) {
    return (
      <Button type="button" variant="outline" size="lg" disabled className="w-full max-w-sm">
        Continue with Google
      </Button>
    );
  }

  return <div ref={containerRef} className="min-h-[44px] w-full max-w-sm overflow-hidden rounded" />;
}
