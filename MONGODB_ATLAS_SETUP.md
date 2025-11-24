# MongoDB Atlas Setup Guide

Quick reference for setting up MongoDB Atlas for TeamTalk

## Overview

MongoDB Atlas is a fully managed cloud database service. Free tier is perfect for development and small deployments.

## Setup Steps

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with email and password
4. Verify email address
5. Accept terms and create account

### 2. Create Your First Cluster

1. Click "Create a Deployment"
2. Select **M0 (FREE FOREVER)**
3. Choose your preferred cloud provider:
   - AWS (recommended)
   - Google Cloud
   - Azure
4. Choose nearest region (for lowest latency)
5. Click "Create Deployment"

**Wait for cluster to be ready** (about 3-5 minutes)

### 3. Create Database User

1. When cluster is ready, click on it
2. Go to "Database Access"
3. Click "Add New Database User"
4. Choose "Password" authentication
5. Set username: `teamtalk_user`
6. Set password: **Choose a strong password** (20+ characters)
   - Example: `TeamTalk#Secure2024!@#$%`
7. Click "Add User"

**Save your username and password securely!**

### 4. Set Up Network Access

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. **Option A (Development):** Click "Add My Current IP"
4. **Option B (Production):** Click "Allow access from anywhere" or enter `0.0.0.0/0`
5. Click "Confirm"

**Note:** For production, use specific IP addresses for better security.

### 5. Get Connection String

1. Go back to "Databases"
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Select **Node.js** as driver
5. Copy the connection string

**Example format:**
```
mongodb+srv://teamtalk_user:PASSWORD@cluster0.mongodb.net/teamtalk?retryWrites=true&w=majority
```

### 6. Add to Your Project

1. Replace `PASSWORD` with your actual password
2. For Render: Add as `MONGO_URI` environment variable
3. For local development: Add to `.env` file (not committed to git!)

## Connection String Troubleshooting

### Special Characters in Password

If your password has special characters, URL-encode them:

| Character | URL Code |
|-----------|----------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |

**Example:**
- Password: `Pass@word#123`
- Encoded: `Pass%40word%23123`

### Connection Failed

1. **Check IP is whitelisted:** Network Access → Verify IP
2. **Check password:** Ensure special characters are URL-encoded
3. **Check cluster name:** Verify cluster URL matches
4. **Check database name:** Should match in connection string

## Test Connection Locally

```bash
# Use mongosh (MongoDB shell)
mongosh "mongodb+srv://teamtalk_user:PASSWORD@cluster0.mongodb.net/teamtalk"

# Or test with Node.js
node -e "
const { MongoClient } = require('mongodb');
MongoClient.connect('mongodb+srv://teamtalk_user:PASSWORD@cluster0.mongodb.net/teamtalk')
  .then(() => console.log('✅ Connected!'))
  .catch(e => console.error('❌ Failed:', e.message));
"
```

## Database Collections

TeamTalk automatically creates these collections:

- **users** - User accounts, passwords (bcrypt hashed), status
- **workspaces** - Team workspaces with members
- **channels** - Communication channels in workspaces
- **messages** - Chat messages in channels
- **directmessages** - 1-on-1 and group chat metadata
- **sessions** (optional) - Session management

## Monitoring Your Database

### View Collections

1. Go to Cluster → "Collections"
2. See all your data organized by collection
3. Click collection name to explore documents

### Check Storage Usage

1. Go to Cluster → "Metrics"
2. Monitor "Database Storage"
3. Free tier limit: 512 MB

### View Logs

1. Go to Cluster → "Logs"
2. See connection logs, errors, queries
3. Helpful for debugging connection issues

## Backup & Restore

### Automatic Backups

- Free tier: Backup snapshots every 6 hours
- 7-day retention
- Access via "Backup" section in cluster

### Manual Backup

1. Click cluster name
2. Click "Backup" tab
3. Click "Backup Now"
4. Create snapshot for safekeeping

### Restore from Backup

1. Click "Backup" tab
2. Select snapshot
3. Click "Restore"
4. Choose restore options
5. Confirm and wait for restore

## Upgrading from Free Tier

When your free cluster is no longer sufficient:

1. Click cluster name
2. Click "Tier" → "Edit Tier"
3. Choose paid tier (M2, M5, M10, etc.)
4. Set desired specs
5. Click "Save"
6. Billing starts immediately (pro-rated)

## Pricing Reference

| Tier | Price | Storage | Connections |
|------|-------|---------|-------------|
| M0 | Free | 512 MB | 100 |
| M2 | $9/month | 2 GB | 500 |
| M5 | $57/month | 25 GB | 1000 |
| M10 | $117/month | 100 GB | 1500 |

## Security Best Practices

✅ **Do:**
- Use strong, unique passwords (20+ characters)
- Regularly rotate database user passwords
- IP whitelist production (don't use 0.0.0.0/0 in production)
- Enable VPC for production deployments
- Monitor logs for suspicious activity
- Use separate users for different environments

❌ **Don't:**
- Share connection strings
- Commit connection strings to GitHub
- Use simple passwords
- Allow all IPs in production
- Reuse passwords across services

## Troubleshooting

### "Too many connections"

**Cause:** Connection pool limit reached

**Solution:**
1. Upgrade tier (increases connection limit)
2. Reduce concurrent connections from app
3. Implement connection pooling in app

### "IP not whitelisted"

**Cause:** Connection from IP address not in Network Access

**Solution:**
1. Go to Network Access
2. Click "Add IP Address"
3. Enter current IP or use 0.0.0.0/0

### "Authentication failed"

**Cause:** Wrong username or password

**Solution:**
1. Double-check username and password
2. URL-encode special characters
3. Test credentials in mongosh

### "Connection timeout"

**Cause:** Network connectivity issue or cluster not ready

**Solution:**
1. Wait 5-10 minutes after cluster creation
2. Check internet connection
3. Try pinging MongoDB servers
4. Try from different network if possible

## Quick Reference

**Connection String Template:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://teamtalk_user:MyP@ssw0rd@cluster0.abc123.mongodb.net/teamtalk?retryWrites=true&w=majority
```

**For Render:**
1. Create secret environment variable `MONGO_URI`
2. Paste connection string as value
3. Deploy

---

**MongoDB Atlas Ready!** ✅

Your database is now configured and ready for TeamTalk deployment.
