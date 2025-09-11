import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${baseUrl}/verify-email?token=${token}`;

  // For development, log the verification link to console
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 EMAIL VERIFICATION LINK:');
    console.log(`Email: ${email}`);
    console.log(`Verification Link: ${link}`);
    console.log('Copy this link and open it in your browser to verify your email.\n');
    
    // Still try to send via Resend, but don't fail if it doesn't work
    try {
      return await resend.emails.send({
        from: 'mail@nextmatch.trycatchlearn.com',
        to: email,
        subject: 'Verify your email address',
        html: `
                <h1>Verify your email address</h1>
                <p>Click the link below to verify your email address</p>
                <a href="${link}">Verify email</a>
            `,
      });
    } catch (error) {
      console.log('Resend email failed (expected in development):', error);
      return { success: true }; // Return success so the app continues
    }
  }

  return resend.emails.send({
    from: 'mail@nextmatch.trycatchlearn.com',
    to: email,
    subject: 'Verify your email address',
    html: `
            <h1>Verify your email address</h1>
            <p>Click the link below to verify your email address</p>
            <a href="${link}">Verify email</a>
        `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${baseUrl}/reset-password?token=${token}`;

  // For development, log the reset link to console
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔑 PASSWORD RESET LINK:');
    console.log(`Email: ${email}`);
    console.log(`Reset Link: ${link}`);
    console.log('Copy this link and open it in your browser to reset your password.\n');
    
    // Still try to send via Resend, but don't fail if it doesn't work
    try {
      return await resend.emails.send({
        from: 'mail@nextmatch.trycatchlearn.com',
        to: email,
        subject: 'Reset your password',
        html: `
                <h1>You have requested to reset your password</h1>
                <p>Click the link below to reset password</p>
                <a href="${link}">Reset password</a>
            `,
      });
    } catch (error) {
      console.log('Resend email failed (expected in development):', error);
      return { success: true }; // Return success so the app continues
    }
  }

  return resend.emails.send({
    from: 'mail@nextmatch.trycatchlearn.com',
    to: email,
    subject: 'Reset your password',
    html: `
            <h1>You have requested to reset your password</h1>
            <p>Click the link below to reset password</p>
            <a href="${link}">Reset password</a>
        `,
  });
}
