# Products CRUD API

Project ini adalah REST API sederhana untuk mengelola data product. API dibuat menggunakan Node.js, Express, MySQL, dan Docker Compose.

Fokus utama project ini adalah menjalankan aplikasi dan database menggunakan Docker.

## Teknologi yang Digunakan

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- Docker
- Docker Compose
- Postman untuk pengujian API

## Entity Product

Data yang digunakan pada project ini adalah `products`.

| Field | Tipe Data | Keterangan |
| --- | --- | --- |
| `id` | Integer | Primary key, auto increment |
| `name` | String | Nama product |
| `price` | Integer | Harga product |

## Struktur Project

```text
products
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── db
│   └── init.sql
├── postman
│   └── products-crud-api.postman_collection.json
└── src
    ├── app.js
    ├── db.js
    └── routes
        └── products.js
```

## Menjalankan Project

Pastikan Docker Desktop sudah berjalan.

Jalankan perintah berikut dari folder `products`:

```bash
docker compose up --build
```

Jika ingin menjalankan container di background:

```bash
docker compose up --build -d
```

Docker Compose akan menjalankan dua service:

| Service | Keterangan |
| --- | --- |
| `app` | Aplikasi Express API |
| `db` | Database MySQL |

Aplikasi dapat diakses melalui:

```text
http://localhost:3000
```

Untuk menghentikan container:

```bash
docker compose down
```

Jika ingin menghapus data database dan mengulang inisialisasi tabel:

```bash
docker compose down --volumes
docker compose up --build
```

## Konfigurasi Environment

Contoh konfigurasi environment tersedia di file `.env.example`.

```env
DB_HOST=db
DB_USER=root
DB_PASSWORD=password
DB_NAME=crud_db
DB_PORT=3306
PORT=3000
```

Saat berjalan di Docker Compose, aplikasi menggunakan host database `db`, yaitu nama service MySQL di dalam `docker-compose.yml`.

## Inisialisasi Database

Tabel `products` dibuat otomatis dari file:

```text
db/init.sql
```

Isi tabel:

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL
);
```

File SQL tersebut dipasang ke container MySQL melalui Docker Compose pada folder:

```text
/docker-entrypoint-initdb.d/init.sql
```

## Endpoint API

Base URL:

```text
http://localhost:3000
```

### 1. Cek API

```http
GET /
```

Response:

```json
{
  "message": "Products API is running"
}
```

### 2. Membuat Product

```http
POST /products
```

Body:

```json
{
  "name": "Notebook",
  "price": 15000
}
```

Contoh response:

```json
{
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "name": "Notebook",
    "price": 15000
  }
}
```

### 3. Mengambil Semua Product

```http
GET /products
```

Contoh response:

```json
{
  "products": [
    {
      "id": 1,
      "name": "Notebook",
      "price": 15000
    }
  ]
}
```

### 4. Mengambil Product Berdasarkan ID

```http
GET /products/:id
```

Contoh:

```http
GET /products/1
```

Contoh response:

```json
{
  "product": {
    "id": 1,
    "name": "Notebook",
    "price": 15000
  }
}
```

Jika product tidak ditemukan:

```json
{
  "message": "Product not found"
}
```

### 5. Mengubah Product

```http
PUT /products/:id
```

Contoh:

```http
PUT /products/1
```

Body:

```json
{
  "name": "Updated Notebook",
  "price": 20000
}
```

Contoh response:

```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Updated Notebook",
    "price": 20000
  }
}
```

### 6. Menghapus Product

```http
DELETE /products/:id
```

Contoh:

```http
DELETE /products/1
```

Response:

```json
{
  "message": "Product deleted successfully"
}
```

## Validasi dan Error

Jika `name` kosong atau `price` bukan integer bernilai positif atau nol, API akan mengembalikan:

```json
{
  "message": "Product name must be a non-empty string and price must be a non-negative integer"
}
```

Jika `id` tidak valid, API akan mengembalikan:

```json
{
  "message": "Product ID must be a positive integer"
}
```

Jika product tidak ditemukan, API akan mengembalikan:

```json
{
  "message": "Product not found"
}
```

## Pengujian dengan Postman

Pengujian API dilakukan menggunakan Postman.

Collection Postman tersedia di:

```text
postman/products-crud-api.postman_collection.json
```

Cara menggunakan:

1. Buka Postman.
2. Klik `Import`.
3. Pilih file `postman/products-crud-api.postman_collection.json`.
4. Jalankan request secara berurutan dari atas ke bawah.

Urutan request yang diuji:

1. `GET /`
2. `POST /products`
3. `GET /products`
4. `GET /products/:id`
5. `PUT /products/:id`
6. `GET /products/:id` setelah update
7. `DELETE /products/:id`
8. `GET /products/:id` setelah delete
9. Request body tidak valid
10. Product tidak ditemukan

Hasil pengujian Postman:

| Pengujian | Hasil |
| --- | --- |
| Cek root API | Berhasil |
| Membuat product | Berhasil |
| Mengambil semua product | Berhasil |
| Mengambil product berdasarkan ID | Berhasil |
| Mengubah product | Berhasil |
| Menghapus product | Berhasil |
| Product tidak ditemukan | Berhasil mengembalikan `404` |
| Body tidak valid | Berhasil mengembalikan `400` |

Jika dibutuhkan untuk pengumpulan tugas, screenshot hasil pengujian dapat ditambahkan secara terpisah.

## Catatan Auto Increment MySQL

Nilai `id` pada MySQL menggunakan `AUTO_INCREMENT`. Jika sebuah data sudah dibuat lalu dihapus, ID tersebut tidak digunakan ulang secara otomatis.

Contoh:

```text
id 1 dibuat
id 2 dibuat lalu dihapus
data berikutnya akan mendapat id 3
```

Perilaku ini normal pada MySQL.
