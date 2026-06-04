export function normalizeUrl(url: string): string {
  if (!url) return url;
  
  // If URL doesn't have a protocol, add https://
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  return url;
}

export async function exportAuditToPDF(
  url: string,
  fileName: string = `audit-${new Date().toISOString().split('T')[0]}.pdf`
) {
  try {
    // Get the report content element
    const reportElement = document.getElementById('audit-report');
    if (!reportElement) {
      throw new Error('Report content not found');
    }

    console.log('Starting PDF export for:', url);

    // Simple approach: use the browser's built-in print-to-PDF
    // This is more reliable than trying to generate PDFs in browser
    if (typeof window !== 'undefined') {
      // Trigger print dialog asynchronously
      setTimeout(() => {
        window.print();
      }, 100);
      
      console.log('Print dialog opened. User can save as PDF from the dialog');
      return true;
    }
    
    throw new Error('Print not available in this environment');
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

export async function shareAudit(url: string) {
  const shareUrl = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/report-preview?url=${encodeURIComponent(url)}`;

  // Try Web Share API first (mobile/modern browsers)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `AEO Audit Results: ${url}`,
        text: `Check out my website audit report`,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    console.log('Share link copied to clipboard');
    return true;
  } catch (err) {
    console.error('Failed to copy share link:', err);
    return false;
  }
}
