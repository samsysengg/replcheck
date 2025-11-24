# TeamTalk - Deployment Quick Start

Fast 10-minute deployment guide to get TeamTalk live on Render

## 5-Minute MongoDB Setup

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create free M0 cluster
3. Create user: "teamtalk_user" with strong password
4. Add IP (0.0.0.0/0 or your Render IP)
5. Get connection string: mongodb+srv://teamtalk_user:PASSWORD@cluster.mongodb.net/teamtalk
6. Save connection string
```

## 5-Minute Render Deployment

```
1. Go to https://dashboard.render.com
2. "New +" → "Web Service"
3. Connect GitHub account → Select TeamTalk repo
4. Configure:
   - Name: teamtalk
   - Runtime: Node
   - Build: npm ci && npm run build
   - Start: npm start
5. Add Environment Variables:
   - NODE_ENV: production
   - PORT: 5000
   - MONGO_URI: (paste from MongoDB)
   - JWT_SECRET: (leave blank - auto-generated)
   - SESSION_SECRET: (leave blank - auto-generated)
6. Click "Create Web Service" and wait 5-10 minutes
```

## Verification Checklist

After deployment completes:

- [ ] Visit your Render URL (https://teamtalk-xxxxx.onrender.com)
- [ ] Login page loads without errors
- [ ] Create a new account
- [ ] Create a workspace
- [ ] Create a channel
- [ ] Send a message
- [ ] Check message appears in real-time
- [ ] Create 1-on-1 chat with another user
- [ ] Test DM real-time sync
- [ ] Video/audio call buttons visible

## Environment Variables Reference

| Variable | Required | Auto-generated | Example |
|----------|----------|---|---------|
| NODE_ENV | Yes | No | production |
| PORT | Yes | No | 5000 |
| MONGO_URI | Yes | No | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | Yes | Yes (leave blank) | (auto-generated) |
| SESSION_SECRET | Yes | Yes (leave blank) | (auto-generated) |

## Files for Reference

- **RENDER_DEPLOYMENT_GUIDE.md** - Full deployment documentation
- **MONGODB_ATLAS_SETUP.md** - Detailed MongoDB setup
- **render.yaml** - Render configuration file
- **replit.md** - Project documentation

## Troubleshooting

**Build fails?**
- Check render.yaml syntax
- Ensure npm install completes locally
- Push latest code to GitHub

**App crashes?**
- Check MongoDB URI in environment variables
- Verify MongoDB password doesn't have special chars (or URL-encode them)
- Check IP whitelist in MongoDB Atlas

**Can't login?**
- Clear browser cache
- Check API logs in Render dashboard
- Verify MONGO_URI is correct

**Real-time messages not syncing?**
- Restart Render service
- Check Socket.io connection in browser DevTools
- Verify CORS includes .render.app domains

## Deployment URL

Your app will be available at:
```
https://teamtalk-[random-id].onrender.com
```

(You can customize this in Render service settings)

## Next: Custom Domain (Optional)

To use your own domain:

1. Go to Render service → Custom Domain
2. Add your domain (e.g., teamtalk.mycompany.com)
3. Update DNS records per Render instructions
4. SSL auto-enabled

## Support Links

- Render docs: https://render.com/docs
- MongoDB docs: https://docs.atlas.mongodb.com
- TeamTalk issues: Check logs in Render dashboard

---

**Ready to deploy?** Follow the steps above and your TeamTalk will be live in 10 minutes! 🚀
