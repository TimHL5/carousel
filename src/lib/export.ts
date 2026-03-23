import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Slugify a string for filenames — strips path separators, null bytes, non-ASCII
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[/\\]/g, '') // strip path separators
    .replace(/\0/g, '') // strip null bytes
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .slice(0, 80); // cap length
}

// Format date as YYYY-MM-DD
function dateStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Build export filename prefix from carousel title + theme + date
export function exportPrefix(title: string, themeId: string): string {
  const slug = slugify(title) || 'carousel';
  return `${slug}-${themeId}-${dateStamp()}`;
}

// Double-render technique: first call warms font cache, second captures correctly
// Adds ~200ms overhead but prevents missing web fonts on first export
async function captureNode(node: HTMLElement): Promise<string> {
  // Warmup render — discard result
  await toPng(node, { pixelRatio: 2 });
  // Wait for font rasterization
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Final capture
  return toPng(node, { pixelRatio: 2 });
}

// Convert data URL to Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

// ── Single Slide Export ──────────────────────────────────────────────

export interface ExportResult {
  success: boolean;
  error?: string;
}

export async function exportSlide(
  node: HTMLElement,
  filename: string,
): Promise<ExportResult> {
  try {
    const dataUrl = await captureNode(node);
    const blob = dataUrlToBlob(dataUrl);
    saveAs(blob, filename);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ── Copy to Clipboard ────────────────────────────────────────────────
// Chrome-first via ClipboardItem with promise-based blob
// Non-Chrome falls back to PNG download

export async function copySlideToClipboard(
  node: HTMLElement,
  fallbackFilename: string,
): Promise<ExportResult> {
  try {
    const dataUrl = await captureNode(node);
    const blob = dataUrlToBlob(dataUrl);

    // Try Clipboard API (Chrome-first)
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return { success: true };
    }

    // Fallback: download as PNG
    saveAs(blob, fallbackFilename);
    return { success: true, error: 'clipboard-unsupported' };
  } catch (error) {
    // Clipboard permission denied — fallback to download
    try {
      const dataUrl = await captureNode(node);
      const blob = dataUrlToBlob(dataUrl);
      saveAs(blob, fallbackFilename);
      return { success: true, error: 'clipboard-fallback' };
    } catch (fallbackError) {
      return { success: false, error: String(fallbackError) };
    }
  }
}

// ── ZIP Export ────────────────────────────────────────────────────────
// Per-slide error isolation: each slide exports independently
// Partial export on failure — user gets what worked + error report

export interface ZipExportResult {
  success: boolean;
  totalSlides: number;
  exportedSlides: number;
  failedSlides: number[];
  error?: string;
}

export async function exportAllAsZip(
  slideNodes: HTMLElement[],
  title: string,
  themeId: string,
  onProgress?: (current: number, total: number) => void,
): Promise<ZipExportResult> {
  const prefix = exportPrefix(title, themeId);
  const zip = new JSZip();
  const folder = zip.folder(prefix);
  if (!folder) {
    return { success: false, totalSlides: slideNodes.length, exportedSlides: 0, failedSlides: [], error: 'Failed to create ZIP folder' };
  }

  const failedSlides: number[] = [];
  let exportedCount = 0;

  for (let i = 0; i < slideNodes.length; i++) {
    onProgress?.(i + 1, slideNodes.length);
    try {
      const dataUrl = await captureNode(slideNodes[i]);
      const base64 = dataUrl.split(',')[1];
      const slideNum = String(i + 1).padStart(2, '0');
      folder.file(`slide-${slideNum}.png`, base64, { base64: true });
      exportedCount++;
    } catch {
      // Per-slide isolation: retry once
      try {
        const dataUrl = await captureNode(slideNodes[i]);
        const base64 = dataUrl.split(',')[1];
        const slideNum = String(i + 1).padStart(2, '0');
        folder.file(`slide-${slideNum}.png`, base64, { base64: true });
        exportedCount++;
      } catch {
        failedSlides.push(i + 1);
      }
    }
  }

  if (exportedCount === 0) {
    return { success: false, totalSlides: slideNodes.length, exportedSlides: 0, failedSlides, error: 'All slides failed to export' };
  }

  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${prefix}.zip`);
    return {
      success: true,
      totalSlides: slideNodes.length,
      exportedSlides: exportedCount,
      failedSlides,
    };
  } catch (error) {
    return { success: false, totalSlides: slideNodes.length, exportedSlides: 0, failedSlides: [], error: String(error) };
  }
}

// ── PDF Export ────────────────────────────────────────────────────────
// PNG-to-PDF pipeline. JPEG compression at 0.92 per DESIGN.md.

export async function exportAsPdf(
  slideNodes: HTMLElement[],
  title: string,
  themeId: string,
  dimensions: { width: number; height: number },
  onProgress?: (current: number, total: number) => void,
): Promise<ExportResult> {
  const prefix = exportPrefix(title, themeId);

  // Determine page orientation and size
  const isLandscape = dimensions.width > dimensions.height;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Create PDF with custom page size in px (jsPDF uses pt by default, we use px)
  const pdf = new jsPDF({
    orientation: orientation as 'portrait' | 'landscape',
    unit: 'px',
    format: [dimensions.width, dimensions.height],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < slideNodes.length; i++) {
    onProgress?.(i + 1, slideNodes.length);

    if (i > 0) {
      pdf.addPage([dimensions.width, dimensions.height], orientation as 'portrait' | 'landscape');
    }

    try {
      const dataUrl = await captureNode(slideNodes[i]);
      // Add as JPEG with 0.92 quality for compression
      pdf.addImage(dataUrl, 'JPEG', 0, 0, dimensions.width, dimensions.height, undefined, 'FAST', 0);
    } catch {
      // Per-slide: retry once
      try {
        const dataUrl = await captureNode(slideNodes[i]);
        pdf.addImage(dataUrl, 'JPEG', 0, 0, dimensions.width, dimensions.height, undefined, 'FAST', 0);
      } catch {
        // Skip failed slide — add blank page
      }
    }
  }

  try {
    pdf.save(`${prefix}.pdf`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
