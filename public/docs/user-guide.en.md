# User Guide

## Complete Guide to Using the EarthEnable Mobile App

This comprehensive guide covers all features and capabilities of the EarthEnable field operations mobile app.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Signing In](#signing-in)
3. [Understanding the Dashboard](#understanding-the-dashboard)
4. [Viewing and Managing Tasks](#viewing-and-managing-tasks)
5. [Completing Tasks](#completing-tasks)
6. [Accessing FormYoula Surveys](#accessing-formyoula-surveys)
7. [Offline Mode & Data Sync](#offline-mode--data-sync)
8. [Changing Language](#changing-language)
9. [Reporting Issues](#reporting-issues)
10. [Settings & Account Management](#settings--account-management)

---

## Getting Started

### What is the EarthEnable App?

The EarthEnable mobile app is an **offline-first field operations tool** that allows staff across Rwanda, Uganda, and Kenya to manage their tasks, complete surveys, and track progress—even without an internet connection.

### Key Features:

- ✅ **Offline task management** - Work anywhere, anytime
- ✅ **Automatic sync** - Data syncs when connected
- ✅ **Real-time progress tracking** - Monitor completion status
- ✅ **FormYoula integration** - Access surveys directly
- ✅ **Multilingual** - English and Kinyarwanda support
- ✅ **Secure authentication** - Google Sign-In with company email

---

## Signing In

### First Time Sign In

1. Open the **EarthEnable** app
2. You'll see the **sign-in screen** with the EarthEnable logo
3. Tap the **"Sign in with Google"** button

![Sign In Screen](/images/app-screenshots/sign-in.png)

4. **Select your account:**
   - Choose your `@earthenable.org` email address
   - If you have multiple Google accounts, make sure to select the correct work account
5. **Grant permissions** when prompted:
   - Allow the app to access your account information
   - These permissions are required for authentication

> **Important:** Only earthenable.org email addresses are authorized. Personal Gmail accounts will not work.

### Sign In Troubleshooting

**"Sign in failed" error:**

- Verify you're using your earthenable.org email
- Check your internet connection
- Try signing out of all Google accounts and signing in again

**"Account not authorized" error:**

- Your account may not be activated yet
- Contact your manager to ensure your account has been set up
- Email support@earthenable.org if the issue persists

---

## Understanding the Dashboard

After signing in, you'll land on the **Dashboard** - your central hub for task overview and quick actions.

![Dashboard Overview](/images/app-screenshots/dashboard-overview.png)

### Dashboard Components:

#### 1. **Header Section**

- **Greeting:** "Hello, [Your Name]"
- **Last sync time:** Shows when data was last synchronized
- **Sync status indicator:** Green (connected), Orange (syncing), Red (offline)

#### 2. **Task Statistics Cards**

Four cards show your task breakdown:

- **All Tasks:** Total number of tasks assigned to you
- **Not Started:** Tasks you haven't begun
- **In Progress:** Tasks currently being worked on
- **Completed:** Tasks you've finished

![Task Statistics](/images/app-screenshots/task-stats.png)

Each card shows:

- **Count:** Number of tasks in that status
- **Percentage:** Visual progress bar
- **Tap to filter:** Tapping a card filters the task list by that status

#### 3. **Quick Actions**

- **View All Tasks:** Jump to the complete task list
- **Sync Now:** Manually trigger a sync
- **Report Issue:** Access the issue reporting feature

---

## Viewing and Managing Tasks

Navigate to the **Tasks** tab (list icon) in the bottom navigation to see all your assigned tasks.

![Task List](/images/app-screenshots/task-list.png)

### Task List Features:

#### **Filter Tasks**

At the top of the screen, you'll see filter chips:

- **All** - Show all tasks
- **Not Started** - Only tasks you haven't begun
- **In Progress** - Tasks currently being worked on
- **Completed** - Finished tasks
- **Pending** - Tasks awaiting review

Tap any filter chip to show only tasks in that status. The active filter is highlighted in orange.

![Task Filters](/images/app-screenshots/task-filters.png)

#### **Task Cards**

Each task is displayed as a card showing:

- **Task title:** Brief description of the task
- **Status badge:** Color-coded status indicator
  - 🔵 Blue: Not Started
  - 🟠 Orange: In Progress
  - 🟢 Green: Completed
  - 🟣 Purple: Pending
- **Due date:** When the task should be completed
- **Location:** City/region for the task
- **Opportunity details:** Related customer/project information

#### **Task Actions**

Tap any task card to:

- View full task details
- Update task status
- Access related surveys
- See customer information

---

## Completing Tasks

### Opening Task Details

1. Tap on a **task card** from the task list
2. The **Task Detail Modal** opens, showing:
   - Full task description
   - Current status
   - Opportunity information (customer name, type, stage)
   - Related FormYoula surveys
   - Task history/notes

![Task Detail Screen](/images/app-screenshots/task-detail.png)

### Updating Task Status

To update a task's status:

1. In the Task Detail Modal, find the **"Update Status"** section
2. Tap the **status dropdown** to see available options:
   - **Not Started** → First status when task is assigned
   - **In Progress** → When you begin working on the task
   - **Completed** → When you finish the task
   - **Pending** → Awaiting review or approval
3. Select the new status
4. Tap the **"Update Status"** button to save

![Update Task Status](/images/app-screenshots/update-status.png)

### Status Update Success

After updating:

- You'll see a **success message** showing the status change
- The task card immediately reflects the new status
- Changes are saved locally first (works offline!)
- When online, changes sync automatically to the server

> **Offline Note:** You can update task status even without internet. Changes are saved locally and will sync automatically when connection is restored.

---

## Accessing FormYoula Surveys

Many tasks require completing quality assurance surveys through FormYoula.

### Opening a Survey

1. Open the **task detail** for the task
2. Scroll to the **"Quality Assurance Surveys"** section
3. You'll see a list of related surveys (if any)
4. Tap the **"Open Survey"** button next to the survey you need to complete

![FormYoula Survey Button](/images/app-screenshots/form youla-button.png)

### What Happens Next

- The app will open **FormYoula** (external survey app)
- You may be redirected to the Play Store to install FormYoula if not already installed
- Complete the survey in the FormYoula app
- Return to EarthEnable when finished

### Survey Types

Different task types may have different surveys:

- **Welcome Call surveys**
- **Final Evaluation surveys**
- **Quality Check surveys**
- **Customer Feedback surveys**

The survey displayed depends on:

- Your assigned task type
- The country you're working in (RW, KE, ZM, IN)
- The customer's project stage

---

## Offline Mode & Data Sync

The EarthEnable app is designed to work **offline-first**, meaning you can use it anywhere, even without internet.

### How Offline Mode Works

**When you're offline:**

- ✅ View all your tasks
- ✅ Filter and search tasks
- ✅ Update task status
- ✅ View customer information
- ✅ All changes are saved locally on your device

**What requires internet:**

- ❌ Initial sign-in
- ❌ First data sync after install
- ❌ Downloading new tasks assigned to you
- ❌ Uploading task status changes to the server
- ❌ Opening FormYoula surveys (requires redirect)

![Offline Indicator](/images/app-screenshots/offline-mode.png)

### Automatic Synchronization

The app automatically syncs data in the background:

- **Every 5 minutes** when connected to internet
- **Immediately** when you update a task status
- **On app launch** (initial sync)
- **When connection is restored** after being offline

### Sync Status Indicators

Look for these sync indicators in the Dashboard:

- 🟢 **Green:** Connected and synced
- 🟠 **Orange:** Currently syncing data
- 🔴 **Red:** Offline (no internet connection)
- ⏱️ **Last synced:** Time stamp showing when data was last updated

### Manual Sync

To manually trigger a sync:

1. Go to the **Dashboard**
2. Look for the **"Sync Now"** button
3. Tap to start immediate synchronization
4. Wait for the sync to complete (usually 5-30 seconds)

> **Best Practice:** Always sync before going to an area with poor internet coverage, and sync again when you return to a good connection.

---

## Changing Language

The app supports **English** and **Kinyarwanda** (Ikinyarwanda).

### Switching Languages

1. Go to **Settings** (gear icon in bottom navigation)
2. Find the **"Language"** section
3. Tap **"Select Language"**
4. Choose between:
   - **English** (Icyongereza)
   - **Kinyarwanda** (Ikinyarwanda)
5. The app will immediately update to show the selected language

![Language Settings](/images/app-screenshots/language-settings.png)

### What Changes

When you change language:

- All app interface text translates
- Task statuses translate
- Button labels translate
- Navigation items translate
- Settings menu translates

**What doesn't change:**

- Task titles and descriptions (from server)
- Customer names
- Your name and email

---

## Reporting Issues

Found a bug or have feedback? Use the built-in issue reporting feature.

### How to Report an Issue

1. Go to **Settings** → **Help & Support**
2. Tap **"Report an Issue"**
3. The **Issue Report Form** opens

![Report Issue Form](/images/app-screenshots/report-issue.png)

4. Fill in the form:
   - **Issue Description (Required):** Describe the problem clearly
   - **Additional Context (Optional):** Any extra details that might help

5. Tap **"Submit Report"**

### What Gets Sent

Your report includes:

- Your description
- Device information (Android version, device model)
- App version
- Recent activity logs (last 10 actions)
- Your account info (name, email)

This helps the support team diagnose and fix issues faster.

### Offline Reporting

- **If you're offline:** Your report is queued and will be sent automatically when connection is restored
- **If online:** Report is sent immediately
- You'll see a confirmation message either way

### Response Time

- Reports are reviewed by the technical team
- Expect a response within 2-3 business days
- Critical bugs are prioritized

---

## Settings & Account Management

Access app settings by tapping the **gear icon** in the bottom navigation.

![Settings Menu](/images/app-screenshots/settings-menu.png)

### Settings Sections

#### **1. General**

- App version display
- Build information

#### **2. Language**

- Switch between English and Kinyarwanda
- Language preference is saved

#### **3. Account**

- View your profile information:
  - Name
  - Email address
  - User role
- **Sign Out** button

#### **4. Help & Support**

- Report an Issue
- FAQ link
- Support contact information

#### **5. Legal**

- **Terms of Service** - App usage terms
- **Privacy Policy** - How your data is handled

### Signing Out

To sign out of the app:

1. Go to **Settings**
2. Scroll to the **Account** section
3. Tap **"Sign Out"**
4. Confirm when prompted

> **Warning:** Signing out will:
>
> - Remove your authentication token
> - Keep local data on the device (not deleted)
> - Require you to sign in again to access tasks
> - Sync any pending changes before signing out (if online)

### Viewing Your Profile

In **Settings → Account**, you can view:

- **Your name:** As registered in the system
- **Email address:** Your earthenable.org email
- **Role:** Your user role (QA Agent, Manager, Admin)
- **Account status:** Active/Inactive

---

## Tips & Best Practices

### 📱 **Battery Management**

- Background sync uses minimal battery
- Close the app when not in use for extended periods
- Sync manually before going to low-battery situations

### 🌐 **Internet Usage**

- Initial sync (first time): ~50-100 MB data
- Regular syncs: ~1-5 MB per sync
- Use Wi-Fi for initial setup to save mobile data

### 🔄 **Sync Strategy**

- Always sync before leaving an area with good internet
- Sync after completing several tasks
- Enable auto-sync in device settings

### 📊 **Task Management**

- Update task status promptly to keep team informed
- Check dashboard regularly for new assignments
- Filter tasks by status to focus on priorities

### 🔐 **Security**

- Don't share your earthenable.org account
- Sign out if sharing device with others
- Keep your device locked with PIN/password

### 📱 **Device Care**

- Keep at least 500 MB free storage
- Update the app when new versions are available
- Clear app cache if experiencing issues (Settings → Apps → EarthEnable → Storage)

---

## Keyboard Shortcuts & Gestures

### Common Gestures

- **Swipe down** on task list to refresh
- **Tap and hold** on a task for quick actions (future feature)
- **Pull to refresh** on dashboard to trigger sync

### Navigation

- **Back button** returns to previous screen
- **Bottom navigation** always visible for quick access
- **Status bar notifications** for sync completion

---

## Frequently Used Workflows

### Workflow 1: Daily Task Review

1. Open app → Dashboard
2. Check task statistics
3. Tap "View All Tasks"
4. Filter by "Not Started"
5. Review new assignments
6. Update status as you work

### Workflow 2: Completing a Field Visit

1. Travel to site (offline okay)
2. Open task related to visit
3. Update status to "In Progress"
4. Complete FormYoula survey
5. Update status to "Completed"
6. When back online, sync automatically happens

### Workflow 3: End of Day Sync

1. Return to office/home with Wi-Fi
2. Open app → Dashboard
3. Wait for automatic sync (or tap "Sync Now")
4. Verify all tasks updated
5. Close app

---

## Next Steps

- **[Installation Guide](/app-docs/installation)** - Install the app
- **[FAQ](/app-docs/faq)** - Common questions and troubleshooting

---

## Need Help?

**Technical Support:** support@earthenable.org
**Your Manager or IT Support:** To verify if tasks exist in Salesforce or for sync issues
**This Guide:** Bookmark for quick reference

---

**Last Updated:** November 2025
**App Version:** 1.0.0
