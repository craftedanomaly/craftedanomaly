# 🤔 Neden Görseller Hala Görünüyor?

## Sorunun Cevabı

Supabase Storage entegrasyonunu kaldırdık ama görseller hala görünüyor çünkü:

### 📊 Database'de Eski URL'ler Var

```
Database (Supabase)
├── projects table
│   ├── cover_image: "https://xyz.supabase.co/storage/v1/object/public/media/abc.jpg"
│   └── hero_image: "https://xyz.supabase.co/storage/v1/object/public/media/def.jpg"
├── categories table
│   ├── cover_image: "https://xyz.supabase.co/storage/v1/object/public/media/ghi.jpg"
│   └── hover_video: "https://xyz.supabase.co/storage/v1/object/public/media/video.mp4"
└── hero_slides table
    └── url: "https://xyz.supabase.co/storage/v1/object/public/media/hero.jpg"
```

### 🔄 Akış Şu Şekilde:

```
1. Next.js sayfa render oluyor
        ↓
2. Database'den veri çekiliyor
        ↓
3. cover_image: "https://xyz.supabase.co/storage/..."
        ↓
4. Next.js Image component bu URL'i kullanıyor
        ↓
5. Supabase Storage'dan görsel çekiliyor ✅
```

---

## 🎯 Ne Değişti?

### ✅ Yeni Yüklemeler:
```
Admin Panel → Upload → R2 API → Cloudflare R2
                                      ↓
                        Database'e kaydediliyor:
                        "https://cdn.craftedanomaly.com/..."
```

### ❌ Eski Görseller:
```
Database → "https://xyz.supabase.co/storage/..."
                        ↓
                Supabase Storage'dan çekiliyor
                (Hala aktif ve çalışıyor)
```

---

## 🔧 Çözüm: 2 Seçenek

### Seçenek 1: URL Migration (Önerilen)

Database'deki tüm URL'leri güncelle:

```bash
# 1. Önce dosyaları Supabase'den R2'ye kopyala (manuel)
# 2. URL'leri güncelle:
npm install  # tsx paketini yükle
npm run migrate:urls
```

**Script Ne Yapar:**
- Database'deki tüm Supabase Storage URL'lerini bulur
- R2 CDN URL'lerine çevirir
- Otomatik günceller

**Örnek:**
```
Önce:  https://xyz.supabase.co/storage/v1/object/public/media/hero.jpg
Sonra: https://cdn.craftedanomaly.com/media/hero.jpg
```

### Seçenek 2: Manuel Yeniden Upload

1. Her projeyi admin panelden aç
2. Görselleri yeniden yükle (R2'ye gidecek)
3. Kaydet

---

## ⚠️ Önemli Notlar

### Dosyaları Taşımayı Unutmayın!

URL'leri güncellemeden önce dosyaları Supabase'den R2'ye kopyalamalısınız:

```bash
# Manuel yöntem:
1. Supabase Dashboard → Storage → Buckets
2. Her bucket'tan dosyaları indirin
3. Admin Panel → Media Management
4. R2'ye yükleyin (aynı klasör yapısını koruyun)
```

### Klasör Yapısını Koruyun:

```
Supabase:
media/
├── hero-slides/
├── category-videos/
└── content/

R2:
media/
├── hero-slides/  ← Aynı yapı
├── category-videos/
└── content/
```

---

## 📋 Migration Checklist

- [ ] **Adım 1**: Supabase Storage'dan dosyaları indirin
- [ ] **Adım 2**: R2'ye yükleyin (klasör yapısını koruyun)
- [ ] **Adım 3**: `npm install` (tsx paketi için)
- [ ] **Adım 4**: `npm run migrate:urls` çalıştırın
- [ ] **Adım 5**: Siteyi test edin
- [ ] **Adım 6**: Supabase Storage'ı temizleyin (opsiyonel)

---

## 🧪 Test

Migration sonrası test edin:

```bash
# 1. Development server'ı başlatın
npm run dev

# 2. Şu sayfaları kontrol edin:
- Homepage (hero carousel)
- Category pages (cover images, videos)
- Project detail pages (images)
- About page (image)
- Admin panel (logo)

# 3. Browser DevTools → Network
- Görsellerin cdn.craftedanomaly.com'dan geldiğini kontrol edin
- Supabase Storage istekleri olmamalı
```

---

## 🎉 Sonuç

### Şu Anda:
- ✅ Yeni yüklemeler → R2
- ❌ Eski görseller → Supabase Storage (hala çalışıyor)
- ⚠️ Supabase egress maliyeti → Hala var (eski görseller için)

### Migration Sonrası:
- ✅ Tüm görseller → R2 CDN
- ✅ Supabase egress → $0
- ✅ Daha hızlı
- ✅ Daha ölçeklenebilir

---

## 📞 Sorun Giderme

### "Migration script hata veriyor"
- Environment variables kontrol edin
- `SUPABASE_SERVICE_ROLE_KEY` var mı?
- Database bağlantısı çalışıyor mu?

### "Görseller görünmüyor"
- Dosyaları R2'ye kopyaladınız mı?
- Klasör yapısı aynı mı?
- CDN URL doğru mu?

### "Bazı görseller hala Supabase'den geliyor"
- Migration script tüm tabloları kontrol etti mi?
- Browser cache temizleyin (hard refresh)
- DevTools → Network → görsellerin URL'lerini kontrol edin
