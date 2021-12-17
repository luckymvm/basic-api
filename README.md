### Endpoints:

**/auth**

Path | Method | Description
---|---|---
/auth/login | POST | Sign in action
/auth/refresh | POST | Get new access& refresh tokens
/auth/logout | POST | Logout user
/auth | GET | Auth & get current user info

**/user**

Path | Method | Description
---|---|---
/user/register | POST | Sign up new user
/user/confirm-email | POST | Email confirmation
/user/resend-email-confirmation-link | POST | Resend a link to confirm email 
/user/send-reset-password-link | POST | Send a link to reset password 
/user/reset-password | POST | Password change confirmation
/user/change-password | POST | Password change action
/user/email-change-request | POST | Request to change mail 
/user/confirm-email-change | POST | Email change confirmation
/user/change-alias | PUT | Change alias action
/user/delete | DELETE | Delete account