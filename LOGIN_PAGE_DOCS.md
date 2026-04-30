# Hamro Doctor - Login Page Documentation

## Overview
A professional, responsive login page for the Hamro Doctor patient platform built with React and Vite. The page features a modern design with the specified color palette, form validation, error handling, and a beautiful sidebar with feature highlights.

## Features

### 🎨 Design Highlights
- **Modern UI**: Clean, professional design with smooth animations
- **Color Palette**: 
  - Primary: #1E88E5 (Sky Blue)
  - Secondary: #0D47A1 (Dark Blue)
  - Background: #F4F6F8 (Light Gray-Blue)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in dark mode compatibility
- **Accessibility**: WCAG compliant with proper labels and ARIA attributes

### ✨ Features
- Email/Phone login
- Password visibility toggle
- "Remember me" checkbox
- Forgot password link
- Social login options (Google, Facebook)
- Loading states with spinner animation
- Error handling and validation
- Responsive sidebar with healthcare features highlights
- Mobile-optimized forms (prevents zoom on iOS)

## File Structure

```
src/
├── pages/
│   └── Login.jsx              # Main login component
├── styles/
│   └── Login.css              # Login page styles with color palette
├── App.jsx                    # Main app component with auth routing
├── App.css                    # Dashboard/app styles
├── index.css                  # Global styles with CSS variables
└── main.jsx                   # Entry point
```

## Getting Started

### Installation

1. Navigate to the frontend directory:
```bash
cd hamro_doctor_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

## API Integration

### Backend Endpoint
The login page connects to your backend login endpoint:

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "loginId": "email@example.com or 9841234567",
  "password": "userPassword"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "userId",
    "name": "User Name",
    "email": "email@example.com",
    "role": "patient"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Invalid email/phone or password"
}
```

## Configuration

### Backend URL
Update the backend URL in [Login.jsx](src/pages/Login.jsx) line 13:

```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
```

Change `http://localhost:5000` to your actual backend URL.

## Color Palette

The color palette is defined in CSS variables (`:root`) in both `Login.css` and `index.css`:

```css
:root {
  --primary: #1E88E5;        /* Main brand color - Sky Blue */
  --secondary: #0D47A1;      /* Dark blue for accents */
  --background: #F4F6F8;     /* Light background */
  --text-dark: #212121;      /* Dark text */
  --text-light: #757575;     /* Secondary text */
  --border: #E0E0E0;         /* Border color */
  --error: #D32F2F;          /* Error state */
  --success: #388E3C;        /* Success state */
  --white: #FFFFFF;          /* White */
}
```

## Component Structure

### Login.jsx Component
- **State Management**: 
  - `loginId`: Email or phone number
  - `password`: Password input
  - `loading`: Loading state during submission
  - `error`: Error message display
  - `showPassword`: Password visibility toggle

- **Main Functions**:
  - `handleSubmit()`: Handles form submission and API call
  - Stores token and user data in localStorage
  - Redirects to dashboard on success

### User Data Storage
On successful login, the component stores:
- **Token**: `localStorage.getItem('token')`
- **User**: `localStorage.getItem('user')`

These can be retrieved for authenticated API calls.

## Responsive Breakpoints

The login page is optimized for different screen sizes:

| Device | Width | Adjustments |
|--------|-------|-------------|
| Desktop | > 968px | Full 2-column layout with sidebar |
| Tablet | 640px - 968px | Single column, sidebar visible |
| Mobile | < 640px | Single column, sidebar hidden, optimized spacing |
| Small Mobile | < 480px | Compact layout, larger touch targets |

## Form Validation

- **Email/Phone**: Required field, must have input
- **Password**: Required field, minimum input expected
- **Both fields**: Required before form submission

### Error Handling

The component handles:
- Network errors
- Invalid credentials
- Server errors
- Display user-friendly error messages

## Animations & Transitions

- **Smooth transitions** on all interactive elements (0.3s default)
- **Error alert slide-down** animation
- **Button hover effects** with transform and shadow changes
- **Loading spinner** animation (360° rotation)
- **Fade effects** on form inputs and focus states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization Guide

### Change Colors
1. Update CSS variables in `src/styles/Login.css` `:root` section
2. Update global variables in `src/index.css` `:root` section

### Add Company Logo
Replace the SVG in the logo-circle with your own logo/image.

### Modify Features List
Edit the features list in the sidebar section of [Login.jsx](src/pages/Login.jsx).

### Change Social Login Options
Add or remove social buttons in the social-buttons section of [Login.jsx](src/pages/Login.jsx).

### Adjust Spacing
Modify padding/margin values in the CSS file to adjust layout spacing.

## Security Considerations

- ✅ Token stored in localStorage (consider using secure cookies for production)
- ✅ Password input masked by default
- ✅ HTTPS recommended for all backend communications
- ✅ Add CSRF protection for production
- ✅ Validate all inputs on backend
- ⚠️ Consider adding rate limiting to prevent brute force attacks

## Next Steps

### For Patient Dashboard
After login, you can create:
1. Patient dashboard with appointment history
2. Medical records section
3. Prescription management
4. Doctor consultation booking
5. Health metrics tracking

### For Registration
Create a registration page following the same design pattern using:
- `/api/v1/auth/register` endpoint
- OTP verification flow
- Similar component structure and styling

## Troubleshooting

### Login page not showing
- Ensure `localStorage` is not being blocked
- Check browser console for errors
- Verify React and dependencies are installed

### Backend connection error
- Check backend server is running on port 5000
- Verify CORS is enabled on backend
- Update backend URL in Login.jsx if different

### Styling issues
- Clear browser cache
- Rebuild with `npm run build`
- Check CSS file imports

### Mobile zoom issues
- CSS already includes `user-scalable=yes` in viewport meta tag
- Form inputs have `font-size: 16px` to prevent iOS zoom

## Performance

- Lazy loading for social buttons
- Optimized animations (60fps)
- Minimal re-renders with proper state management
- CSS Grid for efficient layout
- Production-ready with minification

## License

This component is part of the Hamro Doctor project.

---

**Last Updated**: April 2026
**Version**: 1.0.0
