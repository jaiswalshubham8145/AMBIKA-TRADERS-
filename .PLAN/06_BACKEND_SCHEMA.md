# Backend Schema Document

## Ambika Traders — E-Commerce Platform

**Version:** 1.1 (Updated for Firebase/Firestore)
**Database:** Firebase Firestore (NoSQL)
**Design principle:** Generic `Category → Product → Variant` model so all categories share one structure. Since Firestore is NoSQL, we will embed variants and images directly inside the Product document (or use subcollections) to optimize read operations and reduce document reads.

---

## 1. Entity Relationship Overview (NoSQL)

```
users (collection)
  ├── User Document
  └── addresses (subcollection)

categories (collection)
  └── Category Document

products (collection)
  ├── Product Document (embeds variants, images, attributes)
  └── reviews (subcollection)

orders (collection)
  └── Order Document (embeds OrderItems, GiftDetail, Address Snapshot, PaymentRecord)

bundles (collection)
  └── Bundle Document (embeds BundleItems)

coupons (collection)
  └── Coupon Document

banners (collection)
  └── Banner Document
```

---

## 2. Core Collections (Firestore JSON Structure)

### `users` Collection

```json
{
  "_id": "user_uid_from_auth",
  "email": "user@example.com",
  "phone": "+919876543210",
  "name": "John Doe",
  "role": "CUSTOMER", // or "ADMIN"
  "wishlist": ["product_id_1", "product_id_2"],
  "createdAt": "timestamp"
}
```

#### `users/{userId}/addresses` Subcollection

```json
{
  "_id": "auto_id",
  "fullName": "John Doe",
  "phone": "+919876543210",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isDefault": true
}
```

### `categories` Collection

```json
{
  "_id": "auto_id",
  "slug": "rakhi",
  "name": "Rakhi",
  "description": "Premium Rakhis",
  "heroImageUrl": "https://cloudinary.com/..."
}
```

### `products` Collection

```json
{
  "_id": "auto_id",
  "categoryId": "category_id",
  "slug": "peacock-ad-rakhi",
  "title": "Premium Peacock Rakhi",
  "description": "...",
  "basePrice": 499,
  "attributes": {
    "threadColor": "Red",
    "motif": "Peacock",
    "setIncludes": ["Roli-Chawal"]
  },
  "isPublished": true,
  "isFeatured": true,
  "avgRating": 4.8,
  "createdAt": "timestamp",
  "updatedAt": "timestamp",

  "images": [{ "url": "...", "altText": "Front view", "position": 0 }],

  "variants": [
    {
      "id": "v1",
      "sku": "RK-PEA-RD-01",
      "label": "Standard",
      "priceOverride": null,
      "stock": 50,
      "isActive": true
    }
  ]
}
```

### `orders` Collection

```json
{
  "_id": "auto_id",
  "userId": "user_id_or_null_for_guest",
  "guestEmail": "guest@example.com",
  "guestPhone": "+919876543210",
  "status": "PENDING", // PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, RTO
  "paymentMethod": "RAZORPAY", // or "COD"
  "paymentStatus": "UNPAID", // UNPAID, AUTHORIZED, PAID, FAILED, REFUNDED
  "subtotal": 499,
  "discountTotal": 0,
  "shippingTotal": 50,
  "total": 549,
  "idempotencyKey": "uuid_from_client",

  "shippingAddress": {/* Snapshot of Address Document */},

  "requestedDeliveryDate": "timestamp_or_null",

  "items": [
    {
      "productId": "product_id",
      "variantId": "v1",
      "quantity": 2,
      "unitPrice": 499,
      "title": "Premium Peacock Rakhi"
    }
  ],

  "giftDetail": {
    "message": "Happy Raksha Bandhan!",
    "giftWrap": true,
    "recipientName": "Rahul"
  },

  "paymentRecord": {
    "razorpayOrderId": "order_abc123",
    "razorpayPaymentId": "pay_xyz789",
    "razorpaySignature": "...",
    "amount": 549,
    "capturedAt": "timestamp"
  },

  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `banners` Collection

```json
{
  "_id": "auto_id",
  "slot": "homepage_hero",
  "title": "Celebrate the bond",
  "mediaUrl": "...",
  "ctaText": "Shop Now",
  "ctaLink": "/category/rakhi",
  "countdownTo": "timestamp",
  "isActive": true
}
```

---

## 3. Key Design Decisions Explained

| Decision                                                | Reasoning                                                                                                                                                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attributes` Map on Product                             | Lets Rakhi, Jewellery, Makeup, Krishna Clothing share one collection without schema migrations.                                                                                                                                  |
| Embedded `variants` & `images`                          | In NoSQL, embedding arrays of variants and images inside the Product document saves reads (1 read for the entire product vs. N reads). Variants rarely exceed 10-20 per product, so it fits safely within Firestore's 1MB limit. |
| `shippingAddress` Snapshot on Order                     | Orders must never change if the user later edits their saved address.                                                                                                                                                            |
| Single `orders` Collection with Embedded Items/Payments | Unlike Prisma where `PaymentRecord` and `OrderItem` are separate tables, Firestore encourages embedding them inside the Order document to fetch an order in a single read.                                                       |
| `RTO` order status                                      | India COD-specific reality — failed cash-on-delivery attempts are common and need their own state.                                                                                                                               |

---

## 4. Indexing & Performance Notes

- Composite indexes will be needed in Firestore for querying products by `categoryId` + `isPublished`.
- Filtering products by multiple attributes (e.g., color + material) will require managing composite indexes or relying on client-side filtering if collections are small.
