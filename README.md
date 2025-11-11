# Efectivo inclusivo - Sistema de Autenticación Accesible

Sistema de autenticación accesible para Efectivo inclusivo, una aplicación de reconocimiento inteligente de billetes construida con React, TypeScript y Firebase, específicamente diseñada para usuarios con problemas de visión.

## Features

- **🔐 Autenticación de un solo botón**: Un botón universal para login y registro
- **🔥 Firebase Auth con Google**: Autenticación segura con cuentas de Google
- **♿ Accesibilidad visual**: Alto contraste, fuentes grandes y cumplimiento WCAG 2.1 AA
- **🔊 Retroalimentación de audio**: Notificaciones sonoras para acciones exitosas y errores
- **📱 Soporte para lectores de pantalla**: Etiquetas ARIA completas y HTML semántico
- **📐 Diseño responsivo**: Funciona en todos los dispositivos y tamaños de pantalla
- **🤖 Detección automática**: Detecta automáticamente usuarios existentes vs nuevos
- **💰 Preparado para Efectivo inclusivo**: Integración lista para reconocimiento de billetes con IA

## Setup Instructions

1. **Firebase Configuration**:
   - Create a new Firebase project at https://console.firebase.google.com/
   - Enable Authentication and add Google as a sign-in provider
   - Copy your Firebase config to `src/config/firebase.ts`

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm run dev
   ```

## Firebase Configuration

Replace the placeholder values in `src/config/firebase.ts` with your actual Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Accessibility Features

- **🎨 Alto Contraste**: Los colores cumplen con los estándares WCAG 2.1 AA
- **📝 Texto Grande**: Tamaño de fuente mínimo de 20px
- **⌨️ Navegación por Teclado**: Accesibilidad completa por teclado
- **🔊 Soporte para Lectores de Pantalla**: Etiquetas ARIA y descripciones apropiadas
- **🎵 Retroalimentación de Audio**: Sonidos de éxito y error mejorados
- **🎯 Gestión de Foco**: Indicadores de foco claros
- **🌊 Movimiento Reducido**: Respeta las preferencias del usuario
- **🎨 Gradientes Modernos**: Diseño visual atractivo y accesible

## Technical Stack

- **⚛️ React 18** con TypeScript
- **🔥 Firebase Authentication** 
- **🎨 Tailwind CSS** para estilos
- **🎯 Lucide React** para iconos
- **🎵 Web Audio API** para retroalimentación sonora
- **🎨 Google Fonts (Inter)** para tipografía mejorada

## Usage

1. **👀 Vista inicial**: El usuario ve un solo botón "Entrar con Google"
2. **🖱️ Clic**: Al hacer clic se abre la autenticación de Google
3. **🤖 Automático**: Firebase maneja automáticamente login/registro
4. **✅ Confirmación**: Retroalimentación visual y sonora de éxito
5. **🚪 Salida**: Los usuarios autenticados pueden cerrar sesión con un clic

## WCAG 2.1 Compliance

Este sistema cumple con los requisitos WCAG 2.1 Nivel AA incluyendo:
- ✅ Ratios de contraste de color
- ✅ Accesibilidad por teclado
- ✅ Compatibilidad con lectores de pantalla
- ✅ Gestión de foco
- ✅ Texto alternativo para imágenes
- ✅ Estructura HTML semántica

## Próximos Pasos - Integración Efectivo inclusivo

Este sistema de autenticación está preparado para integrarse con:
- 📷 **Cámara inteligente** para captura de billetes
- 🧠 **TensorFlow.js** para reconocimiento con IA
- 🎯 **Teachable Machine** para modelos personalizados
- 📱 **Interfaz móvil optimizada** para uso en tiempo real
- 🔊 **Retroalimentación sonora** para confirmación de detección