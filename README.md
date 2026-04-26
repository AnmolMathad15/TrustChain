<div align="center">

<!-- HERO BANNER -->
<img src="banner<img width="1024" height="1536" alt="banner" src="https://github.com/user-attachments/assets/9142d135-ee74-48c7-a711-68cfaa9d7d3a" />
.png" width="100%" />

<br><br>
</div>
<div align="center">

# 🔐 TrustChain

### Self-Sovereign Identity (SSI) Platform for Secure & Verifiable Credentials

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Ethereum](https://img.shields.io/badge/Ethereum-Polygon-8247E5?logo=ethereum&logoColor=white)](https://polygon.technology)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Built on Replit](https://img.shields.io/badge/Built%20on-Replit-667881?logo=replit&logoColor=white)](https://replit.com)

TrustChain is a decentralized identity verification platform built on **W3C Self-Sovereign Identity (SSI)** standards. It enables users to own, manage, and share verifiable credentials — without relying on any central authority.



</div>

---

## 🚩 The Problem

Traditional identity systems are broken:

| Problem | Impact |
|---|---|
| Centralized data silos | Single point of failure, mass breaches |
| No user ownership | Platforms control your identity |
| Slow verification | Manual, paper-heavy processes |
| Credential forgery | Fake documents are easy to create |
| Privacy violations | Over-sharing personal data is the norm |

---

## 💡 The Solution

TrustChain puts identity back in the hands of users using blockchain-anchored **Decentralized Identifiers (DIDs)** and **Verifiable Credentials (VCs)**.

- ✅ You own your identity — no central authority
- ✅ Credentials are cryptographically signed and tamper-proof
- ✅ Share only what you need — selective disclosure
- ✅ Verifiers validate authenticity on-chain, without contacting the issuer



---

## ✨ Features

### 👤 Identity Management
- Create and manage **Decentralized Identifiers (DIDs)**
- User-controlled identity wallet
- Secure JWT-based authentication

### 📄 Credential Management
- Issue digitally signed **Verifiable Credentials (VCs)**
- Store credentials securely in your wallet
- Share credentials selectively with verifiers

### ✔️ Verification System
- Real-time on-chain credential verification
- Tamper-proof validation via blockchain anchoring
- No issuer contact required during verification

### 🔐 Security
- Blockchain-backed data integrity (Ethereum / Polygon)
- Privacy-preserving access control
- Decentralized trust model — no single point of failure

---

## 🏗️ Architecture

```
┌──────────────┐      Issue VC       ┌───────────────┐     Share VC     ┌──────────────┐
│    Issuer    │ ──────────────────▶ │    Holder     │ ───────────────▶ │   Verifier   │
│ (Uni / Gov)  │                     │  (Wallet)     │                   │              │
└──────────────┘                     └───────────────┘                   └──────┬───────┘
        │                                    │                                  │
        ▼                                    ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          Blockchain  (Ethereum · Polygon)                               │
│   ┌──────────────────┐   ┌──────────────────────┐   ┌───────────────────────────────┐  │
│   │   DID Registry   │   │   Smart Contracts    │   │       VC Anchoring            │  │
│   └──────────────────┘   └──────────────────────┘   └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Credential Flow

1. **User registers** → DID is created and anchored to the blockchain
2. **Issuer issues a VC** → credential is cryptographically signed
3. **Holder stores it** → credential lives in the user's identity wallet
4. **User shares selectively** → presents only the needed claims to a verifier
5. **Verifier checks on-chain** → validates the hash without contacting the issuer

---

## ⚙️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js · TypeScript · Tailwind CSS |
| **Backend** | Node.js · Express.js |
| **Database** | MongoDB |
| **Blockchain** | Ethereum / Polygon · Solidity Smart Contracts |
| **Identity** | W3C DIDs · Verifiable Credentials (VCs) |
| **Package Manager** | pnpm (workspace monorepo) |
| **Platform** | Replit · Vercel · Render |

---

## 📁 Project Structure

```
TrustChain/
│
├── artifacts/              # Build artifacts and compiled outputs
├── attached_assets/        # Static assets (images, icons, etc.)
├── lib/                    # Shared libraries
│   ├── issuer/             # Issuer page and backend logic
│   ├── verifier/           # Verifier page and backend logic
│   └── landing/            # Landing page
├── scripts/                # Utility and deployment scripts
│
├── .gitignore
├── .npmrc
├── .replit                 # Replit configuration
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml     # Monorepo workspace config
├── replit.md               # Replit-specific documentation
└── tsconfig.base.json      # Shared TypeScript config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- pnpm (`npm install -g pnpm`)
- MongoDB (local or Atlas)
- An Ethereum/Polygon RPC endpoint (e.g. Alchemy, Infura)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/AnmolMathad15/TrustChain.git
cd TrustChain
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Set up environment variables**

Create a `.env` file in the root:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret_key

# Blockchain
BLOCKCHAIN_RPC=your_rpc_url
CONTRACT_ADDRESS=your_deployed_contract_address

# OpenAI (optional — AI features)
OPENAI_API_KEY=your_openai_api_key
```

**4. Run the development server**

```bash
pnpm dev
```

---

## 📌 Use Cases

- 🎓 **Academic certificates** — universities issue tamper-proof degrees
- 🪪 **Digital identity** — government-issued IDs on-chain
- 🏦 **KYC verification** — verify identity without storing sensitive data
- 💼 **Employment checks** — verify work history and qualifications instantly
- 📋 **Document authentication** — any credential, any organization

---

## 🧪 Roadmap

- [ ] Zero-Knowledge Proofs (ZKP) for privacy-preserving verification
- [ ] Multi-chain interoperability
- [ ] AI-powered fraud detection
- [ ] Mobile identity wallet (iOS / Android)
- [ ] Government and enterprise integrations

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: describe your change"

# 4. Push and open a pull request
git push origin feature/your-feature-name
```

---

## 👥 Team

| Name | GitHub |
|---|---|
| Anmol Mathad | [@AnmolMathad15](https://github.com/AnmolMathad15) |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ on decentralized identity standards**

[GitHub](https://github.com/AnmolMathad15/TrustChain) · 

</div>
