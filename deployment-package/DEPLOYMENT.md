# Deployment Guide for Heavenly Nature Schools Website

This guide will help you deploy your website to Netlify with all features configured.

## Prerequisites

- A Netlify account (free tier is sufficient)
- Domain name: `heavenlynatureschools.com` (to be purchased)
- Zoho Mail account for email: `info@heavenlynatureschools.com`

## Step 1: Prepare Your Code

The website is built with React and ready for deployment. All files are in the `/app/frontend` directory.

### Build the Project

```bash
cd /app/frontend
yarn install
yarn build
```

This creates a `build` folder with production-ready static files.

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify CLI (Recommended)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy from the frontend directory:
```bash
cd /app/frontend
netlify deploy --prod
```

4. Follow the prompts:
   - Create a new site? **Yes**
   - Site name: **heavenlynatureschools** (or your preferred name)
   - Publish directory: **build**

### Option B: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `build` folder
4. Your site will be live at a temporary URL like `random-name-123.netlify.app`

## Step 3: Configure Netlify Identity

Netlify Identity provides secure admin authentication.

1. In your Netlify site dashboard, go to **Site settings** → **Identity**
2. Click **Enable Identity**
3. Under **Registration preferences**, select **Invite only**
4. Under **External providers**, you can optionally enable Google/GitHub login
5. Go to **Settings** → **Identity** → **Enable Git Gateway**

### Invite Admin Users

1. Go to **Identity** tab in your Netlify dashboard
2. Click **Invite users**
3. Enter admin email addresses
4. They'll receive an invite to set up their password

## Step 4: Configure Netlify Forms

Your contact form is already set up with `data-netlify="true"` attribute.

1. Go to **Site settings** → **Forms**
2. Enable form notifications:
   - Go to **Forms** → **Form notifications**
   - Add **Email notification**
   - Enter: `info@heavenlynatureschools.com`
   - Now you'll receive an email for each contact form submission

## Step 5: Configure Custom Domain

### Purchase Domain

Purchase `heavenlynatureschools.com` from:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### Connect Domain to Netlify

1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Enter `heavenlynatureschools.com`
4. Netlify will provide DNS records

### Update DNS Records

In your domain registrar's DNS settings, add these records (provided by Netlify):

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### Enable HTTPS

1. In Netlify, go to **Domain settings** → **HTTPS**
2. Click **Verify DNS configuration**
3. Once verified, click **Provision certificate**
4. HTTPS will be automatically enabled

## Step 6: Configure Zoho Mail

### Set Up Zoho Mail (Free Tier)

1. Go to [Zoho Mail](https://www.zoho.com/mail/)
2. Sign up for free plan (supports 1 domain, 5 users)
3. Verify your domain ownership

### Add DNS Records for Zoho Mail

Add these records in your domain registrar:

```
Type: MX
Priority: 10
Value: mx.zoho.com

Type: MX
Priority: 20
Value: mx2.zoho.com

Type: TXT
Name: @
Value: v=spf1 include:zoho.com ~all

Type: TXT
Name: zmail._domainkey
Value: [Provided by Zoho after setup]
```

### Create Email Account

1. In Zoho Mail admin panel, create `info@heavenlynatureschools.com`
2. Set a strong password
3. Configure email forwarding if needed

## Step 7: Test Everything

### Test Public Pages
- ✅ Navigate through all pages (Home, About, Vision, Programs, etc.)
- ✅ Check responsive design on mobile/tablet
- ✅ Submit contact form
- ✅ Verify email notification received

### Test Admin Panel
- ✅ Go to `yourdomain.com/admin/login`
- ✅ Log in with Netlify Identity
- ✅ Create a blog post
- ✅ Create an event
- ✅ View contact form submissions
- ✅ Log out

### Test Blog & Events
- ✅ View blog posts on public site
- ✅ View events on public site
- ✅ Click through to individual posts/events

## Environment Variables

No environment variables are needed! Everything runs client-side with:
- Netlify Identity for authentication
- LocalStorage for data persistence
- Netlify Forms for contact submissions

## Continuous Deployment (Optional)

To enable automatic deployments when you update code:

1. Push your code to GitHub/GitLab
2. In Netlify, go to **Site settings** → **Build & deploy**
3. Link your repository
4. Set build command: `yarn build`
5. Set publish directory: `build`
6. Now every push to main branch automatically deploys

## Backup & Data Management

### Blog Posts & Events
Data is stored in browser LocalStorage. To backup:
1. Go to admin panel
2. Open browser console
3. Run:
```javascript
console.log(localStorage.getItem('blogPosts'));
console.log(localStorage.getItem('schoolEvents'));
```
4. Copy and save the JSON

### Contact Form Submissions
- Viewable in Netlify dashboard under **Forms**
- Also accessible via admin panel
- Set up email notifications to never miss a message

## Monitoring & Analytics

### Add Google Analytics (Optional)

1. Create a Google Analytics account
2. Get your tracking ID
3. Add to `public/index.html` before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-TRACKING-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA-TRACKING-ID');
</script>
```

## Support & Troubleshooting

### Common Issues

**Issue: Admin can't log in**
- Solution: Ensure Netlify Identity is enabled and user is invited

**Issue: Contact form not working**
- Solution: Check that form has `data-netlify="true"` attribute

**Issue: Domain not connecting**
- Solution: Wait 24-48 hours for DNS propagation

**Issue: HTTPS not working**
- Solution: Verify DNS is correct, then provision certificate in Netlify

### Need Help?

- Netlify Documentation: https://docs.netlify.com/
- Netlify Support: https://www.netlify.com/support/
- Zoho Mail Support: https://www.zoho.com/mail/help/

## Cost Summary

- **Netlify Hosting**: FREE (up to 100GB bandwidth/month)
- **Netlify Identity**: FREE (up to 1,000 active users)
- **Netlify Forms**: FREE (up to 100 submissions/month)
- **Domain Name**: ~$10-15/year
- **Zoho Mail**: FREE (up to 5 users)

**Total Monthly Cost: $0** (after one-time domain purchase)

## Next Steps After Deployment

1. ✅ Create initial blog posts about the school
2. ✅ Add upcoming events
3. ✅ Share website on social media (Facebook, YouTube)
4. ✅ Print business cards with website URL
5. ✅ Update Google My Business with website
6. ✅ Submit to search engines for indexing
7. ✅ Set up Google Search Console for SEO monitoring

---

## Quick Reference Commands

```bash
# Build for production
yarn build

# Deploy to Netlify
netlify deploy --prod

# Test locally
yarn start

# View local build
npx serve build
```

## Website URLs After Deployment

- **Main Website**: https://heavenlynatureschools.com
- **Admin Login**: https://heavenlynatureschools.com/admin/login
- **Contact Email**: info@heavenlynatureschools.com
- **Facebook**: https://www.facebook.com/share/1CPEyYC14f/
- **YouTube**: https://youtube.com/@heavenlynatureschools

---

**Congratulations!** Your website is now live and ready to serve the mission of Heavenly Nature Schools. 🎉

For any questions about deployment, please refer to this guide or contact technical support.
