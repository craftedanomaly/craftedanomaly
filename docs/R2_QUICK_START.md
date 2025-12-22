# 🚀 Cloudflare R2 Hızlı Başlangıç

## Yapmanız Gereken 3 Şey:

### 1️⃣ Environment Variables Ekleyin

`.env.local` dosyanızı açın (yoksa oluşturun) ve şunları ekleyin:

```env
NEXT_PUBLIC_R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
NEXT_PUBLIC_R2_BUCKET_NAME=ca-site
NEXT_PUBLIC_R2_CDN_URL=https://cdn.craftedanomaly.com
```

### 2️⃣ Cloudflare'den Bilgileri Alın

#### Account ID:
1. https://dash.cloudflare.com > R2
2. Sağ üstteki **Account ID**'yi kopyalayın

#### API Keys:
1. R2 sayfasında **Manage R2 API Tokens**
2. **Create API Token**
3. Permissions: **Object Read & Write** + **Admin Read & Write**
4. **Access Key ID** ve **Secret Access Key**'i kopyalayın

### 3️⃣ Paketleri Yükleyin ve Başlatın

```bash
npm install
npm run dev
```

## ✅ Test Edin

1. `http://localhost:3000/admin` > Media Management
2. Bir görsel yükleyin
3. Çalışıyorsa tamamdır! 🎉

---

## 📚 Detaylı Bilgi

Daha fazla bilgi için: `CLOUDFLARE_R2_SETUP.md`
