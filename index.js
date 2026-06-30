import { Worker } from "node:worker_threads";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerPath = join(__dirname, "worker.js");

const { values } = parseArgs({
  options: {
    workers: { type: "string", short: "w", default: "10" },
    test: { type: "boolean", short: "t", default: false },
  },
  strict: true,
});

const testMode = values.test;

const maxWorkers = parseInt(values.workers, 10);

if (isNaN(maxWorkers) || maxWorkers < 1) {
  console.error("Worker count must be a positive integer.");
  process.exit(1);
}

const urlPatternRoomset = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&roomset={{ROOMSET}}&size=4096x4096&view={{VIEW}}&encoding=webp{{CROP}}{{OUTPUT}}{{ANIMATIONS}}';
const urlPatternNonRoomset = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&size=4096x4096&angle_x={{ANGLEX}}&angle_y={{ANGLEY}}&distance={{DISTANCE}}&encoding=webp{{CROP}}{{OUTPUT}}';
const urlPatternBundleHero = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&angle_x={{ANGLEX}}&angle_y={{ANGLEY}}&distance={{DISTANCE}}&zoom={{ZOOM}}{{CROP}}&size=4096x4096&encoding=webp{{OUTPUT}}';
const urlPatternBundleCard = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&angle_x={{ANGLEX}}&angle_y={{ANGLEY}}&distance={{DISTANCE}}&zoom={{ZOOM}}{{CROP}}&size=4096x4096{{OUTPUT}}&encoding=webp';
const urlPatternBundleMain = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&angle_x={{ANGLEX}}&angle_y={{ANGLEY}}&distance={{DISTANCE}}&zoom={{ZOOM}}{{CROP}}&size=4096x4096&background=eff2f4&encoding=webp{{OUTPUT}}';
const urlPatternBundleSlider = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&angle_x={{ANGLEX}}&angle_y={{ANGLEY}}&distance={{DISTANCE}}&zoom={{ZOOM}}{{CROP}}&size=4096x4096&encoding=webp{{OUTPUT}}';
const urlPatternRangeCard = 'https://vp.img.haze.tools/simba_{{BED}}%20{{STORAGE}}?materials=UPHOLSTERY:{{COLOUR}}%2CLEGS:{{LEGS}}%2CBEDDING:BASEBEDDING%2CHEADBOARDBACK:BASE&angle_x={{ANGLEX}}&angle_y={{ANGLEY}}&distance={{DISTANCE}}&zoom={{ZOOM}}&size=4096x4096{{OUTPUT}}{{CROP}}&encoding=webp';

const outputCoversDesktopMain = [
    '572x353',
    '1144x707',
    '979x605',
    '1958x1210',
    '4096x4096' // zoomed in image
];

const outputCoversDesktopSecondary = [
    '281x173',
    '562x347',
    '484x299',
    '968x598'
];

const outputCoversMobile = [
    '320x320',
    '375x375',
    '768x768',
    '1023x1023',
    '640x640',
    '750x750',
    '1536x1536',
    '2046x2046'
];

const outputCoversBundleHero = [
  '913x500',
  '240x131',
  '275x151',
  '320x175',
  '420x175',
  '480x263',
  '800x438',
  '840x460',
  '960x526'
]

const outputCoversBundleCard = [
  '246x145',
]

const outputCoversBundleMain = [
  '850x500',
  '913x537',
  '240x141',
  '320x188',
  '480x282',
  '840x494',
  '960x565'
]

const outputCoversBundleSlider = [
  '450x250',
]

const outputCoversRangeCard = [
  '246x145',
]

const storageAndLegsAll = [
    { storage: 'No Storage', legs: ['Dark Wood'], optionalAnimations: ''},
    { storage: '4 Drawer', legs: ['Dark Wood'], optionalAnimations: 'RIGHT_STORAGE,RIGHT_BEHINDSTORAGE'},
    { storage: '2 Drawer', legs: ['Dark Wood'], optionalAnimations: 'RIGHT_STORAGE'},
    { storage: 'Bed Frame', legs: ['Brushed Steel', 'Brushed Bronze'], optionalAnimations: ''},
    { storage: 'Ottoman', legs: ['Wooden Wedge'], optionalAnimations: 'LIFT_UP'},
];

const storageAndLegsNoBedframe = [
    { storage: 'No Storage', legs: ['Dark Wood'], optionalAnimations: ''},
    { storage: '4 Drawer', legs: ['Dark Wood'], optionalAnimations: 'RIGHT_STORAGE,RIGHT_BEHINDSTORAGE'},
    { storage: '2 Drawer', legs: ['Dark Wood'], optionalAnimations: 'RIGHT_STORAGE'},
    { storage: 'Ottoman', legs: ['Wooden Wedge'], optionalAnimations: 'LIFT_UP'},
];

const bedsAndRooms = [
    // { bed: 'Hebden Bed', roomset: 'roomset3', storagesAndLegs: storageAndLegsAll},
    // { bed: 'Camden Bed', roomset: 'roomset8', storagesAndLegs: storageAndLegsAll},
    // { bed: 'Putney Bed', roomset: 'roomset5', storagesAndLegs: storageAndLegsNoBedframe},
    // { bed: 'Thorner Bed', roomset: 'roomset10', storagesAndLegs: storageAndLegsAll},
    // { bed: 'Didsbury Bed', roomset: 'roomset15', storagesAndLegs: storageAndLegsAll},
    // { bed: 'Wilmslow Bed', roomset: 'roomset2', storagesAndLegs: storageAndLegsAll},
    // { bed: 'Ludlow Bed', roomset: 'roomset20', storagesAndLegs: storageAndLegsAll},
    { bed: 'Fife Bed', roomset: 'roomset17', storagesAndLegs: storageAndLegsAll},
];

const colours = ['Fossil Grey', 'Oatmeal', 'Taupe', 'Charcoal Grey','Silver Grey', 'Arctic Grey', 'Ebony', 'Ecru','Mole','Chocolate', 'Olive', 'Oxblood', 'Navy', 'Mink', 'Dove', 'Anthracite', 'Cream', 'Latte', 'Nickel', 'Asphalt', 'Stone', 'Mocha'];

const viewsCropsAndOutputs = [
    { view: 'view1', crop: '0x512x3350x3750', outputs: outputCoversDesktopMain, animations: false},
    { view: 'view1', crop: '0x1124x3500x3400', outputs: outputCoversMobile, animations: false},
    { view: 'view2', crop: '200x912x3596x3896', outputs: outputCoversDesktopSecondary, animations: false},
    { view: 'view2', crop: '0x1124x3900x3600', outputs: outputCoversMobile, animations: false},
    { view: 'view3', crop: '0x0x4096x3750', outputs: outputCoversDesktopSecondary, animations: false},
    { view: 'view3', crop: '0x512x4096x4096', outputs: outputCoversMobile, animations: false},
    { view: 'view4', crop: '0x912x3696x4096', outputs: outputCoversDesktopSecondary, animations: false},
    { view: 'view4', crop: '0x768x3750x4096', outputs: outputCoversMobile, animations: false},
    { view: 'view5', crop: '150x700x3800x4096', outputs: outputCoversDesktopSecondary, animations: false},
    { view: 'view5', crop: '', outputs: outputCoversMobile, animations: false},
    { view: 'view6', crop: '0x768x3850x4096', outputs: outputCoversDesktopSecondary, animations: true},
    { view: 'view6', crop: '0x1124x3800x3900', outputs: outputCoversMobile, animations: true},
];

const anglesAndDistances = [
    { angleX: '90.0', angleY: '84.0', distance: '2.5', crop: '0x0x4096x3550', outputs: outputCoversDesktopSecondary},
    { angleX: '90.0', angleY: '84.0', distance: '2.5', crop: '0x0x4096x3550', outputs: outputCoversMobile},
    
];

const anglesDistancesAndZooms = [
  { angleX: '50.0', angleY: '80.0', distance: '3.0', zoom: '1.0', crop: '0x100x4096x3500', outputs: outputCoversBundleHero, urlPattern: urlPatternBundleHero},
  { angleX: '50.0', angleY: '90.0', distance: '2.5', zoom: '1.0', crop: '0x100x4096x3100', outputs: outputCoversBundleCard, urlPattern: urlPatternBundleCard},
  { angleX: '50.0', angleY: '90.0', distance: '2.5', zoom: '1.0', crop: '0x200x4096x3096', outputs: outputCoversBundleMain, urlPattern: urlPatternBundleMain},
  { angleX: '50', angleY: '90', distance: '2.0', zoom: '1.0', crop: '0x50x4096x3100', outputs: outputCoversBundleSlider, urlPattern: urlPatternBundleSlider},
  { angleX: '50.0', angleY: '90.0', distance: '2.5', zoom: '1.0', crop: '0x100x4096x3100', outputs: outputCoversRangeCard, urlPattern: urlPatternRangeCard},
]

// Build all unique URLs
function buildUrls() {
  const seen = new Set();
  const urls = [];

  for (const { bed, roomset, storagesAndLegs } of bedsAndRooms) {
    for (const { storage, legs, optionalAnimations } of storagesAndLegs) {
      for (const leg of legs) {
        for (const colour of colours) {
          for (const { view, crop, outputs, animations } of viewsCropsAndOutputs) {
            if (animations && !optionalAnimations) {
               console.log(`Skipping ${bed} ${storage} ${leg} ${colour} ${view} because animations are required but not available.`);
                continue; // Skip if animations are required but not available for this storage/leg combination
            }
            const cropPart = crop ? `&crop=${crop}` : '';
            const animationsPart = animations ? optionalAnimations ? `&animations=${optionalAnimations}` : '' : '';
            const outputList = outputs?.length ? outputs : [null];

            for (const output of outputList) {
              const outputPart = output ? `&output_cover=${output}` : '';

              const url = urlPatternRoomset
                .replace('{{BED}}', encodeURIComponent(bed))
                .replace('{{STORAGE}}', encodeURIComponent(storage))
                .replace('{{COLOUR}}', encodeURIComponent(colour))
                .replace('{{LEGS}}', encodeURIComponent(leg))
                .replace('{{ROOMSET}}', roomset)
                .replace('{{VIEW}}', view)
                .replace('{{CROP}}', cropPart)
                .replace('{{OUTPUT}}', outputPart)
                .replace('{{ANIMATIONS}}', animationsPart);

              if (!seen.has(url)) {
                seen.add(url);
                urls.push(url);
              }
            }
          }

          for (const { angleX, angleY, distance, crop, outputs } of anglesAndDistances) {
            const cropPart = crop ? `&crop=${crop}` : '';
            const outputList = outputs?.length ? outputs : [null];

            for (const output of outputList) {
              const outputPart = output ? `&output_cover=${output}` : '';

              const url = urlPatternNonRoomset
                .replace('{{BED}}', encodeURIComponent(bed))
                .replace('{{STORAGE}}', encodeURIComponent(storage))
                .replace('{{COLOUR}}', colour)
                .replace('{{LEGS}}', encodeURIComponent(leg))
                .replace('{{ANGLEX}}', angleX)
                .replace('{{ANGLEY}}', angleY)
                .replace('{{DISTANCE}}', distance)
                .replace('{{CROP}}', cropPart)
                .replace('{{OUTPUT}}', outputPart);

              if (!seen.has(url)) {
                seen.add(url);
                urls.push(url);
              }
            }
          }

          for (const { angleX, angleY, distance, zoom, crop, outputs, urlPattern } of anglesDistancesAndZooms) {
            const cropPart = crop ? `&crop=${crop}` : '';
            const outputList = outputs?.length ? outputs : [null];

            for (const output of outputList) {
              const outputPart = output ? `&output_cover=${output}` : '';

              const url = urlPattern
                .replace('{{BED}}', encodeURIComponent(bed))
                .replace('{{STORAGE}}', encodeURIComponent(storage))
                .replace('{{COLOUR}}', colour)
                .replace('{{LEGS}}', encodeURIComponent(leg))
                .replace('{{ANGLEX}}', angleX)
                .replace('{{ANGLEY}}', angleY)
                .replace('{{DISTANCE}}', distance)
                .replace('{{ZOOM}}', zoom)
                .replace('{{CROP}}', cropPart)
                .replace('{{OUTPUT}}', outputPart);

              if (!seen.has(url)) {
                seen.add(url);
                urls.push(url);
              }
            }
          }
        }
      }
    }
  }

  return urls;
}

const urls = buildUrls();

if (testMode) {
  for (const url of urls) {
    console.log(url);
  }

  console.log(`Generated ${urls.length} URL(s) (test mode):\n`);
  process.exit(0);
}

const workerCount = Math.min(maxWorkers, urls.length);

console.log(`Generated ${urls.length} URL(s), fetching with ${workerCount} worker(s)...\n`);

const start = performance.now();
let urlIndex = 0;
let completed = 0;
let succeeded = 0;
let failed = 0;

function sendNextUrl(worker) {
  if (urlIndex < urls.length) {
    worker.postMessage({ url: urls[urlIndex++] });
  } else {
    worker.postMessage({ type: "done" });
  }
}

for (let i = 0; i < workerCount; i++) {
  const worker = new Worker(workerPath, {
    workerData: { workerId: i + 1 },
  });

  worker.on("message", (msg) => {
    if (msg.type === "ready") {
      sendNextUrl(worker);
      return;
    }

    completed++;
    if (msg.success) {
      succeeded++;
      console.log(`[${completed}/${urls.length}] Worker ${msg.workerId}: ${msg.bytes} bytes - ${msg.url}`);
    } else {
      failed++;
      console.error(`[${completed}/${urls.length}] Worker ${msg.workerId}: FAILED ${msg.error} - ${msg.url}`);
    }

    sendNextUrl(worker);

    if (completed === urls.length) {
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      console.log(`\nDone in ${elapsed}s — ${succeeded} succeeded, ${failed} failed out of ${urls.length} URLs`);
    }
  });

  worker.on("error", (err) => {
    console.error(`Worker ${i + 1}: thread error - ${err.message}`);
  });
}

