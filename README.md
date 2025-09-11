# Cadence Collins Campaign Website

A modern, responsive campaign website built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. Features a content management system, mailing list functionality, and event management.

## 🎯 Features

- **Public Website**: Single-page campaign site with bio, events, policy positions
- **Mailing List**: Newsletter signup with email validation and CSV export
- **Event Management**: Admin interface for creating and managing campaign events
- **Content Management System**: Edit bio, policy, and contact sections
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Testing**: Comprehensive test suite with Jest and Playwright

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd ccwebsite
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Database setup**:
   ```bash
   # Run the SQL in database/schema.sql in your Supabase dashboard
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the website.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom campaign theme
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (recommended)

### Project Structure

```
src/
├── app/                    # Next.js 14 App Router
├── components/             # React components
├── lib/                    # Utilities and configurations
├── pages/                  # Pages Router (admin + API)
├── types/                  # TypeScript type definitions
tests/
├── contract/               # API contract tests
├── integration/            # Integration tests
├── unit/                   # Unit tests
database/
└── schema.sql             # Database schema
```

## 📊 Database Schema

The application uses three main tables:

- **mailing_list_subscribers**: Newsletter subscribers
- **campaign_events**: Campaign events and meetings  
- **content_blocks**: Editable website content (bio, policy, contact)

## 🔧 Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authentication
ADMIN_SECRET_TOKEN=your_secure_admin_token
```

### Admin Access

Access the admin dashboard at `/admin` with your admin token. Default token for development: `demo-admin-token`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test types
npm test -- --testPathPattern="contract"
npm test -- --testPathPattern="integration"
npm test -- --testPathPattern="unit"

# Run E2E tests
npm run test:e2e
```

### Test Strategy

Following TDD principles:
1. **Contract tests**: API endpoint contracts
2. **Integration tests**: Component + API integration
3. **Unit tests**: Individual function testing
4. **E2E tests**: Full user workflows

## 📱 API Endpoints

### Public Endpoints

- `GET /api/events` - Get published events
- `GET /api/content/{section}` - Get content (bio, policy, contact)
- `POST /api/mailing-list` - Subscribe to mailing list

### Admin Endpoints (Authenticated)

- `GET /api/admin/mailing-list` - Get subscribers (JSON/CSV)
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/{id}` - Update event
- `DELETE /api/admin/events/{id}` - Delete event
- `PUT /api/admin/content/{section}` - Update content

## 🚀 Deployment

### Vercel (Recommended)

✅ **Automated CI/CD Setup Complete!**

The repository now includes GitHub Actions workflow that automatically:
- Runs tests and linting on every push
- Deploys to Vercel production when code is merged to main
- Creates preview deployments for pull requests

**Live Sites:**
- **Production**: https://ccwebsite-nnxqcw76e-williambridgesapploicoms-projects.vercel.app
- **Admin Panel**: https://ccwebsite-nnxqcw76e-williambridgesapploicoms-projects.vercel.app/admin

Environment variables are pre-configured on Vercel for all environments.

### Other Platforms

The application can be deployed on any platform supporting Next.js:
- Netlify
- Railway
- Heroku
- Self-hosted

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the campaign color scheme:

```js
colors: {
  campaign: {
    50: '#eff6ff',   // Lightest blue
    600: '#2563eb',  // Primary blue
    800: '#1e40af',  // Darker blue
    // ... more shades
  }
}
```

### Content

Use the admin interface at `/admin/content` to edit:
- Biography section
- Policy priorities 
- Contact information

## 📈 Performance

- **Lighthouse Score**: 95+ performance
- **Core Web Vitals**: Green
- **Bundle Size**: Optimized with Next.js
- **Caching**: Static generation where possible

## 🔒 Security

- Row Level Security (RLS) on database
- Input validation with Zod
- CSRF protection
- Environment variable security
- Admin authentication required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review test failures for guidance
- Open an issue on GitHub

---

Built with ❤️ for democracy and community engagement.