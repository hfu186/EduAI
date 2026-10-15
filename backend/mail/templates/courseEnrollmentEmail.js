exports.courseEnrollmentEmail = (courseName, name) => {
  const dashboardUrl =
    "https://study-notion-mern-stack.netlify.app/dashboard/enrolled-courses";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Course Registration Confirmation</title>
  <style>
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; }
      .px { padding-left: 20px !important; padding-right: 20px !important; }
      .btn a { display: block !important; }
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:#f1f3f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <!-- Preheader (hiện ở phần preview trong inbox) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    You're in! Start learning "${courseName}" today.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f3f9;padding:32px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" class="wrapper" width="600" cellpadding="0" cellspacing="0"
          style="width:600px;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(20,24,60,0.08);">

          <!-- Header / Hero -->
          <tr>
            <td align="center" class="px"
              style="background:#0f172a;background-image:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 40px;">
              <a href="${dashboardUrl}">
                <img src="https://i.ibb.co/7Xyj3PC/logo.png" alt="EduSpace" width="140"
                  style="display:block;border:0;max-width:140px;height:auto;margin:0 auto 20px;">
              </a>
              <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background-color:#FFD60A;color:#0f172a;font-size:28px;font-weight:bold;">
                &#10003;
              </div>
              <h1 style="margin:16px 0 0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;">
                Registration Confirmed
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="px" style="padding:36px 40px 8px;color:#334155;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 16px;font-size:18px;color:#0f172a;">
                Hi <strong>${name}</strong> 👋
              </p>
              <p style="margin:0 0 24px;">
                You've successfully registered for the course below. We're excited to have you on board!
              </p>

              <!-- Course card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #FFD60A;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:4px;">
                      Your course
                    </div>
                    <div style="font-size:18px;font-weight:700;color:#0f172a;">
                      ${courseName}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;">
                Log in to your learning dashboard to access the course materials and start your learning journey.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" class="px btn" style="padding:28px 40px 36px;">
              <a href="${dashboardUrl}"
                style="display:inline-block;background-color:#FFD60A;color:#0f172a;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:999px;">
                Go to Dashboard &rarr;
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td class="px" style="padding:0 40px;">
              <div style="height:1px;background-color:#e2e8f0;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" class="px" style="padding:24px 40px 32px;font-size:13px;line-height:1.6;color:#94a3b8;">
              Need help? Reach out to us at
              <a href="mailto:gadeaniruddha2@gmail.com" style="color:#0f172a;font-weight:600;text-decoration:underline;">gadeaniruddha2@gmail.com</a>
              &mdash; we're here to help!
              <br><br>
              &copy; ${new Date().getFullYear()} EduSpace. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};