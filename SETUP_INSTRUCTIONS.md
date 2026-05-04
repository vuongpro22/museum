# Huong dan cau hinh Museum (Node.js + MongoDB + Cloudinary)

## 1) Cau hinh backend moi trong `server`

### Tao file env
Tao file `server/.env` tu mau `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Cap nhat cac gia tri:

```env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/museum
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cai dependencies va chay server

```bash
cd server
npm install
npm run dev
```

Server se chay tai `http://localhost:8080`.

## 2) Cau hinh frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dang goi API qua `/api/images` nhu backend cu.

## 3) API endpoints (giu nguyen)

```txt
GET    /api/images
GET    /api/images/{id}
POST   /api/images/upload
PUT    /api/images/{id}
DELETE /api/images/{id}
GET    /api/images/search?title={search_term}
```

### Music endpoints (moi)

```txt
GET  /api/music
GET  /api/music?sync=true
POST /api/music/sync
```

- `sync=true` hoac `POST /api/music/sync` se quet Cloudinary, loc file `.mp3` va luu danh sach vao MongoDB.
- Co the dat `CLOUDINARY_MUSIC_PREFIX` de gioi han quet theo folder/prefix.

### Upload/Update request body
- `file`: file anh (multipart/form-data)
- `title`: tieu de anh
- `description`: mo ta (tuy chon)
- `position`: vi tri sap xep (tuy chon, number)

## 4) MongoDB schema

Collection `images` duoc tao tu dong voi cac field:
- `id` (number, auto increment de tuong thich frontend hien tai)
- `title`
- `cloudinaryUrl`
- `cloudinaryPublicId`
- `description`
- `position` (unique neu co gia tri)
- `createdAt`
- `updatedAt`

## 5) Luu y

1. Khong con phu thuoc MySQL/Spring Boot.
2. Can MongoDB va Cloudinary credentials hop le.
3. Gioi han upload: 10MB.
4. Chi chap nhan file `image/*`.

## 6) Troubleshooting

### Khong ket noi duoc MongoDB
- Kiem tra `MONGODB_URI` trong `server/.env`.
- Dam bao MongoDB service dang chay.

### Loi Cloudinary
- Kiem tra `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Kiem tra quota tai khoan Cloudinary.

### Loi CORS
- Backend moi da bat CORS toan bo origin.
- Neu deploy production, nen gioi han origin theo domain that.
