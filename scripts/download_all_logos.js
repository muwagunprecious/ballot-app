const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'parties');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const remoteLogos = {
  aa: 'https://inecnigeria.org/_nuxt/action-alliance-aa_logo.DQolkzM6.jpg',
  adp: 'https://inecnigeria.org/_nuxt/action-democratic-party-adp_logo.7qxyEaV2.png',
  app: 'https://inecnigeria.org/_nuxt/action-peoples-party-app_logo.BhRwRU7M.png',
  aac: 'https://inecnigeria.org/_nuxt/african-action-congress-aac_logo.BiPR0ZxO.jpg',
  adc: 'https://inecnigeria.org/_nuxt/african-democratic-congress-adc_logo.DBilnanA.jpg',
  apc: 'https://inecnigeria.org/_nuxt/all-progressives-congress-apc_logo.CSXCWB6p.jpg',
  apga: 'https://inecnigeria.org/_nuxt/all-progressives-grand-alliance-apga_logo.PfgYjSjV.jpg',
  apm: 'https://inecnigeria.org/_nuxt/allied-peoples-movement-apm_logo.BQN54Bkl.jpg',
  bp: 'https://inecnigeria.org/_nuxt/boot-party-bp_logo.Br5O5Wf6.jpg',
  dla: 'https://inecnigeria.org/_nuxt/democratic-leadership-alliance-dla_logo.B-mFJlad.jpg',
  lp: 'https://inecnigeria.org/_nuxt/labour-party-lp_logo.SV1XCjLU.jpg',
  ndp: 'https://inecnigeria.org/_nuxt/national-democratic-party_logo.B2wV2anp.jpg',
  nrm: 'https://inecnigeria.org/_nuxt/national-rescue-movement-nrm_logo.BUg-M2QT.png',
  nnpp: 'https://inecnigeria.org/_nuxt/new-nigeria-peoples-party-nnpp_logo.DkfmFai5.jpg',
  ndc: 'https://inecnigeria.org/_nuxt/nigeria-democratic-congress_logo.BRx6oQl5.jpeg',
  pdp: 'https://inecnigeria.org/_nuxt/peoples-democratic-party-pdp_logo.D7bjcnnk.png',
  prp: 'https://inecnigeria.org/_nuxt/peoples-redemption-party-prp_logo.C8_o4OQI.png',
  sdp: 'https://inecnigeria.org/_nuxt/social-democratic-party-sdp_logo.DhlQ2VXw.png',
  ypp: 'https://inecnigeria.org/_nuxt/young-progressive-party-ypp_logo.Biw28-Pp.jpeg',
  yp: 'https://inecnigeria.org/_nuxt/youth-party-yp_logo.CLRm4uyn.png',
  zlp: 'https://inecnigeria.org/_nuxt/zenith-labour-party-zlp_logo.B_S46I7c.jpg',
};

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
  console.log(`Saved ${dest} (${arrayBuffer.byteLength} bytes)`);
}

async function extractAccord() {
  const text = await (await fetch('https://inecnigeria.org/_nuxt/DKR7bjjL.js')).text();
  const base64Match = text.match(/Gh\s*=\s*"(data:image\/[^;]+;base64,[^"]+)"/);
  if (base64Match) {
    const dataUrl = base64Match[1];
    const base64Data = dataUrl.split(',')[1];
    const dest = path.join(targetDir, 'a.png');
    fs.writeFileSync(dest, Buffer.from(base64Data, 'base64'));
    console.log(`Saved Accord logo to ${dest}`);
  } else {
    // Search for base64 before action-alliance
    const idx = text.indexOf('action-alliance-aa_logo');
    const prev = text.substring(idx - 1500, idx);
    const m = prev.match(/data:image\/[^;]+;base64,([a-zA-Z0-9+/=]+)/);
    if (m) {
      const dest = path.join(targetDir, 'a.png');
      fs.writeFileSync(dest, Buffer.from(m[1], 'base64'));
      console.log(`Saved Accord logo via regex to ${dest}`);
    } else {
      console.error('Could not find base64 for Accord');
    }
  }
}

async function run() {
  console.log('Downloading all 21 party logos from INEC...');
  for (const [key, url] of Object.entries(remoteLogos)) {
    const ext = path.extname(url.split('?')[0]);
    const dest = path.join(targetDir, `${key}${ext}`);
    try {
      await downloadFile(url, dest);
    } catch (e) {
      console.error(`Error downloading ${key}:`, e.message);
    }
  }

  console.log('Extracting Accord (A) logo...');
  await extractAccord();
  console.log('Done downloading all party logos!');
}

run();
