import React, { useState } from 'react';
import { LogIn, LogOut, User, AlertCircle, CheckCircle, Camera, Banknote, Shield, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AccessibleButton } from './AccessibleButton';
import { audioFeedback } from '../utils/audioFeedback';
import { CameraScreen } from './CameraScreen';

export const AuthScreen: React.FC = () => {
  const { user, loading, error, signInWithGoogle, logout } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setFeedbackMessage(null);

    try {
      await signInWithGoogle();
      setFeedbackMessage('¡Inicio de sesión exitoso!');
      audioFeedback.playSuccess();
    } catch (error) {
      setFeedbackMessage('Error al iniciar sesión. Por favor, intenta de nuevo.');
      audioFeedback.playError();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setFeedbackMessage('Sesión cerrada correctamente');
      audioFeedback.playSuccess();
    } catch (error) {
      setFeedbackMessage('Error al cerrar sesión');
      audioFeedback.playError();
    }
  };

  // Si el usuario está autenticado, mostrar la pantalla de la cámara
  if (user) {
    return (
      <CameraScreen 
        onLogout={handleLogout}
        userName={user.displayName || 'Usuario'}
      />
    );
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
        role="main"
        aria-label="Cargando aplicación"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-semibold text-blue-900" aria-live="polite">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
      role="main"
      aria-label={user ? "Panel de usuario autenticado" : "Pantalla de inicio de sesión"}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12 animate-pulse"></div>
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        ></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8">
        <header className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
              <Banknote className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            {user ? 'Efectivo inclusivo' : 'Efectivo inclusivo'}
          </h1>
          <p className="text-xl text-gray-600">
            {user ? 'Reconocimiento de billetes con IA' : 'Reconocimiento inteligente de billetes'}
          </p>
        </header>

        {/* Feedback Messages */}
        {feedbackMessage && (
          <div 
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              feedbackMessage.includes('Error') || feedbackMessage.includes('error')
                ? 'bg-red-100 border-2 border-red-300'
                : 'bg-green-100 border-2 border-green-300'
            }`}
            role="alert"
            aria-live="assertive"
          >
            {feedbackMessage.includes('Error') || feedbackMessage.includes('error') ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            <span className="text-lg font-medium">
              {feedbackMessage}
            </span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div 
            className="p-4 rounded-lg bg-red-100 border-2 border-red-300 flex items-center space-x-3"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-lg font-medium text-red-800">
              {error}
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Login Screen */}
            <div className="text-center space-y-8">
              {/* Features showcase */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Cámara Inteligente</h3>
                    <p className="text-sm text-gray-600">Reconocimiento en tiempo real</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="bg-green-100 rounded-full p-3">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">IA Avanzada</h3>
                    <p className="text-sm text-gray-600">Precisión del 95%+</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Seguro y Privado</h3>
                    <p className="text-sm text-gray-600">Sin almacenamiento de imágenes</p>
                  </div>
                </div>
              </div>
              
              <AccessibleButton
                onClick={handleSignIn}
                disabled={isSigningIn}
                variant="primary"
                className="w-full"
                ariaLabel="Iniciar sesión con Google"
                ariaDescription="Botón principal para autenticarse con Google. Funciona tanto para usuarios nuevos como existentes."
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>
                    {isSigningIn ? 'Autenticando...' : 'Entrar con Google'}
                  </span>
                </div>
              </AccessibleButton>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <p className="text-lg text-blue-900 leading-relaxed">
                  <strong>¡Bienvenido a Efectivo inclusivo!</strong><br/>
                  Inicia sesión para acceder al reconocimiento inteligente de billetes. 
                  La autenticación es segura y se maneja automáticamente.
                </p>
              </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-medium">
            Sistema accesible optimizado para usuarios con problemas de visión
          </p>
        </footer>
      </div>
    </div>
  );
};