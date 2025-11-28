# Migrare de la Supabase la Neon Database

## 📋 Status Actual

✅ **Export complet:** 137 înregistrări exportate din Supabase
- 14 proprietăți
- 85 imagini
- 12 cereri clienți
- 3 submissions
- 19 activități admin
- 1 admin
- 2 agenți
- 1 curs valutar

## 🎯 Pași pentru Migrare

### Pasul 1: Creează cont Neon

1. Accesează: https://neon.tech
2. Sign up cu GitHub/Google/Email
3. Verifică email-ul dacă e necesar

### Pasul 2: Creează proiect nou

1. Click pe **"Create a project"**
2. Setează:
   - **Project name:** `buzau-realestate-prod` (sau alt nume)
   - **Region:** Alege **Europe (Frankfurt)** - cel mai aproape de România
   - **PostgreSQL version:** 16 (latest)
3. Click **"Create project"**

### Pasul 3: Obține connection strings

După ce proiectul e creat, vei vedea **Connection Details**:

```
📋 Vei avea 2 connection strings:

1. DATABASE_URL (pooled connection):
   postgresql://[user]:[password]@[host]/[db]?sslmode=require

2. DIRECT_URL (direct connection):
   postgresql://[user]:[password]@[host]/[db]?sslmode=require&connect_timeout=10
```

**IMPORTANT:** Copiază ambele strings într-un loc sigur!

### Pasul 4: Actualizează .env.local

Înlocuiește connection strings-urile în `.env.local`:

```bash
# Neon Database URLs (înlocuiește cu valorile tale)
DATABASE_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require&connect_timeout=10"

# Păstrează restul variabilelor
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
# ... etc
```

### Pasul 5: Rulează migrarea schemei

```bash
# 1. Push schema către Neon
npx prisma db push

# 2. Generează Prisma Client
npx prisma generate
```

### Pasul 6: Importă datele

```bash
# Rulează scriptul de import
npx tsx scripts/import-data.ts
```

Ar trebui să vezi:
```
🚀 Starting data import to Neon...
📊 Data to import:
   - Admins: 1
   - Properties: 14
   - Property Images: 85
   ...
✅ Data import completed successfully!
```

### Pasul 7: Verifică datele

```bash
# Verifică că totul e OK
npx prisma studio
```

Ar trebui să vezi toate cele 14 proprietăți cu imaginile lor.

### Pasul 8: Testează local

```bash
# Restart development server
npm run dev
```

Accesează:
- http://localhost:3000/properties?type=APARTAMENT&operation=VANZARE
- http://localhost:3000/properties/47

Ar trebui să funcționeze perfect, **FĂRĂ erori de connection timeout**!

### Pasul 9: Actualizează Vercel

1. Accesează: https://vercel.com/dashboard
2. Selectează proiectul **camimob**
3. Mergi la **Settings** → **Environment Variables**
4. Actualizează:
   - `DATABASE_URL` - cu noul string de la Neon
   - `DIRECT_URL` - cu noul direct URL de la Neon
5. Click **Save**
6. Mergi la **Deployments** și click **Redeploy** pe ultimul deployment

### Pasul 10: Verifică producția

După deploy (2-3 minute):
1. Accesează https://www.camimob.ro
2. Verifică că proprietățile se încarcă
3. Testează câteva page refresh-uri
4. **NU ar trebui să mai ai erori 500!**

## 🎉 Beneficii Neon vs Supabase FREE

| Feature | Supabase FREE | Neon FREE |
|---------|---------------|-----------|
| **Conexiuni** | 60 (prea puține) | 100+ |
| **Storage** | 500 MB | 10 GB |
| **RAM** | Limitat | 512 MB |
| **Connection Pooling** | Problematic | Native, stabil |
| **Uptime** | Instabil | 99.9% |
| **Rate Limiting** | Agresiv | Rezonabil |

## 🔧 Troubleshooting

### Eroare: "Schema does not exist"
```bash
# Rulează din nou push
npx prisma db push --force-reset
npx tsx scripts/import-data.ts
```

### Eroare: "Duplicate key violation"
- Normal - scriptul folosește `upsert` și va sări peste duplicate
- Datele existente vor fi păstrate

### Verifică conexiunea
```bash
# Test rapid de conexiune
npx prisma db execute --stdin <<< "SELECT 1"
```

## 📞 Suport Neon

Dacă ai probleme:
- Docs: https://neon.tech/docs
- Discord: https://discord.gg/neon
- Email: support@neon.tech

## 🔒 Securitate

**NU uita:**
- ✅ Adaugă `data-export/` în `.gitignore` (deja făcut)
- ✅ NU commit-a `.env.local`
- ✅ Șterge export-ul după migrare: `rm -rf data-export/`
- ✅ Actualizează environment variables în Vercel

## 📝 Note Finale

- **Branch `versupabase`:** Păstrează versiunea cu Supabase (backup)
- **Branch `master`:** Va folosi Neon după migrare
- **Rollback:** Dacă ceva nu merge, poți reveni la `versupabase`

---

**Status:** Ready to migrate! 🚀

**Next step:** Creează contul Neon și obține connection strings
