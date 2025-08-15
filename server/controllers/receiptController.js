import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import asyncHandler from 'express-async-handler';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Resolve absolute paths based on this file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'receipts'); // ensure absolute & consistent
const TEMP_DIR = path.join(__dirname, '..', 'tmp');                   // ensure absolute & consistent

// PDF Security configuration
const PDF_SECURITY_CONFIG = {
  MAX_PDF_SIZE: 8 * 1024 * 1024, // 8MB for PDFs (stricter than images)
  MAX_PAGES: 50, // Maximum number of pages allowed
  SUSPICIOUS_KEYWORDS: [
    // JavaScript execution patterns
    '/JavaScript', '/JS', 'this.print', 'app.alert', 'eval(',
    // Suspicious actions
    'importDataObject', 'exportDataObject', 'submitForm',
    // External references
    'launch(', 'getURL(', 'GoToR', '/URI',
    // Embedded files
    '/EmbeddedFile', '/FileAttachment', '/Launch',
    // Form actions
    '/SubmitForm', '/ImportData'
  ],
  BLOCKED_CONTENT_TYPES: [
    'application/javascript', 'text/javascript', 'application/x-javascript'
  ]
};

// Configure storage with async directory creation
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(new Error('Failed to create upload directory'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

// Enhanced file validation
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAllowedType = ALLOWED_FILE_TYPES.includes(file.mimetype);
  const isAllowedExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'].includes(extension);

  if (isAllowedType && isAllowedExtension) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WebP images and PDF are allowed.'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

// PDF Security Scanner
class PDFSecurityScanner {
  static async scanPDFForMalware(filePath, buffer = null) {
    const pdfBuffer = buffer || await fs.readFile(filePath);
    const results = {
      isSafe: true,
      threats: [],
      warnings: [],
      metadata: {}
    };

    try {
      // Size check
      if (pdfBuffer.length > PDF_SECURITY_CONFIG.MAX_PDF_SIZE) {
        results.isSafe = false;
        results.threats.push(`PDF size (${Math.round(pdfBuffer.length / 1024 / 1024)}MB) exceeds security limit`);
      }

      // Convert buffer to string for pattern matching
      const pdfContent = pdfBuffer.toString('binary');
      
      // Check PDF header
      if (!pdfContent.startsWith('%PDF-')) {
        results.isSafe = false;
        results.threats.push('Invalid PDF header - potential file type spoofing');
        return results;
      }

      // Extract PDF version
      const versionMatch = pdfContent.match(/%PDF-(\d+\.\d+)/);
      if (versionMatch) {
        results.metadata.version = versionMatch[1];
      }

      // Check for suspicious keywords
      for (const keyword of PDF_SECURITY_CONFIG.SUSPICIOUS_KEYWORDS) {
        if (pdfContent.includes(keyword)) {
          if (keyword.includes('JavaScript') || keyword.includes('/JS')) {
            results.isSafe = false;
            results.threats.push(`Potentially malicious JavaScript detected: ${keyword}`);
          } else if (keyword.includes('launch') || keyword.includes('getURL') || keyword.includes('/URI')) {
            results.isSafe = false;
            results.threats.push(`External execution attempt detected: ${keyword}`);
          } else if (keyword.includes('EmbeddedFile') || keyword.includes('FileAttachment')) {
            results.warnings.push(`Embedded file detected: ${keyword} - Exercise caution`);
          } else {
            results.warnings.push(`Suspicious content detected: ${keyword}`);
          }
        }
      }

      // Check for embedded files or attachments
      const embedCount = (pdfContent.match(/\/EmbeddedFile/g) || []).length;
      if (embedCount > 0) {
        results.warnings.push(`${embedCount} embedded file(s) detected`);
      }

      // Check for forms with external actions
      if (pdfContent.includes('/SubmitForm') && pdfContent.includes('http')) {
        results.isSafe = false;
        results.threats.push('Form with external submission detected - potential data exfiltration');
      }

      // Check object count (complexity analysis)
      const objCount = (pdfContent.match(/\d+ \d+ obj/g) || []).length;
      results.metadata.objectCount = objCount;
      if (objCount > 1000) {
        results.warnings.push(`High object count (${objCount}) - complex PDF structure`);
      }

      // Check for encryption
      if (pdfContent.includes('/Encrypt')) {
        results.warnings.push('Encrypted PDF detected');
        results.metadata.encrypted = true;
      }

      // Additional entropy check for obfuscation
      const entropy = this.calculateEntropy(pdfBuffer.slice(0, Math.min(pdfBuffer.length, 10000)));
      results.metadata.entropy = entropy;
      if (entropy > 7.5) {
        results.warnings.push(`High entropy (${entropy.toFixed(2)}) - possible obfuscation`);
      }

      // File hash for tracking
      results.metadata.sha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    } catch (error) {
      console.error('PDF security scan error:', error);
      results.isSafe = false;
      results.threats.push(`Scan error: ${error.message}`);
    }

    return results;
  }

  static calculateEntropy(buffer) {
    const freq = new Map();
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      freq.set(byte, (freq.get(byte) || 0) + 1);
    }

    let entropy = 0;
    const length = buffer.length;
    for (const count of freq.values()) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  static async validatePDFPages(pdfData) {
    const pageCount = pdfData?.numpages || 0;
    if (pageCount > PDF_SECURITY_CONFIG.MAX_PAGES) {
      throw new Error(`PDF page count (${pageCount}) exceeds security limit of ${PDF_SECURITY_CONFIG.MAX_PAGES}`);
    }
    return pageCount;
  }
}

// Real file-type detection via magic bytes (no reliance on client-provided mimetype)
async function detectFileType(filePath) {
  try {
    const buf = await fs.readFile(filePath);
    if (!buf || buf.length < 4) return null;

    // PDF: %PDF-
    if (buf.slice(0, 5).toString('ascii') === '%PDF-') {
      return { mime: 'application/pdf', ext: 'pdf' };
    }

    // JPEG: FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      return { mime: 'image/jpeg', ext: 'jpg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (buf.length >= 8 && pngSig.every((v, i) => buf[i] === v)) {
      return { mime: 'image/png', ext: 'png' };
    }

    // GIF: GIF87a or GIF89a
    const gifSig = buf.slice(0, 6).toString('ascii');
    if (gifSig === 'GIF87a' || gifSig === 'GIF89a') {
      return { mime: 'image/gif', ext: 'gif' };
    }

    // WEBP: RIFF....WEBP
    if (buf.length >= 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') {
      return { mime: 'image/webp', ext: 'webp' };
    }

    return null;
  } catch (e) {
    console.error('Magic bytes detection failed:', e);
    return null;
  }
}

// Build a sharp pipeline based on options
async function buildAndSaveSharp(inputPath, outputPath, opts) {
  const {
    toGray = true,
    normalize = true,
    brightness = 1.0,
    sharpenSigma = 1.0,
    median = 0,
    threshold = null,
    resizeWidth = null,
    jpegQuality = 92,
  } = opts || {};

  let img = sharp(inputPath, { failOnError: false }).rotate(); // auto-orient via EXIF
  if (toGray) img = img.grayscale();
  if (normalize) img = img.normalize({ upper: 95 });
  if (brightness !== 1.0) img = img.modulate({ brightness });
  if (sharpenSigma && sharpenSigma > 0) img = img.sharpen({ sigma: sharpenSigma });
  if (median && median > 0) img = img.median(median);
  if (resizeWidth && Number.isFinite(resizeWidth)) img = img.resize({ width: resizeWidth, withoutEnlargement: false });
  if (threshold !== null) img = img.threshold(threshold);

  await img.toFormat('jpeg', { quality: jpegQuality }).toFile(outputPath);
}

// Generate multiple preprocessing variants to improve OCR robustness
async function preprocessImageVariants(filePath) {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  const baseName = path.basename(filePath, path.extname(filePath));

  const variants = [
    { key: 'gray_norm_thr140', opts: { toGray: true, normalize: true, brightness: 1.05, sharpenSigma: 1.2, median: 1, threshold: 140, resizeWidth: 1800 } },
    { key: 'gray_norm_thr170', opts: { toGray: true, normalize: true, brightness: 1.1, sharpenSigma: 1.3, median: 1, threshold: 170, resizeWidth: 2000 } },
    { key: 'gray_norm_noThr_big', opts: { toGray: true, normalize: true, brightness: 1.05, sharpenSigma: 1.1, median: 1, threshold: null, resizeWidth: 2200 } },
    { key: 'gray_highContrast_thr160', opts: { toGray: true, normalize: true, brightness: 1.15, sharpenSigma: 1.4, median: 1, threshold: 160, resizeWidth: 2000 } },
  ];

  const outputs = [];
  for (const v of variants) {
    const outPath = path.join(TEMP_DIR, `${baseName}-${v.key}.jpg`);
    try {
      await buildAndSaveSharp(filePath, outPath, v.opts);
      outputs.push(outPath);
    } catch (e) {
      logger.error('Preprocess variant failed:', v.key, e);
    }
  }
  // Fallback to original path if all preprocessing failed
  if (outputs.length === 0) outputs.push(filePath);
  return outputs;
}

// Extract data from receipt using OCR with multi-variant strategy
let ocrWorkerPromise = null;
async function getOcrWorker() {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const worker = await createWorker('eng', 1, {
  logger: m => logger.debug('Tesseract:', m.status || m),
  errorHandler: err => logger.error('Tesseract error:', err)
      });
      await worker.setParameters({
        // Use a wider currency-enabled whitelist; keep spaces
        tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ£€₦₵₹₽¥$.,:/\\-()&'\"+ ",
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: '6', // Assume a uniform block of text
        tessedit_ocr_engine_mode: '1', // LSTM only for better accuracy
        user_defined_dpi: '300',
      });
      return worker;
    })();
  }
  return ocrWorkerPromise;
}

// Helper to build a public URL for the uploaded receipt (works behind proxies)
function publicReceiptUrl(req, filename) {
  // Prefer explicit public base URL if provided (e.g., https://api.example.com)
  if (process.env.PUBLIC_BASE_URL) {
    const base = process.env.PUBLIC_BASE_URL.replace(/\/+$/, '');
    return `${base}/uploads/receipts/${encodeURIComponent(filename)}`;
  }
  // In dev: use the API server host/port directly; don't trust x-forwarded-host from CRA proxy
  const proto = req.protocol;
  const host = req.get('host'); // e.g., localhost:5000
  return `${proto}://${host}/uploads/receipts/${encodeURIComponent(filename)}`;
}

export const processReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      error: 'No file uploaded' 
    });
  }

  // In test environment, avoid heavy OCR work and return a stubbed response
  if (process.env.NODE_ENV === 'test') {
    return res.status(200).json({
      success: true,
      receiptUrl: publicReceiptUrl(req, req.file.filename),
      ocr: { source: 'test-stub' },
      extractedData: { amount: 0, date: null, merchant: 'Test', items: [], category: 'Other', description: 'Test' },
      security: { scanned: false, safe: true }
    });
  }

  let processedPaths = [];

  try {
    // Real file-type detection using magic bytes
    const detected = await detectFileType(req.file.path);
    if (!detected) {
      try { await fs.unlink(req.file.path); } catch (_) {}
      return res.status(400).json({ success: false, error: 'Unable to detect file type' });
    }
    const actualMime = detected.mime;
    const detectedExt = detected.ext ? detected.ext.toLowerCase() : '';
    if (!ALLOWED_FILE_TYPES.includes(actualMime)) {
      try { await fs.unlink(req.file.path); } catch (_) {}
      return res.status(400).json({ success: false, error: 'Unsupported file type' });
    }
    // Normalize file extension to detected type to avoid spoofing and preview mismatches
    const currentExt = path.extname(req.file.filename || '').slice(1).toLowerCase();
    if (detectedExt && currentExt && currentExt !== detectedExt) {
      const base = path.basename(req.file.filename, path.extname(req.file.filename));
      const newFilename = `${base}.${detectedExt}`;
      const newPath = path.join(UPLOAD_DIR, newFilename);
      try {
        await fs.rename(req.file.path, newPath);
        req.file.filename = newFilename;
        req.file.path = newPath;
      } catch (e) {
  logger.error('Failed to normalize file extension:', e);
      }
    }
    const isPdf = actualMime === 'application/pdf';
    if (isPdf) {
      // SECURITY: Perform malware scan on PDF
      const pdfBuffer = await fs.readFile(req.file.path);
      
      const securityScan = await PDFSecurityScanner.scanPDFForMalware(req.file.path, pdfBuffer);
      
      // Log security scan results
      if (securityScan.threats.length > 0) {
  logger.error('PDF security threats detected:', securityScan.threats);
      }
      if (securityScan.warnings.length > 0) {
  logger.warn('PDF security warnings:', securityScan.warnings);
      }

      // Block processing if threats detected
      if (!securityScan.isSafe) {
        // Clean up the uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          logger.error('Failed to clean up unsafe PDF:', cleanupError);
        }

        return res.status(400).json({
          success: false,
          error: 'PDF failed security scan',
          securityIssues: securityScan.threats,
          details: 'The uploaded PDF contains potentially malicious content and has been rejected for security reasons.'
        });
      }

      // Lazy-load the safe lib entry to avoid the test harness in the package root
      const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');

      const pdfData = await pdfParse(pdfBuffer);
      
      // Validate page count
      try {
        await PDFSecurityScanner.validatePDFPages(pdfData);
      } catch (pageError) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          error: pageError.message
        });
      }

      const text = (pdfData && typeof pdfData.text === 'string') ? pdfData.text : '';
      const parsed = parseReceiptText(text || '');

      return res.status(200).json({
        success: true,
        // changed: return absolute URL so client doesn’t rely on dev proxy
        receiptUrl: publicReceiptUrl(req, req.file.filename),
        ocr: { 
          source: 'pdf-text', 
          pages: pdfData?.numpages || undefined, 
          rawTextPreview: (text || '').slice(0, 500) 
        },
        extractedData: validateExtractedData(parsed || { amount: null, date: null, merchant: 'Unknown Merchant', items: [], category: 'Other' }),
        security: {
          scanned: true,
          safe: true,
          warnings: securityScan.warnings,
          metadata: securityScan.metadata
        }
      });
    }

    // Initialize/reuse Tesseract worker (singleton to prevent leaks and improve performance)
    const worker = await getOcrWorker();

    // Preprocess image into multiple variants
    processedPaths = await preprocessImageVariants(req.file.path);

    // Recognize each variant, pick best by confidence + parsing heuristics
    let best = { score: -Infinity, text: '', confidence: 0, parsed: null, path: null };

    for (const p of processedPaths) {
      const result = await worker.recognize(p);
      const text = (result && result.data && typeof result.data.text === 'string') ? result.data.text : String(result.data || '');
      const confidence = (result && result.data && typeof result.data.confidence === 'number') ? result.data.confidence : 0;

      const parsed = parseReceiptText(text);

      // Heuristic scoring: prioritize valid amount/date/merchant + OCR confidence
      let score = 0;
      score += Math.min(Math.max(confidence, 0), 100) * 0.5; // up to 50 points
      if (parsed.amount && parsed.amount > 0) score += 25; // amount found
      if (parsed.date) score += 15; // date found
      if (parsed.merchant && parsed.merchant !== 'Unknown Merchant') score += 8; // merchant found
      if (parsed.items && parsed.items.length > 0) score += 2; // items detected

      if (score > best.score) {
        best = { score, text, confidence, parsed, path: p };
      }
    }

    

    // Return the extracted data
    res.status(200).json({
      success: true,
      // changed: return absolute URL so client doesn’t rely on dev proxy
      receiptUrl: publicReceiptUrl(req, req.file.filename),
      ocr: { confidence: best.confidence, variant: path.basename(best.path || ''), rawTextPreview: (best.text || '').slice(0, 500) },
      extractedData: validateExtractedData(best.parsed || { amount: null, date: null, merchant: 'Unknown Merchant', items: [], category: 'Other' }),
      security: {
        scanned: false,
        safe: true,
        note: 'Image files processed without additional security scanning'
      }
    });

  } catch (error) {
  logger.error('OCR processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process receipt' 
    });
  } finally {
    // Clean up resources
    // Worker kept alive for reuse; no termination here

    // Clean up temporary files
    for (const p of processedPaths) {
      if (!p) continue;
      // Never delete the original upload
      if (path.resolve(p) !== path.resolve(req.file.path)) {
        try { await fs.unlink(p); } catch (_) {}
      }
    }
  }
});

// Enhanced helper function to parse OCR text and extract expense data
function parseReceiptText(text) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const lowerText = normalizedText.toLowerCase();
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  return {
    amount: extractTotalAmount(lines, normalizedText, lowerText),
    date: extractDate(normalizedText, lines),
    merchant: extractMerchant(lines),
    items: extractItems(lines),
    category: determineCategory(lines)
  };
}

// Improved total amount extraction with fuzzy TOTAL matching and line proximity
function extractTotalAmount(lines, text, lowerText) {
  // Prefer lines containing a fuzzy form of TOTAL
  const totalWord = /(t[o0]tal|t0tal|grand\s*t[o0]tal|amount\s*due|balance\s*due)/i;
  const currencyAmount = /([£€₦₵₹₽¥$]?\s?\d{1,3}(?:[\,\s]\d{3})*(?:[\.,]\d{2})|[£€₦₵₹₽¥$]\s?\d+(?:[\.,]\d{2})?)/g;

  for (let i = 0; i < lines.length; i++) {
    if (totalWord.test(lines[i])) {
      // Extract amounts from this line first
      const amountsOnLine = [...lines[i].matchAll(currencyAmount)].map(m => m[0]);
      // Or check the next line (common in receipts)
      const nextLine = lines[i + 1] || '';
      const amountsNextLine = [...nextLine.matchAll(currencyAmount)].map(m => m[0]);
      const all = [...amountsOnLine, ...amountsNextLine]
        .map(a => parseFloat(a.replace(/[^\d.,]/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.')))
        .filter(n => !Number.isNaN(n));
      if (all.length) return Math.max(...all);
    }
  }

  // Fallbacks: scan entire text for currency-like numbers and pick the largest, but prefer occurrences after the word TOTAL
  const matches = [...text.matchAll(currencyAmount)];
  if (matches.length) {
    const amounts = matches.map(m => ({ idx: m.index || 0, val: parseFloat(m[0].replace(/[^\d.,]/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.')) }))
      .filter(o => !Number.isNaN(o.val));
    const totalIdx = lowerText.indexOf('total');
    if (totalIdx >= 0) {
      const after = amounts.filter(a => a.idx >= totalIdx);
      if (after.length) return Math.max(...after.map(a => a.val));
    }
    return Math.max(...amounts.map(a => a.val));
  }
  return null;
}

// Enhanced date extraction supporting more formats
function extractDate(text, lines) {
  const datePatterns = [
    // APRIL 12. 2023 or Apr 12, 2023
    { 
      regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})[\.,]?\s*(\d{4})\b/i,
      format: (m) => {
        const months = {
          january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
          july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
          jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08',
          sep: '09', oct: '10', nov: '11', dec: '12'
        };
        const monthName = m[1].toLowerCase().substring(0, 3);
        const month = months[monthName];
        return `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
      }
    },
    // 2023-04-12 or 2023/04/12 or 2023.04.12
    { 
      regex: /\b(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/,
      format: (m) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
    },
    // 12-04-2023 or 12/04/2023 or 12.04.2023
    { 
      regex: /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/,
      format: (m) => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    },
    // 12-APR-2023 or 12 Apr 2023
    {
      regex: /\b(\d{1,2})[\s\-](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-](\d{4})\b/i,
      format: (m) => {
        const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
        const mon = months[m[2].toLowerCase().substring(0,3)];
        return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
      }
    },
    // 12th April 2023
    {
      regex: /\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+(\d{4})\b/i,
      format: (m) => {
        const months = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
        const mon = months[m[2].toLowerCase()];
        return `${m[3]}-${mon}-${m[1].padStart(2,'0')}`;
      }
    }
  ];

  const dateContextPatterns = [
    /\b(?:date|dated|issued)[\s:]+([^\n]+)/i,
    /\b(?:receipt|transaction) date[\s:]+([^\n]+)/i
  ];

  // Check context patterns first
  for (const contextPattern of dateContextPatterns) {
    const contextMatch = text.match(contextPattern);
    if (contextMatch) {
      const potentialDate = contextMatch[1];
      for (const { regex, format } of datePatterns) {
        const match = potentialDate.match(regex);
        if (match) {
          try {
            return format(match);
          } catch (e) {
            logger.error('Date parsing error:', e);
          }
        }
      }
    }
  }

  // Check full text patterns
  for (const { regex, format } of datePatterns) {
    const match = text.match(regex);
    if (match) {
      try {
        return format(match);
      } catch (e) {
  logger.error('Date parsing error:', e);
      }
    }
  }

  // Check first 7 lines
  for (const line of lines.slice(0, 7)) {
    for (const { regex, format } of datePatterns) {
      const match = line.match(regex);
      if (match) {
        try {
          return format(match);
        } catch (e) {
          logger.error('Date parsing error:', e);
        }
      }
    }
  }

  return null;
}

// Enhanced merchant name extraction
function extractMerchant(lines) {
  const skipPatterns = [
    /receipt/i, /invoice/i, /order/i, /transaction/i, /\btel\b/i, 
    /phone/i, /fax/i, /^\d+$/, /^\s*$/,
    /thank you/i, /welcome/i, /customer/i, /\bdate\b/i, /time/i, /change/i, /subtotal/i, /total/i, /tax/i,
    /\d{4,}/, /\d+\s+[a-z]+\s+\d{2,}/i, // Skip date-like patterns with numbers
    /april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec/i // Skip lines with month names
  ];

  // Prefer top region lines that look like a merchant name
  const candidates = [];
  const topRegion = lines.slice(0, Math.min(10, lines.length));
  for (let i = 0; i < topRegion.length; i++) {
    const line = topRegion[i].trim();
    if (!line || line.length < 2) continue;
    if (skipPatterns.some(p => p.test(line))) continue;
    if (/\$|£|€|₦|₵|₹|₽|¥/.test(line)) continue; // skip money lines
    if (/\d/.test(line) && !/[a-zA-Z]/.test(line)) continue; // numeric-only

    // Score by uppercase ratio and position
    const letters = line.replace(/[^A-Za-z]/g, '');
    const upperRatio = letters ? (letters.replace(/[^A-Z]/g, '').length / letters.length) : 0;
    let score = (10 - i) + upperRatio * 5;

    // Bonus if it contains common business words
    if (/(store|market|shop|restaurant|cafe|pharmacy|clinic|mart|supermarket|ltd|inc|llc|plc)/i.test(line)) score += 3;

    candidates.push({ line, score });
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].line;
  }

  for (const line of lines) {
    const l = line.trim();
    if (l) return l; // last resort
  }

  return 'Unknown Merchant';
}

// Extract potential line items from receipt
function extractItems(lines) {
  // Try to locate an items region between a header and the TOTAL
  let startOfItems = -1;
  let endOfItems = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/description\s+quantity\s+price\s+total/i.test(lines[i]) || /item\s+qty|qty\s+price/i.test(lines[i])) {
      startOfItems = i + 1;
      break;
    }
  }

  if (startOfItems > 0) {
    for (let i = startOfItems; i < lines.length; i++) {
      if (/^\s*(sub\s*total|subtotal|total|amount\s*due)/i.test(lines[i])) {
        endOfItems = i;
        break;
      }
    }
  }

  const items = [];

  const pushClean = (line) => {
    const cleaned = line
      .replace(/^\d+\s+/, '') // leading index
      .replace(/\s{2,}/g, ' ') // normalize spaces
      .replace(/\s+\$?\d+[\.,]\d{2}\s*$/, '') // trailing price
      .trim();
    if (cleaned && cleaned.length > 1 && !/^(description|quantity|qty|price|total)$/i.test(cleaned)) {
      items.push(cleaned);
    }
  };

  if (startOfItems > 0 && endOfItems > startOfItems) {
    for (let i = startOfItems; i < endOfItems; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      pushClean(line);
    }
  }

  // Fallback: heuristic extraction for lines that end with a price
  if (items.length === 0) {
    const priceAtEnd = /\$?\s?\d+(?:[\.,]\d{2})\s*$/;
    for (const line of lines) {
      const l = line.trim();
      if (!l) continue;
      if (priceAtEnd.test(l)) pushClean(l);
    }
  }

  return items;
}

// Enhanced category detection
function determineCategory(lines) {
  const merchantName = extractMerchant(lines);
  const items = extractItems(lines);
  const textToAnalyze = [merchantName, ...items.slice(0, 3)].join(' ').toLowerCase();
  
  const CATEGORIES = {
    'Food & Dining': [
      /restaurant|cafe|coffee|food|pizza|burger|bakery|deli|sandwich|taco|sushi|thai|chinese|meal|dining|bar|pub|bistro|grill|eatery|steakhouse/i,
      /breakfast|lunch|dinner|brunch|appetizer|dessert|entree|cuisine/i
    ],
    'Groceries': [
      /market|grocery|supermarket|walmart|target|costco|kroger|safeway|aldi|trader|joe|whole foods|food store|fresh/i,
      /produce|fruit|vegetable|meat|dairy|bakery|organic|natural|farm/i
    ],
    'Transportation': [
      /gas|shell|exxon|bp|chevron|texaco|mobil|marathon|valero|76|circle k|speedway|fuel|petrol|station/i,
      /uber|lyft|taxi|cab|ride|metro|bus|train|subway|transit|fare|toll|parking|car rental|garage|auto|transport/i
    ],
    'Shopping': [
      /mall|outlet|store|shop|boutique|retail|amazon|ebay|etsy|wayfair|walmart|target|best buy|department|clothing/i,
      /purchase|buy|cart|checkout|order|delivery|shipping|sneaker|shoe|apparel|fashion|accessories|jewelry|watch/i
    ],
    'Entertainment': [
      /movie|theater|cinema|concert|show|event|ticket|netflix|hulu|disney|spotify|pandora|stream|game|play|fun|entertainment/i,
      /amusement|park|fair|festival|zoo|museum|gallery|exhibit|venue|arcade|bowling|activity|leisure/i
    ],
    'Utilities': [
      /utility|bill|electricity|water|gas|power|energy|internet|wifi|broadband|cable|tv|phone|cell|mobile|service/i,
      /provider|connection|subscription|plan|payment|monthly|installment|due/i
    ],
    'Healthcare': [
      /doctor|physician|medical|hospital|clinic|health|care|dentist|dental|eye|vision|pharmacy|drug|prescription|medicine/i,
      /wellness|therapy|treatment|specialist|exam|checkup|appointment|visit|consultation|procedure|insurance/i
    ],
    'Travel': [
      /hotel|motel|inn|lodge|resort|stay|booking|reservation|airbnb|vrbo|accommodation|flight|airline|airport|travel/i,
      /trip|vacation|holiday|tour|cruise|destination|lodge|hostel|camping|excursion|journey|adventure/i
    ],
    'Education': [
      /school|college|university|campus|class|course|tuition|fee|education|learning|academic|study|student|book|textbook/i,
      /degree|program|seminar|workshop|training|lecture|lesson|tutorial|certificate|diploma|scholarship/i
    ],
    'Personal Care': [
      /salon|spa|barber|hair|nail|beauty|cosmetic|makeup|skincare|massage|facial|waxing|manicure|pedicure|styling/i,
      /grooming|hygiene|personal|care|product|service|treatment|wellness|self-care|relaxation/i
    ],
    'Home': [
      /home|house|apartment|condo|rent|mortgage|furniture|decor|appliance|improvement|repair|maintenance|hardware|tool/i,
      /garden|lawn|yard|cleaning|supply|fixture|household|interior|exterior|renovation|remodel|decoration/i
    ],
    'Technology': [
      /computer|laptop|desktop|tablet|phone|device|gadget|electronic|software|hardware|app|application|program|digital/i,
      /tech|technology|printer|scanner|monitor|keyboard|mouse|accessory|cable|charger|battery|storage|component/i
    ],
    'Business': [
      /office|business|work|professional|corporate|commercial|company|enterprise|client|meeting|conference|consulting/i,
      /service|supply|equipment|expense|asset|liability|revenue|profit|loss|tax|accounting|finance/i
    ],
    'Other': [
      /miscellaneous|misc|other|general|various|assorted|diverse|mixed|unspecified|unidentified|unknown|undefined/i,
      /additional|extra|supplementary|complementary|alternative|optional|secondary|tertiary|auxiliary/i
    ]
  };

  for (const [category, patterns] of Object.entries(CATEGORIES)) {
    if (patterns.some(pattern => pattern.test(textToAnalyze))) {
      return category;
    }
  }
  return 'Other';
}

// Data validation and normalization
function validateExtractedData(data) {
  const merchant = data.merchant && data.merchant.trim() ? data.merchant.trim() : 'Unknown Merchant';

  // Build description from meaningful items or merchant name
  const meaningfulItems = (data.items || []).filter(item => !/^(description|quantity|qty|price|total|company|name|tax|change|subtotal|cash)$/i.test(item));
  const description = meaningfulItems.length > 0
    ? `${merchant}: ${meaningfulItems.slice(0, 2).join(', ')}`
    : merchant;

  return {
    ...data,
    amount: data.amount && !isNaN(data.amount) && Number(data.amount) > 0 ? Number(data.amount) : null,
    date: data.date && !isNaN(Date.parse(data.date)) ? data.date : null,
    merchant,
    description: description || 'Receipt'
  };
}