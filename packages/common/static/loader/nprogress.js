// import nProgress from 'nprogress';

// nProgress.configure({
//   showSpinner: false,
// });

// export const startLoading = () => {
//   console.log('start Loading')
//   // nProgress.start();
// };

// export const endLoading = () => {
//   // nProgress.done();
//   console.log('stop loading')
// };

const clamp = (n, min, max) => n > max ? max : n < min ? min : n;
const toBarPerc = (n) => n - 100;

const camelCase = (val) => {
  return val.replace(/^-ms-/, "ms-").replace(/-([\da-z])/gi, function(_, letter) {
    return letter.toUpperCase();
  });
};
const removeElement = (element) => {
  element && element.parentNode && element.parentNode.removeChild(element);
};

const classList = (element) => (" " + (element && element.className || "") + " ").replace(/\s+/gi, " ");
const addClass = (element, name) => {
  const oldList = classList(element);
  if (hasClass(oldList, name))
    return;
  element.classList.add(name);
};
const removeClass = (element, name) => {
  const oldList = classList(element);
  if (!hasClass(oldList, name))
    return;
  element.classList.remove(name);
};
const hasClass = (element, name) => {
  const list = typeof element === "string" ? element : classList(element);
  return list.indexOf(" " + name + " ") >= 0;
};
const css = /* @__PURE__ */ (() => {
  const cssPrefixes = ["Webkit", "O", "Moz", "ms"];
  const cssProps = {};
  const getVendorProp = (name) => {
    var style = document.body.style;
    if (name in style)
      return name;
    let i = cssPrefixes.length;
    let capName = name.charAt(0).toUpperCase() + name.slice(1);
    while (i--) {
      const vendorName = cssPrefixes[i] + capName;
      if (vendorName in style)
        return vendorName;
    }
    return name;
  };
  const getProp = (name) => {
    name = camelCase(name);
    return cssProps[name] || (cssProps[name] = getVendorProp(name));
  };
  const applyCss = (element, prop, value) => {
    const styleName = getProp(prop);
    element.style[styleName] = value;
  };
  return (element, properties) => {
    for (const prop in properties) {
      const value = properties[prop];
      if (value && Object.prototype.hasOwnProperty.call(properties, prop)) {
        applyCss(element, prop, value);
      }
    }
  };
})();

const isHTMLElement = (val) => val instanceof HTMLElement;
const isFunction = (val) => typeof val === "function";
const isNumber = (val) => typeof val === "number";

const queue = /* @__PURE__ */ (() => {
  const pendding = [];
  const next = () => {
    const fn = pendding.shift();
    isFunction(fn) && fn(next);
  };
  return (fn) => {
    pendding.push(fn);
    if (pendding.length === 1)
      next();
  };
})();

const DEFAULT_SETTINGS = {
  minimum: 1,
  easing: "linear",
  positionUsing: "",
  speed: 200,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: true,
  barSelector: '[role="bar"]',
  spinnerSelector: '[role="spinner"]',
  parent: "body",
  template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
};

const ELEMENT_ID = "nprogress";
class NProgress {
  static settings = DEFAULT_SETTINGS;
  static get isRendered() {
    return !!document.getElementById(ELEMENT_ID);
  }
  static status = null;
  static isStared = typeof NProgress.status === "number";
  static configure(options) {
    const settings = NProgress.settings;
    for (const key in options) {
      const k = key;
      const value = options[k];
      if (value && Object.prototype.hasOwnProperty.call(options, key)) {
        settings[k] = value;
      }
    }
  }
  static set(n) {
    const settings = NProgress.settings;
    n = clamp(n, settings.minimum, 100);
    NProgress.status = n === 100 ? null : n;
    const progress = NProgress.render(+(NProgress.status || 0));
    const bar = progress == null ? void 0 : progress.querySelector(
      NProgress.settings.barSelector
    );
    const speed = NProgress.settings.speed;
    const ease = NProgress.settings.easing;
    progress.offsetWidth;
    queue((next) => {
      if (NProgress.settings.positionUsing === "") {
        NProgress.settings.positionUsing = NProgress.getPositionCss();
      }
      css(bar, this.barPositionCSS(n, speed, ease));
      if (n === 100) {
        css(progress, {
          transition: "none",
          opacity: 1
        });
        progress.offsetWidth;
        setTimeout(function() {
          css(progress, {
            transition: `all ${speed}ms linear`,
            opacity: 0
          });
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });
  }
  static start() {
    if (!NProgress.status)
      NProgress.set(0);
    const work = () => {
      setTimeout(() => {
        if (!NProgress.status)
          return;
        NProgress.trickle();
        work();
      }, NProgress.settings.trickleSpeed);
    };
    if (NProgress.settings.trickle)
      work();
  }
  static done() {
    NProgress.set(100);
  }
  static render(from) {
    if (NProgress.isRendered)
      return document.getElementById(ELEMENT_ID);
    addClass(document.documentElement, "nprogress-busy");
    const progress = document.createElement("div");
    progress.id = ELEMENT_ID;
    progress.innerHTML = NProgress.settings.template;
    const bar = progress.querySelector(
      NProgress.settings.barSelector
    );
    const perc = from ? toBarPerc(from) : "-100";
    const parent = isHTMLElement(NProgress.settings.parent) ? NProgress.settings.parent : document.querySelector(NProgress.settings.parent);
    css(bar, {
      transition: "all 0 linear",
      transform: `translate3d(${perc}%, 0, 0)`
    });
    if (!NProgress.settings.showSpinner) {
      const spinner = document.querySelector(
        NProgress.settings.spinnerSelector
      );
      isHTMLElement(spinner) && removeElement(spinner);
    }
    if (parent !== document.body) {
      addClass(parent, "nprogress-custom-parent");
    }
    parent.append(progress);
    return progress;
  }
  static inc(amount) {
    let n = +(NProgress.status || 0);
    if (!n) {
      return NProgress.start();
    } else if (n > 100) {
      return;
    } else {
      if (!isNumber(amount)) {
        if (n >= 0 && n < 20) {
          amount = 10;
        } else if (n >= 20 && n < 50) {
          amount = 4;
        } else if (n >= 50 && n < 80) {
          amount = 2;
        } else if (n >= 80 && n < 100) {
          amount = 1;
        } else {
          amount = 0;
        }
      }
      n = clamp(n + amount, 0, 90);
      return NProgress.set(n);
    }
  }
  static remove() {
    removeClass(document.documentElement, "nprogress-busy");
    const parent = isHTMLElement(NProgress.settings.parent) ? NProgress.settings.parent : document.querySelector(NProgress.settings.parent);
    removeClass(parent, "nprogress-custom-parent");
    const progress = document.getElementById("nprogress");
    progress && removeElement(progress);
  }
  static getPositionCss() {
    const bodyStyle = document.body.style;
    const vendorPrefix = "WebkitTransform" in bodyStyle ? "Webkit" : "MozTransform" in bodyStyle ? "Moz" : "msTransform" in bodyStyle ? "ms" : "OTransform" in bodyStyle ? "O" : "";
    if (vendorPrefix + "Perspective" in bodyStyle) {
      return "translate3d";
    } else if (vendorPrefix + "Transform" in bodyStyle) {
      return "translate";
    } else {
      return "margin";
    }
  }
  static barPositionCSS(n, speed, ease) {
    let barCSS;
    if (NProgress.settings.positionUsing === "translate3d") {
      barCSS = { transform: `translate3d(${toBarPerc(n)}%, 0, 0)` };
    } else if (NProgress.settings.positionUsing === "translate") {
      barCSS = { transform: `translate(${toBarPerc(n)}%, 0)` };
    } else {
      barCSS = { "margin-left": `${toBarPerc(n)}%` };
    }
    barCSS["transition"] = `all ${speed}ms ${ease}`;
    return barCSS;
  }
  static trickle() {
    return NProgress.inc();
  }
}

export { NProgress as default };
