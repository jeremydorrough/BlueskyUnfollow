# Bluesky Unfollower Scripts

This project includes two Node.js scripts for cleaning up your Bluesky social graph:

- `Unfollower.js` – Unfollows every account your handle is following and cleans up orphaned follow records.
- `Unfollower for Banned and Deleted Accounts.js` – Directly wipes follow records from your repo, including those linked to banned or deleted accounts that the standard API can't unfollow.

- It also has a .env file whick stores your credentials. Note it may be a hidden file once downloaded (on Mac you press Shift+Command+Period to reveal hidden files in a folder).

---

## 📦 Requirements

Install [Node.js](https://nodejs.org/) if you don’t already have it.

Then install the required packages:

```bash
npm install dotenv @atproto/api
```

---

## 🔐 Setup Your Credentials

1. Create a `.env` file in the project root:

```
BSKYHANDLE=yourhandle.bsky.social
BSKYPASS=yourpassword
```

2. Add `.env` to your `.gitignore` to avoid exposing your credentials:

```bash
echo ".env" >> .gitignore
```

---

## ▶️ How to Run

### macOS / Linux

```bash
node Unfollower.js
# or
node "Unfollower for Banned and Deleted Accounts.js"
```

### Windows (CMD or PowerShell)

```cmd
node Unfollower.js
:: or
node "Unfollower for Banned and Deleted Accounts.js"
```

---

## 🧹 What These Scripts Do

These scripts help you manage your follow list on Bluesky by:

- Unfollowing every user you're currently following.
- Attempting to delete lingering or "orphaned" follow records.
- Removing stale follow records tied to banned, deleted, or inaccessible accounts (which are often missed by the regular API).

This is especially useful for cleaning up corrupted follow graphs or accounts that were followed but no longer exist in the network.

---

## ⚠️ Use at Your Own Risk

These scripts perform **bulk delete operations** on your account's follow graph. Review the code before running and make sure you understand what it does.
