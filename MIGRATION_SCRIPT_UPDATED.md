# 🔄 Migration Script Güncellendi - Uzantı Bağımsız

## 🎯 Sorun

Dosyalar R2'ye yüklenirken uzantıları değişti:
- **Eskiden**: `.jpg`, `.jpeg`, `.png`
- **Şimdi**: `.avif`, `.webp`

Ama dosya isimleri aynı kaldı:
```
Supabase: hero-slides/abc123.jpg
R2:       hero-slides/abc123.avif  ← Aynı isim, farklı uzantı
```

---

## ✅ Çözüm: Akıllı Script

Script artık **uzantı bağımsız** çalışıyor!

### Nasıl Çalışıyor:

```typescript
1. Database'den URL al:
   "https://xyz.supabase.co/storage/v1/object/public/media/hero-slides/abc123.jpg"

2. Dosya ismini çıkar (uzantısız):
   "hero-slides/abc123"

3. R2'de farklı uzantılarla ara:
   ✗ hero-slides/abc123.jpg
   ✗ hero-slides/abc123.jpeg
   ✗ hero-slides/abc123.png
   ✗ hero-slides/abc123.webp
   ✅ hero-slides/abc123.avif  ← BULUNDU!

4. Bulunan URL'i database'e kaydet:
   "https://cdn.craftedanomaly.com/media/hero-slides/abc123.avif"
```

---

## 🔍 Arama Sırası

Script dosyaları şu sırayla arar:

1. `.avif` (en yeni, en küçük)
2. `.webp` (modern, küçük)
3. `.jpg` (yaygın)
4. `.jpeg` (yaygın)
5. `.png` (kayıpsız)
6. `.gif` (animasyonlu)
7. `.mp4` (video)
8. `.webm` (video)
9. `.mov` (video)

**İlk bulunan uzantı kullanılır!**

---

## 📊 Örnek Çıktı

```bash
$ npm run migrate:urls

🚀 Starting URL migration from Supabase Storage to R2 CDN...
📍 R2 CDN URL: https://cdn.craftedanomaly.com

🔄 Migrating projects.cover_image...
    ✓ Found: https://cdn.craftedanomaly.com/media/hero-slides/abc123.avif
  ✓ https://xyz.supabase.co/.../abc123.jpg → https://cdn.craftedanomaly.com/.../abc123.avif
    ✓ Found: https://cdn.craftedanomaly.com/media/projects/def456.webp
  ✓ https://xyz.supabase.co/.../def456.png → https://cdn.craftedanomaly.com/.../def456.webp
    ⚠️  File not found in R2: media/old-file.*
✅ projects.cover_image: 2 migrated, 1 skipped

🔄 Migrating categories.hover_video...
    ✓ Found: https://cdn.craftedanomaly.com/media/category-videos/video1.mp4
  ✓ https://xyz.supabase.co/.../video1.mp4 → https://cdn.craftedanomaly.com/.../video1.mp4
✅ categories.hover_video: 1 migrated, 0 skipped

✅ Migration completed!
```

---

## 🎯 Avantajlar

### 1. Uzantı Bağımsız
- ✅ Eski uzantı: `.jpg` → Yeni uzantı: `.avif` ✅
- ✅ Dosya ismini değiştirmenize gerek yok
- ✅ Otomatik bulur ve eşleştirir

### 2. Güvenli
- ✅ Dosya R2'de yoksa skip eder
- ✅ Database'i bozmaz
- ✅ Her adımı loglar

### 3. Akıllı
- ✅ En modern formatı tercih eder (avif → webp → jpg)
- ✅ Video formatlarını da destekler
- ✅ HEAD request kullanır (hızlı, bandwidth tasarrufu)

---

## 🚀 Kullanım

### Adım 1: Dosyaları R2'ye Yükleyin

```bash
# Admin Panel → Media Management
# Supabase'den indirdiğiniz dosyaları yükleyin
# İsimler aynı kalabilir, uzantılar değişebilir
```

### Adım 2: Script'i Çalıştırın

```bash
npm install  # tsx paketini yükle (ilk kez)
npm run migrate:urls
```

### Adım 3: Sonuçları Kontrol Edin

```bash
# Script şunları gösterecek:
# - Kaç dosya migrate edildi
# - Kaç dosya skip edildi
# - Hangi dosyalar R2'de bulunamadı
```

---

## ⚠️ Önemli Notlar

### Dosya İsimleri Aynı Olmalı

```
✅ DOĞRU:
Supabase: hero-slides/abc123.jpg
R2:       hero-slides/abc123.avif  ← İsim aynı ✅

❌ YANLIŞ:
Supabase: hero-slides/abc123.jpg
R2:       hero-slides/xyz789.avif  ← İsim farklı ❌
```

### Klasör Yapısı Aynı Olmalı

```
✅ DOĞRU:
Supabase: media/hero-slides/abc123.jpg
R2:       media/hero-slides/abc123.avif  ← Klasör aynı ✅

❌ YANLIŞ:
Supabase: media/hero-slides/abc123.jpg
R2:       media/slides/abc123.avif  ← Klasör farklı ❌
```

### Bulunamayan Dosyalar

Script şunu gösterecek:
```
⚠️  File not found in R2: media/hero-slides/old-file.*
```

Bu durumda:
1. Dosyayı R2'ye yükleyin
2. Script'i tekrar çalıştırın

---

## 🧪 Test

Migration sonrası:

```bash
# 1. Siteyi başlatın
npm run dev

# 2. Browser DevTools → Network
# Görsellerin cdn.craftedanomaly.com'dan geldiğini kontrol edin

# 3. Uzantıları kontrol edin
# .avif veya .webp görmeli, .jpg/.png görmemelisiniz
```

---

## 📋 Checklist

- [ ] Dosyaları R2'ye yükledim (isimler aynı, uzantılar değişebilir)
- [ ] Klasör yapısını korudum
- [ ] `npm install` çalıştırdım
- [ ] `npm run migrate:urls` çalıştırdım
- [ ] Sonuçları kontrol ettim
- [ ] Siteyi test ettim
- [ ] Görseller CDN'den geliyor

---

## 🎉 Sonuç

Artık script:
- ✅ Uzantı bağımsız çalışıyor
- ✅ Otomatik doğru uzantıyı buluyor
- ✅ Modern formatları tercih ediyor
- ✅ Güvenli ve akıllı

Dosya isimlerini değiştirmenize gerek yok! 🚀
