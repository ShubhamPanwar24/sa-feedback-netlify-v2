[README.md](https://github.com/user-attachments/files/28794742/README.md)
# SA Owner Pending Feedback Portal - Admin PIN Fixed Version

Admin PIN is enabled. SA Owner submission does not need PIN.

Deploy settings:
- Build command: npm run build
- Publish directory: public
- Functions directory: netlify/functions

Set Admin PIN in Netlify:
Site configuration > Environment variables > Add ADMIN_PIN = your password
Then redeploy. If not set, default PIN is 1234.

Important:
Deploy full repo/project with netlify/functions folder. Do not deploy only public/index.html.
