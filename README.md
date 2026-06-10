# SA Owner Pending Feedback Portal - Netlify Version 2

## Purpose
Admin uploads daily raw dump CSV. The app filters pending meter tasks and stores them in Netlify backend. SA Owners open one Teams link, select their name, fill feedback, and submit without GitHub login.

## Deploy settings
- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

## Environment variable
Set in Netlify:
- `ADMIN_PIN` = your admin password

If not set, default PIN is `1234`.

## Daily use
1. Open app URL.
2. Admin Panel.
3. Enter Admin PIN.
4. Upload raw dump CSV.
5. Process CSV.
6. Upload / Replace Daily Tasks.
7. Share app link in Teams.
8. SA Owners submit feedback.
9. Download Feedback CSV.

## Daily clear options
- Clear Old Feedback: removes previous feedback submissions only.
- Clear All Tasks + Feedback: removes current pending tasks and all feedback.

## Output columns
Cluster ID, HHID, PMAID, Work Order Number, SA Owner, Appointment Number, Reason for Pending, By which Date Connect, Submitted Time
