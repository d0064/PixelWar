/*
 * sends events via window.PixelWarEvents to potential
 * Extensions and Userscripts
 * Also check out ui/PixelTransferController.js, which sends received
 *   pixels to a window.registerPixelUpdates callback
 * And check ui/templateLoader.js,which is also at window.templateLoader
 *
 */

/* eslint-disable no-underscore-dangle */

import EventEmitter from 'events';

import { getRenderer } from '../../ui/rendererFactory';

let isActive = false;

const PixelWarEvents = new EventEmitter();

/*
 * Monkey patch the 2D renderer when any extension is subscribed to anything
 * to get live view updates.
 * But at the same time limiting the impact when no extension is running
 */
function monkeyPatchRenderer(renderer) {
  if (!isActive || renderer.is3D || renderer.origUpdateView) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('Extension hooked into Renderer');
  renderer.origUpdateView = renderer.updateView;
  renderer.updateView = function mpUpdateView(...args) {
    const [px, py, pScale] = this._view;
    this.origUpdateView(...args);
    const [x, y, scale] = this._view;
    if (x !== px || y !== py) {
      /*
       * [x, y]: floats of canvas coordinates of the center of the screen,
       */
      PixelWarEvents.emit('setviewcoordinates', [x, y]);
    }
    if (scale !== pScale) {
      // clamp to 1 if origin is given, see src/ui/Renderer2.js#184
      const viewscale = (args[1] && scale > 0.85 && scale < 1.20) ? 1.0 : scale;
      /*
       * viewscale: float of canvas scale aka zoom
       */
      PixelWarEvents.emit('setscale', viewscale);
    }
  };
}

(function mpPixelWarEvents() {
  function setActive() {
    // eslint-disable-next-line no-console
    console.log('Extension active');
    PixelWarEvents.once = PixelWarEvents.origOnce;
    PixelWarEvents.addListener = PixelWarEvents.origAdd;
    PixelWarEvents.on = PixelWarEvents.addListener;
    delete PixelWarEvents.origOnce;
    delete PixelWarEvents.origAdd;
    isActive = true;
    const renderer = getRenderer();
    monkeyPatchRenderer(renderer);
  }
  PixelWarEvents.origOnce = PixelWarEvents.once;
  PixelWarEvents.origAdd = PixelWarEvents.addListener;
  PixelWarEvents.once = function once(...args) {
    PixelWarEvents.origOnce(...args);
    setActive();
  };
  PixelWarEvents.addListener = function addListener(...args) {
    PixelWarEvents.origAdd(...args);
    setActive();
  };
  PixelWarEvents.on = PixelWarEvents.addListener;
}());

export default () => (next) => (action) => {
  const { type } = action;

  switch (type) {
    case 's/SELECT_CANVAS': {
      PixelWarEvents.emit('selectcanvas', action.canvasId);
      break;
    }

    case 'SET_HOVER': {
      /*
       * hover: [x, y] integer canvas coordinates of cursor
       * just used on 2D canvas
       */
      PixelWarEvents.emit('sethover', action.hover);
      break;
    }

    case 'REC_BIG_CHUNK': {
      /*
       * chunk: ChunkRGB or ChunkRGB3D object,
       *        see ui/ChunkRGB.js and ui/ChunkRGB3D.js
       */
      PixelWarEvents.emit('receivechunk', action.chunk);
      break;
    }

    default:
      // nothing
  }

  const ret = next(action);

  switch (type) {
    case 'RELOAD_URL':
    case 's/SELECT_CANVAS':
    case 's/TGL_EASTER_EGG':
    case 's/REC_ME':
      if (isActive) {
        const renderer = getRenderer();
        monkeyPatchRenderer(renderer);
      }
      break;

    default:
      // nothing
  }

  return ret;
};

window.PixelWarEvents = PixelWarEvents;
