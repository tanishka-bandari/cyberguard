# User guide

This guide explains how to use CyberGuard, organised by role. It is written for people using the application, not for developers (see the [README](../README.md) and [architecture](architecture.md) for those).

Contents:

- [Roles](#roles)
- [Signing up and signing in](#signing-up-and-signing-in)
- [Everyone: navigation, search and theme](#everyone-navigation-search-and-theme)
- [As a User (reporter)](#as-a-user-reporter)
- [As an Analyst](#as-an-analyst)
- [As an Admin](#as-an-admin)
- [Status, severity and SLA explained](#status-severity-and-sla-explained)
- [FAQ and troubleshooting](#faq-and-troubleshooting)

## Roles

| Role | Who | Home page after sign-in |
|---|---|---|
| **User** (shown as "Reporter") | Anyone who reports incidents, for example an employee | Overview (`/portal`) |
| **Analyst** | Security staff who investigate incidents | Dashboard (`/dashboard`) |
| **Admin** | Security lead: does everything an analyst does, plus assigns and deletes incidents and manages users | Command center (`/admin/command-center`) |

A role decides which pages you see. If you open a page that belongs to another role, you are sent back to your own home page.

## Signing up and signing in

**Create an account**

1. Open the application and choose **Create an account** on the sign-in page.
2. Enter your full name (at least 2 characters), your email address, and a password of at least 8 characters, twice.
3. Select **Create account**. You are signed in straight away and land on the reporter overview.

Every new account is a User. Only an admin can make someone an Analyst or Admin (see [Users](#users-admin)). The very first admin has to be promoted directly in the database; the steps are in the [README](../README.md#4-first-admin-account).

**Sign in**

1. Enter your email and password and select **Sign in**.
2. If you were sent to the sign-in page from a specific page (for example because your session expired), you return to that page afterwards, as long as your role may open it.

Sessions last 24 hours. After that you are asked to sign in again. To sign out earlier, use the sign-out icon at the right end of the top bar.

There is no "forgot password" feature yet.

## Everyone: navigation, search and theme

- **Sidebar** (left): the pages for your role. On phones and tablets (narrower than 1024 px) it is hidden; open it with the menu button at the left of the top bar. Some entries show a count: open incidents under **Incidents** and **My cases**, and new (Reported) incidents under **Triage**.
- **Search** (top bar): type text and press Enter. Press **Ctrl+K** (or **Cmd+K** on a Mac) anywhere to jump into the search box. Staff land on the incident list filtered by that text; reporters land on **My cases** filtered by that text. The search matches the incident number (with or without `#`), title, reporter name, assignee name and incident type.
- **Theme**: the sun/moon button in the top bar switches between dark (default) and light. The choice is remembered in your browser.
- **Notifications**: results of your actions appear as short messages (toasts) at the screen edge and disappear after a few seconds.
- Lists refresh themselves about every 20 seconds, and again when you return to the browser tab, so you normally do not need to reload.

## As a User (reporter)

### Report an incident

Open **Report incident** in the sidebar, or use the button on the overview page. The report has four steps; **Back** and **Next** move between them, and nothing is sent until the last step.

1. **What happened?** Pick the kind of incident: phishing, malware, ransomware, data breach, unauthorized access, DDoS, social engineering or other. Each card has a one-line description. If unsure, choose **Other**.
2. **How serious is it?** Pick low, medium, high or critical. A risk score slider (0 to 100) is pre-filled from your choice (20, 45, 70 or 90). Move it if the pre-filled value does not fit. It is your own estimate; the security team can see it but it does not change anything by itself.
3. **Tell us more.** Give a short title (up to 200 characters) and describe what you saw (up to 2000 characters): when it happened, on which device, what you clicked or noticed. Optionally add evidence: up to 3 files, 10 MB each, for example screenshots. Empty files and files that are too large are rejected with a message.
4. **Review and send.** Check the summary and select **Send report**.

After sending you see "Case #N is open" with a **Track this case** button. If the report was saved but a file could not be uploaded, the page names the files; you can add them again from the case page.

### Track your cases

- **Overview** shows your number of reports, how many are open and resolved, your three newest open cases, and a **Latest updates** feed (status changes and assignments by the security team).
- **My cases** lists every report, newest first. Use the chips to show **All**, **Open** or **Resolved**. Typing in the top-bar search filters this list; **Clear search** removes the filter.
- Open a case to see:
  - a progress bar through the seven statuses (you can see it but not change it),
  - your description,
  - **Notes** written by the security team about your case (you can read them, you cannot write notes),
  - **Evidence**: files attached to the case. You can drag files in or choose them, up to 10 MB each, and download any file, with its SHA-256 fingerprint shown,
  - the incident details and a **Timeline** of everything that happened (reported, status changes, assignment, notes, uploads).

You can only see your own cases.

### Stay safe

**Stay safe** in the sidebar has short, practical tips for each type of incident. Types you have reported before are shown first with a "You reported this" mark.

## As an Analyst

Analysts work incidents but do not assign them or delete them.

### Dashboard

The dashboard summarises incidents for the selected period. Everything below the filter bar follows the filters.

- **Filters:**
  - *Date range*: last 7 days, last 30 days (default), last 90 days or all time.
  - *Type*: one incident type or all.
  - *Severity*, *Status* (Open, Reported, Assigned, In progress, Solved) and *Assignment* (Anyone, Assigned to me, Unassigned): select a chip; select it again to clear it.
  - **Clear filters** resets everything except the date range.
- **KPI cards:** Open, Critical open, Unassigned open, Assigned to me (admins see Resolved instead) and Total reported. Each card applies the matching filter when clicked.
- **Charts:** incidents reported per day, stacked by severity; open incidents by status; incidents by type. Click a coloured segment of a day bar to filter by that severity, or a bar in the status and type charts to filter by that status or type; click again to clear. Hover for exact numbers.
- **Incidents** table and **Recent activity** (the latest 10 audit entries across all incidents).

The filters are stored in the page address, so you can bookmark or share a filtered view.

### Incidents list

**Incidents** lists every incident, 15 per page. Click a column heading to sort. Search by text, filter by type, reporting time (last 24 hours, 7 days, 30 days), assignment, severity and status. The line under the filters shows how many incidents match. **Clear filters** resets them. Staff can also use **Report incident** to open a quick form and report something themselves.

### Work an incident

Open an incident from any list. The page has these parts:

- **Status**: seven steps. Click a step to set that status, or use the quick buttons: **Investigate**, **Contain**, **Resolve**, **Close** (only the buttons that make sense for the current status are shown), and **Reopen** for resolved or closed incidents. Every change is recorded in the timeline.
- **Description** written by the reporter.
- **Notes**: type in *Add a note* (up to 2000 characters) and select **Add note**. Notes are visible to staff and to the person who reported the incident, so write them with that in mind.
- **Evidence**: drag files onto the drop area or select **Choose files** (10 MB each). Select **Download** to get a file; its SHA-256 hash is shown so you can verify it later.
- **Details** (type, severity, risk, reporter, assignee, reported time) and the **Timeline** of audit entries.

You cannot assign an incident as an analyst; ask an admin. See [Assignment](#assign-an-incident-admin).

### Team

**Team** shows a card per analyst and admin with their open incidents and workload. Select a person to see their incidents.

### Alerts

While you are signed in as staff, a message appears when someone else reports a new incident. A new critical incident also shows a red banner at the top with an **Open** link, until you dismiss it.

## As an Admin

Admins can do everything an analyst can. The extra tools are below.

### Command center

Your home page. It shows:

- **SLA breaches**: open incidents past their deadline (see [SLA](#sla)). The card shows the policy next to the number.
- **Unassigned open**: incidents waiting for an owner. Click to open the triage board.
- **Open total** and **Staff** counts.
- **Open incidents per staff member**: a bar chart with a line at 4 open incidents, which is the point where someone is shown as overloaded.
- **Incidents per day, last 14 days**: all incidents and critical ones.
- **SLA watchlist**: the 8 open incidents closest to (or furthest past) their deadline, with a progress bar and either "Overdue by ..." or "... left".
- **Team performance**: assigned, open, resolved, resolution rate and a load flag (**Idle** at 0 open, **Overloaded** at 4 or more open) for each staff member. Click a column heading to sort.

### Assign an incident (admin)

On an incident page, use **Assignment** and pick a person from the list; the number next to each name is how many open incidents they already have. Choose **Unassigned** to remove the assignee. Only analysts and admins appear in the list.

Be aware of the side effects:

- Assigning sets the status to **Under investigation**.
- Unassigning an incident that is under investigation puts it back to **Reported**. In other statuses only the assignee is removed.
- Assigning an incident that is already resolved or closed also reopens it as Under investigation.

### Triage board

**Triage** shows one column per status, from Reported to Resolved. **Closed** is hidden until you tick **Show closed**. Cards are sorted by severity, then risk score, and show the title, risk, assignee and the SLA time left (or "SLA breached ... ago").

With the mouse:

- Drag a card to another column to change its status.
- Drag a card onto a person in the **Staff** strip at the top to assign it. Only open incidents can be assigned this way, and the strip shows how many open incidents each person has.

With the keyboard or on a touch screen:

1. Tab to the **Actions for incident N** button on a card (the three-dot button) and press Enter.
2. In the dialog, choose a status under **Move to** and select **Move**; or choose a person under **Assign to** and select **Assign**; or select **Unassign**.
3. Press Escape to close the dialog without changes.

If the server rejects a change, the card jumps back and an error message explains why.

### Users (admin)

**Users** lists every account. Search by name or email, sort by clicking a heading, and change a role with the dropdown in the last column. Changing someone to **Admin** asks for confirmation. You cannot change your own role. The change applies on the server immediately; the other person sees the new menu the next time they sign in.

### Delete an incident

Admins see a **Delete** button on the incident page. After confirmation the incident is removed together with its notes, evidence files and audit entries. This cannot be undone. A single "Incident deleted" entry stays in the recent activity log.

## Status, severity and SLA explained

### Statuses

| Status | Meaning |
|---|---|
| Reported | Submitted, nobody has looked at it yet |
| Triaged | Looked at and prioritised |
| Assigned | Handed to someone, work not started (set by hand) |
| Under investigation | Being worked on. Assigning an incident sets this status |
| Contained | The threat is stopped from spreading |
| Resolved | Fixed |
| Closed | Finished and archived |

"Open" means anything that is not Resolved or Closed. The filter groups are: Reported, Assigned, In progress (Triaged, Under investigation, Contained) and Solved (Resolved, Closed).

### Severity

Critical, High, Medium and Low are chosen by the reporter and can be seen on every list as a label with an icon. The 0 to 100 risk score is also entered by the reporter; bars show it as Low (below 25), Medium (25 to 49), High (50 to 74) or Critical (75 and above).

### SLA

The SLA is the time the team aims to resolve an incident, counted from the moment it was reported:

| Severity | Target |
|---|---|
| Critical | 4 hours |
| High | 24 hours |
| Medium | 3 days (72 hours) |
| Low | 7 days (168 hours) |

An open incident whose target time has passed is **breached**. The time left is calculated in your browser and updates every minute. Resolving or closing an incident stops it being counted. The SLA is an indicator only: nothing is escalated automatically.

## FAQ and troubleshooting

**I cannot see a page that a colleague told me about.**
Pages depend on your role. Reporters only see the portal; analysts see the dashboard, incidents and team; admins also see the command center, triage and users.

**I was promoted (or demoted) but my menu did not change.**
The server applies the new role at once, but the menu is based on the role from when you signed in. Sign out and sign in again.

**"Your session has expired. Please sign in again."**
Your 24-hour session ended. Sign in again; you return to the page you were on.

**"Cannot reach the server."**
The browser could not get an answer. Check your internet connection. If you run the application yourself, make sure the backend is running and `BACKEND_URL` points to it.

**"Invalid email or password."**
Check both. Email addresses are matched exactly as registered. There is no password reset in the application.

**A new incident does not show up.**
Lists refresh about every 20 seconds and when the tab regains focus. Reload the page if it still does not appear. Reporters only see their own incidents.

**My file was not uploaded.**
Each file can be at most 10 MB and must not be empty. In the report wizard the limit is 3 files; you can add more later on the case page. If the upload fails because of a network problem, try again from the case page.

**I cannot assign an incident.**
Only admins can assign. Analysts can change the status and add notes and evidence.

**I cannot change my own role.**
The server does not allow changing your own role. Ask another admin.

**I cannot open an incident that exists.**
You get "Incident not found" if it was deleted or if it belongs to another reporter and you are a User.

**The page looks wrong on my phone.**
The layout works from about 375 px wide. Use the menu button to open the sidebar, and scroll tables and the triage board sideways.
