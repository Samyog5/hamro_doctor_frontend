# Register Page Documentation

## Overview
A two-step registration page for the Hamro Doctor application. Users create an account with their information in Step 1, then verify it via OTP in Step 2. Fully integrated with the backend.

## Features

### Step 1: Registration Form
- Full name input
- Email address (optional)
- Phone number (required, 10 digits)
- Password (minimum 6 characters)
- Password confirmation
- Form validation
- Error handling

### Step 2: OTP Verification
- SMS-based OTP verification
- 6-digit OTP input
- Resend OTP functionality
- Back to registration option
- OTP expiry timer (10 minutes)

### Design Features
- Same color palette as login page
- Responsive design (desktop, tablet, mobile)
- Step indicator showing progress
- Smooth animations
- Professional sidebar with features
- Dark mode support
- Full accessibility

## Backend Integration

### Step 1: Register Endpoint
**Endpoint**: `POST /api/v1/auth/register`

**Request**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "9841234567",
  "password": "password123",
  "role": "patient"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered. Please verify OTP sent to your phone.",
  "userId": "user_id_here"
}
```

### Step 2: Verify OTP Endpoint
**Endpoint**: `POST /api/v1/auth/verify-otp`

**Request**:
```json
{
  "phone": "9841234567",
  "code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "userId",
    "name": "User Name",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

## File Structure

```
src/
├── pages/
│   ├── Login.jsx               # Login component
│   └── Register.jsx            # Register component (2-step)
├── styles/
│   ├── Login.css               # Login styles
│   └── Register.css            # Register styles
├── App.jsx                     # Main app with page switching
├── App.css                     # Dashboard styles
├── index.css                   # Global styles
└── main.jsx                    # Entry point
```

## Form Validation

### Name
- Required field
- Minimum 1 character

### Email
- Optional field
- Valid email format required if provided

### Phone
- Required field
- Exactly 10 digits

### Password
- Required field
- Minimum 6 characters
- Must match confirmation password

### OTP
- Required field
- Exactly 6 digits
- Automatically formatted (numbers only)

## User Flow

```
1. User clicks "Create one here" on login page
   ↓
2. Lands on Register page, Step 1
   ↓
3. Fills in: name, email (optional), phone, password, confirm password
   ↓
4. Clicks "Continue"
   ↓
5. Backend validates and creates user, sends OTP via SMS
   ↓
6. UI moves to Step 2: OTP Verification
   ↓
7. User receives SMS with 6-digit OTP
   ↓
8. User enters OTP
   ↓
9. Clicks "Verify OTP"
   ↓
10. Backend verifies OTP, returns JWT token
    ↓
11. Token stored in localStorage
    ↓
12. Redirects to dashboard
```

## Component Props

### Register Component
```javascript
<Register onSwitchToLogin={() => setCurrentPage('login')} />
```

**Props**:
- `onSwitchToLogin`: Function to switch back to login page

### Login Component
```javascript
<Login onSwitchToRegister={() => setCurrentPage('register')} />
```

**Props**:
- `onSwitchToRegister`: Function to switch to register page

## State Management

### Step 1 (Registration Form)
- `formData`: User input data
  - name, email, phone, password, confirmPassword
- `loading`: Form submission state
- `error`: Error message display
- `showPassword`: Password visibility toggle
- `showConfirmPassword`: Confirm password visibility toggle
- `step`: Current step (1 or 2)

### Step 2 (OTP Verification)
- `otp`: OTP input value
- `userId`: User ID from registration
- `otpExpiry`: OTP expiration time
- `loading`: Verification state
- `error`: Error message display

## Styling

### Color Palette
- Primary: #1E88E5 (Sky Blue)
- Secondary: #0D47A1 (Dark Blue)
- Background: #F4F6F8
- Error: #D32F2F (Red)
- Success: #388E3C (Green)

### Responsive Breakpoints
- Desktop: > 968px (2-column layout with sidebar)
- Tablet: 640px - 968px (1-column, sidebar visible)
- Mobile: < 640px (1-column, sidebar hidden)
- Small: < 480px (Compact layout)

## Key Functions

### handleRegister()
- Validates form data
- Makes POST request to `/api/v1/auth/register`
- On success: moves to Step 2 (OTP verification)
- On error: displays error message

### handleVerifyOtp()
- Validates OTP (6 digits)
- Makes POST request to `/api/v1/auth/verify-otp`
- On success: stores token and redirects to dashboard
- On error: displays error message

### handleResendOtp()
- Calls register endpoint again
- Generates and sends new OTP via SMS
- Resets OTP timer

### validateForm()
- Validates all form fields
- Returns true if all valid, false otherwise
- Sets appropriate error messages

## Error Handling

The component handles:
- Network errors
- Validation errors
- Backend errors
- User already exists errors
- Invalid OTP errors
- Expired OTP errors
- Display user-friendly error messages

## Features Implemented

✅ Two-step registration flow
✅ Form validation
✅ Password visibility toggle
✅ OTP generation and verification
✅ Resend OTP functionality
✅ Error alerts
✅ Loading states with spinner
✅ Step indicator
✅ Smooth transitions
✅ Mobile optimized
✅ Accessibility compliant
✅ Dark mode support

## Security

- ✅ Password masked by default
- ✅ HTTPS recommended
- ✅ Token stored in localStorage
- ✅ Backend validation on all inputs
- ✅ OTP expires after 10 minutes
- ✅ SMS-based OTP (more secure than email)

## Next Steps

After successful registration:
1. User redirected to dashboard
2. Token available for authenticated API calls
3. Can build patient-specific features

## Customization

### Change OTP Expiry Time
Edit the line that sets otpExpiry:
```javascript
const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

### Add Password Requirements
Update password validation in `validateForm()`:
```javascript
if (formData.password.length < 8) { // Change to 8
  setError('Password must be at least 8 characters');
}
```

### Make Email Required
Remove the optional check:
```javascript
if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
```

### Add Phone Format Support
Accept different phone formats:
```javascript
// Strip non-digits and validate length
const phone = formData.phone.replace(/\D/g, '');
if (phone.length !== 10) {
  setError('Phone number must be 10 digits');
}
```

## Testing

### Test Credentials
- Name: Test User
- Email: test@example.com
- Phone: 9841234567
- Password: Test@123

### Test OTP
The OTP sent via SMS should be 6 digits. For testing without real SMS, check your console logs or use a test SMS service.

### Common Issues

**Issue**: Phone already registered
- **Solution**: Use a different phone number

**Issue**: OTP expired
- **Solution**: Click "Resend OTP" to get a new one

**Issue**: Password mismatch
- **Solution**: Ensure both password fields match exactly

**Issue**: Invalid phone format
- **Solution**: Enter exactly 10 digits

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Minimal re-renders
- CSS Grid efficient layout
- Smooth animations (60fps)
- No external UI libraries
- Fast OTP input with auto-formatting

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
