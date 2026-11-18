# GitHub Pages setup

Use the GitHub_Pages ZIP for deployment. Extract it first. index.html, assets, projects, data, case-study and .nojekyll must be at the repository root. Upload the extracted files, not the ZIP itself. No npm install or build is required.

1. Create a repository in your GitHub account. GitHub Free Pages uses a public repository.
2. Use GitHub Desktop to clone it, copy all extracted files into the repository folder, commit and push. Keep the .nojekyll file.
3. In the repository open Settings > Pages > Build and deployment > Deploy from a branch.
4. Select main and /(root), then Save. GitHub displays the site URL when it is ready.

Standard Pages websites are public, even when a plan permits a private source repository. Do not enable Pages if you want selected viewers only. This package does not include authentication.

## Change thumbnails
Open thumbnail-editor.html in your browser, choose your images, mark finished mockups and export the update ZIP. Extract its assets and data folders over the website files, commit and push again. The editor prepares files; it does not upload them automatically. The natural image layout preserves full artwork without cropping.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
