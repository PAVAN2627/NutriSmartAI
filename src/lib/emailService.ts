// Google Apps Script Web App URL for mailing system
const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

export const sendEmail = async (email: string, subject: string, html: string, message?: string) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ email, subject, html, message }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const subject = "Welcome to NutriSmart AI! 🥗";
  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981, #84cc16); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome, ${name}!</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">We're thrilled to have you join NutriSmart AI. Your personalized nutrition journey starts today.</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">Here is what you can do right away:</p>
        <ul style="color: #4b5563; font-size: 15px; margin-bottom: 20px;">
          <li>Snap & scan your first food item</li>
          <li>Check out budget-friendly recommendations</li>
          <li>Invite a fitness buddy to stay accountable</li>
        </ul>
        <a href="https://nutrismart-ai.vercel.app/dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};

export const sendBuddyInviteEmail = async (toEmail: string, fromName: string, message: string) => {
  const subject = `${fromName} wants to be your Fitness Buddy! 🤝`;
  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #3b82f6, #0ea5e9); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Buddy Request!</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <p style="font-size: 16px; color: #374151; line-height: 1.5;"><strong>${fromName}</strong> has invited you to be their fitness buddy on NutriSmart AI!</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic; color: #4b5563;">
          "${message}"
        </div>
        <a href="https://nutrismart-ai.vercel.app/fitness-buddy" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join Them on NutriSmart</a>
      </div>
    </div>
  `;
  return sendEmail(toEmail, subject, html);
};

export const sendWeeklyReportEmail = async (email: string, name: string) => {
  const subject = "Your NutriSmart AI Weekly Recap 📊";
  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #a855f7, #6366f1); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Weekly AI Insights</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">Your personalized AI coach has analyzed your eating habits from the last 7 days. Here are some quick takeaways:</p>
        
        <div style="background: #fdf4ff; border-left: 4px solid #a855f7; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #86198f;">Protein Intake</h3>
          <p style="margin-bottom: 0; color: #4b5563;">You've hit your protein goals 5 out of 7 days! Keep up the great work to maintain muscle health.</p>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #b45309;">Sugar Alert</h3>
          <p style="margin-bottom: 0; color: #4b5563;">We noticed a spike in late-night sugars. Try substituting with fruit or dark chocolate to improve sleep quality.</p>
        </div>

        <a href="https://nutrismart-ai.vercel.app/reports" style="display: block; text-align: center; background-color: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 25px;">View Detailed Report</a>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};

export const sendReminderEmail = async (email: string, name: string) => {
  const subject = "Don't forget to log your lunch! 🥗";
  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f97316, #eab308); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Stay on Track!</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">Consistency is the key to hitting your goals. You haven't logged your afternoon meal yet. Snap a quick photo with the app and let the AI do the heavy lifting!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://nutrismart-ai.vercel.app/scan" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log Food Now</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};
