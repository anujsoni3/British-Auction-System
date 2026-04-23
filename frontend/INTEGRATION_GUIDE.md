# 🚀 Quick Integration Guide

## Installing the Landing Page

### Step 1: Install Required Dependencies

```bash
cd frontend

# Core dependencies
npm install react react-dom react-router-dom

# UI and styling
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Optional: for animations
npm install framer-motion
```

### Step 2: Initialize Tailwind CSS (if not already done)

```bash
npx tailwindcss init -p
```

This creates:
- `tailwind.config.js` - Configuration file
- `postcss.config.js` - PostCSS configuration

### Step 3: Update Your Entry Point

Make sure your `index.html` has a root element:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AuctionFlow - Smart RFQ Auctions</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 4: Copy Component Files

The landing page uses these files:
- `src/components/LandingPage.jsx` - Main landing page
- `src/components/shared/UI.jsx` - Reusable UI components
- `src/styles/landing.css` - Custom animations
- `src/index.css` - Global styles
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

## Integration Options

### Option A: Using as Home Page

Update `src/App.jsx`:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
```

### Option B: Integrated with Authentication

```jsx
import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/me', {
        credentials: 'include'
      });
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
}

export default App;
```

### Option C: Standalone Landing Page

Use the landing page as a separate route:

```jsx
<Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/app/*" element={<ProtectedApp />} />
  </Routes>
</Router>
```

## Configuration

### Update Backend URL

Edit `src/App.jsx` to match your backend:

```js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

// In fetch calls:
fetch(`${BACKEND_URL}/auth/me`, { ... })
```

### Environment Variables

Create `.env` file in frontend root:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_ENV=development
```

Access in code:
```js
const backendUrl = import.meta.env.VITE_BACKEND_URL;
```

## Customization

### Add Your Logo

```jsx
// In LandingPage component
<div className="flex items-center gap-2">
  <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
  <span>Your Company Name</span>
</div>
```

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  'primary': {
    '500': '#your-color',
  },
  'secondary': {
    '500': '#your-color',
  }
}
```

Then update components to use new colors.

### Modify Content

Edit `src/components/LandingPage.jsx` sections:

```jsx
// Hero Section
<h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
  Your custom title
</h1>

// Features
const features = [
  {
    icon: <YourIcon />,
    title: 'Your Feature',
    description: 'Your description',
    gradient: 'from-emerald-500/20 to-emerald-600/20'
  }
]
```

## Adding Advanced Sections

Import and use advanced components:

```jsx
import {
  TestimonialsSection,
  PricingSection,
  FAQSection,
  IntegrationsSection,
  ComparisonSection,
  ResourcesSection
} from './AdvancedExamples';

// In your landing page component:
<LandingPageContent />
<TestimonialsSection />
<FAQSection />
<PricingSection />
```

## Performance Optimization

### 1. Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./components/LandingPage'));

<Suspense fallback={<Loading />}>
  <LandingPage />
</Suspense>
```

### 2. Image Optimization

```jsx
<img
  src="/path/to/image.webp"
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

### 3. Font Optimization

Add to `index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap');

* {
  font-display: swap;
}
```

## Testing

### Component Testing

```jsx
import { render, screen } from '@testing-library/react';
import LandingPage from './components/LandingPage';

describe('LandingPage', () => {
  it('renders hero section', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Smart RFQ/i)).toBeInTheDocument();
  });
});
```

### Responsive Testing

Use browser DevTools or:

```bash
npm install -D @testing-library/react
```

## Build & Deploy

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Connect your repo to Netlify
# Deploy `dist` folder
```

## Troubleshooting

### Styles not applying

1. Ensure Tailwind is configured
2. Check `index.css` imports all required files
3. Run `npm run build` to rebuild

### Components not rendering

1. Check all imports are correct
2. Verify React Router setup
3. Check browser console for errors

### Navigation not working

1. Verify links use correct paths
2. Check backend server is running
3. Test CORS configuration

## Tips & Tricks

### Smooth Scroll Behavior

```css
html {
  scroll-behavior: smooth;
}
```

### Add Loading States

```jsx
const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);
  try {
    // Perform action
  } finally {
    setLoading(false);
  }
};
```

### Dark Mode Support

```jsx
// Tailwind handles this automatically
// Just use dark: prefix for dark mode styles
<div className="bg-white dark:bg-slate-900">
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Copy component files
3. ✅ Configure Tailwind
4. ✅ Update backend URL
5. ✅ Customize branding
6. ✅ Test responsive design
7. ✅ Deploy to production

## Support & Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)
- [Vite Docs](https://vitejs.dev)

---

**Questions? Check the LANDING_PAGE_GUIDE.md for more details!**
