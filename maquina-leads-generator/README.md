# Maquina Leads Generator — Documentación Completa

Sistema automático de generación de leads con IA usando n8n, OpenAI, Google Sheets y Gmail.
**Coste operativo estimado: 2-5€/mes** (solo OpenAI, todo lo demás es gratis).

---

## Workflows en N8N

| Workflow | ID n8n | Trigger | Función |
|----------|--------|---------|---------|
| MLG-01 Discovery | `hXVOcI3wmMdh0lX9` | Diario 2am | Busca negocios en Google Maps |
| MLG-02 Enrichment | `2yEilGH0TkYn3Xp8` | Cada 2h | Extrae emails, PageSpeed, Intent Score |
| MLG-03 Web Analysis | `ZhLcGgtqdc6On1Ja` | Cada 4h | Analiza web con gpt-4o-mini |
| MLG-04 Message Gen | `fdov3DsfBmNaaYfJ` | Cada 6h | Genera email personalizado |
| MLG-05 Outreach | `oDrFUZJY8vCoatxQ` | Lun-Vie 9am | Envía emails via Gmail |
| MLG-06 Follow-up | `vHZgEM93HD8TbpoT` | Diario 10am | Seguimientos días 3, 7 y 14 |
| MLG-07 Respuestas | `AGYurs9LLvHhzjZg` | Gmail Trigger | Clasifica respuestas, envía Calendly |
| MLG-08 Dashboard | `Xuz2zC65E5rYSqCh` | Webhook GET | Panel visual en tiempo real |

---

## Setup inicial (pasos obligatorios)

### 1. Crear Google Sheet

1. Ir a [sheets.google.com](https://sheets.google.com) → crear hoja nueva
2. Nombrarla: `Maquina Leads Generator - [Nombre Cliente]`
3. Crear una pestaña llamada exactamente: **`MLG_Leads`**
4. Copiar el ID de la URL (la parte entre `/d/` y `/edit`)

**Columnas necesarias en MLG_Leads** (añadir en fila 1):
```
place_id | Negocio | Telefono | Direccion | Web | Rating | Total_Resenias |
Tipo | Tiene_Web | Google_Maps_URL | Estado | Fecha_Discovery | Intent_Score |
Email | Mobile_Score | Web_Age_Anios | Prioridad | Analisis_Web |
Problemas_Detectados | Oportunidades | Recomendacion_Principal |
Asunto_Email | Mensaje_Generado | Fecha_Envio | Clasificacion_Respuesta
```

### 2. Configurar cada workflow

En **cada uno de los 8 workflows**, abrir el nodo `⚙️ Config` y cambiar:

| Campo | Valor |
|-------|-------|
| `sheet_id` | ID de tu Google Sheet |
| `ciudad` | Ciudad objetivo (MLG-01) |
| `sectores` | Sectores separados por coma (MLG-01) |
| `agencia_nombre` | Tu nombre de agencia (MLG-04) |
| `remitente_nombre` | Tu nombre (MLG-04) |
| `calendly_link` | Tu link de Calendly (MLG-04, MLG-07) |

### 3. Activar workflows en orden

Activar en este orden exacto:
1. MLG-01 → esperar que corra una vez
2. MLG-02 → esperar que procese los leads
3. MLG-03 → esperar análisis
4. MLG-04 → esperar mensajes generados
5. MLG-05 → activar (ya empezará a enviar el próximo lunes)
6. MLG-06 → activar
7. MLG-07 → activar
8. MLG-08 → ya activo (dashboard disponible)

---

## Dashboard del cliente

**URL del panel:**
```
https://n8n.cruzn8n.com/webhook/mlg-dashboard?sheet_id=TU_SHEET_ID&cliente=Nombre+Cliente
```

El cliente abre esta URL en el navegador y ve en tiempo real:
- Total leads en pipeline
- Funnel por estado
- Leads interesados (acción inmediata)
- Top leads por Intent Score
- Tasa de respuesta
- Progreso del pipeline

**Para cada cliente nuevo**, solo cambia los parámetros en la URL:
- `sheet_id=` → ID de su Google Sheet
- `cliente=` → Nombre del cliente

---

## Flujo de estados de un lead

```
Nuevo
  ↓ (MLG-02)
Enriquecido
  ↓ (MLG-03, si tiene web)
Analizado
  ↓ (MLG-04, si tiene email)
Mensaje_Listo
  ↓ (MLG-05)
Contactado
  ↓ (MLG-06, día 3)
Seguimiento_1
  ↓ (MLG-06, día 7)
Seguimiento_2
  ↓ (MLG-06, día 14)
Seguimiento_3

Si responde (MLG-07):
  → Interesado   (Calendly enviado automáticamente)
  → En_Duda      (revisar manualmente)
  → No_Interesado (pipeline cerrado)
```

---

## Optimización de costes OpenAI

| Tarea | Modelo | Tokens aprox | Coste/lead |
|-------|--------|-------------|------------|
| Análisis web (MLG-03) | gpt-4o-mini | ~400 | 0.00012€ |
| Generar mensaje (MLG-04) | gpt-4o-mini | ~600 | 0.00018€ |
| Follow-up (MLG-06) | gpt-4o-mini | ~350 | 0.00010€ |
| Clasificar respuesta (MLG-07) | gpt-4o-mini | ~150 | 0.00004€ |
| **Total por lead completo** | | | **~0.0005€** |

**1.000 leads procesados = 0.50€ en OpenAI**

Estrategias aplicadas:
- Solo llama a OpenAI cuando el lead tiene email válido
- Limita el HTML scrapeado a 2.500 caracteres
- Caché implícita: no re-analiza leads ya procesados
- gpt-4o-mini para el 100% de las tareas (suficiente calidad)

---

## Modelo SaaS — Cómo venderlo

### Precios recomendados

| Tier | Setup | Mensual | Leads/mes | Coste op. | Margen |
|------|-------|---------|-----------|-----------|--------|
| Básico | 800€ | 300€ | 500 | ~15€ | 95% |
| Profesional | 1.500€ | 600€ | 2.000 | ~30€ | 95% |
| Agencia | 3.000€ | 1.200€ | 5.000+ | ~60€ | 95% |

### Por cliente nuevo

1. Crear Google Sheet con pestaña MLG_Leads
2. Duplicar los 8 workflows en n8n
3. Cambiar `sheet_id`, `ciudad`, `sectores`, `calendly_link` en nodo Config
4. Activar en orden
5. Enviar URL del dashboard al cliente:
   `https://n8n.cruzn8n.com/webhook/mlg-dashboard?sheet_id=XXX&cliente=NombreCliente`

**Tiempo de setup por cliente: ~30 minutos**

---

## APIs y herramientas usadas

| Herramienta | Coste | Para qué |
|-------------|-------|---------|
| n8n self-hosted | 0€ | Motor de automatización |
| Google Places API | 0€* | Discovery de negocios |
| Google PageSpeed API | 0€ | Intent score (velocidad móvil) |
| Wayback Machine API | 0€ | Intent score (edad de la web) |
| OpenAI gpt-4o-mini | ~0.50€/1k leads | Análisis + mensajes |
| Google Sheets | 0€ | Base de datos + CRM |
| Gmail | 0€ | Envío de emails |
| Calendly Free | 0€ | Agendado de reuniones |

*Google Places API incluye 200$/mes de crédito gratuito (suficiente para ~11.000 requests/mes)

---

## Créditos

Proyecto: **Maquina Leads Generator**
Agencia: Cruz Digital
Creado con: Claude Code + n8n MCP
Fecha: Marzo 2026
