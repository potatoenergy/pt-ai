import { user_name, password, cf_clearance, session } from "../misc/config";

export async function AuthBot(page: any) {
   // Define the cookies
   const cookies = [
    {
      name: 'ar_debug',
      value: '1',
      domain: 'www.google-analytics.com',
      path: '/',
      expires: new Date('2024-09-07T12:23:25.699Z').getTime() / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'cf_clearance',
      value: cf_clearance,
      domain: 'pony.town',
      path: '/',
      expires: new Date('2025-06-11T13:58:53.069Z').getTime() / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'session',
      value: session,
      domain: 'pony.town',
      path: '/',
      expires: new Date('2025-06-15T05:48:59.104Z').getTime() / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    }
  ];

  // Set the cookies
  await page.setCookie(...cookies);

  // Navigate to the website
  await page.goto('https://pony.town');
}


// export async function AuthBot(page: any) {
//     // Click button to login using Twitter
//   await page.click('button[title="Sign in or sign up using Twitter"]');

//   await page.waitForSelector("#username_or_email");

//   // Fill in username input
//   await page.type("#username_or_email", user_name);

//   // Fill in password input
//   await page.type("#password", password);

//   // Click "Authorize app" button
//   await page.click("#allow");
// }