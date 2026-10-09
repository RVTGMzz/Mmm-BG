import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// CH-18.22: individually editable, original vector puppet parts. QA art only.
// No foreground-background segmentation, 48px upscaling or sprite strip extraction.
const parts = new Map();
const add = (name, w, h, art) => parts.set(name, { w, h, art });

add('coat-back',112,112,`<path d="M30 10 Q10 13 8 42 L7 94 35 106 56 84 75 107 105 96 102 38 Q97 15 78 9 L55 22Z" fill="#525e4c"/><path d="M28 16 48 30 33 51 22 31 M82 16 65 29 85 50 92 30" fill="#79826b"/><rect x="82" y="53" width="14" height="9" rx="2" fill="#b64751"/><circle cx="30" cy="28" r="4" fill="#debe6a"/>`);
add('satchel',48,66,`<path d="M13 18 Q10 6 27 7 Q41 8 39 25" fill="none" stroke="#996a41" stroke-width="7"/><path d="M5 24 Q7 20 14 20 H39 Q46 23 44 32 L43 58 Q25 65 4 57Z" fill="#8f5639"/><path d="M6 33 Q23 43 43 33 L41 45 Q23 51 8 43Z" fill="#b97b4c"/><path d="M22 42 26 35 30 42 26 40 26 46Z" fill="#efc978"/>`);
add('torso',75,75,`<path d="M13 4 Q37 -3 61 4 L72 32 65 69 10 70 3 33Z" fill="#fff4df"/><path d="M25 3 38 19 50 3 54 5 40 29 36 66 31 29 21 5Z" fill="#ead5ba"/><path d="M34 15 H42 L39 62 36 68 32 61 36 26Z" fill="#80503e"/><path d="M15 4 Q12 32 18 66 M59 4 Q62 32 56 67" stroke="#9c683f" fill="none" stroke-width="7"/><rect x="11" y="42" width="11" height="8" rx="2" fill="#d7b465"/><rect x="52" y="42" width="11" height="8" rx="2" fill="#d7b465"/><path d="M7 63 H68 L65 74 H10Z" fill="#74513e"/>`);
add('head',78,81,`<ellipse cx="12" cy="48" rx="9" ry="12" fill="#dfa67f"/><ellipse cx="66" cy="48" rx="9" ry="12" fill="#dfa67f"/><path d="M10 22 Q13 7 39 7 Q65 7 69 28 L66 56 Q57 77 38 77 Q21 77 12 54Z" fill="#e9b58c"/><path d="M25 43 Q29 40 34 44 M45 44 Q51 40 56 43" stroke="#5c413a" fill="none" stroke-width="3"/><path d="M29 61 Q36 56 40 61 Q46 56 53 61" stroke="#4e3b37" fill="none" stroke-width="5"/><path d="M33 69 Q41 76 48 69" stroke="#62463e" fill="none" stroke-width="3"/>`);
add('hair-front',82,40,`<path d="M5 32 Q0 16 22 8 Q36 -1 45 9 Q59 -3 72 7 Q82 14 77 30 Q66 17 57 22 Q44 11 33 27 Q20 20 5 32Z" fill="#4a4744"/><path d="M12 18 Q25 7 35 14 M40 12 Q54 3 62 13 M55 19 Q69 12 75 23" stroke="#a5aba7" fill="none" stroke-width="4"/>`);
add('glasses',77,29,`<rect x="3" y="5" width="32" height="21" rx="5" fill="#e6cf9c" fill-opacity=".1" stroke="#dab861" stroke-width="3.6"/><rect x="42" y="5" width="32" height="21" rx="5" fill="#e6cf9c" fill-opacity=".1" stroke="#dab861" stroke-width="3.6"/><path d="M35 12 Q39 9 42 12" fill="none" stroke="#dab861" stroke-width="3"/><circle cx="21" cy="16" r="2.2" fill="#34302d"/><circle cx="57" cy="16" r="2.2" fill="#34302d"/><path d="M10 5 Q20 1 30 5 M47 5 Q56 1 67 5" stroke="#544038" fill="none" stroke-width="3"/>`);
for (const side of ['left','right']) {
  const left=side==='left';
  add('leg-upper-'+side,30,43,`<path d="M4 4 Q16 -1 27 6 L26 39 Q15 45 4 39Z" fill="${left?'#88654e':'#775641'}"/><path d="M12 9 L14 36" stroke="#b28a6b" fill="none"/>`);
  add('leg-lower-'+side,26,40,`<path d="M4 2 H22 L22 36 Q13 41 3 35Z" fill="${left?'#89634a':'#75513e'}"/><path d="M13 8 L14 32" stroke="#aa8165" fill="none"/>`);
  add('shoe-'+side,36,22,`<path d="M4 5 Q15 2 22 8 L33 11 Q38 17 31 19 H5 Q0 17 4 5Z" fill="#59392f"/><path d="M4 17 H34" stroke="#c2a16b" fill="none" stroke-width="2"/><rect x="18" y="8" width="10" height="4" rx="2" fill="#dfc077"/>`);
  add('arm-upper-'+side,28,47,`<path d="M8 4 Q23 0 26 17 L23 40 Q15 48 3 39 L2 17Z" fill="${left?'#f3e7d6':'#fff0df'}"/><path d="M4 33 H25 V40 Q14 47 4 39Z" fill="#e6d2bb"/>`);
  add('arm-lower-'+side,23,36,`<path d="M4 2 H20 L21 28 Q12 37 3 29Z" fill="#fff2e1"/><path d="M3 25 H21" stroke="#bfa183" fill="none"/><rect x="3" y="21" width="18" height="6" rx="2" fill="${left?'#8d6042':'#d4b366'}"/>`);
  add('hand-'+side,19,22,`<path d="M5 2 Q10 -1 16 5 L17 15 10 21 2 16 2 7Z" fill="#e5ad83"/>`);
}
const dir='public/assets/characters/ch1822/cau-co';
await mkdir(dir,{recursive:true});
for(const [name,p] of parts) {
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+p.w+'" height="'+p.h+'" viewBox="0 0 '+p.w+' '+p.h+'"><g stroke="#4b352d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">'+p.art+'</g></svg>';
  await writeFile(join(dir,name+'.svg'),svg,'utf8');
}
console.log('[ch1822] generated '+parts.size+' editable separated CAU CÓ SVG layers');
