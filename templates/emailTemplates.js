const brandName = "ERP System"

const layout = ({ title, preview, body }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:#111827;padding:24px 32px;color:#ffffff;font-size:20px;font-weight:700;">
                ${brandName}
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 40px;">
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

const greenButton = (href, label) => `
  <a href="${href}" target="_blank" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;line-height:1;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
    ${label}
  </a>
`

const verifyEmailTemplate = ({ username, verifyUrl }) => {
  return layout({
    title: "Verify your email",
    preview: "Click the green Verify button to confirm your email address.",
    body: `
      <h1 style="margin:0 0 12px;font-size:24px;color:#111827;">Verify your email</h1>
      <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">
        Hi ${username || "there"}, thanks for creating an account. Please confirm your email address to finish registration.
      </p>
      <p style="margin:0 0 28px;text-align:center;">
        ${greenButton(verifyUrl, "Verify")}
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
        This verification link expires in 24 hours. If you did not create this account, you can ignore this email.
      </p>
      <p style="margin:0;color:#9ca3af;font-size:12px;word-break:break-all;">
        ${verifyUrl}
      </p>
    `,
  })
}

const resetPasswordTemplate = ({ username, resetUrl }) => {
  return layout({
    title: "Reset your password",
    preview: "Use the button below to reset your ERP password.",
    body: `
      <h1 style="margin:0 0 12px;font-size:24px;color:#111827;">Reset your password</h1>
      <p style="margin:0 0 18px;color:#4b5563;font-size:15px;line-height:1.6;">
        Hi ${username || "there"}, we received a request to reset your password. Click the button below to choose a new password.
      </p>
      <p style="margin:0 0 28px;text-align:center;">
        ${greenButton(resetUrl, "Reset Password")}
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
        This link expires in 15 minutes. If you did not ask for a reset, you can ignore this email.
      </p>
      <p style="margin:0;color:#9ca3af;font-size:12px;word-break:break-all;">
        ${resetUrl}
      </p>
    `,
  })
}

const verificationResultPage = ({ success, message }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${success ? "Email Verified" : "Verification Failed"}</title>
  </head>
  <body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;min-height:100vh;display:flex;align-items:center;justify-content:center;">
    <div style="background:#ffffff;max-width:480px;width:100%;margin:24px;padding:40px 32px;border-radius:16px;text-align:center;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
      <div style="width:64px;height:64px;border-radius:50%;margin:0 auto 16px;background:${success ? "#dcfce7" : "#fee2e2"};display:flex;align-items:center;justify-content:center;font-size:28px;">
        ${success ? "✓" : "!"}
      </div>
      <h1 style="margin:0 0 8px;color:${success ? "#16a34a" : "#dc2626"};font-size:26px;">
        ${success ? "Email Verified" : "Verification Failed"}
      </h1>
      <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">${message}</p>
    </div>
  </body>
</html>
`

const resetPasswordPage = ({ token, message }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
  </head>
  <body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;min-height:100vh;display:flex;align-items:center;justify-content:center;">
    <div style="background:#ffffff;max-width:480px;width:100%;margin:24px;padding:40px 32px;border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
      <h1 style="margin:0 0 8px;color:#111827;font-size:26px;text-align:center;">Reset Password</h1>
      <p style="margin:0 0 24px;color:#4b5563;font-size:14px;text-align:center;">${message || "Enter a new password for your account."}</p>
      <form method="POST" action="" style="display:flex;flex-direction:column;gap:12px;">
        <input type="hidden" name="token" value="${token || ""}" />
        <input type="password" name="password" placeholder="New password" minlength="6" required style="padding:12px 14px;border:1px solid #d1d5db;border-radius:10px;font-size:15px;" />
        <button type="submit" style="background:#22c55e;color:#ffffff;border:0;padding:14px 16px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;">
          Reset Password
        </button>
      </form>
    </div>
  </body>
</html>
`

module.exports = {
  verifyEmailTemplate,
  resetPasswordTemplate,
  verificationResultPage,
  resetPasswordPage,
}
