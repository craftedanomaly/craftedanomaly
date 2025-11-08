# 📁 R2 Klasör Yapısı - Önemli Değişiklik!

## 🎯 Sorun Çözüldü

### Önceki Durum (Yanlış):
```
Supabase: media/hero-slides/abc.jpg
R2:       media/hero-slides/abc.avif  ← media/ klasörü var
Script:   media/hero-slides/abc.* arıyor ✅
```

### Gerçek Durum:
```
Supabase: media/hero-slides/abc.jpg
R2:       hero-slides/abc.avif  ← media/ klasörü YOK!
Script:   media/hero-slides/abc.* arıyor ❌ BULAMAZ!
```

---

## ✅ Yapılan Değişiklikler

### 1. Migration Script Güncellendi

**Önceki:**
```typescript
// R2'de dosyayı ara
const r2Url = await findFileInR2('media', 'hero-slides/abc123');
// Arar: https://cdn.craftedanomaly.com/media/hero-slides/abc123.avif
```

**Yeni:**
```typescript
// R2'de dosyayı ara (bucket prefix'siz)
const r2Url = await findFileInR2('', 'hero-slides/abc123');
// Arar: https://cdn.craftedanomaly.com/hero-slides/abc123.avif
```

### 2. Upload Component'leri Güncellendi

Tüm `media/` prefix'leri kaldırıldı:

#### ✅ `video-upload.tsx`:
```typescript
// Önceki: formData.append('path', 'media/category-videos');
formData.append('path', 'category-videos');
```

#### ✅ `add-hero-slide-form.tsx`:
```typescript
// Önceki: formData.append('path', 'media/hero-slides');
formData.append('path', 'hero-slides');
```

#### ✅ `settings/page.tsx`:
```typescript
// Önceki: formData.append('path', 'media/branding');
formData.append('path', 'branding');

// Önceki: formData.append('path', 'media/content');
formData.append('path', 'content');
```

#### ✅ `image-upload.tsx`:
```typescript
// Default bucket değişti
bucket = '' // R2'de bucket klasörü yok, direkt root'ta
```

#### ✅ `api/upload/route.ts`:
```typescript
// Önceki: uploadToR2(file, 'media/uploads')
uploadToR2(file, 'uploads')
```

---

## 📊 R2 Klasör Yapısı

### Supabase'de:
```
media/  ← Bucket
├── hero-slides/
│   ├── slide1.jpg
│   └── slide2.jpg
├── category-videos/
│   └── video1.mp4
├── branding/
│   └── logo.png
└── content/
    └── about.jpg
```

### R2'de (Doğru):
```
/ (root)  ← Bucket yok!
├── hero-slides/
│   ├── slide1.avif
│   └── slide2.avif
├── category-videos/
│   └── video1.mp4
├── branding/
│   └── logo.avif
└── content/
    └── about.avif
```

---

## 🔄 Migration Script Akışı

### Önceki (Yanlış):
```
1. Database: https://xyz.supabase.co/.../media/hero-slides/abc.jpg
2. Parse: bucket="media", path="hero-slides/abc.jpg"
3. R2'de ara: https://cdn.craftedanomaly.com/media/hero-slides/abc.*
4. Sonuç: ❌ BULUNAMADI (media/ klasörü yok!)
```

### Yeni (Doğru):
```
1. Database: https://xyz.supabase.co/.../media/hero-slides/abc.jpg
2. Parse: bucket="media", path="hero-slides/abc.jpg"
3. R2'de ara: https://cdn.craftedanomaly.com/hero-slides/abc.*
4. Sonuç: ✅ BULUNDU!
```

---

## 🚀 Yeni Upload Akışı

### Admin Panel'den Upload:
```
1. Dosya seç: image.jpg
2. Path belirle: "hero-slides"
3. R2'ye yükle: hero-slides/image.avif
4. URL oluştur: https://cdn.craftedanomaly.com/hero-slides/image.avif
5. Database'e kaydet: ✅
```

### Eski Kod (Yanlış):
```typescript
formData.append('path', 'media/hero-slides');
// Yükler: media/hero-slides/image.avif ❌
```

### Yeni Kod (Doğru):
```typescript
formData.append('path', 'hero-slides');
// Yükler: hero-slides/image.avif ✅
```

---

## ⚠️ Önemli Notlar

### 1. R2 Flat File Structure
R2'de klasörler gerçek klasör değil, sadece prefix:
```
hero-slides/abc.avif  ← Bu bir "hero-slides/" prefix'li dosya
media/hero-slides/abc.avif  ← Bu bir "media/hero-slides/" prefix'li dosya
```

### 2. Supabase'den R2'ye Taşırken
Dosyaları taşırken `media/` prefix'ini **kaldırın**:
```
✅ DOĞRU:
Supabase: media/hero-slides/abc.jpg
R2:       hero-slides/abc.avif

❌ YANLIŞ:
Supabase: media/hero-slides/abc.jpg
R2:       media/hero-slides/abc.avif
```

### 3. Mevcut Dosyalar
Eğer R2'de zaten `media/` prefix'li dosyalar varsa:
- Onları root'a taşıyın
- Veya script'i çalıştırmadan önce düzeltin

---

## 📋 Checklist

Dosyaları R2'ye yüklerken:

- [ ] `media/` prefix'ini **kaldırın**
- [ ] Sadece alt klasör ismini kullanın (`hero-slides/`, `branding/`, vb.)
- [ ] Dosya isimleri aynı kalabilir
- [ ] Uzantılar değişebilir (`.jpg` → `.avif`)

Örnek:
```
Supabase: media/hero-slides/slide1.jpg
          ↓ (media/ kaldır)
R2:       hero-slides/slide1.avif ✅
```

---

## 🧪 Test

Migration script'i çalıştırmadan önce test edin:

```bash
# R2'de dosya var mı kontrol et:
curl -I https://cdn.craftedanomaly.com/hero-slides/abc123.avif

# Varsa: HTTP 200 OK
# Yoksa: HTTP 404 Not Found
```

---

## 🎉 Sonuç

Artık:
- ✅ Upload'lar `media/` prefix'siz
- ✅ Migration script `media/` prefix'siz arar
- ✅ R2 klasör yapısı doğru
- ✅ URL'ler: `https://cdn.craftedanomaly.com/hero-slides/abc.avif`

---

## 📁 Güncellenen Dosyalar

1. ✅ `scripts/migrate-urls-to-r2.ts` - media/ prefix kaldırıldı
2. ✅ `src/components/admin/video-upload.tsx` - media/ prefix kaldırıldı
3. ✅ `src/components/admin/add-hero-slide-form.tsx` - media/ prefix kaldırıldı
4. ✅ `src/app/admin/settings/page.tsx` - media/ prefix kaldırıldı
5. ✅ `src/components/admin/image-upload.tsx` - default bucket boş
6. ✅ `src/app/api/upload/route.ts` - media/ prefix kaldırıldı

---

## 🚀 Şimdi Yapın

```bash
# 1. Paketleri yükle
npm install

# 2. Dosyaları R2'ye yükle (media/ prefix'siz!)
# Admin Panel → Media Management
# hero-slides/, category-videos/, branding/, content/

# 3. Migration script'i çalıştır
npm run migrate:urls

# 4. Test et
npm run dev
```

Artık script dosyaları bulacak! 🎉
