# India Cyber Incident Monitor: website

Static page (`index.html`) plus one serverless function (`api/incidents.js`).
No build step and no npm packages.

## 1. Publish both Sheet tabs as CSV
1. Open the Sheet "cyber incident data".
2. File > Share > Publish to web.
3. Choose the **incidents** tab, set the format to **Comma-separated values (.csv)**, click Publish, copy the link.
4. Repeat for the **global_incidents** tab.

Anyone with these links can read those tabs. Keep private data out of the Sheet.

## 2. Put the project on GitHub
Create a repository and upload the three files, keeping the folder layout:

```
index.html
api/incidents.js
README.md
```

## 3. Deploy on Vercel
1. Vercel > Add New > Project > import the repository.
2. Framework preset: **Other**. Leave build settings empty.
3. Before deploying, open Environment Variables and add:
   - `INDIA_CSV_URL` = the incidents tab CSV link
   - `GLOBAL_CSV_URL` = the global_incidents tab CSV link
4. Deploy.

If you add the variables after the first deploy, redeploy once.

## 4. Check it
- Open `/api/incidents` on your site. You should see JSON with a `rows` list.
- An error message there names what is missing.
- Published CSVs can lag a few minutes behind the Sheet.

## Notes
- Scope is set by tab: `incidents` rows are "India", `global_incidents` rows are "Global".
- A link found in both tabs is shown once, as India.
- Footer placeholder: replace `[YOUR NAME / COLLEGE]` in `index.html`.
