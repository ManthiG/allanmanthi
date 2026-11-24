ALLAN MANTHI MWEU — PERSONAL WEBSITE (v3, one story)
====================================================

The page tells one story: Complexity → Understanding → System →
Implementation → Evidence → Conversation.

Structure
  index.html                      The homepage (all text is real HTML)
  work/juapath.html               Case study
  work/wazi.html                  Case study
  css/styles.css                  Design system, layout and motion
  js/main.js                      Hero scene, scroll light/parallax, CV download, form
  assets/Allan-Manthi-Mweu-CV.pdf The downloadable CV
  cv/cv.html                      Source of the CV (edit, then re-export the PDF)
  assets/*.webp                   Scene images (large + small versions)
  assets/og-image.jpg             Link-sharing preview image

Deploying to Vercel
  The site is static: no build step, no framework. vercel.json adds security
  headers, sensible caching and a proper download header for the CV.
  .vercelignore keeps README.txt and the CV source (cv/) off the live site.

  Option 1 - GitHub (recommended: every update redeploys automatically)
    1. Create a GitHub repository (e.g. "allan-manthi-site") and upload the
       contents of this folder (index.html at the top level).
    2. In Vercel: Add New -> Project -> Import the repository.
       Framework Preset: Other. Build command: none. Output directory: leave empty.
    3. Deploy. Later changes: commit to GitHub and Vercel redeploys.

  Option 2 - Vercel CLI (needs Node.js)
    In a terminal inside this folder:
      npx vercel          (first run: log in, accept defaults -> preview URL)
      npx vercel --prod   (publishes to your production URL)

  After the first deploy
    - Settings -> Domains: add your own domain if you have one.
    - Change og:image in index.html to the full URL, e.g.
      https://YOUR-DOMAIN/assets/og-image.jpg, so link previews show the image.

  Plan note: Vercel's free Hobby plan is for personal, non-commercial use.
  A site that promotes paid services, and any client websites, should be on
  the Pro plan.

Contact form
  By default the form opens the visitor's email app with the message
  pre-filled to allan@juapath.com. To receive enquiries directly instead:
    1. Create a free form at formspree.io (or a similar service).
    2. Copy its endpoint URL, e.g. https://formspree.io/f/abcdwxyz
    3. In index.html, set it on the form: data-endpoint="https://formspree.io/f/abcdwxyz"
  The form then sends in the background and shows a confirmation or error.

Updating the CV
  Edit cv/cv.html, open it in Chrome, Print → Save as PDF (A4, margins
  default, "Background graphics" on), and save over
  assets/Allan-Manthi-Mweu-CV.pdf.

Images
  The scene and case-study images are generated, illustrative images and are
  labelled as such. Replace the Juapath and Wazi images with real product
  screenshots or photos when you can share them (same file names, similar
  proportions).

Before going live, check
  1. Wazi: your role ("systems design and development") and stage ("In development").
  2. Juapath: role description and "Ongoing" stage.
  3. CV: add job titles, dates, degree details, tools, certifications,
     phone and LinkedIn where you can verify them (see the comment at the
     top of cv/cv.html).
  4. Once you have a domain, change og:image in <head> to the full URL.
