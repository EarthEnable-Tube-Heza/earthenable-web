# Frequently Asked Questions (FAQ)

## Common Questions and Troubleshooting for the EarthEnable Mobile App

This FAQ covers the most common questions and issues you may encounter while using the EarthEnable mobile app.

---

## Table of Contents

1. [Account & Sign-In](#account--sign-in)
2. [Tasks & Task Management](#tasks--task-management)
3. [Offline Mode & Syncing](#offline-mode--syncing)
4. [FormYoula Integration](#formyoula-integration)
5. [Language & Localization](#language--localization)
6. [Performance & Technical Issues](#performance--technical-issues)
7. [Data & Privacy](#data--privacy)
8. [App Updates](#app-updates)
9. [Device & Compatibility](#device--compatibility)
10. [Getting Help](#getting-help)

---

## Account & Sign-In

### Q: What email address should I use to sign in?

**A:** You must use your **earthenable.org** company email address. Personal Gmail accounts or other email addresses will not work.

Example: `john.doe@earthenable.org`

---

### Q: I'm getting "Sign in failed" error. What should I do?

**A:** Try these steps in order:

1. **Verify your email**: Make sure you're using your `@earthenable.org` email
2. **Check internet connection**: You need internet for the initial sign-in
3. **Sign out of all Google accounts**:
   - Go to your device Settings → Accounts → Google
   - Remove all accounts
   - Sign back into your earthenable.org account
4. **Clear app cache**:
   - Settings → Apps → EarthEnable → Storage → Clear Cache
   - Do NOT clear data unless instructed by support
5. **Restart your device**
6. **Try again**

If the issue persists, contact support@earthenable.org

---

### Q: I signed in successfully, but I'm getting "Account not authorized" error

**A:** This means your account exists in Google but hasn't been activated in the EarthEnable system yet.

**Solutions:**

- Contact your manager to ensure your account has been set up in the system
- Your manager needs to activate your account in the admin dashboard
- Wait 10-15 minutes after activation, then try signing in again
- If still not working after 24 hours, email support@earthenable.org

---

### Q: Can I use the app on multiple devices with the same account?

**A:** Yes! You can sign in on multiple devices (e.g., your work phone and tablet) using the same earthenable.org email. Your tasks will sync across all devices.

**Important:**

- Make sure to sync regularly on each device
- Changes made on one device will appear on others after syncing
- If you see different data on different devices, manually trigger a sync

---

### Q: How do I sign out?

**A:** To sign out:

1. Open the app
2. Go to **Settings** (gear icon at bottom)
3. Scroll to **Account** section
4. Tap **"Sign Out"**
5. Confirm when prompted

**Warning:** Before signing out, make sure all your task updates have been synced to avoid losing changes.

---

## Tasks & Task Management

### Q: I don't see any tasks. What's wrong?

**A:** Several possible reasons:

1. **No tasks assigned yet**: Your manager may not have assigned tasks to you
   - Contact your manager to check task assignments

2. **Sync hasn't completed**:
   - Go to Dashboard
   - Check "Last synced" time
   - Tap "Sync Now" to trigger manual sync
   - Wait for sync to complete (green indicator)

3. **Network issues during initial sync**:
   - Make sure you have a stable internet connection
   - Try syncing again
   - Check if you can access other apps (browser, WhatsApp)

4. **Account not fully activated**:
   - Your account may be authenticated but not fully set up in the system
   - Contact your manager

---

### Q: How do I update a task's status?

**A:** Follow these steps:

1. Go to **Tasks** tab (list icon at bottom)
2. Tap on the **task card** you want to update
3. The Task Detail Modal opens
4. Find the **"Update Status"** section
5. Tap the **status dropdown**
6. Select new status (Not Started → In Progress → Completed → Pending)
7. Tap **"Update Status"** button
8. You'll see a success message

**Note:** You can update task status even when offline. Changes will sync automatically when you're back online.

---

### Q: What's the difference between "Completed" and "Pending" status?

**A:**

- **Completed**: You've finished the task entirely. No further action needed from you.
- **Pending**: The task is done from your side but awaiting review/approval from your manager or another team member.

Use **Pending** when:

- You've completed fieldwork but waiting for manager verification
- You've submitted a survey but waiting for quality check
- The task depends on another person's action

Use **Completed** when:

- Everything is 100% done
- No further action needed
- Task is fully closed

---

### Q: I accidentally marked a task as Completed. Can I change it back?

**A:** Yes! You can change task status at any time:

1. Open the task
2. Change the status dropdown back to "In Progress" (or appropriate status)
3. Tap "Update Status"
4. The change will sync to the server

**Note:** Your manager can see the task history, so don't worry about making mistakes.

---

### Q: Can I filter tasks by location or due date?

**A:** Currently, the app supports filtering by **status only** (All, Not Started, In Progress, Completed, Pending).

**Workaround for finding specific tasks:**

- Use the task cards which display location and due date
- Scroll through your filtered list
- Tasks are sorted by creation date (newest first)

**Coming soon:** Search and advanced filtering features are planned for a future release.

---

### Q: How many tasks can I see at once?

**A:** The app loads all tasks assigned to you - there's no limit. However:

- Tasks are loaded from local database (very fast)
- All your assigned tasks sync during each sync operation
- Performance remains good even with 100+ tasks

---

## Offline Mode & Syncing

### Q: What can I do when I'm offline?

**A:** When offline, you can:

✅ **View all tasks** - Previously synced tasks are available
✅ **Filter tasks** - By status (All, Not Started, etc.)
✅ **Update task status** - Changes saved locally
✅ **View task details** - All customer information
✅ **View dashboard statistics** - Based on local data
✅ **Navigate the app** - All screens accessible

❌ **Cannot do:**

- Download new tasks assigned after going offline
- Open FormYoula surveys (requires internet redirect)
- Upload task status changes to server (queued until online)
- Sign in for the first time

---

### Q: How often does the app sync data?

**A:** The app syncs automatically in these situations:

- **Every 5 minutes** when connected to internet (background sync)
- **On app launch** (initial sync when you open the app)
- **Immediately after task status update** (if online)
- **When connection is restored** after being offline

You can also **manually trigger sync** anytime by:

1. Going to Dashboard
2. Tapping the **"Sync Now"** button

---

### Q: How do I know if my changes have synced?

**A:** Check the **sync indicator** on the Dashboard:

- 🟢 **Green + "Synced X minutes ago"** = All changes uploaded successfully
- 🟠 **Orange + "Syncing..."** = Currently uploading changes
- 🔴 **Red + "Offline"** = No internet, changes waiting to upload

**Best Practice:**

- Always check sync status before closing the app after making changes
- If you see "Offline", your changes are saved locally but not yet on the server
- When back online, wait for green "Synced" indicator

---

### Q: What happens if I update a task offline and my manager updates it online at the same time?

**A:** The app uses **"server wins"** conflict resolution:

- Task data (title, description, customer info) is **read-only** from your app
- Only task **status** can be updated by you
- When both you and your manager update status simultaneously:
  - Your change is saved locally
  - When you sync, if the server has a newer change, **server change wins**
  - You'll see the server's status, not yours

**Why?** This prevents data conflicts and ensures your manager's decisions take priority.

---

### Q: I've been offline for 3 days. Will my changes still sync?

**A:** Yes! Your changes are stored locally and will sync whenever you connect to internet, regardless of how long you've been offline.

**However:**

- New tasks assigned to you during those 3 days won't appear until you sync
- Your manager can't see your status updates until you sync
- Very old pending changes (30+ days) may be reviewed by support for data integrity

**Best Practice:** Sync at least once every few days when possible to keep data current.

---

### Q: Sync is taking a very long time. What should I do?

**A:** If sync takes more than 2 minutes:

1. **Check your internet speed**:
   - Try loading a website in your browser
   - Speed test: Fast.com or Speedtest.net
   - Minimum recommended: 1 Mbps download

2. **Switch networks**:
   - If on mobile data, try Wi-Fi
   - If on Wi-Fi, try mobile data
   - Sometimes one works better than the other

3. **Cancel and retry**:
   - Close the app completely (force stop)
   - Reopen the app
   - Sync will resume automatically

4. **Clear app cache** (if still slow):
   - Settings → Apps → EarthEnable → Storage → Clear Cache
   - Reopen app and try syncing

5. **Contact support** if sync fails repeatedly (5+ times)

---

## FormYoula Integration

### Q: What is FormYoula and why do I need it?

**A:** FormYoula is a separate mobile app used for **quality assurance surveys** at EarthEnable.

**Why separate app?**

- FormYoula is specialized for complex surveys with photos, GPS, signatures
- EarthEnable app focuses on task management
- Integration allows seamless workflow between both apps

**You need FormYoula to:**

- Complete Welcome Call surveys
- Submit Final Evaluation forms
- Perform quality checks
- Capture customer feedback

---

### Q: How do I install FormYoula?

**A:** FormYoula is installed from the Google Play Store:

1. When you tap **"Open Survey"** in a task, you'll be redirected to Play Store
2. If not installed, tap **"Install"** on the FormYoula app page
3. Wait for installation to complete
4. Return to EarthEnable app
5. Tap **"Open Survey"** again

**Alternative:**

- Search "FormYoula" in Play Store manually
- Install before starting field work
- Then surveys will open directly

---

### Q: When I tap "Open Survey", nothing happens

**A:** Troubleshooting steps:

1. **Check if FormYoula is installed**:
   - Look for FormYoula icon in your app drawer
   - If not found, install from Play Store

2. **Check internet connection**:
   - Opening surveys requires internet
   - Survey links are fetched from the server

3. **Check if task has surveys**:
   - Not all tasks have associated surveys
   - If the "Quality Assurance Surveys" section is empty, there's no survey for this task

4. **Update FormYoula**:
   - Go to Play Store → My apps & games → Updates
   - Update FormYoula if available

5. **Restart both apps**:
   - Close EarthEnable and FormYoula completely
   - Reopen EarthEnable
   - Try again

---

### Q: Do I need to complete the survey before marking a task as Completed?

**A:** It depends on your task requirements:

- **Welcome Call tasks**: Survey completion may be optional (check with manager)
- **Final Evaluation tasks**: Survey is **mandatory** before marking Complete
- **Quality Check tasks**: Survey is **mandatory**

**Best Practice:**

- Always complete the survey if the button is present
- Your manager reviews survey submissions
- Mark task as "Pending" if survey is submitted but awaiting approval
- Mark as "Completed" only after survey AND all other requirements are met

---

### Q: Can I complete surveys offline?

**A:** FormYoula has its own offline capabilities, but:

- You **need internet** to open the survey from EarthEnable app (initial redirect)
- Once FormYoula opens the survey, you may be able to complete it offline (depends on FormYoula settings)
- FormYoula handles its own data submission

**For FormYoula-specific questions:**

- Check FormYoula's own documentation
- Contact FormYoula support
- Ask your manager about FormYoula workflows

---

## Language & Localization

### Q: How do I change the app language?

**A:** To switch between English and Kinyarwanda:

1. Open the app
2. Go to **Settings** (gear icon at bottom)
3. Find the **"Language"** section
4. Tap **"Select Language"**
5. Choose:
   - **English** (Icyongereza)
   - **Kinyarwanda** (Ikinyarwanda)
6. The app will immediately switch to the selected language

**Note:** Your language preference is saved and persists across app restarts.

---

### Q: Why are some parts still in English even after changing to Kinyarwanda?

**A:** Some content cannot be translated:

**What DOES translate:**

- All app interface text (buttons, labels, menus)
- Task statuses (Not Started, In Progress, etc.)
- Navigation items
- Settings options
- Error messages

**What DOES NOT translate:**

- Task titles and descriptions (from Salesforce)
- Customer names and company names
- Your name and email address
- Opportunity information (from Salesforce)

This is because task data comes from external systems (Salesforce) that are in English.

---

### Q: Can I request the app in other languages (Swahili, French)?

**A:** Currently, the app supports:

- English (Icyongereza)
- Kinyarwanda (Ikinyarwanda)

**Future language support** is possible based on demand. If you need another language:

- Contact your manager with the language request
- Provide business justification (number of staff who need it)
- The team will evaluate for future releases

---

## Performance & Technical Issues

### Q: The app is running slowly. How can I fix it?

**A:** Try these solutions in order:

**1. Close background apps:**

- Open Recent Apps (square button)
- Swipe away all other apps
- Reopen EarthEnable

**2. Clear app cache:**

- Settings → Apps → EarthEnable → Storage → Clear Cache
- Do NOT clear data (you'll lose local tasks)

**3. Restart your device:**

- Hold power button
- Tap "Restart"
- Wait for device to reboot
- Open app again

**4. Check device storage:**

- Settings → Storage
- Ensure at least **500 MB free space**
- Delete unused apps or old photos if needed

**5. Update the app:**

- Check for app updates in Managed Google Play
- Install any available updates

**6. Reinstall (last resort):**

- Only if support team recommends
- Uninstall → Reinstall from Managed Google Play
- Sign in again
- Wait for full sync

---

### Q: The app crashed. What should I do?

**A:** If the app closes unexpectedly:

1. **Reopen the app** - It usually restarts normally
2. **Check if data is safe**:
   - Go to Tasks tab
   - Verify your recent task updates are still there
   - If missing, check sync status
3. **If crashes repeatedly** (3+ times):
   - Restart your device
   - Clear app cache
   - Report the issue via Settings → Help & Support → Report an Issue

**When reporting crashes, include:**

- What you were doing when it crashed
- How many times it happened
- Device model and Android version

---

### Q: I'm getting "Network request failed" errors

**A:** This error means the app can't reach the server:

**Quick checks:**

1. **Test internet connection**:
   - Open Chrome browser
   - Visit google.com
   - If it doesn't load, your internet is down

2. **Switch networks**:
   - Turn off Wi-Fi, use mobile data (or vice versa)
   - Try syncing again

3. **Check if server is down**:
   - Ask colleagues if their app is working
   - If everyone has the issue, server may be down
   - Wait 10-15 minutes and try again

4. **Check firewall/VPN**:
   - If using company VPN, try disconnecting
   - Some firewalls block the API server

5. **Update app** (if available):
   - New versions may fix connectivity issues

**If issue persists after 1 hour, contact support.**

---

### Q: Battery drain seems high. Is the app using too much power?

**A:** The app is designed to be battery-efficient, but background sync does use some power.

**To minimize battery usage:**

1. **Use Wi-Fi when possible** (mobile data uses more battery)
2. **Close the app when not in use** (don't just minimize)
3. **Disable battery optimization** (if sync isn't working in background):
   - Settings → Apps → EarthEnable → Battery → Unrestricted
4. **Reduce sync frequency** (future feature - not yet available)
5. **Keep app updated** (updates include performance improvements)

**Expected battery usage:**

- Active use: ~5-10% per hour
- Background (with auto-sync): ~1-2% per hour

If significantly higher, report the issue.

---

## Data & Privacy

### Q: Is my data secure?

**A:** Yes. EarthEnable takes data security seriously:

✅ **Encryption:**

- All data transmitted over HTTPS (encrypted in transit)
- Standard SQLite database for local storage (SQLCipher encryption planned for future release)

✅ **Authentication:**

- Google OAuth (industry-standard)
- JWT tokens with 30-day expiry
- Automatic token refresh

✅ **Access Control:**

- You can only see tasks assigned to you
- Role-based permissions (QA Agent, Manager, Admin)
- No access to other users' tasks

✅ **Privacy:**

- We don't sell or share your data
- Data used only for EarthEnable operations
- See full Privacy Policy: https://hub.earthenable.org/privacy-policy

---

### Q: What data does the app collect?

**A:** The app collects:

**Account Data:**

- Name, email, profile picture (from Google)
- User role (QA Agent, Manager, Admin)

**Activity Data:**

- Tasks assigned to you
- Task status updates you make
- Sync timestamps
- App usage logs (crashes, errors)

**Device Data (for issue reporting):**

- Device model (e.g., Samsung Galaxy S21)
- Android version (e.g., Android 13)
- App version

**We DO NOT collect:**

- Your location (GPS) - unless explicitly needed for a feature in the future
- Your contacts or photos
- Data from other apps
- Browsing history

---

### Q: Can I delete my data?

**A:** Yes. To request data deletion:

1. **Contact your manager** or support@earthenable.org
2. **Specify** what you want deleted:
   - Your entire account (removes all data)
   - Specific task records
   - Activity logs
3. **Wait for confirmation** (typically 2-5 business days)

**Note:** If you're an active employee, deleting your account will prevent you from using the app for work.

---

### Q: Who can see my task updates?

**A:**

- **You**: Can see all tasks assigned to you
- **Your Manager**: Can see all tasks assigned to their team (including yours)
- **Admins**: Can see all tasks across all teams
- **Other QA Agents**: **Cannot** see your tasks

**Task history:**

- Managers and admins can see when you updated task status
- Timestamps of all status changes are logged
- This is for accountability and workflow tracking

---

## App Updates

### Q: How do I update the app?

**A:** Updates are delivered in two ways:

**1. Over-the-air (OTA) updates:**

- Small updates (bug fixes, minor changes)
- Download automatically in the background
- App prompts you to restart to apply update
- No need to visit Play Store

**2. Full updates (Google Play):**

- Major new features
- Large changes
- Go to Managed Google Play → My apps & games → Updates
- Tap "Update" next to EarthEnable

**Best Practice:** Always install updates when prompted for the best experience and latest features.

---

### Q: The app is prompting me to update. Is it mandatory?

**A:** It depends on the update type:

**Mandatory updates:**

- Security fixes
- Critical bug fixes
- Breaking changes (old version won't work)
- You **cannot skip** these - app won't work until updated

**Optional updates:**

- New features
- Performance improvements
- UI enhancements
- You **can delay** but should install within 7 days

**How to tell:**

- Mandatory: Red banner with "Update Required" - no dismiss button
- Optional: Orange banner with "Update Available" - can dismiss

---

### Q: I updated the app and now it's not working. What should I do?

**A:** If an update causes issues:

1. **Restart the app** (close completely and reopen)
2. **Restart your device** (power off and on)
3. **Clear app cache** (Settings → Apps → EarthEnable → Storage → Clear Cache)
4. **Check for another update** (sometimes a hotfix is released quickly)
5. **Report the issue** via Settings → Help & Support → Report an Issue

**Include in your report:**

- What's not working
- What you were doing when it broke
- App version (visible in Settings → General)
- Device model

Support will respond within 2-3 business days, often faster for critical issues.

---

## Device & Compatibility

### Q: What Android version do I need?

**A:** **Minimum required:** Android 7.0 (Nougat) or higher (API level 24+, Target SDK 36)

**Recommended:** Android 10 or higher for best performance

**To check your Android version:**

1. Settings → About phone → Android version

**If your Android version is too old:**

- Contact IT for a device upgrade
- Older devices may not receive security updates
- App may not install on very old Android versions (below 7.0)

---

### Q: Does the app work on iOS (iPhone)?

**A:** Not yet. The app is currently **Android-only**.

**iOS support** is planned for a future release. If you need iOS:

- Contact your manager to express interest
- The team will consider based on demand
- For now, Android devices are required for field operations

---

### Q: How much storage space does the app need?

**A:** Storage requirements:

- **Download size**: ~50 MB
- **Installed size**: ~120 MB (including initial data)
- **Recommended free space**: At least **500 MB** to allow for:
  - Future updates
  - Offline data growth (if you have many tasks)
  - App cache

**To free up space:**

- Delete unused apps
- Move photos/videos to Google Photos or PC
- Clear cache for other apps

---

### Q: Can I use the app on a tablet?

**A:** Yes! The app works on Android tablets (Android 8.0+).

**Considerations:**

- Tablet screen sizes are supported
- UI scales appropriately
- All features work the same as on phones
- Use the same earthenable.org account to sign in

---

## Getting Help

### Q: How do I report a bug or issue?

**A:** Use the built-in issue reporting feature:

1. Open the app
2. Go to **Settings** → **Help & Support**
3. Tap **"Report an Issue"**
4. Fill in the form:
   - **Issue Description** (required): Describe the problem clearly
   - **Additional Context** (optional): Any extra details
5. Tap **"Submit Report"**

**Your report automatically includes:**

- Your account info (name, email)
- Device information (model, Android version)
- App version
- Recent activity logs (last 10 actions)

**Response time:**

- Reports reviewed within 2-3 business days
- Critical bugs prioritized
- You'll receive an email response

**Offline reporting:** If offline, your report is queued and sent automatically when connection is restored.

---

### Q: Who do I contact for different types of help?

**A:** Depends on the issue type:

**Technical issues** (app crashes, bugs, errors):

- Use in-app: Settings → Help & Support → Report an Issue
- Or email: **support@earthenable.org**

**Task assignment questions** (no tasks, wrong tasks):

- Contact **your manager**
- They control task assignments in the system

**Account activation** (can't sign in, not authorized):

- Contact **your manager**
- They need to activate your account in the admin dashboard

**Device issues** (can't install, device too old):

- Contact **IT administrator**
- Email: **it@earthenable.org** (if applicable)

**Training and how-to questions** (how do I do X?):

- Check this **FAQ** first
- Read the **User Guide**: https://hub.earthenable.org/app-docs/user-guide
- Ask **your manager** or experienced colleagues

---

### Q: Where can I find the user manual?

**A:** Complete documentation is available at:

🌐 **https://hub.earthenable.org/app-docs**

**Available guides:**

- **Installation Guide**: Step-by-step setup instructions
- **User Guide**: Complete feature documentation with screenshots
- **FAQ**: This document (frequently asked questions)

**Languages:** All guides are available in English and Kinyarwanda.

**No login required** - Docs are publicly accessible for easy reference.

---

### Q: I have a feature request. How do I submit it?

**A:** We welcome feature suggestions!

**How to submit:**

1. Email **support@earthenable.org** with:
   - Feature title (brief description)
   - Why you need it (use case)
   - How often you'd use it
   - Any examples from other apps
2. Or use Settings → Help & Support → Report an Issue (and mention it's a feature request)

**What happens next:**

- Team reviews all requests
- Popular/high-impact features are prioritized
- You may be contacted for clarification
- Feature may appear in future release (no guarantees)

**Current roadmap** (features under consideration):

- Search and advanced filtering for tasks
- Push notifications for new tasks
- In-app chat/messaging
- Photo uploads
- Biometric authentication (fingerprint/face)

---

### Q: Is there a training program for new users?

**A:** Yes! New EarthEnable staff receive:

**1. Onboarding session** (first week):

- Manager walks through app basics
- Practice with test tasks
- Q&A session

**2. Self-paced learning**:

- Read User Guide: https://hub.earthenable.org/app-docs/user-guide
- Watch training videos (if available - check with manager)
- Review FAQ (this document)

**3. Ongoing support**:

- Ask experienced colleagues
- Contact your manager
- Use in-app issue reporting

**Tips for new users:**

- Spend 30 minutes exploring the app before field work
- Practice updating task status with test tasks
- Familiarize yourself with offline mode
- Set up FormYoula before your first field visit

---

## Still Have Questions?

If your question isn't answered here:

📧 **Email**: support@earthenable.org
📱 **In-app**: Settings → Help & Support → Report an Issue
📚 **Documentation**: https://hub.earthenable.org/app-docs
👤 **Manager**: Your direct supervisor

**Response times:**

- Critical issues: Within 24 hours
- General questions: 2-3 business days
- Feature requests: Acknowledged within 1 week

---

**Last Updated:** January 2025
**App Version:** 1.0.0
