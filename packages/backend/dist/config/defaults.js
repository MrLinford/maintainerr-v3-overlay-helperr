"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    plex: {
        url: '',
        token: '',
    },
    maintainerr: {
        url: '',
    },
    overlayText: {
        overlayText: 'Leaving',
        useDays: false,
        textToday: 'today',
        textDay: 'in 1 day',
        textDays: 'in {0} days',
        enableDaySuffix: false,
        enableUppercase: false,
        language: 'en-US',
        dateFormat: 'MMM d',
    },
    overlayStyle: {
        fontPath: '/fonts/AvenirNextLTPro-Bold.ttf',
        fontColor: '#FFFFFF',
        backColor: '#B20710',
        fontSize: 5.5,
        padding: 1.5,
        backRadius: 3.0,
        horizontalOffset: 3.0,
        horizontalAlign: 'left',
        verticalOffset: 4.0,
        verticalAlign: 'top',
        overlayBottomCenter: false,
    },
    frame: {
        useFrame: false,
        frameColor: '#B20710',
        frameWidth: 1.5,
        frameRadius: 2.0,
        frameInnerRadius: 2.0,
        frameInnerRadiusMode: 'auto',
        frameInset: 'outside',
        dockStyle: 'pill',
        dockPosition: 'bottom',
    },
    scheduler: {
        cronSchedule: '0 */8 * * *',
        runOnStart: false,
    },
    processing: {
        processCollections: ['*'],
        reapplyOverlay: false,
        forceJpegUpload: false,
        collectionOrderGlobal: 'none',
        collectionAsc: [],
        collectionDesc: [],
    },
    dataDir: './data',
    fontsDir: './fonts',
    timezone: 'UTC',
};
//# sourceMappingURL=defaults.js.map