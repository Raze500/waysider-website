# Waysider — Brandbook v1.0

---

## Posicionamiento

### Matriz

| Bloque | Respuesta |
|---|---|
| Categoría | Herramientas mobile para la vida cotidiana |
| Enemigo | Apps infladas con 50 funciones cuando solo necesitás 3 |
| Audiencia | Usuarios Android no técnicos que quieren algo que funcione y se vea bien |
| Promesa | Una app de calidad: simple, bonita, y hace lo que tiene que hacer |
| Mecanismo | Foco radical — sabemos lo que la gente necesita sin rodeos |
| Prueba | Developer independiente, sin corporación detrás, sin agenda oculta |

### Statement de posicionamiento

> Para usuarios Android no técnicos hartos de apps infladas y confusas, **Waysider** es el estudio indie que crea herramientas mobile simples y bien diseñadas. A diferencia de las apps corporativas con decenas de funciones que nunca vas a usar, hacemos una sola cosa y la hacemos bien.

### Tagline

**"Apps sin rodeos."**

---

## Misión, visión, valores

**Misión** — Crear herramientas Android que cualquier persona pueda usar desde el primer toque, sin manual ni frustración.

**Visión** — Ser el estudio indie de referencia para apps que resuelven problemas reales de forma elegante.

**Valores**
- **Foco** — Una función bien hecha vale más que diez a medias.
- **Honestidad** — Sin dark patterns, sin suscripciones trampa, sin rastreo innecesario.
- **Cuidado** — Cada detalle importa. Si se ve mal, se siente mal.
- **Accesibilidad** — Si tu abuela no lo entiende, hay algo mal en el diseño.

---

## Tono de voz

### Ejes (escala 1–5)

| Eje | Valor |
|---|---|
| Formal ←→ Coloquial | 4 |
| Serio ←→ Humorístico | 2 |
| Respetuoso ←→ Irreverente | 2 |
| Técnico ←→ Divulgativo | 5 |

### 3 principios de voz

1. **Hablamos como un amigo que sabe de tech** — claro, directo, sin jerga innecesaria. Nunca como un manual de usuario ni como un comercial corporativo.
2. **Mostramos, no prometemos** — en lugar de "la mejor app del mercado", decimos qué hace exactamente y por qué importa.
3. **Respetamos el tiempo del lector** — una frase cuando basta con una frase. Sin relleno.

### Vocabulario — SÍ

simple, claro, enfocado, directo, sin rodeos, bonito, cotidiano, confiable, indie, honesto, rápido, ligero, hace lo suyo, sin complicaciones, lo que necesitás

### Vocabulario — NO

disruptivo, innovador, revolucionario, solución, ecosistema, sinergia, robusto, potente, best-in-class, enterprise, premium (sin justificación), next-gen, world-class

### Ejemplos "Antes → Después"

**Landing — hero text**
- Antes: "La solución mobile más innovadora para optimizar tu productividad cotidiana."
- Después: "Una app que hace lo que tiene que hacer. Nada más."

**Email de bienvenida**
- Antes: "Bienvenido al ecosistema Waysider. Estamos comprometidos a brindarte una experiencia de usuario excepcional."
- Después: "Hola. Gracias por descargar [Nombre App]. Tiene una sola función. La hace bien. Avisame si algo no funciona."

**Error 404**
- Antes: "Lo sentimos. La página que buscás no existe. Por favor verificá la URL e intentá nuevamente."
- Después: "Esta página no existe. Pero las apps sí. → Ver apps"

---

## Sistema visual

### Filosofía visual

Dark-first, geométrico limpio. El diseño tiene que comunicar "hecho con cuidado por una persona real", no "generado por una corporación". Cada pantalla debe sentirse liviana aunque sea densa en contenido.

### Paleta de colores

#### Primario — Indigo

| Token | HEX | RGB | HSL | Uso |
|---|---|---|---|---|
| `--color-primary-50` | `#eef2ff` | 238, 242, 255 | 226° 100% 97% | Fondos muy suaves |
| `--color-primary-100` | `#e0e7ff` | 224, 231, 255 | 226° 100% 94% | Hover states claros |
| `--color-primary-200` | `#c7d2fe` | 199, 210, 254 | 228° 97% 89% | Borders activos |
| `--color-primary-300` | `#a5b4fc` | 165, 180, 252 | 233° 94% 82% | Iconos secundarios |
| `--color-primary-400` | `#818cf8` | 129, 140, 248 | 234° 90% 74% | Links |
| `--color-primary-500` | `#6366f1` | 99, 102, 241 | 239° 84% 67% | **Color principal de marca** |
| `--color-primary-600` | `#4f46e5` | 79, 70, 229 | 245° 75% 59% | Botones hover |
| `--color-primary-700` | `#4338ca` | 67, 56, 202 | 247° 60% 51% | Botones pressed |
| `--color-primary-800` | `#3730a3` | 55, 48, 163 | 245° 54% 41% | Texto sobre fondo claro |
| `--color-primary-900` | `#312e81` | 49, 46, 129 | 244° 48% 34% | Dark surface |

Contraste `--color-primary-500` sobre `#09090b`: **6.2:1** ✓ WCAG AA

#### Acento — Lima

| Token | HEX | Uso |
|---|---|---|
| `--color-accent-300` | `#bef264` | Highlights sobre dark |
| `--color-accent-400` | `#a3e635` | **Acento principal** — CTAs secundarios, badges |
| `--color-accent-500` | `#84cc16` | Hover del acento |
| `--color-accent-600` | `#65a30d` | Texto acento sobre fondo claro |

Contraste `--color-accent-400` sobre `#09090b`: **9.4:1** ✓ WCAG AAA

#### Neutros — Zinc

| Token | HEX | Uso |
|---|---|---|
| `--color-neutral-0` | `#ffffff` | Texto sobre dark / fondos light |
| `--color-neutral-50` | `#fafafa` | Fondos light |
| `--color-neutral-100` | `#f4f4f5` | Cards light |
| `--color-neutral-200` | `#e4e4e7` | Borders light |
| `--color-neutral-300` | `#d4d4d8` | Texto muted light |
| `--color-neutral-400` | `#a1a1aa` | Placeholders |
| `--color-neutral-500` | `#71717a` | Texto secundario |
| `--color-neutral-600` | `#52525b` | Texto secundario dark |
| `--color-neutral-700` | `#3f3f46` | Borders dark |
| `--color-neutral-800` | `#27272a` | Cards dark |
| `--color-neutral-900` | `#18181b` | Surface dark |
| `--color-neutral-950` | `#09090b` | **Background principal dark** |

#### Estados

| Token | HEX | Uso |
|---|---|---|
| `--color-success` | `#22c55e` | Confirmaciones |
| `--color-warning` | `#f59e0b` | Alertas |
| `--color-error` | `#ef4444` | Errores |
| `--color-info` | `#3b82f6` | Info |

### Tipografía

**Display — Syne** (Google Fonts, SIL Open Font License)
- Geométrica, moderna, con carácter propio. Comunica "indie con criterio".
- Usada en: headlines, hero text, nombres de apps, taglines.

**Body — Inter** (Google Fonts, SIL Open Font License)
- Máxima legibilidad a cualquier tamaño. El estándar para UI en pantalla.
- Usada en: párrafos, labels, botones, descripción de features, UI en general.

#### Escala tipográfica (ratio 1.25 — Major Third)

| Token | rem | px | Uso |
|---|---|---|---|
| `--text-xs` | 0.64rem | ~10px | Captions, legal |
| `--text-sm` | 0.8rem | ~13px | Labels, metadata |
| `--text-base` | 1rem | 16px | Body texto |
| `--text-lg` | 1.25rem | 20px | Lead text, subtítulos |
| `--text-xl` | 1.563rem | 25px | H4, card títulos |
| `--text-2xl` | 1.953rem | 31px | H3 |
| `--text-3xl` | 2.441rem | 39px | H2 |
| `--text-4xl` | 3.052rem | 49px | H1 desktop |
| `--text-5xl` | 3.815rem | 61px | Hero display |

### Espaciado (escala 4px)

`4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96 — 128`

### Border radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 4px | Inputs, badges pequeños |
| `--radius-md` | 8px | Botones, chips |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modales, panels |
| `--radius-2xl` | 24px | Hero cards, app previews |
| `--radius-full` | 9999px | Pills, avatares |

### Iconografía

**Lucide Icons** — una sola familia, nunca mezclar con otras. Stroke-width: 1.5px en UI general, 2px en lugares de énfasis.

### Estilo de imagen

**Abstracto geométrico** — sin fotos de stock, sin ilustraciones cartoon. Usar formas geométricas, gradientes, y mockups de dispositivo (Android phone) cuando sea necesario. Cada app puede tener un color de acento propio dentro de la paleta primaria.

---

## Usos correctos / incorrectos

**Logo / nombre — CORRECTO**
- "Waysider" (capital W, resto minúscula)
- Sobre fondo oscuro con color primario o blanco
- Con tagline "Apps sin rodeos." debajo en Inter regular

**Logo / nombre — INCORRECTO**
- "WAYSIDER" todo mayúsculas (grita, no es el tono)
- "waysider" todo minúsculas (pierde jerarquía)
- Sobre fondo claro con color primario-500 (contraste insuficiente — usar primary-700+)
- Con gradiente en el texto del nombre
