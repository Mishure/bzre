# Supabase Storage Setup pentru Imagini Proprietăți

## Pași de Configurare:

### 1. Creează Storage Bucket în Supabase

1. Mergi la: https://supabase.com/dashboard/project/lrywxojospwerllzjifz/storage
2. Click pe **"New bucket"**
3. Configurare bucket:
   - **Name**: `property-images`
   - **Public bucket**: ✅ BIFEAZĂ (pentru ca imaginile să fie accesibile public)
   - **File size limit**: 5 MB (sau mai mult dacă dorești)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
4. Click **"Create bucket"**

### 2. Configurează Politici de Acces (Policies)

După ce ai creat bucket-ul, trebuie să setezi politici pentru upload și download:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');
```

Sau poți seta aceste politici din UI:
1. Click pe bucket-ul `property-images`
2. Go to **Policies** tab
3. Click **"New policy"**
4. Selectează template-ul **"Allow public read access"**
5. Repetă pentru upload (select template "Allow authenticated uploads")

### 3. Obține Service Role Key

1. Mergi la: **Settings** → **API**
2. Scroll jos la **Project API keys**
3. Copiază **service_role** key (NU anon key!)
4. Adaugă în `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Actualizează .env.production

Asigură-te că ai următoarele variabile în `.env.production` pentru Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lrywxojospwerllzjifz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Rulează SQL Migration

Rulează următoarea comandă SQL în Supabase SQL Editor pentru a adăuga coloana de imagini:

```sql
ALTER TABLE property_submissions
ADD COLUMN IF NOT EXISTS images TEXT;
```

Sau folosește fișierul: `supabase-add-images-column.sql`

## Verificare

După configurare, testează:
1. Mergi la http://localhost:3001/listeaza-proprietate
2. Completează formularul
3. Încarcă câteva imagini
4. Trimite formularul
5. Verifică în Supabase Storage dacă imaginile au fost încărcate
6. Verifică în `/admin/submissions` dacă imaginile apar

## Troubleshooting

### Eroare: "Failed to upload image"
- Verifică că bucket-ul `property-images` există
- Verifică că policies sunt setate corect
- Verifică că `SUPABASE_SERVICE_ROLE_KEY` este corectă în `.env`

### Imaginile nu apar în admin
- Verifică că `images` column există în tabelul `property_submissions`
- Verifică că imaginile au fost salvate ca JSON string în database

### Imagini nu se afișează
- Verifică că bucket-ul este PUBLIC
- Verifică URL-urile imaginilor în database
- Verifică policy-urile de read access
