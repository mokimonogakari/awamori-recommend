#!/bin/bash
# Build and deploy to GitHub Pages

echo "Building application..."
npm run build

echo "Adding .nojekyll file..."
touch dist/.nojekyll

echo "Deploying to gh-pages..."
cd dist
git init
git add -A
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages
git remote add origin git@github.com:mokimonogakari/awamori-recommend.git 2>/dev/null || true
git push -f origin gh-pages
cd ..

echo "Cleaning up..."
rm -rf dist/.git

echo "✅ Deployment complete!"
echo "Visit: https://mokimonogakari.github.io/awamori-recommend/"
