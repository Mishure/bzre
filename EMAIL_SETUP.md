# 📧 Configurare Notificări Email

Sistem complet de notificări email implementat folosind **Resend**.

## ✅ Ce funcționează acum

Toate formularele de pe site trimit automat emailuri la **contact@bestinvestcamimob.ro**:

1. ✅ **Formular Contact** (`/contact`)
2. ✅ **Listare Proprietate** (`/listeaza-proprietate`)
3. ✅ **Evaluare Gratuită** (`/services/evaluation`)
4. ✅ **Consultanță Imobiliară** (`/services/consulting`)
5. ✅ **Consiliere Juridică** (`/services/legal`)
6. ✅ **Contract Exclusivitate** (`/services/exclusivity`)
7. ✅ **Informații Comisioane** (`/services/commissions`)

---

## 🚀 Pași pentru activare

### **Pas 1: Creează cont Resend (GRATUIT)**

1. Mergi la [https://resend.com](https://resend.com)
2. Click pe **"Start Building for Free"**
3. Creează cont cu Google/GitHub sau email
4. Confirmă emailul

### **Pas 2: Obține API Key**

1. După autentificare, intră în **Dashboard**
2. Click pe **"API Keys"** din meniul stâng
3. Click pe **"Create API Key"**
4. Nume: `BESTINVEST CAMIMOB Production`
5. Permission: **Sending access**
6. Click **"Create"**
7. **COPIAZĂ API KEY-ul** (îl vezi o singură dată!)
   - Format: `re_xxxxxxxxxxxxxxxxxxxxx`

### **Pas 3: Configurează domeniul (IMPORTANT!)**

#### **Opțiunea A: Domeniu Verificat (RECOMANDAT pentru producție)**

1. În Resend Dashboard → **Domains**
2. Click **"Add Domain"**
3. Introdu: `camimob.ro`
4. Urmează instrucțiunile pentru a adăuga DNS records:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

5. Așteaptă verificarea (5-30 minute)
6. După verificare, poți trimite de la: `noreply@camimob.ro`

#### **Opțiunea B: Testing (doar pentru dezvoltare)**

- Fără domeniu verificat, poți trimite **doar 100 emailuri/zi**
- Emailurile vor veni de la: `onboarding@resend.dev`
- OK pentru testare, dar **NU pentru producție**

### **Pas 4: Adaugă API Key în .env**

1. Deschide fișierul `.env` (sau `.env.local`)
2. Adaugă linia:

```bash
RESEND_API_KEY="re_your_actual_api_key_here"
```

3. **Înlocuiește** `re_your_actual_api_key_here` cu API key-ul tău real
4. Salvează fișierul

### **Pas 5: Restart Server**

```bash
# Oprește serverul (CTRL+C)
# Pornește din nou:
npm run dev
```

---

## 🔧 Configurare FROM Email

După ce domeniul este verificat, actualizează în `src/lib/email.ts`:

```typescript
// Linia 6 - Schimbă de la:
const FROM_EMAIL = 'noreply@camimob.ro';

// La (după verificare domeniu):
const FROM_EMAIL = 'noreply@camimob.ro'; // ✅ Va funcționa după verificare
```

---

## 📊 Monitorizare Emailuri

1. Intră în [Resend Dashboard](https://resend.com/overview)
2. Secțiunea **"Logs"** arată toate emailurile trimise
3. Vezi status: **Delivered**, **Bounced**, **Failed**
4. Click pe fiecare email pentru detalii complete

---

## 🧪 Testare

### Test rapid - Formular Contact:

1. Mergi pe http://localhost:3000/contact
2. Completează formularul
3. Trimite
4. Verifică:
   - ✅ Consola server: "Contact form email sent successfully"
   - ✅ Resend Dashboard → Logs: Emailul apare
   - ✅ Inbox **contact@bestinvestcamimob.ro**: Primești emailul

### Test complet - Toate formularele:

```bash
# Testează fiecare formular:
http://localhost:3000/contact
http://localhost:3000/listeaza-proprietate
http://localhost:3000/services/evaluation
http://localhost:3000/services/consulting
http://localhost:3000/services/legal
http://localhost:3000/services/exclusivity
http://localhost:3000/services/commissions
```

---

## ⚠️ Troubleshooting

### **1. "RESEND_API_KEY is not defined"**

- Verifică că ai adăugat `RESEND_API_KEY` în `.env`
- Restart server după modificări în `.env`
- Verifică că nu ai spații sau caractere invizibile

### **2. "Domain not verified"**

- Emailurile vor veni de la `onboarding@resend.dev`
- Pentru producție, trebuie să verifici domeniul `camimob.ro`
- Urmează pașii din Resend Dashboard → Domains

### **3. "Email not sent"**

- Verifică logs în consola server
- Verifică Resend Dashboard → Logs pentru erori
- Asigură-te că API key-ul este corect
- Verifică că nu ai depășit limita zilnică (100 pentru plan gratuit)

### **4. "Cannot read properties of undefined"**

- API key-ul este gol sau invalid
- Regenerează un API key nou din Resend Dashboard

---

## 💰 Costuri

### **Plan Gratuit:**
- ✅ 100 emailuri/zi
- ✅ 3,000 emailuri/lună
- ✅ Suficient pentru începători

### **Plan Pro ($20/lună):**
- ✅ 50,000 emailuri/lună
- ✅ Suport prioritar
- ✅ Webhook-uri
- ✅ Domenii custom nelimitate

---

## 📝 Note Importante

1. **NU comite `.env` în Git!** - API key-ul trebuie secret
2. **Pentru producție:** Verifică domeniul obligatoriu
3. **Monitoring:** Verifică zilnic Resend Logs primele săptămâni
4. **Backup:** Salvează API key-ul într-un loc sigur
5. **Regenerare:** Poți regenera API key-ul oricând din Dashboard

---

## 📧 Format Email-uri

Toate emailurile au:
- ✅ Design profesional HTML
- ✅ Template-uri custom pentru fiecare tip
- ✅ Toate datele formatate frumos
- ✅ Link-uri clickable (telefon, email)
- ✅ Footer cu logo BESTINVEST CAMIMOB

---

## ✅ Verificare Finală

După setup complet, ar trebui să ai:

- [x] Cont Resend creat
- [x] API Key generat și salvat
- [x] Domeniu `camimob.ro` verificat (pentru producție)
- [x] `RESEND_API_KEY` în `.env`
- [x] Server restartat
- [x] Test formular completat cu succes
- [x] Email primit la `contact@bestinvestcamimob.ro`

---

## 🆘 Suport

**Documentație Resend:** [https://resend.com/docs](https://resend.com/docs)

**Status Resend:** [https://status.resend.com](https://status.resend.com)

**Contact Resend:** support@resend.com

---

✨ **Sistemul este gata! Toate formularele trimit emailuri automat la contact@bestinvestcamimob.ro!**
