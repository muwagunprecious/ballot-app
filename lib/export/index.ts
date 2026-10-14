import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

// In-memory cache for generated ballot images
const imageRenderCache = new Map<string, string>();

export async function exportBallotAsPng(
  node: HTMLElement,
  filename: string = 'my-2027-candidates-lineup.png',
  aspectRatio: string = 'twitter_landscape',
  cacheKey?: string
): Promise<string> {
  try {
    // Generate cache key from content hash or provided key
    const effectiveKey = cacheKey || `${aspectRatio}_${node.innerText.slice(0, 150)}_${node.clientWidth}x${node.clientHeight}`;

    let dataUrl = imageRenderCache.get(effectiveKey);

    if (!dataUrl) {
      dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2.5,
        cacheBust: false,
        backgroundColor: '#FFFFFF',
        style: {
          transform: 'scale(1)',
          margin: '0',
        },
      });

      // Store in memory cache
      if (imageRenderCache.size > 20) {
        // Evict oldest entry if cache grows large
        const firstKey = imageRenderCache.keys().next().value;
        if (firstKey) imageRenderCache.delete(firstKey);
      }
      imageRenderCache.set(effectiveKey, dataUrl);
    }

    // Trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Trigger celebration
    triggerCelebration();

    return dataUrl;
  } catch (error) {
    console.error('Failed to export ballot card image', error);
    throw error;
  }
}

export function triggerCelebration() {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#20C878', '#087443', '#FFFFFF', '#FFD700'],
    });
  } catch (e) {
    // Ignore if canvas confetti is not supported
  }
}
