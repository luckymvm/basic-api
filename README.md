## Endpoints:

**/user**

Path | Method | Description
---|---|---
/user/register | POST | Register account action
/user/confirm-email | POST | Email confirmation
/user/resend-email-confirmation-link | POST | Resend a link to confirm email
/user/send-reset-password-link | POST | Send a link to reset password
/user/reset-password | POST | Password change confirmation
/user/change-password | POST | Password change action
/user/email-change-request | POST | Request to change mail
/user/confirm-email-change | POST | Email change confirmation
/user/change-alias | PUT | Change alias action
/user/delete | DELETE | Delete account


**/auth**

Path | Method | Description
---|---|---
/auth/login | POST | Sign in action
/auth/refresh | POST | Get new access&refresh tokens
/auth/logout | POST | Logout user
/auth | GET | Auth & get current user info

---

### Register account

***Request***
```
POST /user/register
{
    "email": "",
    "username": "",
    "alias": "",
    "password": "",
    "fingerprint": ""
}
```
- The request goes through a ValidationPipe (data validation and transformation)
- Save the user to the database
- If a user with such an email and username exists, then we throw an 400 BadRequestException error
- If everything went well, we generate new access token and the refresh token, then we return the 200 code on the successful registration of the user
- A link is sent to an email to confirm the registration of an account

***Response***

If success
```
Set-cookie: refreshToken=${refreshToken}; HttpOnly; Path=/auth; Max-Age=${maxAge}
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjExLCJpYXQiOjE2Mzk3NjkzMzIsImV4cCI6MTYzOTc3MTEzMn0.WFVEN4-jlCn-lf39QaQFbGHPhplPbXjiuIqIyPfzv-E",
    "refreshToken": "aa546c27-45f2-4d41-8726-efb733b4b0b1",
    "username": "username",
    "email": "email@email.com",
    "isEmailConfirmed": false
}
```

In case of error:
```
{
    "statusCode": 400,
    "message": "Username or email are taken",
    "error": "Bad Request"
}
```

---

[comment]: <> (```)

[comment]: <> (POST /auth/login)

[comment]: <> ({)

[comment]: <> (    "username": "",)

[comment]: <> (    "password": "",)

[comment]: <> (    "fingerprint": "")

[comment]: <> (})

[comment]: <> (```)

[comment]: <> (```)

[comment]: <> (POST /auth/refresh ## with refresh tokens in cookies or in the body)

[comment]: <> ({)

[comment]: <> (    "fingerprint": "")

[comment]: <> (})

[comment]: <> (```)

[comment]: <> (```)

[comment]: <> (POST /auth/logout ## with refreshToken in cookies or in the body)

[comment]: <> (```)

[comment]: <> (```)

[comment]: <> (GET /auth ## with Bearer token in the Headers)

[comment]: <> (```)

