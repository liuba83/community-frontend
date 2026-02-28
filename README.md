# Ukrainians in Texas

A service directory platform connecting Ukrainian professionals in Texas with people seeking their services.

## Overview

This platform helps users browse, search, and filter Ukrainian service providers across Texas. Providers can submit their listings via a public Google Form, which are then reviewed and approved by admins before appearing on the site.

**Key Features:**
- 🔍 Browse and search Ukrainian professionals
- 🏷️ Filter by 22 service categories
- 🌐 Bilingual UI (English/Ukrainian)
- 📱 Mobile-responsive design
- 🔒 Secure, spam-protected submissions

## Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Vercel** for hosting

### Backend
- **Vercel Serverless Functions** (API proxy)
- **Airtable** (database)
- **Google Forms** (service submissions)
- **Google Drive** (image storage)

### Architecture
- Single monorepo (frontend + API)
- Serverless API proxy protects Airtable credentials
- Google Forms handles spam protection

## Project Structure

```
ukrainians-in-texas/
├── api/              # Vercel serverless functions (server-side)
├── src/              # React frontend (client-side)
├── docs/             # Documentation
├── public/           # Static assets
└── package.json
```

## Documentation

Comprehensive planning and technical documentation:

- **[MVP Specification](docs/MVP_DOCUMENT.md)** - Complete technical spec, design system, and component architecture
- **[Technology Decisions](docs/DECISIONS.md)** - Why we chose Airtable, Vercel, Google Forms, etc.
- **[Security Concerns](docs/SECURITY_CONCERNS.md)** - Deep dive into security implementation
- **[MVP Gaps](docs/MVP_GAPS.md)** - Edge cases, accessibility, SEO, and performance considerations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Airtable account
- Google Forms account
- Vercel account (for deployment)

### Installation

_Setup instructions will be added once implementation begins._

```bash
# Clone the repository
git clone https://github.com/yourusername/ukrainians-in-texas.git
cd ukrainians-in-texas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Airtable credentials

# Run development server
npm run dev
```

### Environment Variables

**Client-side (public):**
```env
VITE_GOOGLE_FORM_URL=https://forms.gle/your_form_id
```

**Server-side (secret):**
```env
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=Services
```

## Development

_Development workflow and commands will be documented as the project is built._

## Deployment

**Platform:** Vercel

**Process:**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

## Contributing

This is a community project. Contributions are welcome!

## License

[MIT](LICENSE) (or specify your license)

## Contact

For questions or support, contact: [admin@example.com](mailto:admin@example.com)

---

**Built with ❤️ for the Ukrainian community in Texas**
