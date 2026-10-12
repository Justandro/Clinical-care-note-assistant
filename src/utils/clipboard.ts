export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Synchronous fallback FIRST. 
  // document.execCommand MUST be called in the synchronous call stack of the click event.
  // If we await navigator.clipboard first and it fails, the user gesture is lost.
  try {
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    const textArea = document.createElement('textarea');
    
    textArea.style.fontSize = '12pt';
    textArea.style.border = '0';
    textArea.style.padding = '0';
    textArea.style.margin = '0';
    textArea.style.position = 'fixed';
    textArea.style[isRTL ? 'right' : 'left'] = '-9999px';
    textArea.style.top = `${window.pageYOffset || document.documentElement.scrollTop}px`;
    textArea.setAttribute('readonly', '');
    textArea.value = text;
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return true;
    }
  } catch (e) {
    console.warn('document.execCommand copy error:', e);
  }

  // 2. Modern API SECOND
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText blocked or failed:', err);
    }
  }

  return false;
}
