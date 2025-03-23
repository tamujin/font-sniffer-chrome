interface FontInfo {
  family: string;
  weight: string;
  style: string;
  size: string;
}

let isInspectorActive = false;
let highlightOverlay: HTMLElement | null = null;

function getFontInfo(element: Element): FontInfo {
  const style = window.getComputedStyle(element);
  return {
    family: style.fontFamily.split(',')[0].trim().replace(/["']/g, ''),
    weight: style.fontWeight,
    style: style.fontStyle,
    size: style.fontSize
  };
}

function createHighlightOverlay() {
  if (highlightOverlay) return;
  
  highlightOverlay = document.createElement('div');
  highlightOverlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 2147483647;
    background: rgba(16, 185, 129, 0.3);
    border: 2px solid #10B981;
    border-radius: 2px;
    display: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
    transition: all 0.1s ease-in-out;
  `;
  document.body.appendChild(highlightOverlay);
}

function findTextElement(element: Element): Element {
  // If this element has direct text content, return it
  if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
    return element;
  }

  // If it's a text-only container (like a button with just text), return it
  if (element.children.length === 0 && element.textContent?.trim()) {
    return element;
  }

  // If it's a small container with text and maybe one or two inline elements, return it
  if (element.children.length <= 2 && element.textContent?.trim() && 
      Array.from(element.children).every(child => 
        getComputedStyle(child).display === 'inline' || 
        getComputedStyle(child).display === 'inline-block'
      )) {
    return element;
  }

  // Otherwise, try to find the closest parent that's a good text container
  let current = element;
  while (current.parentElement) {
    if (current.parentElement.children.length === 1 && current.parentElement.textContent?.trim()) {
      return current.parentElement;
    }
    current = current.parentElement;
  }

  return element;
}

function showHighlight(element: Element) {
  if (!highlightOverlay) return;
  
  const textElement = findTextElement(element);
  const rect = textElement.getBoundingClientRect();
  
  highlightOverlay.style.display = 'block';
  highlightOverlay.style.top = rect.top + window.scrollY + 'px';
  highlightOverlay.style.left = rect.left + window.scrollX + 'px';
  highlightOverlay.style.width = rect.width + 'px';
  highlightOverlay.style.height = rect.height + 'px';
}

function hideHighlight() {
  if (highlightOverlay) {
    highlightOverlay.style.display = 'none';
  }
}

function handleMouseOver(e: MouseEvent) {
  if (!isInspectorActive) return;
  
  const target = e.target as Element;
  if (target && target.textContent?.trim()) {
    showHighlight(target);
  }
}

function handleMouseOut() {
  if (!isInspectorActive) return;
  hideHighlight();
}

function handleClick(e: MouseEvent) {
  if (!isInspectorActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const target = e.target as Element;
  if (target && target.textContent?.trim()) {
    const textElement = findTextElement(target);
    const fontInfo = getFontInfo(textElement);
    
    // Send message back to popup
    try {
      chrome.runtime.sendMessage({
        action: 'fontInspected',
        fontInfo
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    // Deactivate inspector after selection
    deactivateInspector();
  }
}

function activateInspector() {
  isInspectorActive = true;
  createHighlightOverlay();
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', handleClick, true);
}

function deactivateInspector() {
  isInspectorActive = false;
  hideHighlight();
  document.body.style.cursor = '';
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', handleClick, true);
}

function getSelectedTextInfo(): FontInfo | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!range || range.collapsed) return null;

  // Get the parent element of the selection
  const container = range.commonAncestorContainer;
  const element = container.nodeType === Node.TEXT_NODE 
    ? container.parentElement 
    : container as Element;

  if (!element) return null;

  return getFontInfo(element);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'activateInspector') {
    activateInspector();
    // Send response immediately
    sendResponse({ success: true });
  } else if (request.action === 'deactivateInspector') {
    deactivateInspector();
    // Send response immediately
    sendResponse({ success: true });
  } else if (request.action === 'getSelectedFontInfo') {
    const fontInfo = getSelectedTextInfo();
    sendResponse({ fontInfo });
  }
}); 