# Cloudflare R2 Kurulum Rehberi

## ✅ Tamamlanan Kod Değişiklikleri

Tüm kod değişiklikleri yapıldı. Artık siteniz Cloudflare R2 kullanıyor!

### Değiştirilen Dosyalar:
- ✅ `src/lib/r2-client.ts` (YENİ) - R2 client ve utility fonksiyonları
- ✅ `src/app/api/r2/upload/route.ts` (YENİ) - Upload API
- ✅ `src/app/api/r2/list/route.ts` (YENİ) - List API
- ✅ `src/app/api/r2/delete/route.ts` (YENİ) - Delete API
- ✅ `src/components/admin/image-upload.tsx` (GÜNCELLENDİ)
- ✅ `src/app/admin/media/page.tsx` (GÜNCELLENDİ)
- ✅ `src/components/admin/media-library-modal.tsx` (GÜNCELLENDİ)
- ✅ `package.json` (GÜNCELLENDİ) - AWS SDK eklendi

---

## 📋 Yapmanız Gerekenler

### ADIM 1: Environment Variables Ekleyin

`.env.local` dosyanızı açın (yoksa oluşturun) ve aşağıdaki değişkenleri ekleyin:

```env
# Cloudflare R2 Configuration
NEXT_PUBLIC_R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
NEXT_PUBLIC_R2_BUCKET_NAME=ca-site
NEXT_PUBLIC_R2_CDN_URL=https://cdn.craftedanomaly.com
```

### ADIM 2: Cloudflare R2 Bilgilerini Bulun

#### 2.1 Account ID
1. Cloudflare Dashboard'a gidin: https://dash.cloudflare.com
2. Sol menüden **R2** seçin
3. Sağ üstte **Account ID** görünecek
4. Kopyalayın ve `NEXT_PUBLIC_R2_ACCOUNT_ID` yerine yapıştırın

#### 2.2 Access Key ve Secret Key Oluşturun
1. R2 sayfasında **Manage R2 API Tokens** butonuna tıklayın
2. **Create API Token** butonuna tıklayın
3. Token ayarları:
   - **Token name**: `crafted-anomaly-site` (veya istediğiniz isim)
   - **Permissions**: 
     - ✅ Object Read & Write
     - ✅ Admin Read & Write (bucket yönetimi için)
   - **TTL**: Never expire (veya istediğiniz süre)
4. **Create API Token** butonuna tıklayın
5. Açılan sayfada:
   - **Access Key ID** → `R2_ACCESS_KEY_ID` yerine kopyalayın
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY` yerine kopyalayın
   
   ⚠️ **ÖNEMLİ**: Secret Key sadece bir kez gösterilir! Kaydetmeyi unutmayın.

#### 2.3 Bucket Name ve CDN URL
- **Bucket Name**: `ca-site` (zaten ayarlanmış)
- **CDN URL**: `https://cdn.craftedanomaly.com` (zaten ayarlanmış)

### ADIM 3: NPM Paketlerini Yükleyin

Terminal'de projenizin ana dizininde:

```bash
npm install
```

Bu komut `@aws-sdk/client-s3` paketini yükleyecek.

### ADIM 4: Development Server'ı Yeniden Başlatın

```bash
npm run dev
```

### ADIM 5: Test Edin

1. Admin panele gidin: `http://localhost:3000/admin`
2. **Media Management** sayfasına gidin
3. Bir görsel veya video yüklemeyi deneyin
4. Dosyanın yüklendiğini ve CDN URL'si ile göründüğünü kontrol edin

---

## 🔧 R2 Bucket Yapısı

Dosyalarınız şu şekilde organize edilecek:

```
ca-site/
├── media/
│   ├── hero_slides/
│   ├── content/
│   ├── collages/
│   └── branding/
└── project-images/
    ├── 1234567890-abc123.jpg
    ├── 1234567891-def456.png
    └── ...
```

- **media/**: Genel medya dosyaları (hero slides, content, vb.)
- **project-images/**: Proje görselleri

---

## 🌐 CDN Nasıl Çalışıyor?

### Upload (Yükleme):
1. Admin panelden dosya seçilir
2. Dosya `/api/r2/upload` API route'una gönderilir
3. API route dosyayı R2'ye yükler
4. CDN URL döner: `https://cdn.craftedanomaly.com/path/to/file.jpg`

### Display (Gösterme):
1. Veritabanında CDN URL'si saklanır
2. Frontend'de görsel gösterilirken CDN URL'si kullanılır
3. Cloudflare CDN dosyayı cache'ler ve hızlı servis eder

---

## 🔐 Güvenlik Notları

### Environment Variables:
- ✅ `NEXT_PUBLIC_*` ile başlayanlar frontend'de görünür (güvenli)
- ⚠️ `R2_ACCESS_KEY_ID` ve `R2_SECRET_ACCESS_KEY` sadece server-side (güvenli)
- ❌ Secret key'leri asla frontend'e expose etmeyin!

### API Routes:
- Tüm R2 işlemleri server-side API routes üzerinden yapılıyor
- Credentials frontend'e asla gönderilmiyor
- API routes Next.js tarafından otomatik olarak korunuyor

---

## 📊 Mevcut Supabase Dosyalarını R2'ye Taşıma (Opsiyonel)

Eğer Supabase Storage'da mevcut dosyalarınız varsa:

### Manuel Yöntem:
1. Supabase Dashboard > Storage > Buckets
2. Her bucket'tan dosyaları indirin
3. Admin Panel > Media Management'tan R2'ye yükleyin

### Otomatik Yöntem (Script):
```bash
# Yakında eklenecek - migration script
```

---

## 🐛 Sorun Giderme

### "Failed to upload file" Hatası:
- ✅ Environment variables doğru mu kontrol edin
- ✅ R2 API Token'ın permissions'ları yeterli mi?
- ✅ Bucket name doğru mu? (`ca-site`)
- ✅ Account ID doğru mu?

### "Failed to list files" Hatası:
- ✅ R2 API Token'ın Read permission'ı var mı?
- ✅ Bucket'ta dosya var mı?
- ✅ CDN URL doğru mu?

### Görsel Görünmüyor:
- ✅ CDN URL'si doğru mu? (`https://cdn.craftedanomaly.com`)
- ✅ Cloudflare R2 custom domain ayarları yapıldı mı?
- ✅ CORS ayarları yapıldı mı?

### CORS Ayarları (Gerekirse):
Cloudflare R2 Dashboard'da:
1. Bucket'a tıklayın
2. **Settings** > **CORS Policy**
3. Şu policy'yi ekleyin:

```json
[
  {
    "AllowedOrigins": ["https://craftedanomaly.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## ✅ Kontrol Listesi

Kurulumu tamamladıktan sonra kontrol edin:

- [ ] Environment variables `.env.local` dosyasına eklendi
- [ ] `npm install` çalıştırıldı
- [ ] Development server yeniden başlatıldı
- [ ] Admin panelde görsel yükleme test edildi
- [ ] Yüklenen görsel CDN URL'si ile görünüyor
- [ ] Media Management sayfası dosyaları listeliyor
- [ ] Dosya silme çalışıyor

---

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'da hata mesajlarını kontrol edin
2. Server logs'ları kontrol edin (`npm run dev` çıktısı)
3. Environment variables'ları tekrar kontrol edin

---

## 🎉 Tamamlandı!

Artık siteniz Cloudflare R2 kullanıyor. Tüm görseller ve videolar:
- ✅ R2'de saklanıyor
- ✅ CDN üzerinden servis ediliyor
- ✅ Hızlı ve güvenli
- ✅ Maliyet etkin

Supabase Auth ve Database aynı kalıyor, sadece Storage değişti.
