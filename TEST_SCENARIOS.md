# 🧪 Escenarios de Prueba - Sistema de Detección v2

## 📋 Checklist de Pruebas

Use esta lista para verificar que el sistema funciona correctamente:

---

## ❌ ESCENARIOS QUE NO DEBEN DETECTAR NADA

### 1. Pantalla Negra / Cámara Tapada
**Cómo probar:**
- Tapa completamente la cámara con tu mano
- O apunta la cámara a un lugar muy oscuro

**Resultado esperado:**
```
📷 Cámara muy oscura
```

**✅ CORRECTO:** No hace predicción del modelo
**❌ ERROR:** Muestra alguna clase de billete

---

### 2. Pared/Fondo Uniforme
**Cómo probar:**
- Apunta la cámara a una pared blanca
- O a una superficie de un solo color (mesa, piso, etc.)

**Resultado esperado:**
```
Esperando objeto...
```

**✅ CORRECTO:** No detecta nada
**❌ ERROR:** Muestra alguna clase de billete

---

### 3. Objeto Desconocido
**Cómo probar:**
- Muestra un objeto que NO es un billete:
  - Tu mano
  - Un celular
  - Una taza
  - Un libro

**Resultado esperado:**
```
Esperando objeto...
O
⚠️ Objeto no reconocido
O
📍 Acérquese más
```

**✅ CORRECTO:** No detecta ningún billete
**❌ ERROR:** Detecta un billete cuando no hay ninguno

---

### 4. Billete Borroso / Muy Lejos
**Cómo probar:**
- Sostén un billete real pero muy lejos de la cámara
- O mueve el billete rápidamente (efecto blur)

**Resultado esperado:**
```
📍 Acérquese más
O
🎯 Enfoque mejor el objeto
O
⏳ Confirmando... 1/5 o 2/5 (nunca llega a 5)
```

**✅ CORRECTO:** No confirma detección
**❌ ERROR:** Detecta con poca información

---

### 5. Múltiples Billetes Superpuestos
**Cómo probar:**
- Coloca 2-3 billetes diferentes uno encima del otro
- Que el modelo "vea" partes de varios billetes

**Resultado esperado:**
```
⚠️ Objeto no reconocido
O
🔍 Enfocando... (se queda oscilando)
```

**✅ CORRECTO:** No detecta nada (modelo confundido)
**❌ ERROR:** Detecta uno de los billetes al azar

---

## ✅ ESCENARIO QUE SÍ DEBE DETECTAR

### 6. Billete Claro y Centrado
**Cómo probar:**
- Toma un billete real de tu modelo entrenado
- Sostenlo centrado en la cámara
- A 20-30 cm de distancia
- Con buena iluminación
- Manténlo estable por 3-5 segundos

**Resultado esperado (secuencia):**
```
1. ⏳ Confirmando... 1/5
2. ⏳ Confirmando... 2/5
3. ⏳ Confirmando... 3/5
4. ⏳ Confirmando... 4/5
5. ⏳ Confirmando... 5/5
6. 💵 [Nombre del billete detectado]
7. (Mantiene el resultado por 2.5 segundos)
```

**✅ CORRECTO:** Detecta correctamente después de 5 confirmaciones
**❌ ERROR:** No detecta nada o detecta incorrecto

---

## 🔍 Monitoreo con Console Logs

Abre la consola del navegador (F12) y busca logs como:

```javascript
[ANÁLISIS]
  Clase: 20 pesos
  Confianza: 96.8%
  Margen: 52.3%
  Brillo: 142
  Uniformidad: 35%
  Válido: true
  Dominante: true
```

### 📊 Interpretación de Valores

#### Pantalla Negra:
```
Brillo: 3-15          ← Muy bajo
Uniformidad: 95-100%  ← Muy uniforme
Válido: false         ← No pasa filtro
```

#### Fondo Uniforme:
```
Brillo: 100-200       ← Bueno
Uniformidad: 92-98%   ← Demasiado uniforme
Válido: false         ← No pasa filtro
```

#### Objeto Desconocido:
```
Confianza: 55-85%     ← Baja
Margen: 5-30%         ← Insuficiente
Válido: false         ← No cumple thresholds
```

#### Billete Correcto:
```
Confianza: 95-99%     ← Excelente
Margen: 45-70%        ← Gran diferencia
Brillo: 80-200        ← Aceptable
Uniformidad: 20-70%   ← Tiene detalles
Válido: true          ← Pasa filtros
Dominante: true       ← >95%
```

---

## 🛠️ Ajustes si Falla Alguna Prueba

### Problema: Detecta en pantalla negra

**Solución:** Aumentar `MIN_BRIGHTNESS`
```typescript
const MIN_BRIGHTNESS = 30; // Cambiar de 20 a 30
```

---

### Problema: Detecta en fondos uniformes

**Solución:** Reducir `MAX_UNIFORM_THRESHOLD`
```typescript
const MAX_UNIFORM_THRESHOLD = 0.85; // Cambiar de 0.90 a 0.85
```

---

### Problema: Detecta objetos desconocidos

**Solución:** Aumentar thresholds
```typescript
const CONFIDENCE_THRESHOLD = 0.97;     // De 0.95 a 0.97
const CONFIDENCE_MARGIN = 0.45;        // De 0.40 a 0.45
const MIN_VALID_CONFIDENCE = 0.94;     // De 0.92 a 0.94
```

---

### Problema: NO detecta billetes reales

**Solución:** Reducir thresholds (pero con cuidado)
```typescript
const CONFIDENCE_THRESHOLD = 0.93;     // De 0.95 a 0.93
const CONFIDENCE_MARGIN = 0.35;        // De 0.40 a 0.35
const QUICK_CONFIRM_COUNT = 4;         // De 5 a 4
```

⚠️ **IMPORTANTE:** Si reduces demasiado, volverán los falsos positivos

---

## 📈 Métricas de Éxito

El sistema está funcionando correctamente si:

✅ **0 falsos positivos** en escenarios 1-5
✅ **Detección correcta** en escenario 6
✅ **Mensajes claros** que guían al usuario
✅ **Logs consistentes** en consola
✅ **Tiempo de respuesta** ~3-5 segundos para detección

---

## 🎯 Filosofía del Sistema

> **"Es mejor NO detectar nada que detectar algo incorrecto"**

Este sistema prioriza:
1. 🛡️ **Precisión** sobre velocidad
2. 🚫 **Cero falsos positivos** sobre comodidad
3. ✅ **Confianza total** en detecciones confirmadas

Si un billete real no se detecta, el usuario puede:
- Acercarlo más
- Mejorar la iluminación
- Estabilizar el objeto
- Centrar mejor en cámara

Pero **NUNCA** debe ver un billete que no existe.

---

**Última actualización:** v2 - Triple validación
