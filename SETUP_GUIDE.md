# Hamro Doctor Frontend - Quick Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation & Running

```bash
# 1. Navigate to frontend directory
cd hamro_doctor_frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Visit http://localhost:5173 (or the URL shown in terminal)
```

## 📦 Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## 🔑 Configuration

### Backend URL
Edit `src/pages/Login.jsx` and update the backend URL (around line 13):

```javascript
const response = await fetch('YOUR_BACKEND_URL/api/v1/auth/login', {
```

### For Development
```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
```

### For Production
```javascript
const response = await fetch('https://api.hamrodoc.com/api/v1/auth/login', {
```

## 🎨 Customize Colors

Edit `src/styles/Login.css` and `src/index.css` to change the color palette:

```css
:root {
  --primary: #1E88E5;        /* Change primary color */
  --secondary: #0D47A1;      /* Change secondary color */
  --background: #F4F6F8;     /* Change background */
}
```

## 📱 Responsive Testing

- **Desktop**: Open in full browser window
- **Tablet**: Use browser DevTools (Ctrl+Shift+I) → Toggle device toolbar
- **Mobile**: Use mobile phone or simulate with DevTools

## 🔐 Login Credentials

For testing with your backend:

**Test Credentials Format**:
- Email: `user@example.com`
- Phone: `9841234567`
- Password: Your registered password

The login page accepts both email and phone numbers.

## 🛠️ Troubleshooting

### Issue: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: Port already in use
The dev server will automatically use the next available port.

### Issue: Backend connection error
1. Verify backend server is running
2. Check CORS is enabled on backend
3. Verify backend URL in Login.jsx

### Issue: Styling looks different
- Clear browser cache (Ctrl+Shift+Del)
- Hard reload (Ctrl+Shift+R)

## 📚 Documentation

- **Full Documentation**: See [LOGIN_PAGE_DOCS.md](LOGIN_PAGE_DOCS.md)
- **Backend API**: Check `../hamro_doctor_backend/` for API documentation
- **Design System**: Colors and styles are in `src/styles/Login.css`

## 🎯 Next Steps

1. ✅ Login page is ready
2. ⏳ Patient dashboard (coming next)
3. ⏳ Appointment booking
4. ⏳ Medical records
5. ⏳ User profile

## 📞 Support

For issues or questions:
1. Check [LOGIN_PAGE_DOCS.md](LOGIN_PAGE_DOCS.md) for detailed docs
2. Review backend API documentation
3. Check browser console for errors (F12)

---

**Ready to go!** 🎉
