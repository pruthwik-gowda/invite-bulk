import React, { useState } from "react";
import * as XLSX from "xlsx";
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "./App.css";

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [names, setNames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setStatus("Excel file uploaded");

      // Extract names from Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Extract names from the first column or a column named 'Name'
          const extractedNames = jsonData
            .map((row, index) => {
              const keys = Object.keys(row);
              const firstKey = keys[0];
              const nameKey = keys.find(
                (key) =>
                  key.toLowerCase().includes("name") ||
                  key.toLowerCase().includes("person")
              );
              return row[nameKey] || row[firstKey] || `Name ${index + 1}`;
            })
            .filter((name) => name && name.trim() !== "");

          setNames(extractedNames);
          setStatus(`Found ${extractedNames.length} names in Excel file`);
        } catch (error) {
          setStatus("Error reading Excel file: " + error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCertificateUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setCertificateFile(file);
      setStatus("Certificate template uploaded");
    } else {
      setStatus("Please upload a PDF file");
    }
  };

  const addTextToPDF = async (pdfBytes, name) => {
    // Load the PDF document first
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Register fontkit on the DOCUMENT INSTANCE (not the class)
    pdfDoc.registerFontkit(fontkit);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Calculate available width for the name (from 42% to 72% of page width)
    const startX = width * 0.42;
    const endX = width * 0.73;
    const availableWidth = endX - startX;

    // Load Times New Roman Italic
    let font;
    try {
      font = await pdfDoc.embedFont("Times-Italic");
    } catch (error) {
      // Fallback to Helvetica if Times-Italic fails
      console.warn("Times-Italic not available, using Helvetica", error);
      font = await pdfDoc.embedFont("Helvetica");
    }

    // Start with default font size
    let fontSize = 13;
    let textWidth = font.widthOfTextAtSize(name, fontSize);

    // Reduce font size if text doesn't fit
    while (textWidth > availableWidth && fontSize > 4) {
      fontSize -= 0.5;
      textWidth = font.widthOfTextAtSize(name, fontSize);
    }

    // Calculate center position: center of available space, then subtract half text width
    const centerPoint = startX + availableWidth / 2;
    let x = centerPoint - textWidth / 2;

    // Ensure text stays within bounds (in case of rounding issues)
    x = Math.max(startX, Math.min(x, endX - textWidth));

    const y = height * 0.755;

    firstPage.drawText(name, {
      x: x,
      y: y,
      size: fontSize,
      color: rgb(0, 0, 0),
      font: font,
    });

    return await pdfDoc.save();
  };

  const generateCertificates = async () => {
    if (!excelFile || !certificateFile || names.length === 0) {
      setStatus("Please upload both files first");
      return;
    }

    setIsProcessing(true);
    setStatus("Generating certificates...");

    try {
      const zip = new JSZip();
      const certificateBytes = await certificateFile.arrayBuffer();

      // Generate a certificate for each name
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        setStatus(
          `Generating certificate ${i + 1} of ${names.length}: ${name}`
        );

        const modifiedPdfBytes = await addTextToPDF(certificateBytes, name);

        // Add to ZIP
        zip.file(`${name}.pdf`, modifiedPdfBytes);
      }

      // Generate ZIP file
      setStatus("Creating ZIP file...");
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download the ZIP
      saveAs(zipBlob, "certificates.zip");

      setStatus(`Successfully generated ${names.length} certificates!`);
      setIsProcessing(false);
    } catch (error) {
      setStatus("Error generating certificates: " + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Canva Bulk Certificate Generator</h1>

        <div className="upload-section">
          <div className="upload-box">
            <label htmlFor="excel-upload" className="upload-label">
              Upload Excel File (.xlsx, .xls)
            </label>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              disabled={isProcessing}
            />
            {excelFile && (
              <div className="file-info">
                <strong>✓ {excelFile.name}</strong>
                {names.length > 0 && <span> ({names.length} names found)</span>}
              </div>
            )}
          </div>

          <div className="upload-box">
            <label htmlFor="certificate-upload" className="upload-label">
              Upload Certificate PDF
            </label>
            <input
              type="file"
              id="certificate-upload"
              accept=".pdf"
              onChange={handleCertificateUpload}
              disabled={isProcessing}
            />
            {certificateFile && (
              <div className="file-info">
                <strong>✓ {certificateFile.name}</strong>
              </div>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="processing">
            <div className="spinner"></div>
            <p>{status}</p>
          </div>
        )}

        {!isProcessing && (
          <>
            <div className="preview-section">
              {names.length > 0 && (
                <div>
                  <h3>Preview: First 5 names</h3>
                  <ul className="name-list">
                    {names.slice(0, 5).map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                    {names.length > 5 && (
                      <li>... and {names.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              className="generate-button"
              onClick={generateCertificates}
              disabled={
                !excelFile ||
                !certificateFile ||
                names.length === 0 ||
                isProcessing
              }
            >
              Generate Certificates
            </button>
          </>
        )}

        <div className="status">{status}</div>
      </div>
    </div>
  );
}

export default App;
