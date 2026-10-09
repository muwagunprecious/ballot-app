import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

export async function exportBallotAsPng(
  node: HTMLElement,
  filename: string = 'my-2027-lineup-ballot.png',
  aspectRatio: string = 'twitter_landscape'
): Promise<string> {
  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#FFFFFF',
      style: {
        transform: 'scale(1)',
        margin: '0',
      },
    });

    // Create trigger link to download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Trigger celebratory confetti
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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#20C878', '#087443', '#FFFFFF', '#FFD700'],
    });
  } catch (e) {
    // Ignore if not supported
  }
}
