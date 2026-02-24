/**
 * Email Configuration for Supabase Auth
 *
 * This file contains templates and utilities for customizing
 * Supabase authentication emails.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Supabase email template placeholders:
 *
 * Available in all templates:
 * - {{ .Token }} - Authentication token
 * - {{ .TokenHash }} - Hashed token (for magic links)
 * - {{ .ConfirmationURL }} - Full confirmation URL
 * - {{ .SiteURL }} - Your app's URL
 * - {{ .Data.email }} - User's email address
 *
 * Template subjects:
 * - "{{ .Data.name }}" - User's name (if available)
 */

export const emailTemplates = {
  confirmSignup: {
    subject: 'Confirm Your Signup - Disney DDP Snack Finder',
    description: 'Email sent when user signs up to confirm their email address',
  },
  magicLink: {
    subject: 'Your Magic Link - Sign In Instantly',
    description: 'Email sent for magic link sign-in (passwordless)',
  },
  resetPassword: {
    subject: 'Reset Your Password - Disney DDP Snack Finder',
    description: 'Email sent when user requests to reset their password',
  },
  changeEmail: {
    subject: 'Confirm Your New Email Address',
    description: 'Email sent when user changes their email address',
  },
  recoverEmail: {
    subject: 'Recover Your Account',
    description: 'Email sent for account recovery',
  },
  inviteEmail: {
    subject: 'You\'ve Been Invited to Disney DDP Snack Finder',
    description: 'Email sent to invite users to sign up',
  },
};

/**
 * Supabase Email Configuration Steps:
 *
 * 1. Go to your Supabase dashboard
 * 2. Navigate to Authentication > Email Templates
 * 3. For each email type (confirmSignup, magicLink, resetPassword, etc.):
 *    - Click "Edit" or the pencil icon
 *    - Replace the default HTML with the corresponding template
 *    - Keep the placeholders ({{ .Token }}, {{ .ConfirmationURL }}, etc.)
 *    - Update the subject line
 *    - Save changes
 *
 * 4. Test by:
 *    - Signing up a new account
 *    - Requesting a password reset
 *    - Testing magic link sign-in
 */

export interface EmailCustomizationOptions {
  logoUrl?: string;
  brandColor?: string;
  supportEmail?: string;
  appName?: string;
  appUrl?: string;
}

/**
 * CSS variables used in email templates:
 *
 * Primary Colors:
 * - Blue: #0066cc (sign up confirmation)
 * - Orange: #ff6b35 (magic link)
 * - Purple: #9c27b0 (password reset)
 *
 * Background:
 * - Light: #f5f5f5
 * - Content: #ffffff
 * - Section: #f9f9f9
 *
 * Text:
 * - Primary: #333
 * - Secondary: #555
 * - Muted: #777
 * - Light: #999
 */

/**
 * How to customize email templates:
 *
 * Option 1: Replace colors
 * - Linear gradients use two colors (e.g., #0066cc and #004499)
 * - Update both colors for consistent theming
 *
 * Option 2: Update company info
 * - Replace "Disney DDP Snack Finder" with your app name
 * - Update support email and links
 * - Change copyright year if needed
 *
 * Option 3: Add/remove sections
 * - Each email has a greeting, main content, tips/warnings, and footer
 * - Sections can be removed or reordered
 * - Keep security information visible
 *
 * Option 4: Adjust responsive behavior
 * - @media queries handle mobile (max-width: 600px)
 * - Test on different screen sizes
 */

/**
 * Email delivery checklist:
 *
 * ✅ Verify sender email in Supabase Auth settings
 * ✅ Configure SMTP if using custom email provider
 * ✅ Test confirmation emails work
 * ✅ Test password reset emails work
 * ✅ Check emails on mobile devices
 * ✅ Verify all links are clickable and work
 * ✅ Test unsubscribe links (if applicable)
 * ✅ Check spam/junk folder delivery
 * ✅ Verify company branding is consistent
 * ✅ Test with different email providers (Gmail, Outlook, etc.)
 */

export const emailTips = {
  maxWidth: '600px - Optimal width for most email clients',
  fontStack:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, etc. - Web-safe fonts',
  buttonSize: '14px padding, 16px font - Easy to tap on mobile',
  colorContrast: 'Text color on background has sufficient contrast (WCAG AA)',
  imageOptimization: 'Use inline CSS instead of external stylesheets',
  linkTesting: 'Always test {{ .ConfirmationURL }} and {{ .TokenHash }} placeholders',
};

/**
 * Supabase-specific configuration:
 *
 * In your Supabase Auth settings, you'll see these email templates:
 * - Confirm signup
 * - Invite user
 * - Magic Link
 * - Change email
 * - Recovery
 * - Reset password
 *
 * Each template receives variables from Supabase:
 * - .Token - JWT token or magic link token
 * - .TokenHash - Hashed token for links
 * - .ConfirmationURL - Full URL to complete action
 * - .SiteURL - Your app domain
 * - .Data - Custom data (email, etc.)
 */
