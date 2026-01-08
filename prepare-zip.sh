#!/bin/bash

# Script to prepare the website for ZIP download

echo "🚀 Preparing Heavenly Nature Schools website for deployment..."

# Navigate to frontend directory
cd /app/frontend

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
yarn install

# Build the production version
echo "🏗️  Building production version..."
yarn build

# Create a deployment package directory
echo "📁 Creating deployment package..."
cd /app
mkdir -p deployment-package

# Copy essential files
cp -r frontend/build deployment-package/
cp -r frontend/public deployment-package/
cp frontend/netlify.toml deployment-package/
cp frontend/package.json deployment-package/
cp DEPLOYMENT.md deployment-package/
cp README.md deployment-package/

# Create a netlify folder structure for functions (if needed in future)
mkdir -p deployment-package/netlify/functions

# Create instructions file
cat > deployment-package/QUICK_START.txt << 'EOF'
HEAVENLY NATURE SCHOOLS WEBSITE - DEPLOYMENT PACKAGE
====================================================

WHAT'S INCLUDED:
- build/              (Production-ready static files)
- public/             (Public assets)
- netlify.toml        (Netlify configuration)
- package.json        (Dependencies list)
- DEPLOYMENT.md       (Detailed deployment guide)
- README.md           (Project documentation)

QUICK DEPLOYMENT TO NETLIFY:

Method 1: Drag & Drop (Easiest)
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the 'build' folder
4. Your site is live!

Method 2: Netlify CLI
1. Install: npm install -g netlify-cli
2. Login: netlify login
3. Deploy: netlify deploy --prod --dir=build

NEXT STEPS:
1. Read DEPLOYMENT.md for complete setup guide
2. Configure Netlify Identity for admin access
3. Set up custom domain (heavenlynatureschools.com)
4. Configure Zoho Mail for info@heavenlynatureschools.com
5. Enable Netlify Forms for contact submissions

IMPORTANT LINKS:
- Netlify Dashboard: https://app.netlify.com/
- Netlify Docs: https://docs.netlify.com/
- Domain Setup Guide: See DEPLOYMENT.md
- Email Setup Guide: See DEPLOYMENT.md

ADMIN ACCESS:
After deployment, invite admin users through Netlify Identity:
1. Enable Identity in Netlify dashboard
2. Invite users via email
3. Access admin panel at: yourdomain.com/admin/login

SUPPORT:
- Deployment issues: Read DEPLOYMENT.md
- Technical questions: Refer to README.md
- Netlify support: https://www.netlify.com/support/

WEBSITE URLS:
- Main Site: https://heavenlynatureschools.com (after domain setup)
- Admin Login: https://yourdomain.com/admin/login
- Facebook: https://www.facebook.com/share/1CPEyYC14f/
- YouTube: https://youtube.com/@heavenlynatureschools

© 2023-2025 Heavenly Nature Nursery & Primary School
A ministry of Heavenly Nature Ministry
EOF

# Create the ZIP file
echo "📦 Creating ZIP archive..."
cd deployment-package
zip -r ../heavenlynature-website.zip . -x "*.DS_Store" -x "*node_modules*"

cd /app

echo ""
echo "✅ SUCCESS! Deployment package created."
echo ""
echo "📦 ZIP FILE LOCATION: /app/heavenlynature-website.zip"
echo ""
echo "📝 WHAT TO DO NEXT:"
echo "   1. Download the ZIP file: heavenlynature-website.zip"
echo "   2. Extract it on your local machine"
echo "   3. Read DEPLOYMENT.md for complete deployment instructions"
echo "   4. Deploy the 'build' folder to Netlify"
echo ""
echo "🎉 Your website is ready for deployment!"
echo ""

# Show ZIP file size
ls -lh /app/heavenlynature-website.zip
