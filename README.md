# 🚀 **Spyke AI – AI Prompts & Automation Marketplace**

**Version:** v1.0.0
**Built by:** FutureDesks
**Platform Type:** Web-based SaaS (Stripe Integrated)

---

## 🌟 **Project Overview**

**Spyke AI** is a premium digital marketplace where verified creators (freelancers/agencies) sell AI-based prompts, automations, and agents. Users can instantly purchase and download these digital assets. Admins oversee all transactions, content, and approvals in a multi-role dashboard system.

---

## 👥 **User Roles & Access Levels**

### 1. **User (Buyer)**

* Can browse marketplace
* Account creation & email verification
* Access dashboard post-verification
* Purchase digital products via Stripe
* Instant access to downloads after payment
* Can rate products & raise support tickets

### 2. **Seller (Creator)**

* Account creation + email verification
* Can apply to become a seller
* Requires **manual approval by admin**
* Admin sets **platform commission %** on approval
* Can upload products: Prompts, Automations, Agents
* Add title, category, tags, price, description, file(s), and documentation
* View own sales, payouts, and ratings via seller dashboard

### 3. **Admin**

* Master control over platform
* Approves sellers + sets individual commissions
* Manages all products, users, and content
* Manages blog posts (Sanity CMS integration)
* View orders, payouts, and tickets
* Can verify/reject content
* Adjust platform-wide settings

---

## 🔒 **Authentication & Security**

* Email + password-based sign-up
* Email verification required for all roles
* Forgot password via secure token reset
* Only verified users can access dashboards
* Only admin-approved sellers can publish products

---

## 📂 **Product Types**

Sellers can upload three types of digital content:

| Type            | Description                                  |
| --------------- | -------------------------------------------- |
| **Prompts**     | Battle-tested prompts for GPT or similar     |
| **Automations** | Scripts (e.g., Python, Zapier, Make)         |
| **Agents**      | Multi-step tools/scripts acting as AI agents |

Each listing includes:

* Title
* Description
* Use case / tags
* Price (one-time)
* Download file(s)
* Preview image (optional)
* PDF / video documentation
* Category selection

---

## 🧾 **Key Features**

### 🎛️ **Multi-Dashboard System**

* **User Dashboard**: Purchase history, downloads, ticket status
* **Seller Dashboard**: Product upload, earnings, ratings, payout history
* **Admin Dashboard**: Seller approvals, commission settings, full control

### 💰 **Stripe Payment Integration**

* Supports UPI, Cards, Net Banking, International
* Admin sets platform-wide and per-seller commission %
* Automated seller payouts (Stripe Connect or manual)

### 📦 **Instant Digital Delivery**

* Users get access immediately after successful payment
* Downloads available from user dashboard
* Lifetime access to purchases

### ⭐ **Rating System**

* Users can rate products (1–5 stars)
* Optional reviews/comments per product
* Sellers can view feedback on dashboard

### 🎫 **Support Ticket System**

* Users can raise support tickets post-purchase
* Tickets visible to seller and admin
* Real-time message thread inside dashboard
* Admin can intervene and close tickets

### 📝 **Content & SEO System**

* Blog powered by **Sanity CMS**
* Admins can post guides, news, SEO articles

### 🛡️ **Quality Control**

* All products are reviewed by admin before publishing
* Admin can reject/approve with feedback
* Optional badge: “Verified by Spyke AI”

---

## 🔧 **Workflow Breakdown**

### 🧑‍💼 Seller Onboarding Flow

1. Signup → Verify Email
2. Apply to become a seller
3. Admin reviews profile & sets commission (e.g. 20%)
4. Seller approved → Dashboard unlocked
5. Seller can upload & manage products

### 🛍️ Buyer Purchase Flow

1. Browse products (search, filter, category)
2. Click product → View details
3. Add to cart → Checkout with Stripe
4. Payment success → Product added to "My Purchases"
5. Access files instantly → Optional rating + ticket

### 🛠️ Admin Workflow

1. View list of seller applications
2. Approve/Reject with notes + set commission
3. Review all products → Approve/Reject
4. Manage user complaints via tickets
5. Post blogs from CMS
6. View all revenue & payouts

---

## 🔧 **Core Technologies (Suggested Stack)**

| **Area**            | **Technology**               |
| ------------------- | ---------------------------- |
| **Frontend**        | Next.js                      |
| **Backend**         | Node.js / Express.js         |
| **Authentication**  | JWT + Email OTP              |
| **Database**        | MongoDB                      |
| **Payment Gateway** | Stripe                       |
| **CMS**             | Sanity.io                    |
| **File Hosting**    | ImageKit                     |
| **Deployment**      | VPS (Virtual Private Server) |
| **Support System**  | In-app Ticketing System      |


---

## ✅ **Admin Settings Panel (Must Include)**

* View all registered users
* View pending seller requests
* Approve/Reject sellers + set % commission
* View and manage uploaded products
* View sales reports, revenue, commissions
* Issue manual payouts (if needed)
* Manage blog articles via CMS
* Manage reported users or content

---

## 📁 **Database Structure (Simplified)**

### Tables/Collections:

* **Users** (role, verified, profile)
* **Sellers** (commission, approved, earnings)
* **Products** (type, title, file, price, seller\_id)
* **Orders** (buyer\_id, product\_id, timestamp, amount)
* **Ratings** (user\_id, product\_id, stars, comment)
* **Tickets** (order\_id, status, messages)
* **Admin** (settings, roles, content)

---

## 🔐 **Security Considerations**

* Secure file URLs (download only if purchased)
* Admin-only access to sensitive actions
* Stripe webhook handling for payment verification
* Data validation & sanitation (all input forms)
* OTP/Token expiration on password resets

---

## 📌 **Notes / Exclusions**

* **No custom hiring system** (freelancer hiring not part of MVP)
* No mobile app (Web-first approach)
* All digital files must be under max size limit (configurable)
* Stripe Connect optional — can begin with manual payouts

---

## 📦 Final Deliverables (For Build Phase)

* Frontend with role-based UI
* Backend APIs (auth, product mgmt, payments, tickets)
* Admin panel
* Stripe integration
* CMS integration
* Database schema

