/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/dezalgo";
exports.ids = ["vendor-chunks/dezalgo"];
exports.modules = {

/***/ "(rsc)/./node_modules/dezalgo/dezalgo.js":
/*!*****************************************!*\
  !*** ./node_modules/dezalgo/dezalgo.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var wrappy = __webpack_require__(/*! wrappy */ \"(rsc)/./node_modules/wrappy/wrappy.js\")\nmodule.exports = wrappy(dezalgo)\n\nvar asap = __webpack_require__(/*! asap */ \"(rsc)/./node_modules/asap/asap.js\")\n\nfunction dezalgo (cb) {\n  var sync = true\n  asap(function () {\n    sync = false\n  })\n\n  return function zalgoSafe() {\n    var args = arguments\n    var me = this\n    if (sync)\n      asap(function() {\n        cb.apply(me, args)\n      })\n    else\n      cb.apply(me, args)\n  }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZGV6YWxnby9kZXphbGdvLmpzIiwibWFwcGluZ3MiOiJBQUFBLGFBQWEsbUJBQU8sQ0FBQyxxREFBUTtBQUM3Qjs7QUFFQSxXQUFXLG1CQUFPLENBQUMsK0NBQU07O0FBRXpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcRWxkZXJcXERlc2t0b3BcXEVsZGVyXFxwcm9qZWN0c1xcbWVldGluZy1hc3Npc3RhbnQtbXZwXFxub2RlX21vZHVsZXNcXGRlemFsZ29cXGRlemFsZ28uanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHdyYXBweSA9IHJlcXVpcmUoJ3dyYXBweScpXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXBweShkZXphbGdvKVxuXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5mdW5jdGlvbiBkZXphbGdvIChjYikge1xuICB2YXIgc3luYyA9IHRydWVcbiAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgc3luYyA9IGZhbHNlXG4gIH0pXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHphbGdvU2FmZSgpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50c1xuICAgIHZhciBtZSA9IHRoaXNcbiAgICBpZiAoc3luYylcbiAgICAgIGFzYXAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNiLmFwcGx5KG1lLCBhcmdzKVxuICAgICAgfSlcbiAgICBlbHNlXG4gICAgICBjYi5hcHBseShtZSwgYXJncylcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/dezalgo/dezalgo.js\n");

/***/ })

};
;