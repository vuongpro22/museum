# Museum Server

Node.js + Express backend thay the Spring Boot backend cu, su dung MongoDB va Cloudinary.

## Quick start

1. Copy env:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

## Environment variables

- `PORT`: server port (default `8080`)
- `MONGODB_URI`: MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## API

- `GET /api/images`
- `GET /api/images/:id`
- `POST /api/images/upload`
- `PUT /api/images/:id`
- `DELETE /api/images/:id`
- `GET /api/images/search?title=...`
