# Supabase Storage Bucket Configuration

## AVIF ve WebP Desteği Ekleme

Supabase Dashboard'dan bucket ayarlarını güncellemek için:

### 1. Supabase Dashboard'a Git
- https://supabase.com/dashboard
- Projenizi seçin

### 2. Storage > Buckets
- Sol menüden **Storage** seçin
- **Buckets** sekmesine tıklayın

### 3. Bucket Ayarlarını Düzenle

#### `media` Bucket için:
1. `media` bucket'ının yanındaki **⋮** (3 nokta) menüsüne tıklayın
2. **Edit bucket** seçin
3. **Allowed MIME types** bölümünde:
   ```
   image/jpeg
   image/png
   image/gif
   image/webp
   image/avif
   video/mp4
   video/webm
   video/quicktime
   ```
4. **Save** butonuna tıklayın

#### `project-images` Bucket için:
1. `project-images` bucket'ının yanındaki **⋮** menüsüne tıklayın
2. **Edit bucket** seçin
3. **Allowed MIME types** bölümünde:
   ```
   image/jpeg
   image/png
   image/gif
   image/webp
   image/avif
   ```
4. **Save** butonuna tıklayın

### 4. Alternatif: SQL ile Güncelleme

Eğer bucket ayarlarına erişiminiz yoksa, SQL Editor'den:

```sql
-- media bucket için
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]
WHERE name = 'media';

-- project-images bucket için
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif'
]
WHERE name = 'project-images';
```

### 5. Bucket Yoksa Oluşturma

Eğer bucket'lar yoksa, SQL Editor'den:

```sql
-- media bucket oluştur
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
);

-- project-images bucket oluştur
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif'
  ]
);
```

### 6. RLS (Row Level Security) Politikaları

Upload için gerekli politikalar:

```sql
-- media bucket için upload politikası
CREATE POLICY "Allow authenticated uploads to media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- project-images bucket için upload politikası
CREATE POLICY "Allow authenticated uploads to project-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- Public read access
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('media', 'project-images'));
```

## Dosya Formatları Hakkında

### AVIF (AV1 Image File Format)
- **Avantajlar**: En iyi sıkıştırma, küçük dosya boyutu
- **Tarayıcı Desteği**: Chrome 85+, Firefox 93+, Safari 16+
- **MIME Type**: `image/avif`

### WebP
- **Avantajlar**: İyi sıkıştırma, geniş tarayıcı desteği
- **Tarayıcı Desteği**: Chrome 23+, Firefox 65+, Safari 14+
- **MIME Type**: `image/webp`

### Önerilen Kullanım
1. **AVIF**: Modern tarayıcılar için en iyi seçim
2. **WebP**: Fallback olarak
3. **JPEG/PNG**: Eski tarayıcılar için fallback

## Test Etme

Upload işlemini test etmek için:

1. Admin Panel > Media Management
2. AVIF veya WebP dosyası seçin
3. Upload butonuna tıklayın
4. Hata alırsanız, bucket ayarlarını kontrol edin

## Sorun Giderme

### "Invalid MIME type" Hatası
- Bucket'ın `allowed_mime_types` ayarını kontrol edin
- SQL ile güncelleyin veya Dashboard'dan düzenleyin

### Upload Başarısız
- RLS politikalarını kontrol edin
- Authentication durumunu kontrol edin
- Browser console'da hata mesajlarını inceleyin

### Dosya Görünmüyor
- Bucket'ın `public` olduğundan emin olun
- Public read policy'nin aktif olduğunu kontrol edin
