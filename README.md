# Canva Bulk - Certificate Generator

A React application that generates multiple personalized certificates from an Excel file and a PDF template.

## Features

- Upload an Excel file containing names
- Upload a PDF certificate template
- Automatically extract names from Excel
- Generate individual certificates for each name
- Download all certificates as a ZIP file

## How to Use

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the application:**

   ```bash
   npm start
   ```

3. **Use the application:**
   - Upload an Excel file (.xlsx or .xls) containing names in the first column
   - Upload your certificate PDF template
   - Review the preview of names extracted
   - Click "Generate Certificates"
   - Download the generated ZIP file

## Excel File Format

Your Excel file should have names in the first column. The application will automatically:

- Look for a column with "Name" or "Person" in the header
- Or use the first column if no name column is found

Example Excel structure:

```
Name
John Doe
Jane Smith
Bob Johnson
```

## Customizing Certificate Position

To adjust where the name appears on the certificate, edit the `addTextToPDF` function in `src/App.js`:

```javascript
firstPage.drawText(name, {
  x: width / 2 - 50, // Horizontal position
  y: height / 2, // Vertical position
  size: 24, // Font size
  color: rgb(0, 0, 0), // Text color
});
```

Adjust the `x` and `y` values to position the text where you want it on your certificate template.

## Dependencies

- React - UI framework
- xlsx - Excel file parsing
- pdf-lib - PDF manipulation
- jszip - ZIP file creation
- file-saver - File download functionality

## Build for Production

```bash
npm run build
```

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts** and Vercel will automatically:
   - Detect it's a React app
   - Build your project
   - Deploy it

### Option 2: Deploy via GitHub

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to [Vercel](https://vercel.com)**

3. **Sign in with GitHub**

4. **Click "New Project"** and import your repository

5. **Vercel will automatically detect the framework** and configure everything

6. **Click "Deploy"** - your app will be live in seconds!

Your app will be available at `https://your-project-name.vercel.app`
