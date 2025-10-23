# Vercel Deployment Guide

## Mevcut Site'e Alt Yol Olarak Ekleme (craftedanomaly.com/frendz)

### Yöntem 1: Ana Repo'ya Klasör Olarak Ekle

1. **Ana projenizin klasörüne gidin:**
```bash
cd /path/to/craftedanomaly-repo
```

2. **Frendz klasörünü kopyalayın:**
```bash
# Windows PowerShell
Copy-Item -Path "f:\CHATGPT\frendz" -Destination ".\frendz" -Recurse

# macOS/Linux
cp -r /path/to/frendz ./frendz
```

3. **Git'e ekleyin:**
```bash
git add frendz/
git commit -m "Add Frendz app"
git push origin main
```

4. **Vercel otomatik deploy edecek!**
   - URL: `https://craftedanomaly.com/frendz`

### Yöntem 2: Monorepo ile Birden Fazla Proje

Ana projenizin `vercel.json` dosyasını güncelleyin:

```json
{
  "rewrites": [
    {
      "source": "/frendz",
      "destination": "/frendz/index.html"
    },
    {
      "source": "/frendz/:path*",
      "destination": "/frendz/:path*"
    }
  ]
}
```

## Yeni Proje Olarak Deploy (Subdomain)

### 1. GitHub'a Push

```bash
cd f:\CHATGPT\frendz

git init
git add .
git commit -m "Initial commit: Frendz app"

# GitHub'da yeni repo oluşturun: github.com/new
git remote add origin https://github.com/USERNAME/frendz.git
git branch -M main
git push -u origin main
```

### 2. Vercel'e Import

1. [vercel.com/new](https://vercel.com/new) → **Import Project**
2. GitHub repo'nuzu seçin
3. **Project Settings:**
   - Framework Preset: **Other**
   - Build Command: (boş bırakın)
   - Output Directory: `.`
   - Install Command: (boş bırakın)
4. **Deploy** tıklayın

### 3. Custom Domain Ekle

1. Vercel Dashboard → Projeniz → **Settings** → **Domains**
2. **Add Domain:**
   - `frendz.craftedanomaly.com` (subdomain)
   
3. **DNS Ayarları** (domain sağlayıcınızda):
   - Type: `CNAME`
   - Name: `frendz`
   - Value: `cname.vercel-dns.com`

## Mobil Test

Deploy sonrası mobilde test etmek için:

1. **Chrome DevTools:**
   - F12 → Toggle device toolbar (Ctrl+Shift+M)
   - iPhone/Android seçin

2. **Gerçek Cihazda:**
   - Deploy URL'i mobil tarayıcıda açın
   - `https://craftedanomaly.com/frendz`

3. **PWA Olarak Ekle:**
   - Safari (iOS): Share → Add to Home Screen
   - Chrome (Android): Menu → Add to Home Screen

## Önemli Notlar

### Medya Dosyaları

Placeholder dosyaları oluşturmayı unutmayın:
```bash
# create-placeholders.html sayfasını kullanın
# VEYA gerçek görselleri /images ve /icons klasörlerine ekleyin
```

### Environment Variables (Opsiyonel)

Eğer API key vs. kullanacaksanız:
1. Vercel Dashboard → Settings → Environment Variables
2. Key-value ekleyin

### Build Ayarları

Bu proje tamamen statik, build gerektirmiyor:
- ✅ No build step
- ✅ No dependencies
- ✅ Pure HTML/CSS/JS

### Cache Ayarları

`vercel.json` dosyası cache header'larını ayarlıyor:
- Statik dosyalar: 1 saat cache
- HTML: Her zaman revalidate

## Troubleshooting

### 404 Hatası
- `vercel.json` dosyasının root'ta olduğundan emin olun
- Rewrites doğru yapılandırılmış mı kontrol edin

### Görseller Yüklenmiyor
- `/images` ve `/icons` klasörlerinin repo'da olduğundan emin olun
- Placeholder'ları oluşturun veya gerçek görselleri ekleyin

### Mobilde Çalışmıyor
- HTTPS kullanıldığından emin olun (Vercel otomatik sağlar)
- Service Worker yoksa sorun olmaz
- localStorage mobilde çalışır

## Hızlı Deploy Komutu

Tek komutla deploy (Vercel CLI ile):

```bash
# Vercel CLI kur
npm i -g vercel

# Deploy et
cd f:\CHATGPT\frendz
vercel --prod
```

## Domain Yapılandırması

### Ana Domain Altında (/frendz)
```
craftedanomaly.com          → Ana site
craftedanomaly.com/frendz   → Frendz app
```

### Subdomain Olarak
```
craftedanomaly.com          → Ana site
frendz.craftedanomaly.com   → Frendz app
```

Her iki yöntem de çalışır, tercihinize bağlı!
