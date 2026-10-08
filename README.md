# Legado — Herencia de criptomonedas en Solana

Contrato inteligente en Solana que permite a los usuarios designar herederos para sus criptomonedas mediante un mecanismo de "dead man's switch" (interruptor de hombre muerto), con pausa por viaje y notificación automática por email.

---

## 🎯 Problema que resuelve

Millones de dólares en criptomonedas se pierden cada año porque sus dueños fallecen sin dejar instrucciones de acceso. **La blockchain no reconoce certificados de defunción ni órdenes judiciales: solo firmas.**

**Legado** resuelve esto creando una bóveda programática:

- El usuario designa 2 herederos (con sus direcciones y correos).
- Deposita una garantía en SOL.
- Debe hacer "ping" periódicamente para confirmar que está vivo.
- Si no lo hace en el período definido, los herederos pueden reclamar la garantía.
- Si se va de viaje, puede pausar el temporizador hasta 90 días.

---

## 🔗 Enlaces

| Recurso | URL |
|---------|-----|
| **Frontend** | [https://legado-red.vercel.app](https://legado-red.vercel.app) |
| **Contrato en Solana (Devnet)** | [Explorer](https://explorer.solana.com/address/2yNo3xJD5Qj1HYiAZZ4tKYgRp5HwLt2VXHjzckETMpYG?cluster=devnet) |
| **Program ID** | `2yNo3xJD5Qj1HYiAZZ4tKYgRp5HwLt2VXHjzckETMpYG` |

---

## 🛠️ Stack tecnológico

- **Solana** — Blockchain
- **Anchor 0.29** — Framework de contratos
- **Rust** — Lenguaje del contrato
- **TypeScript + Next.js 16** — Frontend
- **@solana/wallet-adapter** — Conexión con Phantom, Solflare
- **Nodemailer (Gmail SMTP)** — Envío de correos
- **Tailwind CSS + shadcn/ui** — Estilos
- **Vercel** — Hosting del frontend

---

## 📋 Instrucciones del contrato

| Instrucción | Descripción |
|---|---|
| `initialize_vault` | Crea la bóveda, cobra comisión y bloquea garantía en SOL |
| `ping` | Confirma que el dueño sigue activo (reinicia el timer) |
| `pause_inheritance` | Pausa el temporizador por viaje (1-90 días) |
| `resume_inheritance` | Reanuda tras el viaje |
| `cancel_vault` | Cancela la bóveda y devuelve la garantía al dueño |
| `trigger_inheritance` | Activa la herencia tras inactividad |
| `claim_inheritance` | Los 2 herederos firman juntos y reclaman 50/50 |

---

## 💰 Modelo de negocio

| Concepto | Monto | Quién lo paga | Quién lo recibe |
|---|---|---|---|
| **Comisión** | 0.005 SOL | Usuario al crear | Desarrollador |
| **Garantía** | Configurable (ej: 0.05 SOL) | Usuario al crear | Herederos (50/50) si se activa / Usuario si cancela |

---

## 🔐 Seguridad

- **Fix crítico:** El dueño no puede cancelar la bóveda tras expirar el período.
- **2-de-3:** Se necesitan las firmas de los 2 herederos para reclamar.
- **Pausa con límite:** Máximo 90 días. Si no reanuda, la herencia se activa.
- **Todas las acciones quedan registradas en la blockchain.**
- **La garantía en SOL se custodia en una PDA propiedad del programa.**

---

## 🧪 Tests
