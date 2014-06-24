var powerTip = {
	create : function(inputId, data, popupId, top, left) {
		jQuery("#"+popupId).remove();
		tipElement = jQuery('<div/>', { id: popupId, html: data})
			.attr("class", "n")
			.css("top", top)
			.css("left", left)
			.css("display", "block");
		jQuery("#"+inputId).parent().append(tipElement);
	},
	hide : function(popupId) {
		jQuery("#"+popupId).remove();
	}
};
var LiveAddress=function(){function f(e,t,n,r){var i=document.getElementById(e);return l({street:i?i.value:e},t,n,r)}function l(e,t,n,i){if(!e)return null;var o=[],u={};var a="batch_"+s++;e=e instanceof Array?e:[e];r[a]={size:e.length,returned:0,json:[],userCallback:t,wrap:i||function(e){return e}};for(var f in e)o.push(c(e[f],a,f,n));return o}function c(e,t,r,i){var o={fields:e};o.id="addr_"+s++;o.inputIndex=parseInt(r,10);o.json=[];o.batch=t;o.userTimeout=i;o.callback=function(e){d(o.id,e)};n[o.id]=o;return o.id}function h(r){var i=n[r],s;if(e&&t)s="?auth-id="+e+"&auth-token="+t+"&candidates="+o;else s="?auth-token="+e+"&candidates="+o;for(var u in i.fields)s+="&"+u+"="+encodeURIComponent(i.fields[u]);s+="&callback="+encodeURIComponent('LiveAddress.request("'+r+'").callback');return s}function p(e){for(var t in e){var r=document.createElement("script");r.src="https://api.smartystreets.com/street-address"+h(e[t]);document.getElementsByTagName("head")[0].appendChild(r);n[e[t]].DOM=r;i[e[t]]={attempts:i[e[t]]?i[e[t]].attempts||0:0,timeoutID:setTimeout(v(e[t]),u)}}}function d(e,t){var s=n[e];var o=r[s.batch];for(var u in t)t[u].input_index=s.inputIndex;o.json=o.json.concat(t);document.getElementsByTagName("head")[0].removeChild(s.DOM);delete n[e];clearTimeout(i[e].timeoutID);delete i[e];if(++o.returned==o.size){var a=o.userCallback(o.wrap(o.json));delete r[s.batch];return a}}function v(e){return function(){if(++i[e].attempts<a)p([e]);else if(typeof n[e].userTimeout==="function")n[e].userTimeout(n[e].fields)}}function m(e){if(!e||typeof e!=="object")return undefined;return{lat:e.metadata.latitude,lon:e.metadata.longitude,precision:e.metadata.precision,coords:e.metadata.latitude+", "+e.metadata.longitude}}var e,t;var n={};var r={};var i={};var s=0;var o=5;var u=3500;var a=3;return{init:function(n,r){e=encodeURIComponent(n||"");t=encodeURIComponent(r||"")},verify:function(e,t,n,r){var i;if(typeof e==="string")i=f(e,t,n,r);else if(typeof e==="object"&&!(e instanceof Array))i=l(e,t,n,r);else if(e instanceof Array){var s=[];for(var o in e){if(typeof e[o]=="string"){var u=document.getElementById(e);s.push({street:u?u.value:e[o]})}else s.push(e[o])}i=l(s,t,n,r)}p(i)},request:function(e){return n[e]},geocode:function(e,t,n){this.verify(e,t,n,function(e){if(e.length==1)return m(e[0]);else{var t=[];for(var n in e)t.push(m(e[n]));return t}})},components:function(e,t,n){this.verify(e,t,n,function(e){var t=[];for(var n in e){e[n].components.first_line=e[n].delivery_line_1;if(typeof e[n].delivery_line_2!=="undefined")e[n].components.first_line+=" "+e[n].delivery_line_2;e[n].components.last_line=e[n].last_line;if(typeof e[n].addressee!=="undefined")e[n].components.addressee=e[n].addressee;t.push(e[n].components)}return t})},county:function(e,t,n){this.verify(e,t,n,function(e){return e[0].metadata.county_name})}}}();
LiveAddress.init("3180588111764645130");
/*! vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.1.8 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.1.8',
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        ap = Array.prototype,
        apsp = ap.splice,
        isBrowser = !!(typeof window !== 'undefined' && navigator && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value !== 'string') {
                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite and existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
            //registry of just enabled modules, to speed
            //cycle breaking code when lots of modules
            //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; ary[i]; i += 1) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                        //End of the line. Keep at least one non-dot
                        //path segment at the front so it can be mapped
                        //correctly to disk. Otherwise, there is likely
                        //no path mapping for a path starting with '..'.
                        //This can still fail, but catches the most reasonable
                        //uses of ..
                        break;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgName, pkgConfig, mapValue, nameParts, i, j, nameSegment,
                foundMap, foundI, foundStarMap, starI,
                baseParts = baseName && baseName.split('/'),
                normalizedBaseParts = baseParts,
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name && name.charAt(0) === '.') {
                //If have a base name, try to normalize against it,
                //otherwise, assume it is a top-level require that will
                //be relative to baseUrl in the end.
                if (baseName) {
                    if (getOwn(config.pkgs, baseName)) {
                        //If the baseName is a package name, then just treat it as one
                        //name to concat the name with.
                        normalizedBaseParts = baseParts = [baseName];
                    } else {
                        //Convert baseName to array, and lop off the last part,
                        //so that . matches that 'directory' and not name of the baseName's
                        //module. For instance, baseName of 'one/two/three', maps to
                        //'one/two/three.js', but we want the directory, 'one/two' for
                        //this normalization.
                        normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    }

                    name = normalizedBaseParts.concat(name.split('/'));
                    trimDots(name);

                    //Some use of packages may use a . path to reference the
                    //'main' module name, so normalize for that.
                    pkgConfig = getOwn(config.pkgs, (pkgName = name[0]));
                    name = name.join('/');
                    if (pkgConfig && name === pkgName + '/' + pkgConfig.main) {
                        name = pkgName;
                    }
                } else if (name.indexOf('./') === 0) {
                    // No baseName, so this is ID is resolved relative
                    // to baseUrl, pull off the leading dot.
                    name = name.substring(2);
                }
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break;
                                }
                            }
                        }
                    }

                    if (foundMap) {
                        break;
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            return name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                removeScript(id);
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);
                context.require([id]);
                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        normalizedName = normalize(name, parentName, applyMap);
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                //Array splice in the values since the context code has a
                //local var ref to defQueue, so cannot just reassign the one
                //on context.
                apsp.apply(defQueue,
                           [defQueue.length - 1, 0].concat(globalDefQueue));
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return mod.exports;
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            var c,
                                pkg = getOwn(config.pkgs, mod.map.id);
                            // For packages, only support config targeted
                            // at the main module.
                            c = pkg ? getOwn(config.config, mod.map.id + '/' + pkg.main) :
                                      getOwn(config.config, mod.map.id);
                            return  c || {};
                        },
                        exports: defined[mod.map.id]
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var map, modId, err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                map = mod.map;
                modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    this.fetch();
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if ((this.events.error && this.map.isDefine) ||
                                req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            if (this.map.isDefine) {
                                //If setting exports via 'module' is in play,
                                //favor that over return value and exports. After that,
                                //favor a non-undefined return value over exports use.
                                cjsModule = this.module;
                                if (cjsModule &&
                                        cjsModule.exports !== undefined &&
                                        //Make sure it is not already the exports value
                                        cjsModule.exports !== this.exports) {
                                    exports = cjsModule.exports;
                                } else if (exports === undefined && this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                req.onResourceLoad(context, this.map, this.depMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' + args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                //Save off the paths and packages since they require special processing,
                //they are additive.
                var pkgs = config.pkgs,
                    shim = config.shim,
                    objs = {
                        paths: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (prop === 'map') {
                            if (!config.map) {
                                config.map = {};
                            }
                            mixin(config[prop], value, true, true);
                        } else {
                            mixin(config[prop], value, true);
                        }
                    } else {
                        config[prop] = value;
                    }
                });

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location;

                        pkgObj = typeof pkgObj === 'string' ? { name: pkgObj } : pkgObj;
                        location = pkgObj.location;

                        //Create a brand new object on pkgs, since currentPackages can
                        //be passed in again, and config.pkgs is the internal transformed
                        //state for all package configs.
                        pkgs[pkgObj.name] = {
                            name: pkgObj.name,
                            location: location || pkgObj.name,
                            //Remove leading dot in main, so main paths are normalized,
                            //and remove any trailing .js, since different package
                            //envs have different conventions: some use a module name,
                            //some use a file name.
                            main: (pkgObj.main || 'main')
                                  .replace(currDirRegExp, '')
                                  .replace(jsSuffixRegExp, '')
                        };
                    });

                    //Done with modifications, assing packages back to context config
                    config.pkgs = pkgs;
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext,  true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overriden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, pkgs, pkg, pkgPath, syms, i, parentModule, url,
                    parentPath;

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;
                    pkgs = config.pkgs;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');
                        pkg = getOwn(pkgs, parentModule);
                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        } else if (pkg) {
                            //If module name is just the package name, then looking
                            //for the main module.
                            if (moduleName === pkg.name) {
                                pkgPath = pkg.location + '/' + pkg.main;
                            } else {
                                pkgPath = pkg.location;
                            }
                            syms.splice(0, i, pkgPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs ? url +
                                        ((url.indexOf('?') === -1 ? '?' : '&') +
                                         config.urlArgs) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    return onError(makeError('scripterror', 'Script error for: ' + data.id, evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;

    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
                document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/jrburke/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/jrburke/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation that a build has been done so that
                //only one script needs to be loaded anyway. This may need to be
                //reevaluated if other use cases become common.
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one.
                if (!cfg.baseUrl) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                 //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, '')
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        (context ? context.defQueue : globalDefQueue).push([name, deps, callback]);
    };

    define.amd = {
        jQuery: true
    };


    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this));

//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

/*!
 * jQuery JavaScript Library v1.10.2
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03T13:48Z
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<10
	// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	location = window.location,
	document = window.document,
	docElem = document.documentElement,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.10.2",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
try{
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
}
catch(ex)
{
return false;
}
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( jQuery.support.ownLast ) {
			for ( key in obj ) {
				return core_hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations.
	// Note: this method belongs to the css module but it's needed here for the support module.
	// If support gets modularized, this method should be moved back to the css module.
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
/*!
 * Sizzle CSS Selector Engine v1.10.2
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03
 */
(function( window, undefined ) {

var i,
	support,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	hasDuplicate = false,
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rsibling = new RegExp( whitespace + "*[+~]" ),
	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent.attachEvent && parent !== parent.top ) {
		parent.attachEvent( "onbeforeunload", function() {
			setDocument();
		});
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Support: Opera 10-12/IE8
			// ^= $= *= and empty values
			// Should not select anything
			// Support: Windows 8 Native Apps
			// The type attribute is restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "t", "" );

			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === doc || contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === doc || contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val === undefined ?
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null :
		val;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] && match[4] !== undefined ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}
				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return (val = elem.getAttributeNode( name )) && val.specified ?
				val.value :
				elem[ name ] === true ? name.toLowerCase() : null;
		}
	});
}

jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function( support ) {

	var all, a, input, select, fragment, opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Finish early in limited (non-browser) environments
	all = div.getElementsByTagName("*") || [];
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !a || !a.style || !all.length ) {
		return support;
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";

	// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName("tbody").length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName("link").length;

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute("style") );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute("href") === "/a";

	// Make sure that element opacity exists
	// (IE uses filter instead)
	// Use a regex to work around a WebKit issue. See #5145
	support.opacity = /^0.5/.test( a.style.opacity );

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!a.style.cssFloat;

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement("form").enctype;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone = document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Will be defined later
	support.inlineBlockNeedsLayout = false;
	support.shrinkWrapBlocks = false;
	support.pixelPosition = false;
	support.deleteExpando = true;
	support.noCloneEvent = true;
	support.reliableMarginRight = true;
	support.boxSizingReliable = true;

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Support: IE<9
	// Iteration over object's inherited properties before its own.
	for ( i in jQuery( support ) ) {
		break;
	}
	support.ownLast = i !== "0";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior.
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";

		// Workaround failing boxSizing test due to offsetWidth returning wrong value
		// with some non-1 values of body zoom, ticket #13543
		jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
			support.boxSizing = div.offsetWidth === 4;
		});

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})({});

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"applet": true,
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			data = null,
			i = 0,
			elem = this[0];

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( name.indexOf("data-") === 0 ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each(function() {
				jQuery.data( this, key, value );
			}) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n\f]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// Use proper attribute retrieval(#6932, #12072)
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;
					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						-1;
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

	jQuery.expr.attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?
		function( elem, name, isXML ) {
			var fn = jQuery.expr.attrHandle[ name ],
				ret = isXML ?
					undefined :
					/* jshint eqeqeq: false */
					(jQuery.expr.attrHandle[ name ] = undefined) !=
						getter( elem, name, isXML ) ?

						name.toLowerCase() :
						null;
			jQuery.expr.attrHandle[ name ] = fn;
			return ret;
		} :
		function( elem, name, isXML ) {
			return isXML ?
				undefined :
				elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
		};
});

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};
	jQuery.expr.attrHandle.id = jQuery.expr.attrHandle.name = jQuery.expr.attrHandle.coords =
		// Some attributes are constructed with empty-string values when not defined
		function( elem, name, isXML ) {
			var ret;
			return isXML ?
				undefined :
				(ret = elem.getAttributeNode( name )) && ret.value !== "" ?
					ret.value :
					null;
		};
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ret.specified ?
				ret.value :
				undefined;
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !jQuery.support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
var isSimple = /^.[^:#\[\.,]*$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},

	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					cur = ret.push( cur );
					break;
				}
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.unique( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			}));
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var
			// Snapshot the DOM in case .domManip sweeps something relevant into its fragment
			args = jQuery.map( this, function( elem ) {
				return [ elem.nextSibling, elem.parentNode ];
			}),
			i = 0;

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			var next = args[ i++ ],
				parent = args[ i++ ];

			if ( parent ) {
				// Don't use the snapshot next if it has moved (#13810)
				if ( next && next.parentNode !== parent ) {
					next = this.nextSibling;
				}
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		// Allow new content to include elements from the context set
		}, true );

		// Force removal if there was no new content (e.g., from empty arguments)
		return i ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback, allowIntersection ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback, allowIntersection );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[i], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery._evalUrl( node.src );
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (jQuery.find.attr( elem, "type" ) !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	},

	_evalUrl: function( url ) {
		return jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		});
	}
});
jQuery.fn.extend({
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			status = jqXHR.getResponseHeader('Custom-Header-Status') || status;
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || docElem;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	// Expose jQuery as module.exports in loaders that implement the Node
	// module pattern (including browserify). Do not create the global, since
	// the user will be storing it themselves locally, and globals are frowned
	// upon in the Node module world.
	module.exports = jQuery;
} else {
	// Otherwise expose jQuery to the global object as usual
	window.jQuery = window.$ = jQuery;

	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return jQuery; } );
	}
}

})( window );

/*!
 * Backbone.js 1.0.0

 * (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * Backbone may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://backbonejs.org
 */

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.0.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    _.extend(this, _.pick(options, modelOptions));
    if (options.parse) attrs = this.parse(attrs, options) || {};
    if (defaults = _.result(this, 'defaults')) {
      attrs = _.defaults({}, attrs, defaults);
    }
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // A list of options to be attached directly to the model, if provided.
  var modelOptions = ['url', 'urlRoot', 'collection'];

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
    
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }
      console.log('attr');
      console.log(attrs);
      console.log('options');
      console.log(options);
      // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
      if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

      options = _.extend({validate: true}, options);

      // Do not persist invalid models.
      if (!this._validate(attrs, options)) return false;

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.url) this.url = options.url;
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, merge: false, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.defaults(options || {}, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults(options || {}, setOptions);
      if (options.parse) models = this.parse(models, options);
      if (!_.isArray(models)) models = models ? [models] : [];
      var i, l, model, attrs, existing, sort;
      var at = options.at;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        if (!(model = this._prepareModel(models[i], options))) continue;

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(model)) {
          if (options.remove) modelMap[existing.cid] = true;
          if (options.merge) {
            existing.set(model.attributes, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }

        // This is a new model, push it to the `toAdd` list.
        } else if (options.add) {
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
      }

      // Remove nonexistent models if appropriate.
      if (options.remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          splice.apply(this.models, [at, 0].concat(toAdd));
        } else {
          push.apply(this.models, toAdd);
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      if (options.silent) return this;

      // Trigger `add` events.
      for (i = 0, l = toAdd.length; i < l; i++) {
        (model = toAdd[i]).trigger('add', model, this, options);
      }

      // Trigger `sort` if the collection was sorted.
      if (sort) this.trigger('sort', this, options);
      return this;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: this.length}, options));
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function(begin, end) {
      return this.models.slice(begin, end);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id != null ? obj.id : obj.cid || obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Figure out the smallest index at which a model should be inserted so as
    // to maintain order.
    sortedIndex: function(model, value, context) {
      value || (value = this.comparator);
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _.sortedIndex(this.models, model, iterator, context);
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options || (options = {});
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model._validate(attrs, options)) {
        this.trigger('invalid', this, attrs, options);
        return false;
      }
      return model;
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
    'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(e.g. model, collection, id, className)* are
    // attached directly to the view.  See `viewOptions` for an exhaustive
    // list.
    _configure: function(options) {
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, viewOptions));
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && window.ActiveXObject &&
          !(window.external && window.external.msActiveXFilteringEnabled)) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional){
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      fragment = this.getFragment(fragment || '');
      if (this.fragment === fragment) return;
      this.fragment = fragment;
      var url = this.root + fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function (model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

}).call(this);

Backbone.Validation = (function(_){
  'use strict';

  // Default options
  // ---------------

  var defaultOptions = {
    forceUpdate: false,
    selector: 'name',
    labelFormatter: 'sentenceCase',
    valid: Function.prototype,
    invalid: Function.prototype
  };


  // Helper functions
  // ----------------

  // Formatting functions used for formatting error messages
  var formatFunctions = {
    // Uses the configured label formatter to format the attribute name
    // to make it more readable for the user
    formatLabel: function(attrName, model) {
      return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
    },

    // Replaces nummeric placeholders like {0} in a string with arguments
    // passed to the function
    format: function() {
      var args = Array.prototype.slice.call(arguments),
          text = args.shift();
      return text.replace(/\{(\d+)\}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    }
  };

  // Flattens an object
  // eg:
  //
  //     var o = {
  //       address: {
  //         street: 'Street',
  //         zip: 1234
  //       }
  //     };
  //
  // becomes:
  //
  //     var o = {
  //       'address.street': 'Street',
  //       'address.zip': 1234
  //     };
  var flatten = function (obj, into, prefix) {
    into = into || {};
    prefix = prefix || '';

    _.each(obj, function(val, key) {
      if(obj.hasOwnProperty(key)) {
        if (val && typeof val === 'object' && !(
          val instanceof Date ||
          val instanceof RegExp ||
          val instanceof Backbone.Model ||
          val instanceof Backbone.Collection)
        ) {
          flatten(val, into, prefix + key + '.');
        }
        else {
          into[prefix + key] = val;
        }
      }
    });

    return into;
  };

  // Validation
  // ----------

  var Validation = (function(){

    // Returns an object with undefined properties for all
    // attributes on the model that has defined one or more
    // validation rules.
    var getValidatedAttrs = function(model) {
      return _.reduce(_.keys(model.validation || {}), function(memo, key) {
        memo[key] = void 0;
        return memo;
      }, {});
    };

    // Looks on the model for validations for a specified
    // attribute. Returns an array of any validators defined,
    // or an empty array if none is defined.
    var getValidators = function(model, attr) {
      var attrValidationSet = model.validation ? model.validation[attr] || {} : {};

      // If the validator is a function or a string, wrap it in a function validator
      if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
        attrValidationSet = {
          fn: attrValidationSet
        };
      }

      // Stick the validator object into an array
      if(!_.isArray(attrValidationSet)) {
        attrValidationSet = [attrValidationSet];
      }

      // Reduces the array of validators into a new array with objects
      // with a validation method to call, the value to validate against
      // and the specified error message, if any
      return _.reduce(attrValidationSet, function(memo, attrValidation) {
        _.each(_.without(_.keys(attrValidation), 'msg'), function(validator) {
          memo.push({
            fn: defaultValidators[validator],
            val: attrValidation[validator],
            msg: attrValidation.msg
          });
        });
        return memo;
      }, []);
    };

    // Validates an attribute against all validators defined
    // for that attribute. If one or more errors are found,
    // the first error message is returned.
    // If the attribute is valid, an empty string is returned.
    var validateAttr = function(model, attr, value, computed) {
      // Reduces the array of validators to an error message by
      // applying all the validators and returning the first error
      // message, if any.
      return _.reduce(getValidators(model, attr), function(memo, validator){
        // Pass the format functions plus the default
        // validators as the context to the validator
        var ctx = _.extend({}, formatFunctions, defaultValidators),
            result = validator.fn.call(ctx, value, attr, validator.val, model, computed);

        if(result === false || memo === false) {
          return false;
        }
        if (result && !memo) {
          return validator.msg || result;
        }
        return memo;
      }, '');
    };

    // Loops through the model's attributes and validates them all.
    // Returns and object containing names of invalid attributes
    // as well as error messages.
    var validateModel = function(model, attrs) {
      var error,
          invalidAttrs = {},
          isValid = true,
          computed = _.clone(attrs),
          flattened = flatten(attrs);

      _.each(flattened, function(val, attr) {
        error = validateAttr(model, attr, val, computed);
        if (error) {
          invalidAttrs[attr] = error;
          isValid = false;
        }
      });

      return {
        invalidAttrs: invalidAttrs,
        isValid: isValid
      };
    };

    // Contains the methods that are mixed in on the model when binding
    var mixin = function(view, options) {
      return {

        // Check whether or not a value passes validation
        // without updating the model
        preValidate: function(attr, value) {
          return validateAttr(this, attr, value, _.extend({}, this.attributes));
        },

        // Check to see if an attribute, an array of attributes or the
        // entire model is valid. Passing true will force a validation
        // of the model.
        isValid: function(option) {
          var flattened = flatten(this.attributes);

          if(_.isString(option)){
            return !validateAttr(this, option, flattened[option], _.extend({}, this.attributes));
          }
          if(_.isArray(option)){
            return _.reduce(option, function(memo, attr) {
              return memo && !validateAttr(this, attr, flattened[attr], _.extend({}, this.attributes));
            }, true, this);
          }
          if(option === true) {
            this.validate();
          }
          return this.validation ? this._isValid : true;
        },

        // This is called by Backbone when it needs to perform validation.
        // You can call it manually without any parameters to validate the
        // entire model.
        validate: function(attrs, setOptions){
          var model = this,
              validateAll = !attrs,
              opt = _.extend({}, options, setOptions),
              validatedAttrs = getValidatedAttrs(model),
              allAttrs = _.extend({}, validatedAttrs, model.attributes, attrs),
              changedAttrs = flatten(attrs || allAttrs),

              result = validateModel(model, allAttrs);

          model._isValid = result.isValid;

          // After validation is performed, loop through all changed attributes
          // and call the valid callbacks so the view is updated.
          _.each(validatedAttrs, function(val, attr){
            var invalid = result.invalidAttrs.hasOwnProperty(attr);
            if(!invalid){
              opt.valid(view, attr, opt.selector);
            }
          });

          // After validation is performed, loop through all changed attributes
          // and call the invalid callback so the view is updated.
          _.each(validatedAttrs, function(val, attr){
            var invalid = result.invalidAttrs.hasOwnProperty(attr),
                changed = changedAttrs.hasOwnProperty(attr);

            if(invalid && (changed || validateAll)){
              opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector);
            }
          });

          // Trigger validated events.
          // Need to defer this so the model is actually updated before
          // the event is triggered.
          _.defer(function() {
            model.trigger('validated', model._isValid, model, result.invalidAttrs);
            model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
          });

          // Return any error messages to Backbone, unless the forceUpdate flag is set.
          // Then we do not return anything and fools Backbone to believe the validation was
          // a success. That way Backbone will update the model regardless.
          if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
            return result.invalidAttrs;
          }
        }
      };
    };

    // Helper to mix in validation on a model
    var bindModel = function(view, model, options) {
      _.extend(model, mixin(view, options));
    };

    // Removes the methods added to a model
    var unbindModel = function(model) {
      delete model.validate;
      delete model.preValidate;
      delete model.isValid;
    };

    // Mix in validation on a model whenever a model is
    // added to a collection
    var collectionAdd = function(model) {
      bindModel(this.view, model, this.options);
    };

    // Remove validation from a model whenever a model is
    // removed from a collection
    var collectionRemove = function(model) {
      unbindModel(model);
    };

    // Returns the public methods on Backbone.Validation
    return {

      // Current version of the library
      version: '0.8.0',

      // Called to configure the default options
      configure: function(options) {
        _.extend(defaultOptions, options);
      },

      // Hooks up validation on a view with a model
      // or collection
      bind: function(view, options) {
        var model = view.model,
            collection = view.collection;

        options = _.extend({}, defaultOptions, defaultCallbacks, options);

        if(typeof model === 'undefined' && typeof collection === 'undefined'){
          throw 'Before you execute the binding your view must have a model or a collection.\n' +
                'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
        }

        if(model) {
          bindModel(view, model, options);
        }
        else if(collection) {
          collection.each(function(model){
            bindModel(view, model, options);
          });
          collection.bind('add', collectionAdd, {view: view, options: options});
          collection.bind('remove', collectionRemove);
        }
      },

      // Removes validation from a view with a model
      // or collection
      unbind: function(view) {
        var model = view.model,
            collection = view.collection;

        if(model) {
          unbindModel(view.model);
        }
        if(collection) {
          collection.each(function(model){
            unbindModel(model);
          });
          collection.unbind('add', collectionAdd);
          collection.unbind('remove', collectionRemove);
        }
      },

      // Used to extend the Backbone.Model.prototype
      // with validation
      mixin: mixin(null, defaultOptions)
    };
  }());


  // Callbacks
  // ---------

  var defaultCallbacks = Validation.callbacks = {

    // Gets called when a previously invalid field in the
    // view becomes valid. Removes any error message.
    // Should be overridden with custom functionality.
    valid: function(view, attr, selector) {
      view.$('[' + selector + '~="' + attr + '"]')
          .removeClass('invalid')
          .removeAttr('data-error');
    },

    // Gets called when a field in the view becomes invalid.
    // Adds a error message.
    // Should be overridden with custom functionality.
    invalid: function(view, attr, error, selector) {
      view.$('[' + selector + '~="' + attr + '"]')
          .addClass('invalid')
          .attr('data-error', error);
    }
  };


  // Patterns
  // --------

  var defaultPatterns = Validation.patterns = {
    // Matches any digit(s) (i.e. 0-9)
    digits: /^\d+$/,

    // Matched any number (e.g. 100.000)
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

    // Matches a valid email address (e.g. mail@example.com)
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

    // Mathes any valid url (e.g. http://www.xample.com)
    url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
  };


  // Error messages
  // --------------

  // Error message for the build in validators.
  // {x} gets swapped out with arguments form the validator.
  var defaultMessages = Validation.messages = {
    required: '{0} is required',
    acceptance: '{0} must be accepted',
    min: '{0} must be greater than or equal to {1}',
    max: '{0} must be less than or equal to {1}',
    range: '{0} must be between {1} and {2}',
    length: '{0} must be {1} characters',
    minLength: '{0} must be at least {1} characters',
    maxLength: '{0} must be at most {1} characters',
    rangeLength: '{0} must be between {1} and {2} characters',
    oneOf: '{0} must be one of: {1}',
    equalTo: '{0} must be the same as {1}',
    pattern: '{0} must be a valid {1}'
  };

  // Label formatters
  // ----------------

  // Label formatters are used to convert the attribute name
  // to a more human friendly label when using the built in
  // error messages.
  // Configure which one to use with a call to
  //
  //     Backbone.Validation.configure({
  //       labelFormatter: 'label'
  //     });
  var defaultLabelFormatters = Validation.labelFormatters = {

    // Returns the attribute name with applying any formatting
    none: function(attrName) {
      return attrName;
    },

    // Converts attributeName or attribute_name to Attribute name
    sentenceCase: function(attrName) {
      return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function(match, index) {
        return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
      }).replace('_', ' ');
    },

    // Looks for a label configured on the model and returns it
    //
    //      var Model = Backbone.Model.extend({
    //        validation: {
    //          someAttribute: {
    //            required: true
    //          }
    //        },
    //
    //        labels: {
    //          someAttribute: 'Custom label'
    //        }
    //      });
    label: function(attrName, model) {
      return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
    }
  };


  // Built in validators
  // -------------------

  var defaultValidators = Validation.validators = (function(){
    // Use native trim when defined
    var trim = String.prototype.trim ?
      function(text) {
        return text === null ? '' : String.prototype.trim.call(text);
      } :
      function(text) {
        var trimLeft = /^\s+/,
            trimRight = /\s+$/;

        return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
      };

    // Determines whether or not a value is a number
    var isNumber = function(value){
      return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
    };

    // Determines whether or not not a value is empty
    var hasValue = function(value) {
      return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === ''));
    };

    return {
      // Function validator
      // Lets you implement a custom function used for validation
      fn: function(value, attr, fn, model, computed) {
        if(_.isString(fn)){
          fn = model[fn];
        }
        return fn.call(model, value, attr, computed);
      },

      // Required validator
      // Validates if the attribute is required or not
      required: function(value, attr, required, model, computed) {
        var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
        if(!isRequired && !hasValue(value)) {
          return false; // overrides all other validators
        }
        if (isRequired && !hasValue(value)) {
          return this.format(defaultMessages.required, this.formatLabel(attr, model));
        }
      },

      // Acceptance validator
      // Validates that something has to be accepted, e.g. terms of use
      // `true` or 'true' are valid
      acceptance: function(value, attr, accept, model) {
        if(value !== 'true' && (!_.isBoolean(value) || value === false)) {
          return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
        }
      },

      // Min validator
      // Validates that the value has to be a number and equal to or greater than
      // the min value specified
      min: function(value, attr, minValue, model) {
        if (!isNumber(value) || value < minValue) {
          return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
        }
      },

      // Max validator
      // Validates that the value has to be a number and equal to or less than
      // the max value specified
      max: function(value, attr, maxValue, model) {
        if (!isNumber(value) || value > maxValue) {
          return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
        }
      },

      // Range validator
      // Validates that the value has to be a number and equal to or between
      // the two numbers specified
      range: function(value, attr, range, model) {
        if(!isNumber(value) || value < range[0] || value > range[1]) {
          return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
        }
      },

      // Length validator
      // Validates that the value has to be a string with length equal to
      // the length value specified
      length: function(value, attr, length, model) {
        if (!hasValue(value) || trim(value).length !== length) {
          return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
        }
      },

      // Min length validator
      // Validates that the value has to be a string with length equal to or greater than
      // the min length value specified
      minLength: function(value, attr, minLength, model) {
        if (!hasValue(value) || trim(value).length < minLength) {
          return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
        }
      },

      // Max length validator
      // Validates that the value has to be a string with length equal to or less than
      // the max length value specified
      maxLength: function(value, attr, maxLength, model) {
        if (!hasValue(value) || trim(value).length > maxLength) {
          return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
        }
      },

      // Range length validator
      // Validates that the value has to be a string and equal to or between
      // the two numbers specified
      rangeLength: function(value, attr, range, model) {
        if(!hasValue(value) || trim(value).length < range[0] || trim(value).length > range[1]) {
          return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
        }
      },

      // One of validator
      // Validates that the value has to be equal to one of the elements in
      // the specified array. Case sensitive matching
      oneOf: function(value, attr, values, model) {
        if(!_.include(values, value)){
          return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
        }
      },

      // Equal to validator
      // Validates that the value has to be equal to the value of the attribute
      // with the name specified
      equalTo: function(value, attr, equalTo, model, computed) {
        if(value !== computed[equalTo]) {
          return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
        }
      },

      // Pattern validator
      // Validates that the value has to match the pattern specified.
      // Can be a regular expression or the name of one of the built in patterns
      pattern: function(value, attr, pattern, model) {
        if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
          return this.format(defaultMessages.pattern, this.formatLabel(attr, model), pattern);
        }
      }
    };
  }());

  return Validation;
}(_));

/*!
 * ===================================================
 * bootstrap-transition.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
   * ======================================================= */

  $(function () {

    $.support.transition = (function () {

      var transitionEnd = (function () {

        var el = document.createElement('bootstrap')
          , transEndEventNames = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , name

        for (name in transEndEventNames){
          if (el.style[name] !== undefined) {
            return transEndEventNames[name]
          }
        }

      }())

      return transitionEnd && {
        end: transitionEnd
      }

    })()

  })

}(window.jQuery);/* ==========================================================
 * bootstrap-alert.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* ALERT CLASS DEFINITION
  * ====================== */

  var dismiss = '[data-dismiss="alert"]'
    , Alert = function (el) {
        $(el).on('click', dismiss, this.close)
      }

  Alert.prototype.close = function (e) {
    var $this = $(this)
      , selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)

    e && e.preventDefault()

    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())

    $parent.trigger(e = $.Event('close'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent
        .trigger('closed')
        .remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent.on($.support.transition.end, removeElement) :
      removeElement()
  }


 /* ALERT PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('alert')
      if (!data) $this.data('alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


 /* ALERT NO CONFLICT
  * ================= */

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


 /* ALERT DATA-API
  * ============== */

  $(document).on('click.alert.data-api', dismiss, Alert.prototype.close)

}(window.jQuery);/* ============================================================
 * bootstrap-button.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#buttons
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* BUTTON PUBLIC CLASS DEFINITION
  * ============================== */

  var Button = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.button.defaults, options)
  }

  Button.prototype.setState = function (state) {
    var d = 'disabled'
      , $el = this.$element
      , data = $el.data()
      , val = $el.is('input') ? 'val' : 'html'

    state = state + 'Text'
    data.resetText || $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d)
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

    $parent && $parent
      .find('.active')
      .removeClass('active')

    this.$element.toggleClass('active')
  }


 /* BUTTON PLUGIN DEFINITION
  * ======================== */

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('button')
        , options = typeof option == 'object' && option
      if (!data) $this.data('button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.defaults = {
    loadingText: 'loading...'
  }

  $.fn.button.Constructor = Button


 /* BUTTON NO CONFLICT
  * ================== */

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


 /* BUTTON DATA-API
  * =============== */

  $(document).on('click.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
  })

}(window.jQuery);/* ==========================================================
 * bootstrap-carousel.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* CAROUSEL CLASS DEFINITION
  * ========================= */

  var Carousel = function (element, options) {
    this.$element = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options = options
    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.prototype = {

    cycle: function (e) {
      if (!e) this.paused = false
      if (this.interval) clearInterval(this.interval);
      this.options.interval
        && !this.paused
        && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
      return this
    }

  , getActiveIndex: function () {
      this.$active = this.$element.find('.item.active')
      this.$items = this.$active.parent().children()
      return this.$items.index(this.$active)
    }

  , to: function (pos) {
      var activeIndex = this.getActiveIndex()
        , that = this

      if (pos > (this.$items.length - 1) || pos < 0) return

      if (this.sliding) {
        return this.$element.one('slid', function () {
          that.to(pos)
        })
      }

      if (activeIndex == pos) {
        return this.pause().cycle()
      }

      return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
    }

  , pause: function (e) {
      if (!e) this.paused = true
      if (this.$element.find('.next, .prev').length && $.support.transition.end) {
        this.$element.trigger($.support.transition.end)
        this.cycle(true)
      }
      clearInterval(this.interval)
      this.interval = null
      return this
    }

  , next: function () {
      if (this.sliding) return
      return this.slide('next')
    }

  , prev: function () {
      if (this.sliding) return
      return this.slide('prev')
    }

  , slide: function (type, next) {
      var $active = this.$element.find('.item.active')
        , $next = next || $active[type]()
        , isCycling = this.interval
        , direction = type == 'next' ? 'left' : 'right'
        , fallback  = type == 'next' ? 'first' : 'last'
        , that = this
        , e

      this.sliding = true

      isCycling && this.pause()

      $next = $next.length ? $next : this.$element.find('.item')[fallback]()

      e = $.Event('slide', {
        relatedTarget: $next[0]
      , direction: direction
      })

      if ($next.hasClass('active')) return

      if (this.$indicators.length) {
        this.$indicators.find('.active').removeClass('active')
        this.$element.one('slid', function () {
          var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
          $nextIndicator && $nextIndicator.addClass('active')
        })
      }

      if ($.support.transition && this.$element.hasClass('slide')) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $next.addClass(type)
        $next[0].offsetWidth // force reflow
        $active.addClass(direction)
        $next.addClass(direction)
        this.$element.one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
      } else {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $active.removeClass('active')
        $next.addClass('active')
        this.sliding = false
        this.$element.trigger('slid')
      }

      isCycling && this.cycle()

      return this
    }

  }


 /* CAROUSEL PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('carousel')
        , options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option)
        , action = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.defaults = {
    interval: 5000
  , pause: 'hover'
  }

  $.fn.carousel.Constructor = Carousel


 /* CAROUSEL NO CONFLICT
  * ==================== */

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }

 /* CAROUSEL DATA-API
  * ================= */

  $(document).on('click.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this = $(this), href
      , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      , options = $.extend({}, $target.data(), $this.data())
      , slideIndex

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('carousel').pause().to(slideIndex).cycle()
    }

    e.preventDefault()
  })

}(window.jQuery);/* =============================================================
 * bootstrap-collapse.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning || this.$element.hasClass('in')) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning || !this.$element.hasClass('in')) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSE PLUGIN DEFINITION
  * ========================== */

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = $.extend({}, $.fn.collapse.defaults, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSE NO CONFLICT
  * ==================== */

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


 /* COLLAPSE DATA-API
  * ================= */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

}(window.jQuery);/* ============================================================
 * bootstrap-dropdown.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle)
        $('html').on('click.dropdown.data-api', function () {
          $el.parent().removeClass('open')
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        $parent.toggleClass('open')
      }

      $this.focus()

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) $parent.find(toggle).focus()
        return $this.click()
      }

      $items = $('[role=menu] li:not(.divider):visible a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus() {
    $(toggle).each(function () {
      getParent($(this)).removeClass('open')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = selector && $(selector)

    if (!$parent || !$parent.length) $parent = $this.parent()

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdown')
      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


 /* DROPDOWN NO CONFLICT
  * ==================== */

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdown.data-api', clearMenus)
    .on('click.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.dropdown-menu', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);

/* ===========================================================
 * bootstrap-tooltip.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut
        , triggers
        , trigger
        , i

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      triggers = this.options.trigger.split(' ')

      for (i = triggers.length; i--;) {
        trigger = triggers[i]
        if (trigger == 'click') {
          this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
        } else if (trigger != 'manual') {
          eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
          eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
          this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
          this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
        }
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options)

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var defaults = $.fn[this.type].defaults
        , options = {}
        , self

      this._options && $.each(this._options, function (key, value) {
        if (defaults[key] != value) options[key] = value
      }, this)

      self = $(e.currentTarget)[this.type](options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp
        , e = $.Event('show')

      if (this.hasContent() && this.enabled) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })

        this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

        pos = this.getPosition()

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        this.applyPlacement(tp, placement)
        this.$element.trigger('shown')
      }
    }

  , applyPlacement: function(offset, placement){
      var $tip = this.tip()
        , width = $tip[0].offsetWidth
        , height = $tip[0].offsetHeight
        , actualWidth
        , actualHeight
        , delta
        , replace

      $tip
        .offset(offset)
        .addClass(placement)
        .addClass('in')

      actualWidth = $tip[0].offsetWidth
      actualHeight = $tip[0].offsetHeight

      if (placement == 'top' && actualHeight != height) {
        offset.top = offset.top + height - actualHeight
        replace = true
      }

      if (placement == 'bottom' || placement == 'top') {
        delta = 0

        if (offset.left < 0){
          delta = offset.left * -2
          offset.left = 0
          $tip.offset(offset)
          actualWidth = $tip[0].offsetWidth
          actualHeight = $tip[0].offsetHeight
        }

        this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
      } else {
        this.replaceArrow(actualHeight - height, actualHeight, 'top')
      }

      if (replace) $tip.offset(offset)
    }

  , replaceArrow: function(delta, dimension, position){
      this
        .arrow()
        .css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()
        , e = $.Event('hide')

      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      this.$element.trigger('hidden')

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function () {
      var el = this.$element[0]
      return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
        width: el.offsetWidth
      , height: el.offsetHeight
      }, this.$element.offset())
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , arrow: function(){
      return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this
      self.tip().hasClass('in') ? self.hide() : self.show()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  var old = $.fn.tooltip

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }


 /* TOOLTIP NO CONFLICT
  * =================== */

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);
/* ===========================================================
 * bootstrap-popover.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }


  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
      $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

      $tip.removeClass('fade top bottom left right in')
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent()
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options

      content = (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)
        || $e.attr('data-content')

      return content
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  })


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


 /* POPOVER NO CONFLICT
  * =================== */

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);
/* =============================================================
 * bootstrap-scrollspy.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* SCROLLSPY CLASS DEFINITION
  * ========================== */

  function ScrollSpy(element, options) {
    var process = $.proxy(this.process, this)
      , $element = $(element).is('body') ? $(window) : $(element)
      , href
    this.options = $.extend({}, $.fn.scrollspy.defaults, options)
    this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process)
    this.selector = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.$body = $('body')
    this.refresh()
    this.process()
  }

  ScrollSpy.prototype = {

      constructor: ScrollSpy

    , refresh: function () {
        var self = this
          , $targets

        this.offsets = $([])
        this.targets = $([])

        $targets = this.$body
          .find(this.selector)
          .map(function () {
            var $el = $(this)
              , href = $el.data('target') || $el.attr('href')
              , $href = /^#\w/.test(href) && $(href)
            return ( $href
              && $href.length
              && [[ $href.position().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]] ) || null
          })
          .sort(function (a, b) { return a[0] - b[0] })
          .each(function () {
            self.offsets.push(this[0])
            self.targets.push(this[1])
          })
      }

    , process: function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
          , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
          , maxScroll = scrollHeight - this.$scrollElement.height()
          , offsets = this.offsets
          , targets = this.targets
          , activeTarget = this.activeTarget
          , i

        if (scrollTop >= maxScroll) {
          return activeTarget != (i = targets.last()[0])
            && this.activate ( i )
        }

        for (i = offsets.length; i--;) {
          activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
            && this.activate( targets[i] )
        }
      }

    , activate: function (target) {
        var active
          , selector

        this.activeTarget = target

        $(this.selector)
          .parent('.active')
          .removeClass('active')

        selector = this.selector
          + '[data-target="' + target + '"],'
          + this.selector + '[href="' + target + '"]'

        active = $(selector)
          .parent('li')
          .addClass('active')

        if (active.parent('.dropdown-menu').length)  {
          active = active.closest('li.dropdown').addClass('active')
        }

        active.trigger('activate')
      }

  }


 /* SCROLLSPY PLUGIN DEFINITION
  * =========================== */

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('scrollspy')
        , options = typeof option == 'object' && option
      if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy

  $.fn.scrollspy.defaults = {
    offset: 10
  }


 /* SCROLLSPY NO CONFLICT
  * ===================== */

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


 /* SCROLLSPY DATA-API
  * ================== */

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery);/* ========================================================
 * bootstrap-tab.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TAB CLASS DEFINITION
  * ==================== */

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype = {

    constructor: Tab

  , show: function () {
      var $this = this.element
        , $ul = $this.closest('ul:not(.dropdown-menu)')
        , selector = $this.attr('data-target')
        , previous
        , $target
        , e

      if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }

      if ( $this.parent('li').hasClass('active') ) return

      previous = $ul.find('.active:last a')[0]

      e = $.Event('show', {
        relatedTarget: previous
      })

      $this.trigger(e)

      if (e.isDefaultPrevented()) return

      $target = $(selector)

      this.activate($this.parent('li'), $ul)
      this.activate($target, $target.parent(), function () {
        $this.trigger({
          type: 'shown'
        , relatedTarget: previous
        })
      })
    }

  , activate: function ( element, container, callback) {
      var $active = container.find('> .active')
        , transition = callback
            && $.support.transition
            && $active.hasClass('fade')

      function next() {
        $active
          .removeClass('active')
          .find('> .dropdown-menu > .active')
          .removeClass('active')

        element.addClass('active')

        if (transition) {
          element[0].offsetWidth // reflow for transition
          element.addClass('in')
        } else {
          element.removeClass('fade')
        }

        if ( element.parent('.dropdown-menu') ) {
          element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
      }

      transition ?
        $active.one($.support.transition.end, next) :
        next()

      $active.removeClass('in')
    }
  }


 /* TAB PLUGIN DEFINITION
  * ===================== */

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tab')
      if (!data) $this.data('tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


 /* TAB NO CONFLICT
  * =============== */

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


 /* TAB DATA-API
  * ============ */

  $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);/* =============================================================
 * bootstrap-typeahead.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.source = this.options.source
    this.$menu = $(this.options.menu)
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu
        .insertAfter(this.$element)
        .css({
          top: pos.top + pos.height
        , left: pos.left
        })
        .show()

      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val()

      if (!this.query || this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

      return items ? this.process(items) : this
    }

  , process: function (items) {
      var that = this

      items = $.grep(items, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
        .on('mouseleave', 'li', $.proxy(this.mouseleave, this))
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , move: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40,38,9,13,27])
      this.move(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , focus: function (e) {
      this.focused = true
    }

  , blur: function (e) {
      this.focused = false
      if (!this.mousedover && this.shown) this.hide()
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
      this.$element.focus()
    }

  , mouseenter: function (e) {
      this.mousedover = true
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  , mouseleave: function (e) {
      this.mousedover = false
      if (!this.focused && this.shown) this.hide()
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  var old = $.fn.typeahead

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 1
  }

  $.fn.typeahead.Constructor = Typeahead


 /* TYPEAHEAD NO CONFLICT
  * =================== */

  $.fn.typeahead.noConflict = function () {
    $.fn.typeahead = old
    return this
  }


 /* TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this)
    if ($this.data('typeahead')) return
    $this.typeahead($this.data())
  })

}(window.jQuery);
/* ==========================================================
 * bootstrap-affix.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#affix
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* AFFIX CLASS DEFINITION
  * ====================== */

  var Affix = function (element, options) {
    this.options = $.extend({}, $.fn.affix.defaults, options)
    this.$window = $(window)
      .on('scroll.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.affix.data-api',  $.proxy(function () { setTimeout($.proxy(this.checkPosition, this), 1) }, this))
    this.$element = $(element)
    this.checkPosition()
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
      , scrollTop = this.$window.scrollTop()
      , position = this.$element.offset()
      , offset = this.options.offset
      , offsetBottom = offset.bottom
      , offsetTop = offset.top
      , reset = 'affix affix-top affix-bottom'
      , affix

    if (typeof offset != 'object') offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function') offsetTop = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ?
      false    : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ?
      'bottom' : offsetTop != null && scrollTop <= offsetTop ?
      'top'    : false

    if (this.affixed === affix) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''))
  }


 /* AFFIX PLUGIN DEFINITION
  * ======================= */

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('affix')
        , options = typeof option == 'object' && option
      if (!data) $this.data('affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix

  $.fn.affix.defaults = {
    offset: 0
  }


 /* AFFIX NO CONFLICT
  * ================= */

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


 /* AFFIX DATA-API
  * ============== */

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
        , data = $spy.data()

      data.offset = data.offset || {}

      data.offsetBottom && (data.offset.bottom = data.offsetBottom)
      data.offsetTop && (data.offset.top = data.offsetTop)

      $spy.affix(data)
    })
  })


}(window.jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el    = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#modals
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element).on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) this.$element.load(this.options.remote)
  }

  Modal.DEFAULTS = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('shown.bs.modal',  '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(window.jQuery);

// Main.js
// -------
// Defines
//  Namespace
//  a model for SiteSettings (used on the Applications)
//  methods to:
//   create and get applications
//   create singletons
//   get the SiteSettings
// Relinquish jQuery's control of the $ variable.
(function ()
{
	'use strict';
	
	// Global Name Space SC, stands for SuiteCommerce.
	var SC = window.SC = _.extend(window.SC || {}, Backbone.Events);
	
	// Make jQuery not use the $ alias
	jQuery.noConflict();
	
	// Application Creation:
	// Applications will provide by default: Layout (So your views can talk to)
	// and a Router (so you can extend them with some nice defaults)
	// If you like to create extensions to the Skeleton you should extend SC.ApplicationSkeleton
	SC._applications = {};
	SC.Application = function (application_name)
	{
		SC._applications[application_name] = SC._applications[application_name] || new SC.ApplicationSkeleton(application_name);
		return SC._applications[application_name];
	};
	
	// SC.Singleton:
	// Defines a simple getInstance method for:
	// models, collections, views or any other object to use to be used as singletons
	// How to use:
	// Backbone.[Collection, Model, View].extend({Your code}, SC.Singleton);
	// or _.extend({Object literal}, SC.Singleton);
	SC.Singleton = {
		getInstance: function ()
		{
			var This = this;
			this.instance = this.instance || new This();
			return this.instance;
		}
	};

	// Defines the template function as a noop, so it needs to be implemented by an extension
	SC.template = jQuery.noop;
	
})();

// Utils.js
// --------
// A collection of utility methods
// This are added to both SC.Utils, and Underscore.js
// eg: you could use SC.Utils.formatPhone() or _.formatPhone()
(function ()
{
	'use strict';

	// _.formatPhone:
	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	function formatPhone (phone, format)
	{
		// fyi: the tilde (~) its used as !== -1
		var extentionSearch = phone.search(/[A-Za-z#]/)
		,	extention = ~extentionSearch ? ' '+ phone.substring(extentionSearch) : ''
		,	phoneNumber = ~extentionSearch ? ' '+ phone.substring(0, extentionSearch) : phone;
			
		format = format || SC.ENVIRONMENT.siteSettings.phoneformat;
			
		if (/^[0-9()-.\s]+$/.test(phoneNumber) && format)
		{
			var format_tokens = {}
			,	phoneDigits = phoneNumber.replace(/[()-.\s]/g, '');
			
			switch (format)
			{
			// c: country, ab: area_before, aa: area_after, d: digits
			case '(123) 456-7890':
				format_tokens = {c: ' ', ab: '(', aa: ') ', d: '-'};
				break;
			case '123 456 7890':
				format_tokens = {c: ' ', ab: '', aa: ' ', d: ' '};
				break;
			case '123-456-7890':
				format_tokens = {c: ' ', ab: '', aa: '-', d: '-'};
				break;
			case '123.456.7890':
				format_tokens = {c: ' ', ab: '', aa: '.', d: '.'};
				break;
			default:
				return phone;
			}
			
			switch (phoneDigits.length)
			{
			case 7:
				return phoneDigits.substring(0, 3) + format_tokens.d + phoneDigits.substring(3) + extention;
			case 10:
				return format_tokens.ab + phoneDigits.substring(0, 3) + format_tokens.aa + phoneDigits.substring(3, 6) + format_tokens.d + phoneDigits.substring(6) + extention;
			case 11:
				return phoneDigits.substring(0, 1) + format_tokens.c + format_tokens.ab + phoneDigits.substring(1, 4) + format_tokens.aa + phoneDigits.substring(4, 7) + format_tokens.d + phoneDigits.substring(7) + extention;
			default:
				return phone;
			}
		}
		
		return phone;
	}

	function paymenthodIdCreditCart(cc_number)
	{
		// regex for credit card issuer validation
		var cards_reg_ex = {
			'VISA': /^4[0-9]{12}(?:[0-9]{3})?$/
		,	'Master Card': /^5[1-5][0-9]{14}$/
		,	'American Express': /^3[47][0-9]{13}$/
		,	'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/
		}
		
		// get the credit card name 
		,	paymenthod_name;

		// validate that the number and issuer
		_.each(cards_reg_ex, function(reg_ex, name)
		{
			if (reg_ex.test(cc_number))
			{
				paymenthod_name = name;
			}
		});
		
		var paymentmethod = paymenthod_name && _.findWhere(SC.ENVIRONMENT.siteSettings.paymentmethods, {name: paymenthod_name.toString()});
		
		return paymentmethod && paymentmethod.internalid;
	}


	function validateSecurityCode(value)
	{
		return Backbone.Validation.patterns.number.test(value) && (value.length === 3 || value.length === 4);
	}

	function validatePhone (phone)
	{
		console.log(phone);
		var minLength = 10;
		var maxLength = 10;
		if (_.isNumber(phone))
		{
			// phone is a number so we can't ask for .length
			// we elevate 10 to (minLength - 1)
			// if the number is lower, then its invalid
			// eg: phone = 1234567890 is greater than 1000000, so its valid
			//     phone = 123456 is lower than 1000000, so its invalid
			if (phone < Math.pow(10, minLength - 1))
			{
				return _('Phone Number is invalid').translate();
			}
		}
		else if (phone)
		{
			// if its a string, we remove all the useless characters
			var value = phone.replace(/[()-.\s]/g, '');
			// we then turn the value into an integer and back to string
			// to make sure all of the characters are numeric

			//first remove leading zeros for number comparison
//			while(value.length && value.substring(0,1) === '0') 
//			{
//				value = value.substring(1, value.length); 
//			}
			//parseInt(value, 10).toString() !== value ||
			if ( value.length < minLength || value.length > maxLength)
			{
				return _('Phone Number is invalid').translate();
			}
		}
	}

	function validateState(value, valName, form){
		var countries = SC.ENVIRONMENT.siteSettings.countries || [];
		if (countries[form.country] && countries[form.country].states){
			if (value === '')
			{
				return _('State is required').translate();
			}
		}
	}

	// translate:
	// used on all of the harcoded texts in the templates
	// gets the translated value from SC.Translations object literal
	function translate (text)
	{
		text = text.toString();
		// Turns the arguments object into an array
		var args = Array.prototype.slice.call(arguments)
		
		// Checks the translation table
		,	result = SC.Translations && SC.Translations[text] ? SC.Translations[text] : text;
		
		if (args.length && result)
		{
			// Mixes in inline variables
			result = result.format.apply(result, args.slice(1));
		}
		
		return result;
	}
	
	// getFullPathForElement:
	// returns a string containing the path
	// in the DOM tree of the element
	function getFullPathForElement (el)
	{
		var names = [], c, e;

		while (el.parentNode)
		{
			if (el.id)
			{
				// if a parent element has an id, that is enough for our path
				names.unshift('#'+ el.id);
				break;
			}
			else
			{
				if (el === el.ownerDocument.documentElement)
				{
					names.unshift(el.tagName);
				}
				else
				{
					for (c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++)
					{
						names.unshift(el.tagName +':nth-child('+ c +')');
					}
				}

				el = el.parentNode;
			}
		}

		return names.join(' > ');
	}

	function formatCurrency (value, symbol)
	{
		var sign = ''
		,	value_float = parseFloat(value);

		if (isNaN(value_float))
		{
			return value;
		}
		
		if (value_float < 0)
		{
			sign = '-';
		}
		
		value_float = Math.abs(value_float);
		value_float = parseInt((value_float + 0.005) * 100, 10);
		value_float = value_float / 100;

		var value_string = value_float.toString();

		// if the string doesn't contains a .
		if (!~value_string.indexOf('.'))
		{
			value_string += '.00';
		}
		// if it only contains one number after the .
		else if (value_string.indexOf('.') === (value_string.length - 2))
		{
			value_string += '0';
		}
		
		symbol = symbol || SC.ENVIRONMENT.siteSettings.shopperCurrency.symbol || '$';

		return sign + symbol + value_string;
	}

	function highlightKeyword (text, keyword)
	{
		text = text || '';

		keyword = jQuery.trim(keyword).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

		return text.replace(new RegExp('('+ keyword +')', 'ig'), function ($1, match)
		{
			return '<strong>' + match + '</strong>';
		});
	}

	function substitute (text, object)
	{
		text = text || '';

		return text.replace(/\{(\w+)\}/g, function (match, key)
		{
			return typeof object[key] !== 'undefined' ? object[key] : match;
		});
	}

	// iterates a collection of objects, runs a custom function getValue on each item and then joins them
	// returns a string.
	function collectionToString(options) 
	{
		var temp = [];
		_.each(options.collection, function(item) {		
			temp.push(options.getValue(item));		
		});

		return temp.join(options.joinWith);
	} 

	// params map
	function addParamsToUrl (baseUrl, params)
	{
		// We get the search options from the config file
		if (params)
		{
			var paramString = jQuery.param(params)
			,	join_string = ~baseUrl.indexOf('?') ? '&' : '?';

			return baseUrl + join_string + paramString;	
		}
		else
		{
			return baseUrl;
		}
	}
	
	// parseUrlOptions:
	// Takes a url with options (or just the options part of the url) and returns an object
	function parseUrlOptions(options_string)
	{
		options_string = options_string || '';
		
		if (~options_string.indexOf('?'))
		{
			options_string = _.last(options_string.split('?'));
		}
		
		var tokens = options_string.split(/\&/g)
		,	options = {}
		,	current_token;
		
		while (tokens.length > 0)
		{
			current_token = tokens.shift().split(/\=/g);
			options[current_token[0]] = current_token[1];
		}
		
		return options;
	}

	function objectToStyles (obj)
	{
		return _.reduce(obj, function (memo, value, index)
		{
			return memo += index +':'+ value +';'; 
		}, '');
	}

	// simple hyphenation of a string, replaces non-alphanumerical characters with hyphens
	function hyphenate (string) {
		return string.replace(/[\W]/g, '-');
	}
	
	function objectToAtrributes (obj, prefix)
	{
		prefix = prefix ? prefix +'-' : '';

		return _.reduce(obj, function (memo, value, index)
		{
			if (index !== 'text' && index !== 'categories')
			{
				memo += ' '+ prefix;

				if (index.toLowerCase() === 'css' || index.toLowerCase() === 'style')
				{
					index = 'style';
					// styles value has to be an obj
					value = objectToStyles(value);
				}

				if (_.isObject(value))
				{
					return memo += objectToAtrributes(value, index);
				}

				memo += index;

				if (value)
				{
					memo += '="'+ value +'"';
				}	
			}

			return memo;
		}, '');
	}

	function resizeImage (sizes, url, size)
	{
		var resize = _.where(sizes, {name: size})[0];

		if (!!resize)
		{
			return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
		}

		return url;
	}

	function getAbsoluteUrl (file)
	{
		return SC.ENVIRONMENT.baseUrl.replace('{{file}}', file);
	}

	//Fixes anchor elements, preventing default behavior so that
	//they do not change the views (ie: checkout steps)
	function preventAnchorNavigation (selector)
	{
		try
		{
			jQuery(selector).on('click', function (e)
			{
				e.preventDefault();
			});
		}
		catch (e)
		{
			console.log('Error while preventing navigation', e.message);
		}
	}
	
	SC.Utils = {
		translate: translate
	,	substitute: substitute
	,	paymenthodIdCreditCart: paymenthodIdCreditCart
	,	formatPhone: formatPhone
	,	validatePhone: validatePhone
	,	validateState: validateState
	,	validateSecurityCode: validateSecurityCode
	,	formatCurrency: formatCurrency
	,	highlightKeyword: highlightKeyword
	,	getFullPathForElement: getFullPathForElement
	,	collectionToString: collectionToString
	,	addParamsToUrl: addParamsToUrl
	,	parseUrlOptions: parseUrlOptions
	,	objectToAtrributes: objectToAtrributes
	,	resizeImage: resizeImage
	,	hyphenate: hyphenate
	,	getAbsoluteUrl: getAbsoluteUrl
	,	preventAnchorNavigation: preventAnchorNavigation
	};
	
	// We extend underscore with our utility methods
	// see http://underscorejs.org/#mixin
	_.mixin(SC.Utils);
	
})();

// ApplicationSkeleton.js
// ----------------------
// Defines the top level components of an application
// like the name, layout, or the start function
(function ()
{
	'use strict';
	
	function ApplicationSkeleton (name)
	{
		// Enforces new object to be created even if you do ApplicationSkeleton() (without new)
		if (!(this instanceof ApplicationSkeleton))
		{
			return new ApplicationSkeleton();
		}
		
		// Application Default settings:
		this.Configuration = {};
		
		this.name = name;
	}
	
	// Layout: 
	// This View will be created and added to the dom as soon as the app starts.
	// All module's views will get into the dom through this view by calling
	// either showContent, showInModal, showError or other application specific method
	ApplicationSkeleton.prototype.Layout = Backbone.View.extend({
		// this is the tag asociated to the .txt file
		template: 'layout'
		// where it will be appended
	,	container_element: '#main'
		// where the content (views) will be apended
	,	content_element: '#content'
		
	,	key_elements: {}

	,	events: {}
		
	,	initialize: function (Application)
		{
			this.events = {};
			this.application = Application;
		}
		
	,	render: function ()
		{
			this.trigger('beforeRender');

			Backbone.View.prototype.render.call(this);		

			this.updateUI(); 

			this.trigger('afterRender');
		}

		//update the internal dom references (this.key_elements)  
	,	updateUI: function()
		{
			var self = this;

			// Re-usable Layout Dom elements
			// We will generate an association to the jQuery version of the elements in the key_elements obj 
			_.each(this.key_elements, function (element_selector, element_name)
			{
				self['$' + element_name] = self.$(element_selector);
			});

			// We need to ensure the content element is this.content_element
			// if you wish to change the selector do it directly to this prop
			this.$content = this.$(this.content_element);			
		}
		
	,	appendToDom: function ()
		{
			this.trigger('beforeAppendToDom');

			jQuery(this.container_element).empty().append(this.$el);

			this.trigger('afterAppendToDom');
		}
		
	,	getApplication: function ()
		{
			return this.application;
		}
		
		// Defining the interface for this class
		// All modules will interact with the layout trough this methods
		// some others may be added as well
	,	showContent: jQuery.noop
	,	showInModal: jQuery.noop
	,	showError: jQuery.noop
	,	showSuccess: jQuery.noop

	});
	
	ApplicationSkeleton.prototype.getLayout = function getLayout ()
	{
		this._layoutInstance = this._layoutInstance || new this.Layout(this);
		return this._layoutInstance;
	};
	
	// ApplicationSkeleton.getConfig:
	// returns the configuration object of the aplication
	// if a path is applied, it returns that attribute of the config
	// if nothing is found, it returns the default value
	ApplicationSkeleton.prototype.getConfig = function getConfig (path, default_value)
	{
		if (!path)
		{
			return this.Configuration;
		}
		else if (this.Configuration)
		{
			var tokens = path.split('.')
			,	prev = this.Configuration
			,	n = 0;

			while (!_.isUndefined(prev) && n < tokens.length)
			{
				prev = prev[tokens[n++]];
			}

			if (prev)
			{
				return prev;
			}
		}
		
		return default_value;
	};
	
	ApplicationSkeleton.prototype.UserModel = Backbone.Model.extend({});

	ApplicationSkeleton.prototype.getUser = function ()
	{

		if (!this.user_instance) 
		{
			this.user_instance = new this.UserModel();
		}
		return this.user_instance;
	};
	
	ApplicationSkeleton.prototype.start = function start (done_fn)
	{
		var self = this
			// Here we will store 
		,	module_options = {}
			// we get the list of modules from the config file
		,	modules_list = _.map(self.getConfig('modules', []), function(module)
			{
				// we check all the options are strings
				if (_.isString(module))
				{
					return module;
				}
				// for the ones that are the expectation is that it's an array, 
				// where the 1st index is the name of the modules and 
				// the rest are options for the mountToApp function
				else if (_.isArray(module))
				{
					module_options[module[0]] = module.slice(1);
					return module[0];
				}
			});

		this.trigger('beforeStart');
		
		// we use require.js to load the modules
		// require.js takes care of the dependencies between modules
		require(modules_list, function ()
		{
			// then we set the modules to the aplication
			// the keys are the modules_list (names)
			// and the values are the loaded modules returned in the arguments by require.js
			self.modules = _.object(modules_list, arguments);

			self.modulesMountToAppResult = {};

			// we mount each module to our application
			_.each(self.modules, function (module, module_name)
			{
				// We pass the application and the arguments from the config file to the mount to app function
				var mount_to_app_arguments = _.union([self], module_options[module_name] || []);
				if (module && _.isFunction(module.mountToApp))
				{
					self.modulesMountToAppResult[module_name] = module.mountToApp.apply(module, mount_to_app_arguments);
				}
			});
			
			// This checks if you have registered modules
			if (!Backbone.history)
			{
				throw new Error('No Backbone.Router has been initialized (Hint: Are your modules properly set?).');
			}
			
			self.trigger('afterModulesLoaded');
			
			done_fn && _.isFunction(done_fn) && done_fn(self);
			
			self.trigger('afterStart');
		});
	};
	
	// We allow ApplicationSkeleton to listen and trigger custom events
	// http://backbonejs.org/#Events
	_.extend(ApplicationSkeleton.prototype, Backbone.Events);
	
	SC.ApplicationSkeleton = ApplicationSkeleton;
	
})();

// BackToTop.js
// ------------
// Adds a back to top functionality to any element that has data-action="back-to-top"
define('BackToTop', function () 
{
	'use strict';

	return {
		mountToApp: function (Application){
			
			var Layout = Application.getLayout();
			
			// adding BackToTop function in Layout 
			_.extend(Layout, {
				backToTop : function(){
					jQuery('html, body').animate({scrollTop: '0px'}, 300);
				}
			});
			
			// adding events for elements of DOM with data-action="back-to-top" as parameter.
			_.extend(Layout.events, {
				'click [data-action="back-to-top"]': 'backToTop'
			});
		}
	};
});
// ApplicationSkeleton.Layout.showContent.js
// -----------------------------------------
// Renders a View into the layout
// if the view needs to be rendered in a modal, it does so
// triggers a few different events on the layout
(function ()
{
	'use strict';
	
	SC.ApplicationSkeleton.prototype.Layout.prototype.showContent = function showContent (view, dont_scroll)
	{
		if (view.inModal)
		{
			return view.showInModal();
		}
		
		// We render the layout only once, the first time showContent is called
		if (!this.rendered)
		{
			this.render();
			this.rendered = true;
		}
		
		// This line will destroy the view only if you are adding a diferent instance of a view
		this.currentView && this.currentView !== view && this.currentView.destroy();
		
		// the layout should have only one view, the currentView
		this.currentView = view;

		// Empties the content first, so events dont get unbind
		this.$content.empty();
		view.render();

		//document's title
		document.title = view.title || '';
		
		this.trigger('beforeAppendView', view);
		this.$content.append(view.$el);
		this.trigger('afterAppendView', view);
		
		view.isRenderedInLayout = true;
		
		// Sometimes we do not want to scroll top when the view is rendered
		// Eventually we might change view and dont_scroll to an option obj
		if (!dont_scroll)
		{
			jQuery(document).scrollTop(0);
		}

		// we need to return a promise always, as show content might be async
		return jQuery.Deferred().resolveWith(this, [view]);
	};
	
})();
// ApplicationSkeleton.Layout.showInModal.js
// -----------------------------------------
// Shows a view inside of a modal
// Uses Bootstrap's Modals http://twitter.github.com/bootstrap/javascript.html#modals
// All of the ids are added the prefix 'in-modal-' to avoid duplicated ids in the DOM
(function ()
{
	'use strict';
	
	// the last opened modal will be hold in this var
	var current_modal;

	_.extend(SC.ApplicationSkeleton.prototype.Layout.prototype, {

		wrapModalView: function (view)
		{
			// If the view doesn't has a div with the class modal-body
			// we need to wrap it inside of a div that does for propper styling
			var $modal_body = view.$containerModal.find('.modal-body');

			// The view has it's own body so the template is probably doing some fancy stuff, so lets remove the other body
			if (view.$('.modal-body').length && $modal_body.length)
			{
				$modal_body.remove();
				$modal_body = [];
			}
			// if there is no body anywere lets wrap it with one
			else if (!$modal_body.length)
			{
				view.$el = view.$el.wrap('<div class="modal-body"/>').parent();
			}

			if ($modal_body.length)
			{
				$modal_body.append(view.$el);
			}
			else
			{
				view.$containerModal.find('.modal-content').append(view.$el);
			}

			return this;
		}

	,	prefixViewIds: function (view, prefix)
		{
			if (typeof view === 'string')
			{
				prefix = view;
				view = this.currentView;
			}

			if (view instanceof Backbone.View)
			{
				prefix = prefix || '';
				// Adding the prefix to all ids
				view.$('[id]').each(function ()
				{
					jQuery(this).attr('id', function (i, old_id)
					{
						return prefix + old_id;
					});
				});

				// Adding the prefix to all fors, so labels still work
				view.$('[for]').each(function ()
				{
					jQuery(this).attr('for', function (i, old_id)
					{
						return prefix + old_id;
					});
				});
			}
		}

	,	addModalListeners: function (view)
		{
			var self = this;

			view.$containerModal
				// hidden is an even triggered by the bootstrap modal plugin
				// we obliterate anything related to the view once the modal is closed
				.on('hidden.bs.modal', function ()
				{
					// TODO: Review this code
					view.$containerModal.closest('.modal-container').remove();
					view.$containerModal = null;
					self.$containerModal = null;
					self.modalCurrentView = null;
					current_modal = false;
					
					view.destroy();
				});
		}

	,	showInModal: function (view, options)
		{
			// we tell the view its beeing shown in a Modal
			view.inModal = true;

			// we need a different variable to know if the view has already been rendered in a modal
			// this is to add the Modal container only once to the DOM
			if (!view.hasRenderedInModal)
			{
				var element_id = view.$el.attr('id');
				
				this.$containerModal = view.$containerModal = jQuery(
					SC.macros.modal(view.page_header || view.title || '')
				).closest('div');

				this.$containerModal
					.addClass(view.modalClass || element_id ? ('modal-'+ element_id) : '')
					.attr('id', view.modalId || element_id ? ('modal-'+ element_id) : '');
				
				this.modalCurrentView = view;
				view.options.layout = this;
			}

			this.trigger('beforeAppendView', view);
			// Generates the html for the view based on its template
			// http://backbonejs.org/#View-render
			view.render();

			this.wrapModalView(view).prefixViewIds(view, 'in-modal-');
			
			if (!view.hasRenderedInModal)
			{
				// if there was a modal opened we close it
				current_modal && current_modal.modal('hide');
				// Stores the modal dom reference
				current_modal = view.$containerModal;
				
				this.addModalListeners(view);
				// So, now we add the wrapper modal with the view in it to the dom - we append it to the Layout view instead of body, so modal links are managed by NavigationHelper. 
				view.$containerModal.appendTo(this.el).wrap('<div class="modal-container"/>');
				// We trigger the plugin, it can be passed custom options
				// http://twitter.github.com/bootstrap/javascript.html#modals
				view.$containerModal.modal();
			}

			if (options && options.className)
			{
				view.$containerModal.addClass(options.className);
			}
			
			this.trigger('afterAppendView', view);
			
			// the view has now been rendered in a modal
			view.hasRenderedInModal = true;

			return jQuery.Deferred().resolveWith(this, [view]);
		}
	});
})();

// Backbone.cachedSync.js
// ----------------------
// This module defines a new type of Module and Collection and an alternative 
// to Backbone.sync that adds a cacheing layer to all read requests, but 
// leaves all write actions unmodified
(function(){
	
	'use strict';
	
	// The cache is an object where keys are a request identifier and values are a the result of the request and some metadata 
	Backbone.localCache = {};
	// We will cap the size of the cache by an arbitratry number, fell free to change it to meet your needs.
	Backbone.cacheSize = 100;
	
	// Removes the oldest requests once the limit is reached
	function evictRecords()
	{
		var keys = _.keys(Backbone.localCache)
		,	cache_size = keys.length;
		if (cache_size > Backbone.cacheSize)
		{
			delete Backbone.localCache[keys[0]];
		}
	}
	
	// Backbone.cachedSync:
	// Can be used interchangeably with Backbone.sync, it will retun a jQuery promise
	// once it's done will call the apropiate function 
	Backbone.cachedSync = function (action, self, options)
	{
		if (action === 'read')
		{
			// Generates an uninque url that will be used as the request identifier
			var url = _.result(this, 'url');
			if (options && options.data)
			{
				url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(options.data);
			}

			// Generates a new deferred for every new sync, no matter if its or not in the cache
			// This is the responce of this method, this promice will be resolved by the ajax request
			var deferred = jQuery.Deferred();

			// jQuery.ajax maps error to fail and success to done
			deferred.error = deferred.fail;
			deferred.success = deferred.done;

			// Now we make sure the success and error options are called
			deferred.success(options.success);
			deferred.error(options.error);

			// We then delete them from the options that will be passed to the real call so they are not called twice, for the 1st request
			delete options.success;
			delete options.error;

			// Now we get the actual request from the cache or we perform it
			Backbone.localCache[url] = Backbone.localCache[url] || Backbone.sync.apply(this, arguments);

			// Now we resolve the Deferred by listeinig to the resolution of the real request
			// if the request was already resolved our methods will be called imediatelly
			Backbone.localCache[url].then(
				// Success Callback 
				function (response, status, jqXhr) {
					// Sometimes parse modifies the responce object (that is passed by reference)
					response = (jqXhr.responseText) ? JSON.parse(jqXhr.responseText) : response;
					// now we resolve the defered one with results 
					deferred.resolveWith(Backbone.localCache[url], [response, status, jqXhr]);
					// This make sure the cache is keept short
					evictRecords();
				}
				// Error Callback 
			,	function () {
					// if it fails we make sure the next time its requested, dont read from cache
					delete Backbone.localCache[url];
					deferred.rejectWith(Backbone.localCache[url], arguments);
				}
				// Progess Callback
			,	function() {
					deferred.notifyWith(Backbone.localCache[url], arguments);
				}
			);

			// Then we just return the defered
			return deferred;
			// Bottom line: we are piping a fake ajax deferred from the original one
		}

		// if cache is not present we just call the original Backbone.sync
		return  Backbone.sync.apply(this, arguments);
	};
	
	
	function addToCache (data, params)
	{
		/*jshint validthis:true*/
		// Generates an uninque url that will be used as the request identifier
		var url = _.result(this, 'url');
		url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(params || {});

		// This defered will be used as a fake Ajax Request we are gonna store in the cache
		var deferred =  jQuery.Deferred();

		// We resolve the defered with the data you sent and some fake ajax info
		deferred.resolveWith(this, [
			data
		,	'success'
		,	{
				response: data
			,	status: 'success'
			,	statusCode: '200'
			,	readyState: 4
			,	statusText: 'OK'
			,	responseText: false // So it will use response instead of responseText
			}
		]);

		// Stores this fake promice in the cache
		Backbone.localCache[url] = deferred;
	}
	
	// Backbone.CachedCollection: 
	// It's just an extention of the original Backbone.Collection but it uses the Backbone.cachedSync
	Backbone.CachedCollection = Backbone.Collection.extend({
		sync: Backbone.cachedSync
	,	addToCache: addToCache
	});
	
	// Backbone.CachedModel: 
	// It's just an extention of the original Backbone.Model but it uses the Backbone.cachedSync
	Backbone.CachedModel = Backbone.Model.extend({
		sync: Backbone.cachedSync
	,	addToCache: addToCache
	});
	
})();
// Backbone.Model.js
// -----------------
// Extends native Backbone.Model to make internalid the idAttribute
(function ()
{
	'use strict';

	_.extend(Backbone.Model.prototype, {

		url: function ()
		{
			// http://underscorejs.org/#result
			var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url');

			if (this.isNew()) 
			{
				return base;
			}

			/// This will pass the id as a parameter instead of as part of the url
			return base +'?internalid='+ encodeURIComponent(this.id);
		}

	,	idAttribute: 'internalid'

	});

})();
// Backbone.Sync.js
// -----------------
// Extends native Backbone.Sync to pass company and site id on all requests
(function ()
{
	'use strict';

	Backbone.sync = _.wrap(Backbone.sync, function (fn, method, model, options)
	{
		var url = _.result(model, 'url');

		if (url)
		{
			options = options || {};

			options.url = url + (~url.indexOf('?') ? '&' : '?') + jQuery.param({
				// Account Number
				c: SC.ENVIRONMENT.companyId
				// Site Number
			,	n: SC.ENVIRONMENT.siteSettings.siteid
			});
		}

		return fn.apply(this, [method, model, options]);
	});
})();
// Backbone.Validation.callbacks.js
// --------------------------------
// Extends the callbacks of the Backbone Validation plugin
// https://github.com/thedersen/backbone.validation
(function ()
{
	'use strict';

	_.extend(Backbone.Validation.callbacks, {

		valid: function (view, attr, selector)
		{
			var $control = view.$el.find('['+ selector +'="'+ attr +'"]')
				// if its valid we remove the error classnames
			,	$group = $control.parents('.control-group').removeClass('error');
			
			// we also need to remove all of the error messages
			return $group.find('.backbone-validation').remove().end();
		}

	,	invalid: function (view, attr, error, selector)
		{
			_gaq.push(['_trackEvent', 'Custom Checkout Errors', 'Form error', error]);
			
			var $target
			,	$control = view.$el.find('['+ selector +'="'+ attr +'"]')
			,	$group = $control.parents('.control-group').addClass('error');


			//view.$('[data-type="alert-placeholder"]').html(
				//SC.macros.message(_(' Sorry, the information below is either incomplete or needs to be corrected.').translate(), 'error', true )
				//SC.macros.message(_(error).translate(), 'error', true )
			//);

			view.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

			view.$savingForm.find('input[type="reset"], button[type="reset"]').show();

			if ($control.data('error-style') === 'inline')
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find('.help-inline').length)
				{
					$group.find('.controls').append('<span id="powerTipError" class="help-inline backbone-validation"></span>');
				}

				$target = $group.find('.help-inline');
			}
			else
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find('.help-block').length)
				{
					if(attr == "phone"){
						$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: -10px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					}else if(attr == "zip") {
						$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 214%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					}else if(attr == "state"){
						$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 220%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					}else if(attr == "expyear"){
						$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 200px;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					}
					else if(attr == "expmonth"){
						$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: -2px; left: 150%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					}
					else if(attr == "ccsecuritycode"){
						if(jQuery(".modal-body").length != 0){
							$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: -48px; left: -63px;" id="powerTipError" class="help-block backbone-validation"></div></div>');
							jQuery("#in-modal-ccsecuritycode").css("border-color","#b94a48");
							$(".checkbox").css("margin-top","44px");
						}else{
							$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: -9px; left: 134px;" id="powerTipError" class="help-block backbone-validation"></div></div>');
							jQuery("#ccsecuritycode").css("border-color","#b94a48");
						}
					}
					else{
					$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
				}
				}

				$target = $group.find('.help-block');
			}
			
			return $target.text(error);
		}
	});
	 // --------------------------------
    // Custom validators
    // --------------------------------
    _.extend(Backbone.Validation.validators, {
        liveAddressValidator: function (value, attr, customValue, model) {
            if (!value) {
                return null;
            }
            console.log('custom validator liveaddress');
            console.log(value);
        }
    });

})();
// Backbone.View.js
// ----------------
// Extends native Backbone.View with a bunch of required methods
// most of this were defined as no-ops in ApplicationSkeleton.js
(function ()
{
	'use strict';
	
	_.extend(Backbone.View.prototype, {
		// Default error message, usally overwritten by server response on error
		errorMessage: 'Sorry, the information below is either incomplete or needs to be corrected.'
		
		// dont_scroll will eventually be changed to an object literal
	,	showContent: function (dont_scroll)
		{
			return this.options.application && this.options.application.getLayout().showContent(this, dont_scroll);
		}

	,	showInModal: function (options)
		{
			return this.options.application && this.options.application.getLayout().showInModal(this, options);
		}

		// Get view's SEO attributes
	,	getMetaDescription: function ()
		{
			return this.metaDescription;
		}

	,	getMetaKeywords: function ()
		{
			return this.metaKeywords;
		}

	,	getMetaTags: function ()
		{
			return jQuery('<head/>').html(this.metaTags || '').children('meta');
		}

		//Backbone.View.getTitle() : returns the document's title to show when this view is active. 
	,	getTitle: function ()
		{
			return this.title;
		}

	,	getCanonical: function ()
		{
			var canonical = location.origin + '/' + Backbone.history.fragment
			,	index_of_query = canonical.indexOf('?');

			// !~ means: indexOf == -1
			return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
		}

		// For paginated pages, you should implement this operations
		// to return the url of the previous and next pages
	,	getRelPrev: jQuery.noop
	,	getRelNext: jQuery.noop

		// "private", shouldn't be overwritten
		// if a custom destroy method is required
		// override the destroy method.
		// This method should still be called
	,	_destroy: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();

			// http://backbonejs.org/#Events-off
			this.model && this.model.off(null, null, this);
			this.collection && this.collection.off(null, null, this);
		}
		
	,	destroy: function ()
		{
			this._destroy();
		}
	});
})();
// Backbone.View.render.js
// -----------------------
// Extends native Backbone.View with a custom rendering method
(function ()
{
	'use strict';
	
	_.extend(Backbone.View.prototype, {

		_render: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();
			
			// if there is a collection or a model, we 
			(this.model || this.collection) && Backbone.Validation.bind(this);
			
			// Renders the template 
			var tmpl = SC.template(this.template+'_tmpl', {view: this});
			
			// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
			// in data-href (only if we are in IE7)
			// IE7 detection courtesy of Backbone
			// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
			var isExplorer = /msie [\w.]+/
			,	docMode = document.documentMode
			,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
			
			if (oldIE)
			{
				tmpl = tmpl.replace(/href="(.+?)(?=")/g,'$&" data-href="$1');
			}

			// appends the content to the view's element
			this.$el.html(tmpl);
			// http://backbonejs.org/#View-delegateEvents
			this.delegateEvents();

			return this;
		}

	,	render: function () 
		{
			return this._render();
		}
	});
})();
// Backbone.View.saveForm.js
// -------------------------
// Extends native Backbone.View with a custom saveForm function to be called when forms are submited
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {

		liveAddressValidated: null,

		// view.saveForm
		// Event halders added to all views
		saveFormToModel: function (e, model, props){
			var self = this;
			console.log('object');
			console.log(self.$savingForm.serializeObject());
			return self.model.save(props || self.$savingForm.serializeObject(), {

				wait: true
			
				// Hides error messages, re enables buttons and triggers the save event 
				// if we are in a modal this also closes it 
			,	success: function (model, response)
				{
					console.log('success');
					console.log(self);
					if (self.inModal && self.$containerModal)
					{
						self.$containerModal.modal('hide');
					}
					
					if (self.$savingForm.length)
					{
						self.hideError( self.$savingForm );
						self.$savingForm.find('[type="submit"], [type="reset"]').attr('disabled', false);
						model.trigger('save', model, response);
					}
					Backbone.trigger('refresh');
					
				}

				// Re enables all button and shows an error message
			,	error: function (model, response)
				{
				
					self.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

					if (response.responseText)
					{
						//console.log(jQuery.parseJSON(response.responseText));
						model.trigger('error', jQuery.parseJSON(response.responseText));
					}
				}
			}
		);
		},
		saveForm: function (e, model, props)
		{
		
			e.preventDefault();

			model = model || this.model;

			
			this.$savingForm = jQuery(e.target).closest('form');
			
			if (this.$savingForm.length)
			{
				// Disables all for submit buttons, to prevent double submitions
				this.$savingForm.find('input[type="submit"], button[type="submit"]').attr('disabled', true);
				// and hides reset buttons 
				this.$savingForm.find('input[type="reset"], button[type="reset"]').hide();
			}
			
			this.hideError();

			var self = this;
		      // Do not persist invalid models.
			var options = {
					wait:true,
					success:function(){console.log('success');},
					error:function(){console.log('error');}
					};
			options = _.extend({validate: true}, options);
			console.log('before');
			var validation_promise = jQuery.Deferred();
		    if (!self.model._validate(self.$savingForm.serializeObject(), options)) {
		    	validation_promise.reject();
		    	return validation_promise;
		    };
                     if(self.$savingForm.serializeObject().addr1!=undefined && self.$savingForm.serializeObject().addr1!=null){
			if(self.$("input[hiddenname='ignoresuggestion']").val()!='true'){
		    	  //LiveView address validation
				var addr = {
						street: self.$savingForm.serializeObject().addr1,
						city: self.$savingForm.serializeObject().city,
						state:  self.$savingForm.serializeObject().state,
						zipcode: self.$savingForm.serializeObject().zip
					};
		    
//		    LiveAddress.verify(addr, 
//					function(response){
//						console.log("after 1----------------");
//						console.log(response);
//						if(response.length==0){
//							console.log("after 2");
//							self.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);
//							self.model.trigger('error',{
//								errorCode: 'ERR_CHK_INVALID_ADDRESS'
//								,	errorMessage: _('The selected address is invalid').translate()
//								});
//							validation_promise.reject();
//						}
//						else{
//							console.log("after 3");
//							var zipcode = response[0].components.zipcode;
//							if(self.$savingForm.serializeObject().zip.length == 10)
//								zipcode += '-' + response[0].components.plus4_code;
//							//check if address matches the one from liveaddress service
//							//if matches - submit to model, if not - show suggestion message
//							if(response[0].delivery_line_1 != self.$savingForm.serializeObject().addr1 
//									|| response[0].components.city_name != self.$savingForm.serializeObject().city
//									|| response[0].components.state_abbreviation != self.$savingForm.serializeObject().state
//									|| zipcode != self.$savingForm.serializeObject().zip
//							){
//								console.log("after 4");
//								Backbone.trigger('setSuggestedAddress',response[0]);
//console.log(self.$savingForm);
//								self.model.trigger('error',{
//									errorCode: 'ERR_CHK_INVALID_ADDRESS'
//									,	errorMessage: _('<div style="display: table-cell;">You typed:<br/>' + self.$savingForm.serializeObject().addr1 + '<br/>'+
//											self.$savingForm.serializeObject().city + ' ' + self.$savingForm.serializeObject().state + ' ' + self.$savingForm.serializeObject().zip
//											+'<input id="ignorethisaddress" type="button" value="ignore"></input></div><div style="display: table-cell;padding-left: 50px;">We found the following:<br/>' + response[0].delivery_line_1 + '<br/>' + response[0].last_line).translate() + '<input id="usethisaddress" type="button" value="use this"></input></div>'
//									});
//								validation_promise.reject();
//							}
//							else{
//								console.log("after 5");
//								var result = self.saveFormToModel(e, model, props);
//								result.done(function(){validation_promise.resolve(self.model);});
//								
//							}
//						}
//				});
			// Returns the promise of the save acction of the model
				var result = self.saveFormToModel(e, model, props);
				result.done(function(){validation_promise.resolve(self.model);});
			return validation_promise.promise();
		    }else{
				var result = self.saveFormToModel(e, model, props);
				result.done(function(){validation_promise.resolve(self.model);});
				return validation_promise.promise();
		    }
		}
		    else{
		    	
//				var result = self.saveFormToModel(e, model, props);
//				result.done(function(){validation_promise.resolve(self.model);});
//				return validation_promise.promise();
//				return result;
				return self.saveFormToModel(e, model, props);
			}
		}
	});
})();
// Backbone.View.toggleReset.js
// -----------------------
// Backbones' view extension for showing/hiding a "reset" button that restore all form's fields that have changed 
// You have to assign the change event of the inputs of a form to call this function
// For example in the "events" array of a view: 
// 
// 'change form' : 'toggleReset'
//
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {
		
		// the "debounce" add a small delay between the eventr and the function triggering
		// it's useful when the user is writting so we don't trigger the event after every keypress
		toggleReset: _.debounce(function (e)
		{
			var $form = jQuery(e.target).closest('form')
			,	model = this.model
			,	attribute, value

			// look for the changed fields
			,	fields_changed = _.filter( $form.serializeObject(), function ( item, key )
				{
					attribute = model.get( key );
					value = jQuery.trim( item );

					return attribute ? attribute !== value : !!value;
				});

			// if some field changed, the reset button is shown
			$form.find('[data-action="reset"]')[ fields_changed.length ? 'removeClass' : 'addClass' ]('hide');

			return this;
		},300)
	});
})();
// jQuery.ajaxSetup.js
// -------------------
// Adds the loading icon, updates icon's placement on mousemove
// Changes jQuery's ajax setup defaults
(function ()
{
	'use strict';

	// Variable used to track the mouse position
	var mouse_position = {
		top: 0
	,	left: 0
	};
	
	jQuery(document).ready(function ()
	{
		var $body = jQuery(document.body)
		,	$loading_icon = jQuery('#loadingIndicator');

		if (!$loading_icon.length)
		{
			// if the icon wasn't there, lets add it and make a reference in the global scope
			$loading_icon = SC.$loadingIndicator = jQuery('<img/>', {
				id: 'loadingIndicator'
			,	'class': 'global-loading-indicator'
			,	src: _.getAbsoluteUrl('img/ajax-loader.gif')
			,	css: {
					zIndex: 9999
				,	position: 'absolute'
				}
			}).hide().appendTo($body);
		}

		// loading icon sizes, used for positioning math
		var icon_height = 16
		,	icon_width = 16;

		$body.on({
			// On mouse move, we update the icon's position, even if its not shown
			mousemove: function (e)
			{
				// TODO: if we use a setTimeOut we would improve the performance of this
				mouse_position = {
					top: Math.min($body.innerHeight() - icon_height, e.pageY + icon_width)
				,	left: Math.min($body.innerWidth() - icon_width, e.pageX + icon_height)
				};

				$loading_icon.filter(':visible').css(mouse_position);
			}
			// when the body resizes, we move the icon to the bottom of the page
			// so we don't get some empty white space at the end of the body
		,	resize: function ()
			{
				var icon_offset = $loading_icon.offset();

				mouse_position = {
					top: Math.min($body.innerHeight() - icon_height, icon_offset.top)
				,	left: Math.min($body.innerWidth() - icon_width, icon_offset.left)
				};

				$loading_icon.filter(':visible').css(mouse_position);
			}
		});
	});
	
	SC.loadingIndicatorShow = function ()
	{
		SC.$loadingIndicator && SC.$loadingIndicator.css(mouse_position).show();
	};
	
	SC.loadingIndicatorHide = function ()
	{
		SC.$loadingIndicator && SC.$loadingIndicator.hide();
	};
	
	// This registers an event listener to any ajax call
	jQuery(document)
		// http://api.jquery.com/ajaxStart/
		.ajaxStart(SC.loadingIndicatorShow)
		// http://api.jquery.com/ajaxStop/
		.ajaxStop(SC.loadingIndicatorHide);
	
	// http://api.jquery.com/jQuery.ajaxSetup/
	jQuery.ajaxSetup({
		beforeSend: function (jqXhr, options)
		{
			// BTW: "!~" means "== -1"
			if (!~options.contentType.indexOf('charset'))
			{
				// If there's no charset, we set it to UTF-8
				jqXhr.setRequestHeader('Content-Type', options.contentType + '; charset=UTF-8');
			}
		}
	});
})();
// jQuery.serializeObject.js
// -------------------------
// Used to transform a $form's data into an object literal
// with 'name: value' pairs
(function ()
{
	'use strict';

	jQuery.fn.serializeObject = function ()
	{
		var o = {}
			// http://api.jquery.com/serializeArray/
		,	a = this.serializeArray();
		
		// When a checkbox is not checked, we need to send the "unchecked value"
		// that value is held as a data attribute: "data-unchecked-value"
		this.find('input[type=checkbox]:not(:checked)[data-unchecked-value]').each(function ()
		{
			var $this = jQuery(this);

			a.push({
				name: $this.prop('name')
			,	value: $this.data('unchecked-value')
			});
		});
		
		// Then we just loop through the array to create the object
		jQuery.each(a, function ()
		{
			if (o[this.name] !== undefined)
			{
				if (!o[this.name].push)
				{
					o[this.name] = [o[this.name]];
				}

				o[this.name].push(this.value || '');
			}
			else
			{
				o[this.name] = this.value || '';
			}
		});
		
		return o;
	};
	
})();
// String.format.js
// ----------------
// Used for the translation method in Utils.js
// Will replace $(n) for the n parameter entered 
// eg: "This $(0) a $(1), $(0) it?".format("is", "test");
//     returns "This is a test, is it?"
(function () {
	'use strict';
	
	String.prototype.format = function ()
	{
		var args = arguments;

		return this.replace(/\$\((\d+)\)/g, function (match, number)
		{ 
			return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	};

})();
// Underscore.templates.js
// -----------------------
// Handles compiling for the templates
// Pre-compiles all of the macros
// Adds comments to the begining and end of each template/macro
// to make it easier to spot templates with development tools
(function ()
{
	'use strict';
	
	SC.handleMacroError = function (error, macro_name)
	{
		console.error('Error in macro: '+ macro_name +', '+ error.stack);
	};
	
	
	SC.compileMacros = function compileMacros(macros)
	{
		// Exports all macros to SC.macros
		SC.macros = {};

		var context = {

			// registerMacro:
			// method used on every macro to define itself
			registerMacro: function (name, fn)
			{
				var original_source = fn.toString()
					// Adds comment lines at the begining and end of the macro
					// The rest of the mumbo jumbo is to play nice with underscore.js
				,	modified_source = ';try{var __p="\\n\\n<!-- MACRO STARTS: '+ name +' -->\\n";'+ original_source.replace(/^function[^\{]+\{/i, '').replace(/\}[^\}]*$/i, '') +';__p+="\\n<!-- MACRO ENDS: '+ name +' -->\\n";return __p;}catch(e){SC.handleMacroError(e,"'+ name +'")}' || []
					// We get the parameters from the string with a RegExp
				,	parameters = original_source.slice(original_source.indexOf('(') + 1, original_source.indexOf(')')).match(/([^\s,]+)/g) || [];
				
				parameters.push(modified_source);
				
				// Add the macro to SC.macros
				SC.macros[name] = _.wrap(Function.apply(null, parameters), function (fn)
				{
					return jQuery.trim(
						fn.apply(this, _.toArray(arguments).slice(1))
					);
				});
			}
		};
		
		// Now we compile de macros
		_.each(macros, function (macro)
		{
			try
			{
				// http://underscorejs.org/#template
				_.template(macro, context);
			}
			catch (e)
			{
				// if there's an arror compiling a macro we just
				// show the name of the macro in the console and carry on
				SC.handleMacroError(e, macro.substring( macro.indexOf('(') + 2, macro.indexOf(',') - 2 ) );
			}
		});
	};

	// Template compaling and rendering.
	// We compile the templates as they are needed 
	var processed_templates = {};

	function template (template_id, obj)
	{
		// Makes sure the template is present in the template collection 
		if (!SC.templates[template_id])
		{
			throw new Error('Template \''+template_id+'\' is not present in the template hash :(');
		}
		
		try
		{
			// If the temlpate hasn't been complied we compile it and add it to the library
			processed_templates[template_id] = processed_templates[template_id] || _.template(SC.templates[template_id] || '');
			// Then we return the template, adding the start and end comment lines
			return '\n\n<!-- TEMPLATE STARTS: '+ template_id +'-->\n'+ processed_templates[template_id](_.extend({}, SC.macros, obj)) +'\n<!-- TEMPLATE ENDS: '+ template_id +' -->\n';
		}
		catch (err)
		{
			// This adds the template id to the error message so you know which template to look at
			err.message = 'Error in template '+template_id+': '+err.message;
			throw err;
		}
	}

	// This is the noop function declared on Main.js
	SC.template = template;
	
})();

/*!
* Description: SuiteCommerce Reference Checkout
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with Checkout specific core methods

(function ( Checkout )
{
	'use strict';

	// Extends the layout of Checkout
	Checkout.Layout = Checkout.Layout.extend({
	
		// Register the global key Elements, in this case the sidebar and the breadcrum
		key_elements: {
			breadcrumb: '#breadcrumb'
		}
	});
	
	// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	// TODO: EXTEND THIS AS A EXTRA 
	_.extend(Checkout, {
		resizeImage: function (url, size)
		{
			var mapped_size = Checkout.getConfig('imageSizeMapping.'+ size, size);
			return SC.Utils.resizeImage(Checkout.getConfig('siteSettings.imagesizes', []), url, mapped_size);
		}
	});
	
	Checkout.start = _.wrap(Checkout.start, function(fn)
	{
		var wizard_modules = _(this.getConfig('checkoutSteps')).chain().pluck('steps').flatten().pluck('modules').flatten().value();
		
		wizard_modules = _.uniq(wizard_modules);
		
		this.Configuration.modules = _.union(this.getConfig('modules'), wizard_modules);
		
		fn.apply(this, _.toArray(arguments).slice(1));
	});
	
	// This makes that Promo codes and GC travel to different servers (secure and unsecure)
	Checkout.on('afterStart', function()
	{
		// Eximines the event target to check if its a touchpoint
		// and replaces it with the new version ot the touchpoint
		function fixCrossDomainNavigation(e)
		{
			var $element = jQuery(e.target);
			if (!$element.closest('#main').length)
			{
				var href = e.target.href
				,	touchpoints = Checkout.getConfig('siteSettings.touchpoints');
				_.each(touchpoints, function(touchpoint)
				{
					if (~touchpoint.indexOf(href.split('?')[0]))
					{
						e.target.href = touchpoint;
					}
				});
			}
		}
		// As this fixCrossDomainNavigation only alters the href of the a we can append it 
		// to the mouse down event, and not to the click thing will make us work a lot more :)
		jQuery(document.body).on('mousedown', 'a', fixCrossDomainNavigation);
		jQuery(document.body).on('touchstart', 'a', fixCrossDomainNavigation);
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:false});
	
})( SC.Application('Checkout') );
// Configuration.js
// ----------------
// All of the applications configurable defaults
// Each section is comented with a title, please continue reading

(function (application)
{
	'use strict';

	//window.screen = false; //always comment this line on production !!
	// Calculates the width of the device, it will try to use the real screen size.
	var screen_width = (window.screen) ? window.screen.availWidth : window.outerWidth || window.innerWidth;	

	application.Configuration = {};

	_.extend(application.Configuration, {
				
		// header_macro will show an image with the url you set here
		logoUrl: ''

		// depending on the application we are configuring, used by the NavigationHelper.js
	,	currentTouchpoint: 'checkout'
		
		// list of the applications required modules to be loaded
		// de dependencies to be loaded for each module are handled by
		// [require.js](http://requirejs.org/)
	,	modules: [
			// ItemDetails should always be the 1st to be added
			// there will be routing problmes if you change it
			['ItemDetails',  {startRouter: true}]
		,	['Cart', {startRouter: false}]
		,	['LoginRegister', {startRouter: true}]
		,	'BackToTop'
		,	'Profile'
		,	'CreditCard'
		,	'Address'
		,	'OrderWizard'
		,	'Facets.Model'
		,	'LanguageSupport'
		,	'MultiCurrencySupport'
		,	'MultiHostSupport'
		,	'NavigationHelper'
		,	'SiteSearch'
		,	'AjaxRequestsKiller'
		,	'ErrorManagement'
		,	'GoogleAnalytics'
		,	'Merchandising'

			// TODO: This modules need to be loaded on boot time, and they are needed within a module, so they are not caught by our fix.
		,	'OrderWizard.Module.PaymentMethod.Creditcard'
		,	'OrderWizard.Module.PaymentMethod.Invoice'
		,	'OrderWizard.Module.PaymentMethod.PayPal'
		]

	,	defaultSearchUrl: 'search'

	,	startCheckoutWizard: true

// The checkoutSteps properties is an array that defines the entire Checkout experience. It is based on a Wizard, this is a list of 
// steps that the user secuentially complete submitting the order at the end. Each step contains one or more modules that perform a logic 
// task like showing or asking the user certain information. 
// In this configuration file there three fully functional examples of the checkout experience: 
// 1) The normal three steps checkout (uncommented), 2) the One Page Checkout (commented) and 3) a four step "Billing First" Checkout (commented). 
// For trying the later two just replace the checkoutSteps property value with the desired commented one. 

// The following describes the format of the checkoutSteps property
/*
checkoutSteps: [											//an array with the step groups conforming The Checkout
	{
		name: 'Step Group'									//the name of this Step Group
	,	steps: [											//an array of the steps of this step group
			{
				name: 'Step'								//literal name for this step
			,	getName: function()	{return 'a name'; }		//dynamic name for this step. If there is no getname() defined, name property will be used instead
			,	url: 'step-url'								//this step's url. Must be unique among all the steps
			,	continueButtonLabel: "Continue"				//The label of the 'Continue' button for this step, for example, for One Page Checkout it could be 'Place Order'
			,	hideBackButton: true						//if true the "Back" button will be hidden for this step
			,	hideContinueButton: true					//if true the "Continue" buttons in the page will be hidden for this step
			,	hideSecondContinueButtonOnPhone: true		//if true the second "Continue" button in the page will be hidden when displayed on a smartphone. Use this if there are too many "Continue" buttons in a step (i.e. top, bottom and summary buttons)
			,	hideSummaryItems: true						//if true the cart summary's items are not showed on this step
			,	hideSummary: true							//if true the cart summary is not showed on this step
			,	hideBreadcrumb: true						//if true the breadcrumb in the page will be hidden for this step
			,	headerMacro: 'header'						//each step can define which main site header to show when the user is placed on it. By default the simplyfied macro is used, but the normal 'header' (or a custom one) can be used		
			,	footerMacro: 'footer'						//as with the header, each step can define which site footer to use, by default the simplified footer is used. 
			,	bottomMessage: 'Some message at the bottom' //a message that will appear at the bottom of the step, under the "continue" and "back" buttons
			,	modules: [									//Required, the list modules that form this step, the order will be respected vissually from top to bottom. 
					'Module.Name'							//three different module syntax are supported String, array or object. 
				,	['Module2', {edit_url: '/someurl'}]		//individual modules may accept configuration parameters that will be applied to the module for this step. In this case the edit_url is accepted by those modules that ask the user to edit data from modules in ahother step, so it must be a valid step url.
				,	{name: 'Module3', title: 'My module!'}	//also modules accept the property 'title' for showing a small title on top of the module.
				]
			,	save: function()							//a custom save function which 'this' context will be the Step (a Backbone view)
				{
					return this.wizard.model.submit();
				}
			}
		]
	}
]
*/


/* the normal three step checkout */
	,	checkoutSteps: [
			{
				name: _('Shipping & Delivery').translate()
			,	steps: [
					//{
					//	name: _('Enter Shipping Address').translate(),	
//					hideBackButton: true
//					,	hideSummary: screen_width < 768 //hide summary on phone
//					/*,	getName: function()	
//						{
//							if (this.wizard.options.profile.get('addresses').length)
//							{
//								return _('SELECT YOUR SHIPPING ADDRESS').translate();
//							}
//							else
//							{
//								return _('ENTER YOUR SHIPPING ADDRESS').translate();
//							}
//						}*/
//					,	url: 'shipping/address'
//,	continueButtonLabel: _('Next Step').translate()
//					,	modules: [
//							['OrderWizard.Module.Address.Shipping']
//						]
//					},
					{
					//	name: _('Select your delivery method').translate(),	
					url: 'shipping/method'
					,	hideBackButton: true
					//,	hideSummary: screen_width < 768 //hide summary on phone
,	continueButtonLabel: _('Next: BILLING & PAYMENT').translate()
					,	modules: [
							['OrderWizard.Module.Address.Shipping', {title: _('SELECT YOUR SHIPPING ADDRESS').translate()}]
						,	'OrderWizard.Module.Shipmethod'
						,	['OrderWizard.Module.CardMessage',{title:_('IS THIS ORDER A GIFT?').translate()}]
						]
					}
				]
			},
			
			{
				name: _('Billing & Payment').translate()
			,	steps: [
					{
					//	name: _('Choose Payment Method').translate(),
					url: 'billing'
					,	hideBackButton: false
					//,	hideSummary: screen_width < 768 //hide summary on phone
					,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
					,	continueButtonLabel: _('Next: REVIEW ORDER').translate()
					,	modules: [
						['OrderWizard.Module.Address.Billing', {enable_same_as: true}], 
						'OrderWizard.Module.PaymentMethod.Selector'
			
						//,'OrderWizard.Module.PaymentMethod.GiftCertificates'
					 	          /*
							'OrderWizard.Module.PaymentMethod.GiftCertificates'
						,	'OrderWizard.Module.PaymentMethod.Selector'
						//	configure the address module to show a "same as XXX address" checkbox
						,	['OrderWizard.Module.Address.Billing', {enable_same_as: true, title: _('Enter Billing Address').translate()}]
						,	'OrderWizard.Module.RegisterEmail'*/
						]
					}//,
//					{
//						url: 'confirmation'
//					,	headerMacro: 'header'
//					,	hideSummaryItems: true
//					,	hideContinueButton: true
//					,	hideBackButton: true
//					,	modules: [
//							'OrderWizard.Module.Confirmation'
//						,	'OrderWizard.Module.RegisterGuest'
//						,	'OrderWizard.Module.ShowPayments'
//						,	'OrderWizard.Module.ShowShipments'
//						]
//					,	present: function ()
//						{
//							this.wizard.application.trackTransaction(this.wizard.model);
//						}
//					}
				]
			}
		
		,
		//maintenance------------------
//		{
//		name: _('Billing & Payment test').translate()
//	,	steps: [
//			{
//			//	name: _('Choose Payment Method').translate(),
//			url: 'paymentandbilling'
//			,	hideBackButton: false
//			,	hideSummary: screen_width < 768 //hide summary on phone
//			,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
//			,	continueButtonLabel: _('Next: REVIEW ORDER').translate()
//			,	modules: [
//				'OrderWizard.Module.PaymentAndBilling'
//				]
//			}
//			
//		]
//	},
	//--------------------maintenance
	
		{
				name: _('Review Order').translate()
			,	steps: [
					{
					/*	name: _('Review Your Order').translate()
					,*/	url: 'review'
					,	continueButtonLabel: _('Place Order').translate()
					,	hideBackButton: true
					,	hideSummaryItems: true
					,	modules: [
					    	['OrderWizard.Module.ShowPayments', {edit_url_billing: '/billing', edit_url_address: '/billing', shipping_change_url: '/addressbook'}]	
						,	'OrderWizard.Module.TermsAndConditions'
						//,	['OrderWizard.Module.ShowShipments', {edit_url: '/shipping/address', show_edit_button: true}]
//						,	['OrderWizard.Module.CardMessage',{title:_('IS THIS ORDER A GIFT?').translate()}]
						
						]
					,	save: function()
						{
							return this.wizard.model.submit();
						}
					}
				,
			
				{
					url: 'confirmation'
				,	headerMacro: 'header'
				,	hideSummaryItems: true
				,	hideContinueButton: true
				,	hideBackButton: true
				,	modules: [
					/*	'OrderWizard.Module.Confirmation'
					,*/	'OrderWizard.Module.RegisterGuest'
					,	'OrderWizard.Module.ShowShipments'
					]
				,	present: function ()
					{
						this.wizard.application.trackTransaction(this.wizard.model);
					}
				}
				
				]
			}
		]

/* The One Page Checkout Scenario */

/*		,	checkoutSteps: [
			{
				name: _('Place Order').translate()
			,	steps: [
					{
						name: null
					,	url: 'opc'
					,	continueButtonLabel: _('Place Order').translate()
					,	hideBackButton: true
					,	hideBreadcrumb: true
					,	hideSecondContinueButtonOnPhone: true
					,	modules: [
							['OrderWizard.Module.Address.Shipping', {title: _('Enter Shipping Address').translate()}]
						,	['OrderWizard.Module.Shipmethod', {title: _('Choose delivery method').translate()}]
						,	['OrderWizard.Module.PaymentMethod.GiftCertificates', {title: _('Choose Payment Method').translate()}]
						,	['OrderWizard.Module.PaymentMethod.Selector', {
								modules: [
									{
										classModule: 'OrderWizard.Module.PaymentMethod.Creditcard'
									,	name: _('Credit / Debit Card').translate()
									,	type: 'creditcard'
									,	options: {}
									}
								,	{
										classModule: 'OrderWizard.Module.PaymentMethod.Invoice'
									,	name: _('Invoice').translate()
									,	type: 'invoice'
									,	options: {}
									}
								,	{
										classModule: 'OrderWizard.Module.PaymentMethod.PayPal'
									,	name: _('PayPal').translate()
									,	type: 'paypal'
									,	options: {backFromPaypalBehavior: 'stay'} // other value also supported 'advance'
									}
								]
							}]
						,	['OrderWizard.Module.Address.Billing', {enable_same_as: true, title: _('Enter Billing Address').translate()}]
						,	'OrderWizard.Module.RegisterEmail'
						,	'OrderWizard.Module.TermsAndConditions'

						]
					,	save: function()
						{
							if (this.wizard.isPaypal() && !this.wizard.isPaypalComplete())
							{
								return this._save();
							}
							else
							{
								return this.wizard.model.submit();
							}
							
						}
					}
				]
			}
		,	{
				name: _('Thanks').translate()
			,	steps: [
					{
						url: 'thanks'
					,	headerMacro: 'header'
					,	hideSummaryItems: true
					,	hideContinueButton: true
					,	hideBreadcrumb: true
					,	hideBackButton: true
					,	modules: [
							'OrderWizard.Module.Confirmation'
						,	'OrderWizard.Module.RegisterGuest'
						//,	'OrderWizard.Module.ShowPayments'
						//,	'OrderWizard.Module.ShowShipments'
						]
					,	present: function ()
						{
							this.wizard.application.trackTransaction(this.wizard.model);
						}
					}
				]
			}
		]
*/


/* The Billing First Scenario */

/*

,	checkoutSteps: [
			{
				name: _('Addresses').translate()
			,	steps: [
					{
						name: _('Enter Billing Address').translate()
					,	url: 'billing/address'
					,	hideBackButton: true
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							'OrderWizard.Module.Address.Billing'
						]
					}
				,	{
						name: _('Enter Shipping Address').translate()
					,	getName: function()	
						{
							if (this.wizard.options.profile.get('addresses').length)
							{
								return _('Choose Shipping Address').translate();
							}
							else
							{
								return _('Enter Shipping Address').translate();
							}
						}
					,	url: 'shipping/address'
					,	hideBackButton: true
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							['OrderWizard.Module.Address.Billing', {edit_url: '/billing/address', title: _('Billing Address').translate()}]
						,	['OrderWizard.Module.Address.Shipping', {enable_same_as: true, title: _('Shipping Address').translate()}]
						]
					}
				]
			}
		,	{
				name: _('Shipping method').translate()
			,	steps: [
					{
						name: _('Choose delivery method').translate()
					,	url: 'shipping/method'
					,	hideBackButton: true
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							['OrderWizard.Module.Address.Shipping', {edit_url: '/shipping/address'}]
						,	'OrderWizard.Module.Shipmethod'
						]
					}
				]
			}
		,	{
				name: _('Payment').translate()
			,	steps: [
					{
						name: _('Choose Payment Method').translate()
					,	url: 'billing'
						// for each Step, a message that will appear at the end of the step can be configured. 
					,	bottomMessage: _('You will have an opportunity to review your order on the next step.').translate()
					,	hideSummary: screen_width < 768 //hide summary on phone
					,	modules: [
							'OrderWizard.Module.PaymentMethod.GiftCertificates'
						,	'OrderWizard.Module.PaymentMethod.Selector'
						//	configure the address module to show a "same as XXX address" checkbox
						,	['OrderWizard.Module.Address.Billing', {enable_same_as: false, edit_url: 'billing/address'}]
						,	'OrderWizard.Module.RegisterEmail'
						]
					}
				]
			}
		,	{
				name: _('Review & Place Order').translate()
			,	steps: [
					{
						name: _('Review Your Order').translate()
					,	url: 'review'
					,	continueButtonLabel: _('Place Order').translate()
					,	hideBackButton: true
					,	hideSummaryItems: true
					,	modules: [
							['OrderWizard.Module.ShowPayments', {edit_url_billing: '/billing', edit_url_address: '/billing/address' }]
						,	['OrderWizard.Module.ShowShipments', {edit_url: '/shipping/address', show_edit_button: true}]
						,	'OrderWizard.Module.TermsAndConditions'
						]
					,	save: function()
						{
							return this.wizard.model.submit();
						}
					}
				,	{

						url: 'confirmation'
					,	headerMacro: 'header'
					,	hideContinueButton: true
					,	hideSummaryItems: true
					,	hideBackButton: true
					,	modules: [
							'OrderWizard.Module.Confirmation'
						,	'OrderWizard.Module.RegisterGuest'
						,	'OrderWizard.Module.ShowPayments'
						,	'OrderWizard.Module.ShowShipments'
						]
					}
				]
			}
		]
*/
		// default macros
	,	macros: {
			
			itemOptions: {
				// each apply to specific item option types
				selectorByType: 
				{
					select: 'itemDetailsOptionTile'
				,	'default': 'itemDetailsOptionText'
				}
				// for rendering selected options in the shopping cart
			,	selectedByType: {
					'default': 'shoppingCartOptionDefault'
				}
			}
			// default merchandising zone template
		,	merchandisingZone: 'merchandisingZone'
		}

		// array of links to be added to the header
		// this can also contain subcategories
	,	navigationTabs: [
			{
				text: _('Home').translate()
			,	href: '/'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#/'
				}
			}
		,	{
				text: _('Shop').translate()
			,	href: '/search'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#/search'
				}
			}
		]



		// options to be passed when querying the Search API
	,	searchApiMasterOptions: {
			Facets: {
				fieldset: 'search'
			}

		,	itemDetails: {
				fieldset: 'details'
			}

			// don't remove, get extended
		,	merchandisingZone: {}
		}

		// Analytics Settings
	,	tracking: {
			trackPageview: true
		,	google: {
				propertyID: 'UA-37219823-1'
				// [Tracking Between a Domain and a Sub-Directory on Another Domain](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite?hl=en#domainAndSubDirectory)
			,	domainName: 'none'
			}
		}

		// Typeahead Settings
	,	typeahead: {
			minLength: 3
		,	maxResults: 8
		,	macro: 'typeahead'
		}

		// setting it to false will search in the current results
		// if on facet list page
	,	isSearchGlobal: true

		// url for the not available image
	,	imageNotAvailable: _.getAbsoluteUrl('img/no_image_available.jpeg')
		
		// map of image custom image sizes
		// usefull to be customized for smaller screens
	,	imageSizeMapping: {
			thumbnail: 'thumbnail' // 175 * 175
		,	main: 'main' // 600 * 600
		,	tinythumb: 'tinythumb' // 50 * 50
		,	zoom: 'zoom' // 1200 * 1200
		,	fullscreen: 'fullscreen' // 1600 * 1600
		}
		
		// Macro to be rendered in the header showing your name and nav links
		// we provide be 'headerProfile' or 'headerSimpleProfile'
	,	profileMacro: 'headerProfile'

	,	languagesEnabled: true
		
		// When showing your credit cards, which icons should we use	
	,	creditCardIcons: {
			'VISA': 'img/visa.png'
		,	'Discover': 'img/discover.png'
		,	'Master Card': 'img/master.png'
		,	'American Express': 'img/american.png'
		}

		// Search preferences
	,	searchPrefs: {
			// keyword maximum string length - user won't be able to write more than 'maxLength' chars in the search box
			maxLength: 40

			// keyword formatter function will format the text entered by the user in the search box. This default implementation will remove invalid characters like *(){}+-=" that causes known problems
		,	keywordsFormatter: function (keywords)
			{ 
					// characters that cannot appear at any location
				var anyLocationRegex = /[\(\)\[\]\{\}\!\"\:]{1}/g
					// characters that cannot appear at the begining
				,	beginingRegex = /^[\*\-\+\~]{1}/g
					// replacement for invalid chars
				,	replaceWith = '';

				return keywords.replace(anyLocationRegex, replaceWith).replace(beginingRegex, replaceWith); 
			}
		}

		//Invoice payment method terms and conditions text 
	,	invoiceTermsAndConditions: _('<h4>Invoice Terms and Conditions</h4><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>').translate()
	});
		
	// Phone Specific
	if (screen_width < 768)
	{
		_.extend(application.Configuration, {});
	}
	// Tablet Specific
	else if (screen_width >= 768 && screen_width <= 1024)
	{
		_.extend(application.Configuration, {});
	}
	// Desktop Specific
	else
	{
		_.extend(application.Configuration, {});
	}
	
})(SC.Application('Checkout'));

// ItemsKeyMapping.js
// ------------------
// Holds the mapping of whats retuned by the search api / Commerce api for items
// to what is used all across the application.
// The main reason behind this file is that you may eventually want to change were an attribute of the item is comming from,
// for example you may want to set that the name of the items are store in a custom item field instead of the display name field,
// then you just change the mapping here instead of looking for that attribute in all templates and js files
(function () 
{
	'use strict';

	// itemImageFlatten: 
	// helper function that receives the itemimages_detail (returned by the search api) 
	// and flatens it into an array of objects containing url and altimagetext
	function itemImageFlatten (images)
	{
		if ('url' in images && 'altimagetext' in images)
		{
			return [images];
		}

		return _.flatten(_.map(images, function (item)
		{
			if (_.isArray(item))
			{
				return item;
			}

			return itemImageFlatten(item);
		}));
	}

	// This file can be used for multiple applications, so we avoided making it application specific 
	// by iterating the collection of defined applications.
	_.each(SC._applications, function (application)
	{
		// Makes double sure that the Configuration is there
		application.Configuration = application.Configuration || {};

		// Extends the itemKeyMapping configuration
		// The key mapping object is simple object were object keys define how the application is going to call it 
		// and values define from which key to read in the result of the search api
		// There are three posible ways to define a key mapping:
		//   - _key: "search_api_key" -- This means, Whenever I ask you for the _key returned anythig that you have in the search_api_key key of the item object
		//   - _key: ["search_api_key", "second_options"] -- similar as avobe, but if the 1st key in the array is falsy go and try the next one, it will retun the 1st truthful value
		//   - _key: function(item) { return "something you want"; } -- you can also set up a function that will recive the item model as argument and you can set what to return.
		application.Configuration.itemKeyMapping = _.extend(application.Configuration.itemKeyMapping || {}, {

			// Item Internal Id: used as a fallback to the url and to add to cart
			// You should not need to change this tho
			_id: 'internalid'

			// Item SKU number
		,   _sku: 'itemid'

			// Name of the item, some times displayname is empty but storedisplayname2 tends to be set always
		,   _name: function (item)
			{
				// If its a matrix child it will use the name of the parent
				if (item.get('_matrixParent').get('internalid') ) 
				{
					return item.get('_matrixParent').get('storedisplayname2') || item.get('_matrixParent').get('displayname');
				}

				// Otherways return its own name
				return item.get('storedisplayname2') || item.get('displayname');
			}

			// Page Title of the PDP
		,   _pageTitle: ['pagetitle', 'storedisplayname2', 'displayname']

			// h1 of the PDP and also the title of the modal
		,   _pageHeader: ['storedisplayname2', 'displayname']

		,	_keywords: 'searchkeywords'

		,	_metaTags: 'metataghtml'
			
			// This retuns the breadcrum json obj for the PDP
		,   _breadcrumb: function (item)
			{
				var breadcrumb = [{
					href: '/'
				,   text: _('Home').translate()
				}];
				
				if (item.get('defaultcategory_detail'))
				{
					var category_path = '';

					_.each(item.get('defaultcategory_detail'), function (cat)
					{
						category_path += '/'+cat.url;
						breadcrumb.push({
							href: category_path
						,   text: cat.label
						});
					});
				}

				breadcrumb.push({
					href: item.get('_url')
				,   text: item.get('_name')
				});
				
				return breadcrumb;
			}

			// Url of the item
		,   _url: function (item)
			{
				
				// If this item is a child of a matrix return the url of the parent
				if (item.get('_matrixParent') && item.get('_matrixParent').get('internalid'))
				{
					return item.get('_matrixParent').get('_url');
				}
				// if its a standar version we need to send it to the canonical url
				else if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD')
				{
					return item.get('canonicalurl');
				}
				// Other ways it will use the url component or a default /product/ID
				return item.get('urlcomponent') ? '/'+ item.get('urlcomponent') : '/product/'+ item.get('internalid');
			}

			// For an item in the cart it returns the url for you to edit the item
		,	_editUrl: function (item)
			{
				var url = (item.get('_matrixParent').get('_id')) ? item.get('_matrixParent').get('_url') : item.get('_url');

				// Appends the options you have configured in your item to the url
				url += item.getQueryString();

				// adds the order item id, the view will update the item in the cart instead of adding it  
				if (item.get('line_id'))
				{
					url += '&cartitemid='+ item.get('line_id');
				}

				return url;
			}

			// Object containing the url and the altimagetext of the thumbnail
		,   _thumbnail: function (item)
			{
				var item_images_detail = item.get('itemimages_detail') || {};

				// If you generate a thumbnail position in the itemimages_detail it will be used
				if (item_images_detail.thumbnail)
				{
					return item_images_detail.thumbnail;
				}

				// otherwise it will try to use the storedisplaythumbnail
				if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD' && item.get('storedisplaythumbnail'))
				{
					return {
						url: item.get('storedisplaythumbnail')
					,	altimagetext: item.get('_name')
					};
				}
				// No images huh? carry on

				var parent_item = item.get('_matrixParent');
				// If the item is a matrix child, it will return the thumbnail of the parent
				if (parent_item && parent_item.get('internalid'))
				{
					return parent_item.get('_thumbnail');
				}

				var images = itemImageFlatten(item_images_detail);
				// If you using the advance images features it will grab the 1st one
				if (images.length)
				{
					return images[0];
				}

				// still nothing? image the not available
				return {
					url: application.Configuration.imageNotAvailable
				,	altimagetext: item.get('_name')
				};
			}

			// Array of objects containing the url and the altimagetext of the images of the item
		,	_images: function (item)
			{
				var result = []
				,	selected_options = item.itemOptions
				,	item_images_detail = item.get('itemimages_detail') || {}
				,   swatch = selected_options && selected_options[application.getConfig('multiImageOption')] || null;

				item_images_detail = item_images_detail.media || item_images_detail;
				
				if (swatch && item_images_detail[swatch.label])
				{
					result = itemImageFlatten(item_images_detail[swatch.label]);
				}
				else
				{
					result = itemImageFlatten(item_images_detail);
				}

				return result.length ? result : [{
					url: item.get('storedisplayimage') || application.Configuration.imageNotAvailable
				,	altimagetext: item.get('_name')
				}];
			}

			// For matrix child items in the cart we generate this position so we have a link to the parent
		,	_matrixParent: 'matrix_parent'

			// For matrix parent items, where are the attribures of the children
		,   _matrixChilds: 'matrixchilditems_detail'

			// The definition of the options of items with options
		,   _optionsDetails: 'itemoptions_detail'

			// Related items 
		,   _relatedItems: 'related_items'

			// Item price information
		,   _priceDetails: 'onlinecustomerprice_detail'
		,	_price: function (item)
			{

				return item.get('onlinecustomerprice_detail').onlinecustomerprice;
			}

		,   _comparePriceAgainst: 'pricelevel1'
		,   _comparePriceAgainstFormated: 'pricelevel1_formatted'

			// Item Type
		,   _itemType: 'itemtype'

			// Stock, the number of items you have available
		,   _stock: 'quantityavailable'

		,	_minimumQuantity: function(item)
			{
				return item.get('minimumquantity') || 1;
			}

		,	_isInStock: 'isinstock'
		,	_isPurchasable: 'ispurchasable'
		,	_isBackorderable: 'isbackorderable'
		,	_showOutOfStockMessage: 'showoutofstockmessage'

			// Show the IN STOCK label, this can be configured in a per item basis
		,   _showInStockMessage: function ()
			{
				return false;
			}

			// Should we show the stock description? 
		,   _showStockDescription: function ()
			{
				return true;
			}

			// Stock Description, some times used to display messages like New Arrival, Ships in 3 days or Refubrished
		,   _stockDescription: 'stockdescription'

			// Stock Description class, we use this to add a class to the html element containig the _stockDescription so you can easily style it.
			// This implementation will strip spaces and other punctuations from the _stockDescription and prepend stock-description-
			// so if your _stockDescription is Ships in 3 days your _stockDescriptionClass will be stock-description-ships-in-3-days
		,   _stockDescriptionClass: function (item)
			{
				return 'stock-description-'+ item.get('_stockDescription') || ''.toLowerCase().replace(/\W+/g,'-').replace(/\-+/g,'-');
			}

			// What to write when the item is out of stock
		,   _outOfStockMessage: function (item)
			{
				return item.get('outofstockmessage') || _('Out of Stock').translate();
			}

			// What to write when the item is in stock
		,   _inStockMessage: function ()
			{
				return _('In Stock').translate();
			}

			// Reviews related item attributes

			// Overal item rating
		,   _rating: function (item)
			{
				return Math.round(item.get('custitem_ns_pr_rating') * 10) / 10 || 0;
			}

			// How many times this item was reviewd
		,   _ratingsCount: function (item)
			{
				return item.get('custitem_ns_pr_count') || 0;
			}

			// What are the posible attributes I want this item to be rated on
		,   _attributesToRateOn: function (item)
			{
				return item.get('custitem_ns_pr_item_attributes') && item.get('custitem_ns_pr_item_attributes').split(', ') || [];
			}

			// returns a object containing the average rating per atribute
		,   _attributesRating: function (item)
			{
				return JSON.parse(item.get('custitem_ns_pr_attributes_rating'));
			}

			// returns an object containig how many reviews it the item has for each particular rating
		,   _ratingsCountsByRate: function (item)
			{
				return item.get('custitem_ns_pr_rating_by_rate') && JSON.parse(item.get('custitem_ns_pr_rating_by_rate')) || {};
			}
		});
	});
})();
// Account.ForgotPassword.Model.js
// -------------------------------
// Sends user input data to the forgot password service
// validating email before is sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.ForgotPassword.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-forgot-password.ss')

	,	validation: {
			email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		}
	});
});
// Account.Login.Model.js
// ----------------------
// Sends user input data to the login service
// validating email and password before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.Login.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: function ()
		{
			return _.getAbsoluteUrl('services/account-login.ss') + '?n=' + SC.ENVIRONMENT.siteSettings.siteid;
		}

	,	validation: {
			email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		,	password:  { required: true, msg: _('Please enter a valid password').translate() }
		}
	});
});
// Account.Register.Model.js
// -------------------------
// Sends user input data to the register service
// validating fields before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.Register.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-register.ss')

	,	validation: {
			firstname: { required: true, msg: _('First Name is required').translate() }
		,	lastname: { required: true, msg: _('Last Name is required').translate() }
		,	email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		,	company:  { required: SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T', msg: _('Company Name is required').translate() }
		,	password:  { required: true, msg: _('Please enter a valid password').translate() }
		,	password2: [ 
				{ required: true, msg: _('Confirm password is required').translate() }
			,	{ equalTo: 'password', msg: _('New Password and Confirm Password do not match').translate() }
			]
		}
	});
});
// Account.ResetPassword.Model.js
// ------------------------------
// Sends user input data to the reset password service
// validating passwords before they are sent
// [Backbone.validation](https://github.com/thedersen/backbone.validation)
define('Account.ResetPassword.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({

		urlRoot: _.getAbsoluteUrl('services/account-reset-password.ss')
	,	validation: {
			confirm_password: [ 
				{ required: true, msg: _('Confirm password is required').translate() }
			,	{ equalTo: 'password', msg: _('New Password and Confirm Password do not match').translate() }]
		
		,	password: { required: true, msg: _('New  password is required').translate() }
		}
	});
});
// Address.Collection.js
// -----------------------
// Addresses collection
define('Address.Collection', ['Address.Model'], function (Model)
{
	'use strict';
	
	return Backbone.Collection.extend(
	{
		model: Model
	,	url: 'services/address.ss'

	} );
});

// Address.js
// -----------------
// Defines the Address  module (Model, Collection, Views, Router)
define('Address', ['Address.Views','Address.Model','Address.Router','Address.Collection'], function (Views, Model, Router, Collection)
{
	'use strict';
	
	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});

// Address.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Address.Model', function ()
{
	'use strict';
	
	return Backbone.Model.extend(
	{
		urlRoot: 'services/address.ss'
	,	events:{
		'error': 'showError'
	}
	,	validation: {
			lastfullname: { /*required: true, msg: _('Last Name is required').translate()*/ 
				fn: function(value){
					var reg = /^[a-zA-Z- ]{2,}$/;
					if(value.length == 0 || !reg.test(value)){
						return _('Hey, Professor Imistypedmyname, want to try again?').translate();
					}
					
//					if(value.indexOf(',')>-1||value.indexOf('.')>-1){
//						return 'Last name can not contain comma or period symbols';
//					}
				}
			}
		,	firstfullname: { /*required: true, msg: _('First Name is required').translate(),*/
				fn: function(value){
					var reg = /^[a-zA-Z- ]{2,}$/;
					if(value.length == 0 || !reg.test(value)){
						return _('Is that really your firstname? Try again').translate();
					}
					
//					if(value.indexOf(',')>-1||value.indexOf('.')>-1||value.indexOf(' ')>-1){
//						return 'First name can not contain space, comma or period symbols';
//					}
				}
			}
		,	addr1: { required: true, msg: _('Address is required').translate() }
		,	company: { required: SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T', msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { required: true, msg: _('Zip Code is required').translate() }
		,	phone: { required:true,fn:_.validatePhone}
		}
	
	,	getFormattedAddress: function ()
		{
			var address_formatted = this.get('firstfullname') + '<br>'+
									this.get('fullname') + '<br>' +
									(this.get('company') === null ? '' : this.get('company')+ '<br>')  +
									this.get('addr1') + '<br>' +
									(this.get('addr2') === null ? '' :  this.get('addr2') + '<br>')  +
									this.get('city') + ' ' + (this.get('state') === null ? '' :  this.get('state')) + this.get('zip') + ' ' + this.get('country');

			return address_formatted;
		}
		// render the error message
	,	showError: function (error)
	{
		console.log('address model show error');
		// Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder. 
//		this.$('[data-type="alert-placeholder-module"]:first').html( 
//			SC.macros.message('dsd', 'error', true) 
//		);
	}
	});
});

// CreditCard.Router.js
// -----------------------
// Router for handling addresses (CRUD)
define('Address.Router', ['Address.Views','Address.Model'], function (Views, Model)
{
	'use strict';
	// Adds routes to the application
	return Backbone.Router.extend({
		
		routes: {
			'addressbook': 'addressBook'
		,	'addressbook/new': 'newAddress'
		,	'addressbook/:id': 'addressDetailed'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}
		
	// list profile's addressess
	,	addressBook: function ()
		{
			var collection = this.application.getUser().get('addresses');

			if (collection.length)
			{
				var view = new Views.List({
						application: this.application
					,	collection: collection
					});
				
				collection.on('reset destroy change add', function () {
					this.addressBook();
				}, this);
				view.showContent('addressbook');
			}
			else
			{
				Backbone.history.navigate('#addressbook/new', {trigger: true});
			}
		}

	// view address's details
	,	addressDetailed: function (id)
		{
			var collection = this.application.getUser().get('addresses')

			,	model = collection.get(id)
			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				,	model: model
				});
			
			view.model.on('reset destroy change add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#addressbook', {trigger: true});
				}
			}, view);
			console.log("322");
			console.log(view);
			view.showContent('addressbook');
		}

	// add new address 
	,	newAddress: function ()
		{
			var collection = this.application.getUser().get('addresses')

			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				,	model: new Model()
				});
			
			collection.on('add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#addressbook', {trigger: true});
				}
			}, view);

			view.model.on('change', function ( model ) {
				collection.add( model );
			}, this);
			
			view.showContent('addressbook');
		}
	});
});

// CreditCard.Views.js
// -----------------------
// Views for handling addresses (CRUD)
define('Address.Views', function ()
{
	'use strict';

	var Views = {};
	
	// Address details view/edit
	Views.Details = Backbone.View.extend({
		
		template: 'address'
		
	,	attributes: {'class': 'AddressDetailsView'}
	,	events: {
			'submit form': 'saveForm'

		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
,       'click #ignorethisaddress': 'ignoreSuggestedAddress'
		,       'click #usethisaddress':'useSuggestedAddress'
		,	'change select[data-type="country"]': 'updateStates'
		,	'blur input[data-type="phone"]': 'formatPhone'
//		,	'blur #ext': 'formatPhone'
		,	'blur input[name="firstfullname"]': 'verifyFirstName'
		,	'blur input[name="lastfullname"]': 'verifyLastName'
		,	'blur input[name="company"]': 'verifyCompany'
		,	'blur input[name="addr1"]': 'verifyAddress'
		,	'blur input[name="city"]': 'verifyCity'
		,	'blur input[name="zip"]': 'verifyZip'
		,	'click .input-large': 'hidePowerTip'
		,	'click .input-medium': 'hidePowerTip'
		,	'click .input-small': 'hidePowerTip'
		
		}
	, useSuggestedAddress: function () {
				var self = this;
				
				this.$("input[name='addr1']").val(self.suggestedAddress.delivery_line_1);
				this.$("input[name='city']").val(self.suggestedAddress.components.city_name);
				this.$('[data-type="state"]').val(self.suggestedAddress.components.state_abbreviation);
				this.$("input[name='zip']").val(self.suggestedAddress.components.zipcode + '-' + self.suggestedAddress.components.plus4_code);
				self.hideError();
		}
	,	hidePowerTip: function(e){
			var controlContainer = jQuery(e.target).parent().parent();
			controlContainer.attr('class','control-group');
			controlContainer.find('div').find('div').empty();
			console.log(controlContainer);
		}
	, ignoreSuggestedAddress: function() {
		this.$("input[hiddenname='ignoresuggestion']").val('true');
		this.hideError();
		}
	,	verifyFirstName: function (e){
			var firstname = this.$("input[name='firstfullname']");
			var result = firstname.val();
			firstname.val( result.trim() );
		}
	,	verifyLastName: function (e){
			var name = this.$("input[name='lastfullname']");
			var result = name.val();
			name.val( result.trim() );
	}
	,	verifyCompany: function (e){
			var name = this.$("input[name='company']");
			var result = name.val();
			name.val( result.trim() );
	}
	,	verifyAddress: function (e){
		var name = this.$("input[name='addr1']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	verifyCity: function(e){
		var name = this.$("input[name='city']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	verifyZip: function(e){
		var name = this.$("input[name='zip']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	initialize: function ()
		{
		
			var self = this;
			this.title = this.model.isNew() ? _('Add New Address').translate() : _('Update Address').translate();
			this.suggestedAddress = null;
			this.page_header = this.title;
			this.model.on('error',function(err){self.showError(err.errorMessage);});
			Backbone.on('setSuggestedAddress', function(suggestedAddress){ self.suggestedAddress = suggestedAddress;  });
		}
	,	setSuggestedAddress: function(suggestedAddress){
			
		}
	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
			this.$('[rel="tooltip"]').tooltip({
				placement: 'right'
			}).on('hide', function(e) {
				e.preventDefault(); 
				jQuery(e.target).next('.tooltip').hide(); 
			});
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('addressbook');
		}
	

	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
//			var $target = this.$("input[name='phone1']");
//			this.model.set("phone1",$target.val(),{validate: true});
//			var resultPhone = this.$("input[name='phone1']").val().concat(this.$("input[name='ext']").val());
			$target.val( _( $target.val() ).formatPhone() );
//			this.model.set("phone",(_(resultPhone).formatPhone()),{validate: true});
		}
		
	// initialize states dropdown
	,	updateStates: function (e)
		{
		console.log('update states');
			this.$('[data-type="state"]').closest('.control-group').empty().append(
				SC.macros.statesDropdown({
					countries: this.options.application.getConfig('siteSettings.countries')
				,	selectedCountry: this.$(e.target).val()
				,	manage: this.options.manage ? this.options.manage + '-' : ''
				})
			);
		}
	});
	
	// List profile's addresses
	Views.List = Backbone.View.extend({
	
		template: 'address_book'
	,	page_header: _('Address Book').translate() 
	,	title: _('Address Book').translate() 
	,	attributes: { 'class': 'AddressListView' }
	,	events: { 'click [data-action="remove"]': 'remove' 	
	}

	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
	
	,	askYesOrNo: function(btn1, btn2, element){
		alert("askYesOrNo");
		
		  var btns = {};
		  btns[btn1] = function(){ 
		      element.destroy({ wait: true });
		      jQuery(this).dialog("close");
		  };
		  btns[btn2] = function(){
			  jQuery(this).dialog("close");
		  };
		  jQuery("<div></div>").dialog({
			    autoOpen: true,
			    title: 'Condition',
			    modal:true,
			    buttons:btns
			  });
//		 var myDialog = jQuery('<div id="removeconfirm"><p>Yes or No?</p><input type="button" id="yes" value="Yes"/><input type="button" id="no" value="No"/></div>');
//		 myDialog.css("width","700px").css("height","400px");
//console.log("conf_promt");
//console.log(myDialog);
//		  jQuery("#yes").click(function(){return true;});
//		  jQuery("#no").click(function(){return false;});
//		  myDialog.modal(); 
		}
		
	// remove address
	,	remove: function(e) {
		
			e.preventDefault();
		
//		this.askYesOrNo("Yes", "No", this.collection.get( jQuery(e.target).data('id') ));
			if ( confirm( _('Are you sure you want to delete this address?').translate() ) )
//			if ( this.askYesOrNo() )
			{
				console.log("REMOVE ADDRESSS");
				this.collection.get( jQuery(e.target).data('id') ).destroy({ wait: true });
			}
		}
	});

	return Views;
});
// AjaxRequestsKiller.js
// ---------------------
// Keeps trak of ongoing ajax requests and of url (or hash) changes, 
// so when the url changes it kills all pending ajax requests that other routers may have initiated.
// It's important to note that not all ajax request are opened by the change of the url, 
// for that reason it's important that you tag thouse who do by adding a killerId: this.application.killerId to the request (collection.fetch and model.fetch may trigger a request)
define('AjaxRequestsKiller', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application){
			
			// Sets the first Killer ID
			// Every time the url changes this will be reseted, 
			// but as we are the last listening to the url change event
			// this only hapend after all reuqest are made
			application.killerId = _.uniqueId('ajax_killer_');

			// Every time a reuqest is made, a ref to it will be store in this collection.
			application.lambsToBeKilled = [];
			
			// Wraps the beforeSend function of the jQuery.ajaxSettings
			jQuery.ajaxSettings.beforeSend = _.wrap(jQuery.ajaxSettings.beforeSend, function (fn, jqXhr, options)
			{
				/// Check previous ongoing requests
				_.each(application.lambsToBeKilled, function (prev_jqXhr)
				{
					// if the new id is different than the old one, it means that there is a new killer id, 
					// so we kill the old one if its still ongoing
					if (options.killerId && options.killerId !== prev_jqXhr.killerId)
					{
						if (prev_jqXhr.readyState !== 4)
						{
							// If we are killing this request we dont want the ErrorHandling.js to handle it
							prev_jqXhr.preventDefault = true;
							prev_jqXhr.abort();
						}
						
						// we take it off the lambsToBeKilled collection to free some space and processing.
						application.lambsToBeKilled = _.without(application.lambsToBeKilled, prev_jqXhr);
					}
				});

				// If the killerId is set we add it to the collection  
				if (options.killerId)
				{
					jqXhr.killerId = options.killerId;
					application.lambsToBeKilled.push(jqXhr);
				}
				
				// Finnaly we call the original jQuery.ajaxSettings.beforeSend
				fn.apply(this, _.toArray(arguments).slice(1));
			});
			
			// We listen to the afterStart because Backbone.history is *potentialy* not ready untill after that
			application.on('afterStart', function ()
			{
				// There is a timinig issue involved, 
				// the on all event happends after the 2nd requests is done
				Backbone.history.on('all', function ()
				{
					// Generates a new id for the **next** request
					application.killerId = _.uniqueId('ajax_killer_');
				});
			});
		}
	};
});

// Cart.js
// -------
// Defines the Cart module (Model, Collection, Views, Router)
// mountToApp handles some environment issues
// Add some function to the application
// * getCart()
// and to the layout
// * updateMiniCart()
// * showMiniCart()
// * showCartConfirmationModal()
// * goToCart()
// * showCartConfirmation()
define('Cart'
,	['LiveOrder.Model', 'Cart.Views', 'Cart.Router']
,	function (LiveOrderModel, Views, Router)
{
	'use strict';
	
	return {
		Views: Views
	,	Router: Router
	,	mountToApp: function (application, options)
		{
			var Layout = application.getLayout();
			
			// application.getCart():
			// Use it to acuire the cart model instance
			application.getCart = function ()
			{
				if (!application.cartInstance)
				{
					application.cartInstance = new LiveOrderModel({internalid: 'cart'});
					application.cartInstance.application = application;
				}
				
				return application.cartInstance;
			};

			_.extend(Layout.key_elements, {
				miniCart: '#mini-cart-container'
			,	miniCartSummary: '.mini-cart-summary'
			});
						
			// layout.updateMiniCart()
			// Updates the minicart by running the macro and updateing the miniCart key Element
			Layout.updateMiniCart = function()
			{
				var cart = application.getCart();
				this.$miniCart.html(SC.macros.miniCart(cart, application));
				this.$miniCartSummary.html(SC.macros.miniCartSummary(cart.getTotalItemCount()));
			};
			
			// layout.showMiniCart()
			Layout.showMiniCart = function()
			{
				jQuery(document).scrollTop(0);
				this.$(Layout.key_elements.miniCart +' .dropdown-toggle').parent().addClass('open');
			};
			
			// layout.showCartConfirmationModal()
			Layout.showCartConfirmationModal = function()
			{
				this.showInModal(new Views.Confirmation({
					layout: this
				,	application: application
				,	model: application.getCart()
				}));
			};
			
			// layout.goToCart()
			Layout.goToCart = function()
			{
				Backbone.history.navigate('cart', { trigger: true });
			};
			
			// layout.showCartConfirmation()
			// This reads the configuration object and execs one of the fuctions avome 
			Layout.showCartConfirmation = function ()
			{
				// Available values are: goToCart, showMiniCart and showCartConfirmationModal
				Layout[application.getConfig('addToCartBehavior')]();
			};
			
			// Every time the cart changes the mini cart gets updated
			Layout.on('afterRender', function ()
			{
				application.getCart().on('change', function ()
				{
					Layout.updateMiniCart();
				});
			});
			
			// Initializes the router
			if (options && options.startRouter)
			{
				return new Router(application);
			}
		}
	};
});

// Cart.Router.js
// --------------
// Creates the cart route
define('Cart.Router', ['Cart.Views'], function (Views)
{
	'use strict';
	
	return Backbone.Router.extend({
		
		routes: {
			'cart': 'showCart'
		,	'cart*options': 'showCart'
		}
		
	,	initialize: function (Application)
		{
			this.application = Application;
		}
		
	,	showCart: function ()
		{
			var view = new Views.Detailed({
				model: this.application.getCart()
			,	application: this.application
			});
			
			view.showContent();
		}
	});
});

// Cart.Views.js
// -------------
// Cart and Cart Confirmation views
define('Cart.Views', ['ErrorManagement'], function (ErrorManagement)
{
	'use strict';

	var Views = {}
	,	colapsibles_states = {};

	// Views.Detailed:
	// This is the Shopping Cart view
	Views.Detailed = Backbone.View.extend({
		
		template: 'shopping_cart'
		
	,	title: _('Shopping Cart').translate()
		
	,	page_header: _('Shopping Cart').translate()
		
	,	attributes: { 
			'id': 'shopping-cart'
		,	'class': 'view shopping-cart' 
		}
		
	,	events: {
			'blur [name="quantity"]': 'updateItemQuantity'
		,	'submit [data-action="update-quantity"]': 'updateItemQuantity'
		
		,	'click [data-action="remove-item"]': 'removeItem'

		,	'submit form[data-action="apply-promocode"]': 'applyPromocode'
		,	'click [data-action="remove-promocode"]': 'removePromocode'

		,	'submit form[data-action="estimate-tax-ship"]': 'estimateTaxShip'
		,	'click [data-action="remove-shipping-address"]': 'removeShippingAddress'
		,	'change [data-action="estimate-tax-ship-country"]': 'changeCountry'
		}
		
		// showContent:
		// initializes tooltips.
		// TODO: NOT NECESARY WITH LATEST VERSION OF BOOTSTRAP
		// calls the layout's default show content method
	,	showContent: function ()
		{
			return this.options.application.getLayout().showContent(this, true).done(function (view)
			{
				view.$('[data-toggle="tooltip"]').tooltip({html: true});
			});
		}

	,	hideError: function (selector)
		{
			var el = (selector)? selector.find('[data-type="alert-placeholder"]') : this.$('[data-type="alert-placeholder"]');
			el.empty();
		}

	,	showError: function (message, line, error_details)
		{

			this.hideError();
			var placeholder;

			if (line)
			{
				// if we detect its a rolled back item, (this i an item that was deleted 
				// but the new options were not valid and was added back to it original state)
				// We will move all the references to the new line id
				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					var new_line_id = error_details.newLineId;

					line.attr('id', new_line_id);

					line.find('[name="internalid"]').attr({
						id: 'update-internalid-' + new_line_id
					,	value: new_line_id
					});
				}

				placeholder = line.find('[data-type="alert-placeholder"]');
				this.hideError(line);
			}
			else 
			{
				placeholder = this.$('[data-type="alert-placeholder"]');
				this.hideError();
			}
			// Finds or create the placeholder for the error message
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			// Renders the error message and into the placeholder
			placeholder.append( 
				SC.macros.message( message, 'error', true ) 
			);

			// Re Enables all posible disableded buttons of the line or the entire view
			if (line)
			{
				line.find(':disabled').attr('disabled', false);
			}
			else
			{
				this.$(':disabled').attr('disabled', false);
			}
		}
		
		// updateItemQuantity:
		// executes on blur of the quantity input
		// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateItemQuantity: function (e)
		{
			e.preventDefault();

			var self = this
			,	$line = null
			,	options = jQuery(e.target).closest('form').serializeObject()
			,	line = this.model.get('lines').get(options.internalid);

			if (parseInt(line.get('quantity'),10) !==  parseInt(options.quantity,10))
			{
				line.set('quantity', options.quantity);

				$line = this.$('#' + options.internalid);

				this.model.updateLine(line)
					.success(_.bind(this.showContent, this))
					.error(
						function (jqXhr)
						{
							jqXhr.preventDefault = true;
							var result = JSON.parse(jqXhr.responseText);

							self.showError(result.errorMessage, $line, result.errorDetails);
						}
					);
			}
		}
		
		// removeItem: 
		// handles the click event of the remove button
		// removes the item from the cart model and saves it.
	,	removeItem: function (e)
		{
			this.model.removeLine(this.model.get('lines').get(jQuery(e.target).data('internalid')))
				.success(_.bind(this.showContent, this));
		}
		
		// applyPromocode:
		// Handles the submit of the apply promo code form
	,	applyPromocode: function (e)
		{
			e.preventDefault();
			
			this.$('[data-type=promocode-error-placeholder]').empty();
			
			var self = this
			,	$target = jQuery(e.target)
			,	options = $target.serializeObject();

			// disable inputs and buttons
			$target.find('input, button').prop('disabled', true);

			this.model.save({ promocode: { code: options.promocode } }).success(
				function()
				{
					self.showContent();
				}
			).error(
				function (jqXhr) 
				{
					self.model.unset('promocode');
					jqXhr.preventDefault = true;
					var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
					self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
					$target.find('input[name=promocode]').val('').focus();
				}
			).always(
				function(){
					// enable inputs and buttons
					$target.find('input, button').prop('disabled', false);
				}
			);
		}

		// removePromocode:
		// Handles the remove promocode button
	,	removePromocode: function (e)
		{
			e.preventDefault();

			var self = this;

			this.model.save({ promocode: null }, { 
				success: function()
				{
					self.showContent();
				}
			});
		}
		
		// estimateTaxShip
		// Sets a fake address with country and zip code based on the options.
	,	estimateTaxShip: function (e)
		{
			e.preventDefault();

			var options = jQuery(e.target).serializeObject()
			,	self = this;
			
			var address_internalid = options.zip + '-' + options.country + '-null';
			this.model.get('addresses').push({
				internalid: address_internalid
			,	zip: options.zip
			,	country: options.country
			});
			this.model.set('shipaddress', address_internalid);

			this.model.save().success(function()
			{
				self.showContent();
			});
		}

		// removeShippingAddress:
		// sets a fake null address so it gets removed by the backend
	,	removeShippingAddress: function (e)
		{
			e.preventDefault();

			var self = this;

			this.model.save({ shipmethod: null, shipaddress: null }).success(function () {
				self.showContent();
			});
		}

	,	changeCountry: function(e)
		{
			e.preventDefault();
			this.storeColapsiblesState();
			var options = jQuery(e.target).serializeObject();

			var AddressModel = this.model.get('addresses').model;
			this.model.get('addresses').add(new AddressModel({ country: options.country, internalid: options.country }));
			this.model.set({ shipaddress: options.country });

			this.showContent().done(function(view){
				view.resetColapsiblesState();
			});
			
		}
		
	,	resetColapsiblesState: function ()
		{
			var self = this;
			_.each(colapsibles_states, function (is_in, element_selector)
			{
				self.$(element_selector)[ is_in ? 'addClass' : 'removeClass' ]('in').css('height',  is_in ? 'auto' : '0');
			});
		}

	,	storeColapsiblesState: function ()
		{
			this.storeColapsiblesStateCalled = true;
			this.$('.collapse').each(function (index, element)
			{
				colapsibles_states[SC.Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
			});
		}	
	});

	// Views.Confirmation:
	// Cart Confirmation Modal
	Views.Confirmation = Backbone.View.extend({
		
		template: 'shopping_cart_confirmation_modal'
	
	,	title: _('Added to Cart').translate()
	
	,	page_header: _('Added to Cart').translate()
	
	,	attributes: {
			'id': 'shopping-cart'
		,	'class': 'cart-confirmation-modal shopping-cart'
		}
	
	,	events: { 
			'click [data-trigger=go-to-cart]': 'dismisAndGoToCart'
		}
	
	,	initialize: function (options)
		{
			this.line = options.model.getLatestAddition();
		}
		
		
		// dismisAndGoToCart
		// Closes the modal and calls the goToCart 
	,	dismisAndGoToCart: function (e)
		{
			e.preventDefault();

			this.$containerModal.modal('hide');
			this.options.layout.goToCart();
		}
	});

	return Views;
});

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jan 2014     ashykalov
 *
 */
// CardMessage.Model.js
// -------------------------------
// Sends and gets cardmessage 

define('CardMessage.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		urlRoot: 'services/cardmessage.ss'
	});
});
// CreditCard.Collection.js
// -----------------------
// Credit cards collection
define('CreditCard.Collection', ['CreditCard.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({

		model: Model
	,	url: 'services/creditcard.ss'
	
	});
});

// CreditCard.js
// -----------------
// Defines the CreditCard  module (Model, Collection, Views, Router)
define('CreditCard', ['CreditCard.Views','CreditCard.Model','CreditCard.Collection', 'CreditCard.Router'], function (Views, Model, Collection, Router)
{
	'use strict';

	return	{
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});

// CreditCard.Model.js
// -----------------------
// Model for handling credit cards (CRUD)
define('CreditCard.Model', function ()
{
	'use strict';

	// validate that the expiration date is bigger than today
	function validateExpirationDate (value, name, data)
	{
		
		if(jQuery("[name='expmonth']").val() == 0 || jQuery("[name='expyear']").val() == 0){
			return 'Exp. is required';
		}
		
		var current = new Date();

		if (new Date(current.getFullYear(), current.getMonth()).getTime() > new Date(data.expyear, data.expmonth - 1).getTime())
		{
			return _('Please select a date in the future').translate();
		}
	}
	
	return Backbone.Model.extend({

		urlRoot: 'services/creditcard.ss',

		validation: {
			ccname: [
				{ 
					required: true
				,	msg: _('Name is required').translate()
				}
			,	{
					fn: function (cc_name)
					{	
						if (cc_name && cc_name.length > 26)
						{
							return _('Name too long').translate();
						}
					}
				}
			]
		,	ccnumber: [
				{
					required: true
				,	msg: _('Card Number is required').translate()
				}
			,	{
					// credit card number validation
					// It validates that the number pass the Luhn test and also that it has the right starting digits that identify the card issuer
					fn: function (cc_number, attr, form)
					{
						console.log(cc_number.length);
						if(cc_number.length>16){
							return "We only accept credit cards number that are up to 16 digits - might want to check that number again";
//							jQuery('[data-type="alert-placeholder"]').html(
//									SC.macros.message(_('We only accept credit cards number that are up to 16 digits - might want to check that number again').translate(), 'error', true )
//								);
						}
						// this check shouldn't be necessary, maybe it needs to be removed
						else if (_.isUndefined(form.internalid) && (_.isUndefined(this.attributes.ccnumber) || cc_number === this.attributes.ccnumber))
						{
							cc_number = cc_number.replace(/\s/g, '');

							//check Luhn Algorithm
							var	verify_luhn_algorithm = _(cc_number.split('').reverse()).reduce(function (a, n, index)
								{
									return a + _((+n * [1, 2][index % 2]).toString().split('')).reduce(function (b, o)
										{ return b + (+o); }, 0);
								}, 0) % 10 === 0

							// get the credit card name 
							,	paymenthod_id = _.paymenthodIdCreditCart(cc_number);

							//check that card type is supported by validation
							if (!paymenthod_id)
							{
								return _('Credit Card type is not supported').translate();	
							}
							
							else if (!verify_luhn_algorithm)
							{
								// we throw an error if the number fails the regex or the Luhn algorithm 
								return _('Credit Card Number is invalid').translate();
							}

						}
					}
				}
			]
		,	expyear: { fn: validateExpirationDate }
		,	expmonth: { fn: validateExpirationDate }
		,	savecard: {required: true}
		,	ccsecuritycode: {
				fn: function(value){
					if(value !== null){
						var reg = new RegExp('^[0-9]+$');
						if(value.length < 3 || !reg.test(value)){
							return _('Security Number is required').translate();
						}else if(jQuery(".modal-body").length != 0){
							jQuery("#in-modal-ccsecuritycode").css("border-color","rgb(31, 216, 31)");
							$(".checkbox").css("margin-top","0px");
						}
					}
				}
			}
		}
	/**
	 		validation: {
			ccname: {
				required: true, msg: _('It is required').translate()
			}
		,	ccnumber: {
			fn: function(value){
				if(value.length > 16){
					return _('We only accept credit cards number that are up to 16 digits - might want to check that number again').translate();
				}
			}
		}
		,	expyear: { fn: validateExpirationDate }
		,	expmonth: { fn: validateExpirationDate }
		}
	 */

	,	initialize: function (attributes, options)
		{
			this.options = options;
		}
	});
});
// CreditCard.Router.js
// -----------------------
// Router for handling credit cards (CRUD)
define('CreditCard.Router', ['CreditCard.Views','CreditCard.Model'], function (Views,Model)
{
	'use strict';
	
	return Backbone.Router.extend({

		routes: {
			'creditcards': 'creditCards'
		,	'creditcards/new': 'newCreditCard'
		,	'creditcards/:id': 'creditCardDetailed'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
	
	// creditcards list	
	,	creditCards: function ()
		{
			var collection = this.application.getUser().get('creditcards');

			if (collection.length)
			{
					var view = new Views.List({
						application: this.application
					,	collection: collection
					});

				collection.on('reset destroy change add', function () {
					this.creditCards();
				}, this);

				view.showContent('creditcards');
			}
			else
			{
				Backbone.history.navigate('#creditcards/new', { trigger: true });
			}
		}

	// view credit card details	
	,	creditCardDetailed: function (id)
		{
			var collection = this.application.getUser().get('creditcards')
			,	model = collection.get(id)
			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				,	model: model
				});
			
			model.on('reset destroy change add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#creditcards', {trigger: true});
				}
			}, view);
			
			view.showContent('creditcards');
		}

	// add new credit card 
	,	newCreditCard: function ()
		{
			var name = "cvc",
			value = "",
			days = -1;

            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + value + expires + "; path=/";
        
			var collection = this.application.getUser().get('creditcards')

			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				// the paymentmethods are use for credit card number validation
				,	model: new Model({}, {paymentMethdos: this.application.getConfig('siteSettings.paymentmethods')})
				});
			
			collection
				.on('add', function ()
				{
					if (view.inModal && view.$containerModal)
					{
						view.$containerModal.modal('hide');
						view.destroy();
					}
					else
					{
						Backbone.history.navigate('#creditcards', { trigger: true });
					}

				}, view);

			view.model.on('change', function  (model) {
				collection.add(model, {merge: true});
			}, this);
			
			view.showContent('creditcards');
		}

	});
});

// CreditCard.Views.js
// -----------------------
// Views for handling credit cards (CRUD)
define('CreditCard.Views', function ()
{
	'use strict';

	var Views = {};
	
	// Credit card details view/edit
	Views.Details = Backbone.View.extend({
		
		template: 'creditcard'
	,	attributes: { 'class': 'CreditCardDetailsView' }
	,	events: {
			'submit form': 'saveForm'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'change form [name="ccnumber"]': 'setPaymethodId'
		,	'click [data-action="add_card"]': 'save_cvc'		
		}
		
	,	save_cvc: function(){
//		this.model.set("ccsecuritycode", jQuery("#in-modal-ccsecuritycode").val());
		document.cookie = "cvc="+jQuery("#in-modal-ccsecuritycode").val()+"; path=/";
	}
	,	initialize: function ()
		{ 	//Backbone.Validation.bind(this);
			this.model.validation.ccsecuritycode = { 
			fn: function(value){
				if(value !== null){
					var reg = new RegExp('^[0-9]+$');
					if(value.length < 3 || !reg.test(value)){
						return _('Security Number is required').translate();
					}else if(jQuery(".modal-body").length != 0){
						jQuery("#in-modal-ccsecuritycode").css("border-color","rgb(31, 216, 31)");
						$(".checkbox").css("margin-top","0px");
					}else{jQuery("#ccsecuritycode").css("border-color","rgb(31, 216, 31)");}
				}
			} };
			this.title = this.model.isNew() ? _('Add Credit Card').translate() : _('Edit Credit Card').translate() ;
			this.page_header = this.title;
			
			// initialize date selector
			var currentExpYear = this.model.get('expyear'), newExpYear = new Date().getFullYear(), range = _.range(new Date().getFullYear(), new Date().getFullYear() + 25 );
			if(currentExpYear && currentExpYear < newExpYear)
			{
				range = _.union([parseInt(currentExpYear, 10)], range);
				this.options.expyear = currentExpYear;
			}
			if (!this.model.get('expmonth'))
			{
				this.options.currentMonth = new Date().getMonth() + 1;
			}									
			this.options.months = _.range( 1, 13 );
			this.options.years = range;
			this.options.showDefaults = false;
			console.log('credit card views initialize');
			console.log(this);
			//console.log(this.profile.get("creditcards").models);
			
		}
	,	setPaymethodId: function(e)
		{
			var cc_number = jQuery(e.target).val()
			,	form = jQuery(e.target).closest('form')
			,	paymenthod_id = _.paymenthodIdCreditCart(cc_number);

			if (paymenthod_id)
			{	
				form.find('[name="paymentmethod"]').val(paymenthod_id);
				form.find('[data-image="creditcard-icon"]').each(function(index, img){
					var $img = jQuery(img);
					if ($img.data('value').toString() === paymenthod_id)
					{
						$img.show();
					}
					else
					{
						$img.hide();
					}
				});
			}
		}
	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
		
	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('creditcards');
		}

	});
	
	// Credit cards list
	Views.List = Backbone.View.extend({
	
		template: 'creditcards'
	,	title: _('Credit Cards').translate() 
	,	page_header: _('Credit Cards').translate() 
	,	attributes: { 'class': 'CreditCardListView' }
	,	events: { 'click [data-action="remove"]': 'remove' }

	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
		
	,	remove: function (e)
		{
			e.preventDefault();

			if ( confirm( _('Are you sure you want to delete this Credit Card?').translate() ) )
			{
				this.collection.get( jQuery(e.target).data('id') ).destroy({ wait: true });
			}
		}
	});

	return Views;
});
/* global nsglobal */
// ErrorManagement.js
// ------------------
// Handles all errors related to api calls and provides a 404 and 500 error pages
// Also it manages 403 error (session expires) and do the redirect to login
define('ErrorManagement', function ()
{
	'use strict';

	var Views = {};

	// Views.PageNotFound:
	// Will be rendered if there is a page we can not identify
	Views.PageNotFound = Backbone.View.extend({
		
		template: 'page_not_found'
	,	title: _('Page not found').translate()
	,	page_header: _('Page not found').translate()
		
	,	attributes: {
			'id': 'page-not-found'
		,	'class': 'page-not-found'
		}

	,	initialize: function()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 404;
			}
		}
	});
	
	// Views.InternalError:
	// Will be rendered if there is an internal error
	// May be an api request that went bad or some other issue
	Views.InternalError = Backbone.View.extend({
		
		template: 'internal_error'
	,	title: _('Internal Error').translate()
	,	page_header: _('Internal Error').translate()
		
	,	attributes: {
			'id': 'internal-error'
		,	'class': 'internal-error'
		}

	,	initialize: function (options)
		{
			if (options.page_header)
			{
				this.page_header = options.page_header;
			}

			if (options.title)
			{
				this.title = options.title;
			}

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 500;
			}
		}
	});

	// We extend the view to provide with a showError and hideError to all instances of it
	_.extend(Backbone.View.prototype, {

		// we empty all of the error placeholders of the view
		hideError: function ()
		{
			this.$('[data-type="alert-placeholder"]').empty();
		}
		
	,	showError: function (message)
		{
			//alert('dsd');
			this.hideError();
			// Finds or create the placeholder for the error message
			var placeholder = this.$('[data-type="alert-placeholder"]');
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			// Renders the error message and into the placeholder
			placeholder.append( 
				SC.macros.message( message, 'error', true ) 
			);

			// Re Enables all posible disableded buttons of the view
			this.$(':disabled').attr('disabled', false);
		}
	});

	var parseErrorMessage = function (jqXhr, messageKeys)
	{
		var message = null, i, current_key;
		try
		{
			// Tries to parse the responseText and try to read the most common keys for error messages
			var response = JSON.parse(jqXhr.responseText);
			if (response)
			{
				for (i=0; i < messageKeys.length; i++)
				{
					current_key = messageKeys[i];
					if (response[current_key])
					{
						message = _.isArray(response[current_key]) ? response[current_key][0] : response[current_key];
						break;
					}
				}
			}
		}
		catch (err) {}
		return message;
	};

	return {
		Views: Views
	,	parseErrorMessage: parseErrorMessage
	,	mountToApp: function(application)
		{
			var Layout = application.getLayout();

			_.extend(Layout, {
	
				// layout.errorMessageKeys:
				// They will be use to try to get the error message of a faild ajax call
				// Extend this as needed
				errorMessageKeys: ['errorMessage', 'errors', 'error', 'message']

				// layout.notFound:
				// Shortcut to display the Views.PageNotFound
			,	notFound: function ()
				{
					var view = new Views.PageNotFound({
						application: application
					});
					
					view.showContent();
				}

				// layout.notFound:
				// Shortcut to display the Views.InternalError
				// TODO: this parameters should be an obj
			,	internalError: function (message, page_header, title)
				{
					var view = new Views.InternalError({
						application: application
					,	message: message
					,	page_header: page_header
					,	title: title
					});
					
					view.showContent();
				}
			});

			jQuery(document).ajaxError(function(e, jqXhr, options, error_text) 
			{
				error_text, e;

				// Unauthorized Error, customer must be logged in - we pass origin parameter with the right touchpoint for redirect the user after login
				if (parseInt(jqXhr.status, 10) === 403)
				{
					var url = application.getConfig('siteSettings.touchpoints.login');
					if(application.getConfig('currentTouchpoint'))
					{
						url += '&origin=' + application.getConfig('currentTouchpoint'); //TODO: support ?origin=x
					}
					window.location = url;
				}

				// You can bypass all this logic by capturing the error callback on the fetch using preventDefault = true on your jqXhr object 
				if (!jqXhr.preventDefault)
				{
					// if its a write operation we will call the showError of the currentView or of the modal if presetn
					var message = parseErrorMessage(jqXhr, Layout.errorMessageKeys);

					if (!message || _.isObject(message))
					{
						message =  _('Theres been an internal error').translate();
					}

					if (options.type === 'GET' && options.killerId)
					{
						// Its a read operation that was ment to show a page 
						if  (parseInt(jqXhr.status, 10) === 404)
						{
							// Not Found error, we show that error
							Layout.notFound();
						}
						else
						{
							// Other ways we just show an internal error page
							Layout.internalError(message);
						}
					}
					else if (Layout.currentView)
					{
						
						// Calls the showError of the modal if present or the one of the currentView (content view)
						if (Layout.modalCurrentView)
						{
							Layout.modalCurrentView.showError(message);
						}
						else
						{
							Layout.currentView.showError(message);
						}
					}
					else
					{
						// We allways default to showing the internalError of the layout
						Layout.internalError();
					}
				}
			});
		}
	};
});
// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
// This variable has to be already defined when our module loads
var _gaq = _gaq || [];

// GoogleAnalytics.js
// ------------------
// Loads google analytics script and extends application with methods:
// * trackPageview
// * trackEvent
// * trackTransaction
// Also wraps layout's showInModal
define('GoogleAnalytics', function ()
{
	'use strict';
	
	var GoogleAnalytics = {

		trackPageview: function (url)
		{
			// [_trackPageview()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._trackPageview)
			_gaq.push(['_trackPageview', '/' + url]);
			return this;
		}

	,	trackEvent: function (event)
		{
			// [_trackEvent()](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)
			_gaq.push(['_trackEvent'
			,	event.category
			,	event.action
			,	event.label
			,	event.value
			,	event.noninteraction
			]);

			return this;
		}

	,	addItem: function (item)
		{
			// [_addItem()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem)
			_gaq.push(['_addItem'
			,	item.transaction
			,	item.sku
			,	item.name
			,	item.category
			,	item.price
			,	item.quantity
			]);

			return this;
		}

	,	addTrans: function (transaction)
		{
			// [_addTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans)
			_gaq.push(['_addTrans'
			,	transaction.id
			,	transaction.storeName || SC.ENVIRONMENT.siteSettings.displayname
			,	transaction.subtotal
			,	transaction.tax
			,	transaction.shipping
			,	transaction.city
			,	transaction.state
			,	transaction.country
			]);

			return this;
		}

	,	trackTrans: function ()
		{
			// [_trackTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans)
			_gaq.push(['_trackTrans']);
			return this;
		}

		// Based on the created SalesOrder we trigger each of the analytics
		// ecommerce methods passing the required information
		// [Ecommerce Tracking](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce?hl=en)
	,	trackTransaction: function (Order)
		{
			if (Order && Order.get('confirmation'))
			{
					var shipping_address = Order.get('addresses').get(Order.get('shipaddress'))
				,	transaction_id = Order.get('confirmation').internalid
				,	order_summary = Order.get('summary')
				,	item = null
				,	confirmation_number = Order.get('confirmation').confirmationnumber;

				GoogleAnalytics.addTrans({
					id: confirmation_number
				,	subtotal: order_summary.subtotal
				,	tax: order_summary.taxtotal
				,	shipping: order_summary.shippingcost + order_summary.handlingcost
				,	city: shipping_address.get('city')
				,	state: shipping_address.get('state')
				,	country: shipping_address.get('country')
				});

				Order.get('lines').each(function (line)
				{
					item = line.get('item');

					GoogleAnalytics.addItem({
						transaction: confirmation_number
					,	sku: item.get('_sku')
					,	name: item.get('_name')
					,	category: item.get('_category')
					,	price: line.get('rate')
					,	quantity: line.get('quantity')
					});
				});

				return GoogleAnalytics.trackTrans();
			}
			
		}

	,	extendShowInModal: function (application)
		{
			var Layout = application.getLayout();

			// we extend showInModal to track the event every time a modal is opened
			Layout.showInModal = _.wrap(Layout.showInModal, function (fn, view)
			{
				application.trackEvent({
					category: view.analyticsCategory || 'Modal'
				,	action: view.analyticsAction || view.title || 'Open'
				,	label: view.analyticsLabel || '/' + Backbone.history.fragment
				,	value: view.analyticsValue
				,	noninteraction: view.noninteraction
				});
				
				return fn.apply(this, _.toArray(arguments).slice(1));
			});

			return this;
		}

	,	setAccount: function (config)
		{
			_gaq.push(
				['_setAccount', config.propertyID]
			,	['_setDomainName', config.domainName]
			,	['_setAllowLinker', true]
			);

			return this;
		}

	,	loadScript: function ()
		{
			return (SC.ENVIRONMENT.jsEnvironment === 'browser') && jQuery.getScript(('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js');
		}

	,	mountToApp: function (application)
		{
			var tracking = application.getConfig('tracking');

			// if track page view needs to be tracked
			if (tracking.trackPageview)
			{
				GoogleAnalytics
					// we get the account and domain name from the configuration file
					.setAccount(tracking.google)
					// Wraps layout's showInModal to track the modal event before showing it
					.extendShowInModal(application)
					// the analytics script is only loaded if we are on a browser
					.loadScript();

				_.extend(application, {
					trackPageview: GoogleAnalytics.trackPageview
				,	trackEvent: GoogleAnalytics.trackEvent
				,	trackTransaction: GoogleAnalytics.trackTransaction
				});

				// each time a page is rendered, we track its fragment
				application.getLayout().on('afterAppendView', function ()
				{
					application.trackPageview(Backbone.history.fragment);
				});
			}	
		}
	};
	
	return GoogleAnalytics;
});
// Facets.Model.js
// ---------------
// Connects to the search api to get all the items and the facets
// A Model Contains a Collection of items and the list of facet groups with its values
define('Facets.Model', ['ItemDetails.Collection'], function (ItemDetailsCollection)
{
	'use strict';
	
	var original_fetch = Backbone.CachedModel.prototype.fetch;

	return Backbone.CachedModel.extend({
		
		urlRoot: '/api/items'

	,	initialize: function ()
		{
			// Listen to the change event of the items and converts it to an ItemDetailsCollection
			this.on('change:items', function (model, items)
			{
				if (!(items instanceof ItemDetailsCollection))
				{
					// NOTE: Compact is used to filter null values from response
					model.set('items', new ItemDetailsCollection(_.compact(items)));
				}
			});
		}

		// model.fetch
		// -----------
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function(options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}

	}, {
		mountToApp: function (application) 
		{
			// sets default options for the search api
			this.prototype.urlRoot = SC.Utils.addParamsToUrl(this.prototype.urlRoot, application.getConfig('searchApiMasterOptions.Facets'));
		}
	});
});
// Facets.Translator.js
// --------------------
// Holds the mapping of a url compoment with an api call, 
// is able to translate and to return different configurations of himself with diferent options
define('Facets.Translator'
,	function ()
{
	'use strict';

	// Categories is not a rea l dependency, so if it is present we use it other ways we dont 
	var Categories = false;
	try {
		Categories = require('Categories');
	}
	catch (e)
	{
		console.log('Couldn\'t load Categories. ' + e);
	}
	
	// This is just for internal use only, DO NOT EDIT IT HERE!!
	// the same options should be somewhere in the configuration file
	var default_config = {
		fallbackUrl: 'search'
	,	defaultShow: null
	,	defaultOrder: null
	,	defaultDisplay: null
	,	facets: []
	,	facetDelimiters: {
			betweenFacetNameAndValue: '/'
		,	betweenDifferentFacets: '/'
		,	betweenDifferentFacetsValues: ','
		,	betweenRangeFacetsValues: 'to'
		,	betweenFacetsAndOptions: '?'
		,	betweenOptionNameAndValue: '='
		,	betweenDifferentOptions: '&'
		}
	};
	
	function FacetsTranslator(facets, options, configuration)
	{
		// Enfofces new
		if (!(this instanceof FacetsTranslator)) {
			return new FacetsTranslator(facets, options, configuration);
		}
		
		// Facets go Here
		this.facets = [];
		
		// Other options like page, view, etc. goes here 
		this.options = {};
		
		// This is an object that must contain a fallbackUrl and a lists of facet configurations
		this.configuration = configuration || default_config;
		
		// We cast on top of the passed in parameters.
		if (facets && options)
		{
			this.facets = facets;
			this.options = options;
		}
		else if (_.isString(facets))
		{
			// It's a url
			this.parseUrl(facets);
		}
		else if (facets)
		{
			// It's an API option object
			this.parseOptions(facets);
		}
	}
	
	_.extend(FacetsTranslator.prototype, {
		
		defaultFacetConfig: { 
			behavior: 'single'
		,	max: 5
		}

		// facetsTranslator.parseUrl:
		// Url strings get translated into the differnts part of the object, facets and options
	,	parseUrl: function (url)
		{
			// We remove a posible 1st / (slash)
			url = (url[0] === '/') ? url.substr(1) : url;
			
			// given an url with options we split them into 2 strings (options and facets)
			var facets_n_options = url.split(this.configuration.facetDelimiters.betweenFacetsAndOptions)
			,	facets = (facets_n_options[0] && facets_n_options[0] !== this.configuration.fallbackUrl) ? facets_n_options[0] : ''
			,	options = facets_n_options[1] || '';
			
			// We treat category as the 1st unmaned facet filter, so if you are using categories
			// we will try to take that out by comparig the url with the category tree
			if (this.getFacetConfig('category'))
			{
				var categories = Categories && Categories.getBranchLineFromPath(facets) || [];
				if (categories && categories.length)
				{
					// We set the value for this facet
					var category_string = _.pluck(categories, 'id').join('/');
					this.parseFacet('category', category_string);
					
					// And then we just take it out so other posible facets are computed
					facets = facets.replace(category_string, '');
				}	
				
				// We remove a posible 1st / (slash) (again, it me be re added by taking the category out)
				facets = (facets[0] === '/') ? facets.substr(1) : facets;
			}
			
			// The facet part of the url gets splited and computed by pairs
			var facet_tokens = facets.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenDifferentFacets +'\\'+ this.configuration.facetDelimiters.betweenFacetNameAndValue +']+', 'ig'));
			while (facet_tokens.length > 0)
			{
				this.parseUrlFacet(facet_tokens.shift(), facet_tokens.shift());
			}
			
			// The same for the options part of the url
			var options_tokens = options.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenOptionNameAndValue +'\\'+ this.configuration.facetDelimiters.betweenDifferentOptions +']+', 'ig'))
			,	tmp_options = {};
			
			while (options_tokens.length > 0)
			{
				tmp_options[options_tokens.shift()] = options_tokens.shift();
			}
			
			this.parseUrlOptions(tmp_options);
		}
		
		// facetsTranslator.sanitizeValue:
		// Translates values that came from the url into JS data types that this objects know of
		// Examples for different types: 
		// - range/10to100 gets translated to {from: '10', to: '100'}
		// - range/100 gets translated to {from: '0', to: '100'}
		// - multi/1,2,3 gets translated to ['1', '2', '3']
	,	sanitizeValue: function (value, behavior)
		{
			var parsed_value;
			switch (behavior)
			{
			case 'range':
				// we return an object like {from: string, to: string }
				if (_.isString(value))
				{
					if (value.indexOf(this.configuration.facetDelimiters.betweenRangeFacetsValues) !== -1)
					{
						var tokens = value.split(this.configuration.facetDelimiters.betweenRangeFacetsValues);
						parsed_value = {from: tokens[0], to: tokens[1]};
					}
					else
					{
						parsed_value = {from: '0', to: value};
					}
				}
				else 
				{
					parsed_value = value;
				}
				
				break;
			case 'multi':
				// we allways return an array for a multi value 
				if (value.indexOf(this.configuration.facetDelimiters.betweenDifferentFacetsValues) !== -1)
				{
					parsed_value = value.split(this.configuration.facetDelimiters.betweenDifferentFacetsValues);
				}
				else 
				{
					parsed_value = [value];
				}
				break;
			default: 
				parsed_value = value;
			}
			return parsed_value;
		}
		
		// facetsTranslator.getUrlFacetValue:
		// Returns the value of an active facet by the facet URL component
	,	getUrlFacetValue: function (facet_url)
		{
			return (_.find(this.facets, function (facet) { return facet.url === facet_url; }) || {}).value;
		}
		
		// facetsTranslator.getFacetValue:
		// Returns the value of an active facet by the facet id
	,	getFacetValue: function (facet_id)
		{
			return (_.find(this.facets, function (facet) { return facet.id === facet_id; }) || {}).value;
		}
		
		// facetsTranslator.getAllFacets:
		// Returns a copy of the internal array of facets containing values and configuration
	,	getAllFacets: function ()
		{
			return this.facets.slice(0);
		}
		
		// facetsTranslator.getOptionValue:
		// Returns the value of an active options or it's default value
	,	getOptionValue: function (option_id)
		{
			return this.options[option_id] || null;
		}
		
		// facetsTranslator.parseUrlFacet:
		// for a given name value, it gets the config, sanitaze the value and stores it all in the internal facets array
	,	parseUrlFacet: function (name, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(name, 'url');
			
			if (config.id === 'category' || !name)
			{
				return;
			}
			
			this.facets.push({
				config: config,
				id: config.id,
				url: config.url,
				value: this.sanitizeValue(value, config.behavior)
			});
		}
		
		// facetsTranslator.parseFacet:
		// Same as parseUrlFacet but from id
	,	parseFacet: function (facet_id, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(facet_id, 'id');
			
			this.facets.push({
				config: config,
				id: config.id,
				url: config.url,
				value: this.sanitizeValue(value, config.behavior)
			});
		}
		
		// facetsTranslator.parseUrlOptions:
		// Sets options from the options argument or sets default values
	,	parseUrlOptions: function (options)
		{
			this.options.show = options.show || this.configuration.defaultShow;
			this.options.order = options.order || this.configuration.defaultOrder;
			this.options.page = parseInt(options.page, 10) || 1;
			this.options.display = options.display || this.configuration.defaultDisplay;
			this.options.keywords = options.keywords || this.configuration.defaultKeywords;
		}
		
		// facetsTranslator.getFacetConfig:
		// Gets the configuration for a given facet by id,
		// You can also get it by name or url component if you pass the second parameter
	,	getFacetConfig: function (name, by)
		{
			var result =  _.find(this.configuration.facets, function (facet) { return facet[by || 'id'] === name; });
			return result || _.extend({ id: name, name: name, url: name }, this.defaultFacetConfig);
		}
		
		

		// facetsTranslator.getUrl:
		// Gets the url for current stae of the object
	,	getUrl: function ()
		{
			var url = ''
			,	self = this;
			
			// Prepears the seo limits 
			var facets_seo_limits = {}; 
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				facets_seo_limits = {
					numberOfFacetsGroups: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsGroups || false
				,	numberOfFacetsValues: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsValues || false
				,	options: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.options || false
				};
			}
			
			// If there are too many facets selected 
			if (facets_seo_limits.numberOfFacetsGroups && this.facets.length > facets_seo_limits.numberOfFacetsGroups)
			{
				return '#';
			}

			// Adds the category if it's prsent
			var category_string = this.getFacetValue('category');
			if (category_string)
			{
				url = self.configuration.facetDelimiters.betweenDifferentFacets + category_string;
			}
			
			// Encodes the other Facets
			var sorted_facets = _.sortBy(this.facets, 'url');
			for (var i = 0; i < sorted_facets.length; i++)
			{
				var facet = sorted_facets[i];
				// Category should be already added
				if (facet.id === 'category')
				{
					return;
				}
				var name = facet.url || facet.id,
					value = '';
				switch (facet.config.behavior)
				{
				case 'range':
					facet.value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					value = facet.value.from + self.configuration.facetDelimiters.betweenRangeFacetsValues + facet.value.to;
					break;
				case 'multi':
					value = facet.value.sort().join(self.configuration.facetDelimiters.betweenDifferentFacetsValues);

					if (facets_seo_limits.numberOfFacetsValues && facet.value.length > facets_seo_limits.numberOfFacetsValues)
					{
						return '#';
					}

					break;
				default: 
					value = facet.value;
				}
				
				url += self.configuration.facetDelimiters.betweenDifferentFacets + name + self.configuration.facetDelimiters.betweenFacetNameAndValue + value;
			}
			
			url = (url !== '') ? url : '/'+this.configuration.fallbackUrl;
			
			// Encodes the Options
			var tmp_options = {};
			if (this.options.order && this.options.order !== this.configuration.defaultOrder)
			{
				tmp_options.order = 'order' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.order;
			}
			
			if (this.options.page && parseInt(this.options.page, 10) !== 1)
			{
				tmp_options.page = 'page' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.page;
			}
			
			if (this.options.show && parseInt(this.options.show, 10) !== this.configuration.defaultShow)
			{
				tmp_options.show = 'show' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.show;
			}
			
			if (this.options.display && this.options.display !== this.configuration.defaultDisplay)
			{
				tmp_options.display = 'display' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.display;
			}

			if (this.options.keywords && this.options.keywords !== this.configuration.defaultKeywords)
			{
				tmp_options.keywords = 'keywords' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.keywords;
			}
			
			var tmp_options_keys = _.keys(tmp_options)
			,	tmp_options_vals = _.values(tmp_options);

			// If there are options that should not be indexed also return #
			if (facets_seo_limits.options && _.difference(tmp_options_keys, facets_seo_limits.options).length)
			{
				return '#';
			}

			url += (tmp_options_vals.length) ? this.configuration.facetDelimiters.betweenFacetsAndOptions + tmp_options_vals.join(this.configuration.facetDelimiters.betweenDifferentOptions) : '';
			
			
			return _(url).fixUrl();
		}
		
		// facetsTranslator.getApiParams:
		// Gets the api parameters representing the current status of the object
	,	getApiParams: function ()
		{
			var params = {};
			
			_.each(this.facets, function (facet)
			{
				switch (facet.config.behavior)
				{
				case 'range':
					var value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					params[facet.id + '.from'] = value.from;
					params[facet.id + '.to'] = value.to;
					break;
				case 'multi':
					params[facet.id] = facet.value.sort().join(',') ; // this coma is part of the api call so it should not be removed
					break;
				default: 
					params[facet.id] =  facet.value ;
				}
			});
			
			params.sort = this.options.order;
			params.limit = this.options.show;
			params.offset = (this.options.show * this.options.page) - this.options.show;

			params.q = this.options.keywords;
			
			return params;
		}
		
		// facetsTranslator.cloneForFacetId:
		// retruns a deep copy of this object with a new value for one facet, 
		// if in a name value that is the same as what's in, it will take it out
	,	cloneForFacetId: function (facet_id, facet_value) {
			// Using jQuery here because it offers deep cloning
			var facets	= _.toArray(jQuery.extend(true, {}, this.facets))
			,	options	= jQuery.extend(true, {}, this.options);
			
			var current_facet = _.find(facets, function (facet) { return facet.id === facet_id; });
			if (current_facet)
			{
				if (current_facet.config.behavior === 'multi')
				{
					if (_.indexOf(current_facet.value, facet_value) === -1)
					{
						current_facet.value.push(facet_value);
					}
					else
					{
						current_facet.value = _.without(current_facet.value, facet_value); 
					}
					
					if (current_facet.value.length === 0)
					{
						facets = _.without(facets, current_facet);
					}
				}
				else
				{
					if (!_.isEqual(current_facet.value, facet_value))
					{
						current_facet.value = facet_value;
					}
					else
					{
						facets = _.without(facets, current_facet); 
					}
				}
			}
			
			options.page = 1;
			
			var translator = new FacetsTranslator(facets, options, this.configuration);
			
			if (!current_facet)
			{
				translator.parseFacet(facet_id, facet_value);
			}
			
			return translator;
		}
		
		// facetsTranslator.cloneWithoutFacetId:
		// retruns a deep copy of this object without a facet, 
	,	cloneWithoutFacetId: function (facet_id)
		{
			var facets = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);
			
			facets = _.without(facets, _.find(facets, function (facet) { return facet.id === facet_id; })); 
			
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		// facetsTranslator.cloneForFacetUrl:
		// same as cloneForFacetId but passing the url component of the facet
	,	cloneForFacetUrl: function (facet_url, facet_value) {
			return this.cloneForFacetId(this.getFacetConfig(facet_url, 'url').id, facet_value);
		}
		
		
		// facetsTranslator.cloneWithoutFacetId:
		// same as cloneWithoutFacetId but passing the url component of the facet
	,	cloneWithoutFacetUrl: function (facet_url) {
			return this.cloneWithoutFacetId(this.getFacetConfig(facet_url, 'url').id);
		}

		// facetsTranslator.cloneWithoutFacets:
		// Clones the translator removeing all the facets, leaving only options
	,	cloneWithoutFacets: function () 
		{
			// Creates a new translator with the same params as this;
			var translator = new FacetsTranslator(this.facets, this.options, this.configuration);
			_.each(translator.getAllFacets(), function(facet)
			{
				translator = translator.cloneWithoutFacetId(facet.id);
			});
			return translator;
		}
		


	,	cloneForOption: function (option_id, option_value) {
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets)),
				options = jQuery.extend(true, {}, this.options);
			
			options[option_id] = option_value;
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		
		// facetsTranslator.cloneForOptions:
		// same as cloneForFacetId but for options instead of facets
	,	cloneForOptions: function (object)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets)),
				options = jQuery.extend(true, {}, this.options, object);
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		// facetsTranslator.cloneWithoutOption:
		// same as cloneWithoutFacetId but for options instead of facets
	,	cloneWithoutOption: function (option_id) {
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets)),
				options = jQuery.extend(true, {}, this.options);
			
			delete options[option_id];
			
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		// facetsTranslator.resetAll:
		// Returns a blank instance of itself
	,	resetAll: function ()
		{
			return new FacetsTranslator([], {}, this.configuration);
		}
		
		// facetsTranslator.getMergedCategoryTree: 
		// Returns a Category tree based on the site's one 
		// but merged with the values passed in
		// it expect the format that the search api returns 
		// Be aware that this is a recursive function, and this same function will be used to compute sub categories
	,	getMergedCategoryTree: function (values, branch)
		{
			var self = this;
			// if branch is omited it will start from the top level
			branch = branch || Categories && Categories.getTree() || {};
			
			_.each(values, function (value)
			{
				var id = _.last(value.id.split('/'));
				if (branch[id])
				{
					branch[id].count = value.count;
					
					if (branch[id].sub && _.keys(branch[id].sub).length && value.values.length)
					{
						branch[id].sub = self.getMergedCategoryTree(value.values, branch[id].sub);
					}
				}
			});
			
			return branch;
		}

		// facetsTranslator.setLabelsFromFacets:
		// This let the translator known about labels the api proportions
		// Tho this make the translator a bit less API agnostic
		// this step is totaly optional and it should work regardless of this step
	,	setLabelsFromFacets: function (facets_labels)
		{
			this.facetsLabels = facets_labels;
		}

		// facetsTranslator.getLabelForValue:
		// If facets labes have been setted it will try to look for the label for the 
		// [id, value] combination and return it's label, otherways it will return the value
	,	getLabelForValue: function (id, value)
		{
			var facet = _.where(this.facetsLabels || [], {id: id});

			if (facet.length)
			{
				var label = _.where(facet[0].values || [], {name: value});
				
				if (label.length)
				{
					return label[0].label;
				}
			}

			return value;

		}

	});
	
	return FacetsTranslator;
});

// ItemDetails.Collection.js
// -------------------------
// Returns an extended version of the CachedCollection constructor
// (file: Backbone.cachedSync.js)
define('ItemDetails.Collection', ['ItemDetails.Model'], function (Model)
{
	'use strict';

	return Backbone.CachedCollection.extend({
		
		url: '/api/items'
	,	model: Model
		
		// http://backbonejs.org/#Model-parse
	,	parse: function (response)
		{
			// NOTE: Compact is used to filter null values from response
			return _.compact(response.items) || null;
		}
	});
});
// ItemDetails.js
// --------------
// Groups the different components of the Module
define('ItemDetails'
,	['ItemDetails.Model', 'ItemDetails.Collection', 'ItemDetails.View', 'ItemDetails.Router']
,	function (Model, Collection, View, Router)
{
	'use strict';

	return {
		View: View
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application, options)
		{
			// Wires the config options to the url of the model 
			Model.prototype.urlRoot = _.addParamsToUrl(Model.prototype.urlRoot, application.getConfig('searchApiMasterOptions.itemDetails', {}));
			// and the keymapping
			Model.prototype.keyMapping = application.getConfig('itemKeyMapping', {});

			Model.prototype.itemOptionsConfig = application.getConfig('itemOptions', []);

			Model.prototype.itemOptionsDefaultMacros = application.getConfig('macros.itemOptions', {});
			
			if (options && options.startRouter)
			{
				return new Router(application);
			}
		}
	};
});
// ItemDetails.Model.js
// --------------------
// Represents 1 single product of the web store
define('ItemDetails.Model', ['ItemOptionsHelper'], function (ItemOptionsHelper)
{
	'use strict';
	
	var Model = Backbone.CachedModel.extend({
		
		urlRoot: '/api/items'

		// The api returns the items as an array allways this takes care of returning the object
	,	parse: function (response)
		{
			// if we are performing a direct API call the item is response.items[0] 
			// but if you are using the ItemDetails.Collection to fetch this guys
			// The item is the response
			var single_item = response.items && response.items[0];

			if (single_item)
			{
				single_item.facets = response.facets;
			}

			return single_item || response;
		}
		
	,	initialize: function ()
		{
			this.itemOptions = {};

			if (_.isArray(this.get('options')))
			{
				this.setOptionsArray(this.get('options'), true);
			}
		}

	,	getOption: function (option_name)
		{
			return this.itemOptions[option_name];
		}

	,	setOptionsArray: function (options, dont_validate)
		{
			var self = this;
			_.each(options, function (option)
			{
				self.setOption(option.id, {
					internalid: option.value
				,	label: option.displayvalue ? option.displayvalue : option.value
				}, dont_validate);
			});
		}

	,	setOption: function (option_name, value, dont_validate)
		{

			// Setting it to null means you dont wan a value for it
			if (option_name === 'quantity')
			{
				this.set('quantity', parseInt(value, 10) || 1);
			}
			else if (_.isNull(value))
			{
				delete this.itemOptions[option_name];
			}
			else
			{
				// Sometimes the name comes in all uppercase
				var option = this.getPosibleOptionByCartOptionId(option_name) || this.getPosibleOptionByCartOptionId(option_name.toLowerCase());

				// You can pass in the internalid on the instead of the full item 
				if (option && option.values)
				{
					value = _.isObject(value) ? value : _.where(option.values, {internalid: value.toString()})[0];
				}
				else if (!_.isObject(value))
				{
					value = {
						internalid: value
					,	label: value
					};
				}
				
				// if it's a matrix option this will make sure it's compatible to what its already set!
				if (!dont_validate && option.isMatrixDimension && !_.contains(this.getValidOptionsFor(option.itemOptionId), value.label))
				{
					throw new RangeError('The combination you selected is invalid');
				}
				if (option && option.cartOptionId)
				{
					this.itemOptions[option.cartOptionId] = value;
				}

			}
			return value;
			
		}

	,	getItemOptionsForCart: function ()
		{
			var result = {};

			_.each(this.itemOptions, function (value, name)
			{
				result[name] = value.internalid;
			});

			return result;
		}

		// model.get:
		// We have override the get function for this model in order to honor the itemsKeyMapping
		// It also makes sure that _matrixChilds and _relatedItems are ItemDetails.Collection and 
		// _matrixParent is an ItemDetails.Model
		// TODO: Deprecate the dont_cache param and make sure that mappings to functions are not chaced
	,	get: function (attr, dont_cache)
		{
			var keyMapping = this.keyMapping || this.collection.keyMapping;
			
			if (dont_cache || (keyMapping && !this.attributes[attr] && keyMapping[attr]))
			{
				var mapped_key = keyMapping[attr];
				
				if (_.isFunction(mapped_key))
				{
					this.attributes[attr] = mapped_key(this);
				}
				else if (_.isArray(mapped_key))
				{
					for (var i = 0; i < mapped_key.length; i++)
					{
						if (this.attributes[mapped_key[i]])
						{
							this.attributes[attr] = this.attributes[mapped_key[i]];
							break;
						}
					}
				}
				else
				{
					this.attributes[attr] = this.attributes[mapped_key];
				}

				if (attr === '_matrixChilds' || attr === '_relatedItems')
				{
					var Collection = require('ItemDetails.Collection');
					this.attributes[attr] = new Collection(this.attributes[attr] || []);
				}
				else if (attr === '_matrixParent')
				{
					this.attributes[attr] = new Model(this.attributes[attr] || {});
				}
			}
			
			return this.attributes[attr];
		}
		
		// model.getPrice:
		// Gets the price based on the selection of the item and the quantity
	,	getPrice: function ()
		{
			var self = this
			,	details_object = this.get('_priceDetails') || {}
			,	matrix_children = this.getSelectedMatrixChilds()
			,	result =  { 
					price: details_object.onlinecustomerprice
				,	price_formatted: details_object.onlinecustomerprice_formatted
				};

			// Computes Quantity pricing.
			if (details_object.priceschedule && details_object.priceschedule.length)
			{
				var quantity = this.get('quantity'),
					price_schedule, min, max;

				for (var i = 0; i < details_object.priceschedule.length; i++)
				{
					price_schedule = details_object.priceschedule[i];
					min = parseInt(price_schedule.minimumquantity, 10);
					max = parseInt(price_schedule.maximumquantity, 10);
					
					if ((min <= quantity && quantity < max) || (min <= quantity && !max))
					{
						result  = {
							price: price_schedule.price
						,	price_formatted: price_schedule.price_formatted
						};
					}
				}
			}

			// if it's a matrix it will compute the matrix price
			if (matrix_children.length)
			{
				// Gets the price of each child
				var children_prices = [];

				_.each(matrix_children, function (child)
				{
					child.setOption('quantity', self.get('quantity'));
					children_prices.push(child.getPrice());
				});

				if (children_prices.length === 1)
				{
					// If there is only one it means there is only one price to show
					result = children_prices[0];
				}
				else
				{
					// otherways we should compute max and min to show a range in the gui
					var children_prices_values = _.pluck(children_prices, 'price')
					,	min_value = _.min(children_prices_values)
					,	max_value = _.max(children_prices_values);

					if (min_value !== max_value)
					{
						// We return them alongside the result of the parent
						result.min = _.where(children_prices, {price: min_value})[0];
						result.max = _.where(children_prices, {price: max_value})[0];
					}
					else
					{
						// they are all alike so we can show any of them
						result = children_prices[0];
					}
				}
			}

			// Adds the compare agains price if its not setted by one if the childs
			if (!result.compare_price && this.get('_comparePriceAgainst'))
			{
				result.compare_price = this.get('_comparePriceAgainst');
				result.compare_price_formatted = this.get('_comparePriceAgainstFormated');
			}

			return result;
		}

		// model.getStockInfo
		// Returns an standar formated object for the stock info
		// It also consider matrix childs
	,	getStockInfo: function ()
		{
			// Standarize the result object 
			var stock_info = {
					stock: this.get('_stock')
				,	isInStock: this.get('_isInStock')

				,	outOfStockMessage: this.get('_outOfStockMessage')
				,	showOutOfStockMessage: this.get('_showOutOfStockMessage')

				,	inStockMessage: this.get('_inStockMessage')
				,	showInStockMessage: this.get('_showInStockMessage')

				,	stockDescription: this.get('_stockDescription')
				,	showStockDescription: this.get('_showStockDescription')
				,	stockDescriptionClass: this.get('_stockDescriptionClass')
				}
				
			,	matrix_children = this.getSelectedMatrixChilds();

			// if there is matrix children this will compute them all
			if (matrix_children.length)
			{
				var matrix_children_stock_info = [];

				_.each(matrix_children, function (child)
				{
					matrix_children_stock_info.push(child.getStockInfo());
				});

				// If all matrix childs return the same value for a given attribute that becomes the output, 
				// with the exeption of stock that is an adition of the stocks of the childs
				_.each(stock_info, function (value, key)
				{
					var children_values_for_attribute = _.pluck(matrix_children_stock_info, key);

					if (key === 'stock')
					{
						stock_info.stock = _.reduce(children_values_for_attribute, function (memo, num) { return memo + num; }, 0);
					}
					else if (key === 'isInStock')
					{
						// the parent is in stock if any of the child items is in stock
						// so, if in the array of the values of 'isInStock' for the childs
						// there is a 'true', then the parent item is in stock
						stock_info.isInStock = _.contains(children_values_for_attribute, true);
					}
					else
					{
						children_values_for_attribute = _.uniq(children_values_for_attribute);

						if (children_values_for_attribute.length === 1)
						{
							stock_info[key] = children_values_for_attribute[0];
						}
					}
				});
			}
			
			return stock_info;
		}

		// model.isReadyForCart:
		// if it has mandatory options, checks for all to be filled
		// also checks if the item is purchasable
	,	isReadyForCart: function ()
		{
			// if the item is a matrix, we check if the selection is completed
			// for non-matrix items isSelectionComplete always returns true
			if (this.isSelectionComplete())
			{
				var is_purchasable = this.get('_isPurchasable')
				,	child = this.getSelectedMatrixChilds();

				if (child.length)
				{
					is_purchasable = child[0].get('_isPurchasable');
				}

				return is_purchasable;
			}

			return false;
		}
	});
	
	Model.prototype = _.extend(Model.prototype, ItemOptionsHelper);

	return Model;
});

/* global nsglobal */
// ItemDetails.Router.js
// ---------------------
// Adds route listener to display Product Detailed Page
// Parses any options pased as parameters
define('ItemDetails.Router', ['ItemDetails.Model', 'ItemDetails.View'], function (Model, View)
{
	'use strict';
	
	return Backbone.Router.extend({
		
		routes: {
			':url': 'productDetailsByUrl'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
			// we will also add a new regexp route to this, that will cover any url with slashes in it so in the case
			// you want to handle urls like /cat1/cat2/urlcomponent, as this are the last routes to be evaluated,
			// it will only get here if there is no other more apropiate one
			this.route(/^(.*?)$/, 'productDetailsByUrl');
			
			// This is the fallback url if a product does not have a url component.
			this.route('product/:id', 'productDetailsById');
			this.route('product/:id?:options', 'productDetailsById');
		}
		
	,	productDetailsByUrl: function (url)
		{
			// if there are any options in the URL
			var options = null;

			if (~url.indexOf('?'))
			{
				options = SC.Utils.parseUrlOptions(url);
				url = url.split('?')[0];
			}
			// Now go grab the data and show it
			if (options)
			{
				this.productDetails({url: url}, url, options);				
			}
			else
			{
				this.productDetails({url: url}, url);				
			}
		}
		
	,	productDetailsById: function (id, options)
		{
			// Now go grab the data and show it
			this.productDetails({id: id}, '/product/'+id, SC.Utils.parseUrlOptions(options));
		}	
		
	,	productDetails: function (api_query, base_url, options)
		{
			// Decodes url options 
			_.each(options, function(value, name)
			{
				options[name] = decodeURIComponent(value);
			});

			var application = this.application
			,	model = new Model()
				// we create a new instance of the ProductDetailed View
			,	view = new View({
					model: model
				,	baseUrl: base_url
				,	application: this.application
				});

			model.fetch({
				data: api_query
			,	killerId: this.application.killerId
			}).then(
				// Success function
				function ()
				{
					if (!model.isNew())
					{
						if (api_query.id && model.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
						{
							nsglobal.statusCode = 301;
							nsglobal.location = model.get('_url');
						}

						// once the item is fully loadede we set its options
						model.parseQueryStringOptions(options);
						
						if (!(options && options.quantity))
						{
							model.set('quantity', model.get('_minimumQuantity'));
						}
						
						// we first prepare the view
						view.prepView();
						
						// then we show the content
						view.showContent();
					}
					else
					{
						// We just show the 404 page
						application.getLayout().notFound();
					}
				}
				// Error function
			,	function (model, jqXhr)
				{					
					// this will stop the ErrorManagment module to process this error
					// as we are taking care of it 
					jqXhr.preventDefault = true;

					// We just show the 404 page
					application.getLayout().notFound();
				}
			);
		}
	});
});
// ItemDetails.View.js
// -------------------
// Handles the pdp and quick view
define('ItemDetails.View', ['Facets.Translator'], function (FacetsTranslator)
{
	'use strict';
	
	var colapsibles_states = {};
	
	return Backbone.View.extend({
		
		title: ''
	,	page_header: ''
	,	template: 'product_details'
	,	attributes: {
			'id': 'product-detail'
		,	'class': 'view product-detail'
		}

	,	events: {
			'blur [data-toggle="text-option"]': 'setOption'
		,	'click [data-toggle="set-option"]': 'setOption'
		,	'change [data-toggle="select-option"]': 'setOption'
		
		,	'keydown [data-toggle="text-option"]': 'tabNavigationFix'
		,	'focus [data-toggle="text-option"]': 'tabNavigationFix'

		,	'change [name="quantity"]': 'updateQuantity'

		,	'click [data-type="add-to-cart"]': 'addToCart'
		
		,	'shown .collapse': 'storeColapsiblesState'
		,	'hidden .collapse': 'storeColapsiblesState'

		,	'mouseup': 'contentMouseUp'
		,	'click': 'contentClick'
		}
		
	,	initialize: function (options)
		{
			this.application = options.application;
			this.counted_clicks = {};
		}
		
		// view.getBreadcrumb:
		// It will generate an array suitable to pass it to the breadcrumb macro
		// It looks in the productDetailsBreadcrumbFacets config object
		// This will be enhaced to use the categories once thats ready
	,	getBreadcrumb: function ()
		{
			var self = this
			,	breadcrumb = []
			,	translator = new FacetsTranslator(null, null, this.application.translatorConfig);
			
			_.each(this.application.getConfig('productDetailsBreadcrumbFacets'), function (product_details_breadcrumb_facet)
			{
				var value = self.model.get(product_details_breadcrumb_facet.facetId);

				if (value)
				{
					translator = translator.cloneForFacetId(product_details_breadcrumb_facet.facetId, value);
					breadcrumb.push({
						href: translator.getUrl()
					,	text: product_details_breadcrumb_facet.translator ? _(product_details_breadcrumb_facet.translator).translate(value) : value
					});
				}
			});
			
			return breadcrumb;
		}
		
		// view.storeColapsiblesState:
		// Since this view is re-rendered every time you make a selection
		// we need to keep the state of the collapsable for the next render
	,	storeColapsiblesState: function ()
		{
			this.storeColapsiblesStateCalled = true;

			this.$('.collapse').each(function (index, element)
			{
				colapsibles_states[SC.Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
			});
		}
		
		// view.resetColapsiblesState:
		// as we keep track of the state, we need to reset the 1st time we show a new item
	,	resetColapsiblesState: function ()
		{
			var self = this;
			_.each(colapsibles_states, function (is_in, element_selector)
			{
				self.$(element_selector)[is_in ? 'addClass' : 'removeClass']('in').css('height', is_in ? 'auto' : '0');
			});
		}
		
		// view.updateQuantity:
		// Updates the quantity of the model
	,	updateQuantity: function (e)
		{
			this.model.setOption('quantity', jQuery(e.target).val());
			this.refreshInterface(e);
		}
		
		// view.contentClick:
		// Keeps track of the clicks you have made onto the view, so the contentMouseUp
		// knows if it needs to trigger the click event once again 
	,	contentClick: function (e)
		{
			this.counted_clicks[e.pageX + '|' + e.pageY] = true;
		}

		// view.contentMouseUp:
		// this is used just to register a delayed function to check if the click went through
		// if it didn't we fire the click once again on the top most element
	,	contentMouseUp: function (e)
		{
			if (e.which !== 2 && e.which !== 3)
			{
				var self = this;
				_.delay(function ()
				{
					if (!self.counted_clicks[e.pageX + '|' + e.pageY])
					{
						jQuery(document.elementFromPoint(e.clientX, e.clientY)).click(); 
					}

					delete self.counted_clicks[e.pageX + '|' + e.pageY];

				}, 100);
			}			
		}

		// view.addToCart:
		// Updates the Cart to include the current model
		// also takes care of updateing the cart if the current model is a cart item
	,	addToCart: function (e)
		{
			e.preventDefault();

			// Updates the quantity of the model
			this.model.setOption('quantity', this.$('[name="quantity"]').val());

			if (this.model.isReadyForCart())
			{

				var self = this
				,	cart = this.application.getCart()
				,	layout = this.application.getLayout()
				,	cart_promise
				,	error_message = _('Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.').translate();

				if (this.model.itemOptions && this.model.itemOptions.GIFTCERTRECIPIENTEMAIL)
				{
					if (!Backbone.Validation.patterns.email.test(this.model.itemOptions.GIFTCERTRECIPIENTEMAIL.label))
					{
						self.showError(_('Recipient email is invalid').translate());
						return;
					}
					
				}

				if (this.model.cartItemId)
				{
					cart_promise = cart.updateItem(this.model.cartItemId, this.model).success(function ()
					{
						if (cart.getLatestAddition())
						{
							if (self.$containerModal)
							{
								self.$containerModal.modal('hide');
							}						
							if (layout.currentView instanceof require('Cart').Views.Detailed)
							{
								layout.currentView.showContent();
							}	
						}
						else if(!cart.get('lines'.length) && layout.currentView instanceof require('Cart').Views.Detailed) 
						{	//user enter negative qty and as a result the cart is empty - so if we are in the cart view we redraw it.
							layout.currentView.showContent();
						}
						else if(cart.get('lines'.length)) 
						{	//show the error whenever the cart is not empty because the user may have emptied it
							self.showError(error_message);
						}
					});
				}
				else
				{
					cart_promise = cart.addItem(this.model).success(function ()
					{
						if (cart.getLatestAddition())
						{
							layout.showCartConfirmation();
						}
						else if(!cart.get('lines'.length) && layout.currentView instanceof require('Cart').Views.Detailed) 
						{	//user enter negative qty and as a result the cart is empty - so if we are in the cart view we redraw it.
							layout.currentView.showContent();
						}
						else if(cart.get('lines'.length)) 
						{	//show the error whenever the cart is not empty because the user may have emptied it
							self.showError(error_message);
						}
					});
				}

				// Checks for rollback items.
				cart_promise.error(function (jqXhr)
				{
					var response = JSON.parse(jqXhr.responseText)
					,	error_details = response.errorDetails;

					if (error_details && error_details.status === 'LINE_ROLLBACK')
					{
						var new_line_id = error_details.newLineId;

						self.model.cartItemId = new_line_id;
					}
						
				});

				// disalbes the btn while it's being saved then enables it back again
				if (e && e.target)
				{
					var $target = jQuery(e.target).attr('disabled', true);

					cart_promise.always(function () {
						$target.attr('disabled', false);
					});	
				}
			}
		}

		// view.refreshInterface
		// Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
		// This also updates the url, but it does not generates a hisrory point
	,	refreshInterface: function ()
		{
			var focused_element = this.$(':focus').get(0);

			this.focusedElement = focused_element ? SC.Utils.getFullPathForElement(focused_element) : null;
			
			if (!this.inModal)
			{
				Backbone.history.navigate(this.options.baseUrl + this.model.getQueryString(), {replace: true});
			}

			this.showContent({
				dontScroll: true
			});
		}

		// view.computeDetailsArea
		// this process what you have configured in itemDetails
		// executes the macro or reads the properties of the item
	,	computeDetailsArea: function ()
		{
			var self = this
			,	details = [];
			
			_.each(this.application.getConfig('itemDetails', []), function (item_details)
			{
				var content = '';

				if (item_details.macro)
				{
					content = SC.macros[item_details.macro](self);
				}
				else if (item_details.contentFromKey)
				{
					content = self.model.get(item_details.contentFromKey);
				}
				
				if (jQuery.trim(content))
				{
					details.push({
						name: item_details.name
					,	opened: item_details.opened
					,	content: content
					});
				}
			});
			
			this.details = details;
		}
		
		// view.showInModal:
		// Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
		// after events because those are triggered by showContent
	,	showInModal: function (options)
		{
			this.template = 'quick_view';
			
			return this.application.getLayout().showInModal(this, options);
		}

		// Prepears the model and other internal properties before view.showContent
	,	prepView: function ()
		{
			this.title = this.model.get('_pageTitle');
			this.page_header = this.model.get('_pageHeader');
			
			this.computeDetailsArea();
		}

	,	getMetaKeywords: function ()
		{
			return this.model.get('_keywords');
		}

	,	getMetaTags: function ()
		{
			return jQuery('<head/>').html(
				jQuery.trim(
					this.model.get('_metaTags')
				)
			).children('meta');
		}

		// view.renderOptions:
		// looks for options placeholders and inject the rendered options in them
	,	renderOptions: function ()
		{
			var self = this
			,	posible_options = this.model.getPosibleOptions();
			
			// this allow you to render 1 particular option in a diferent placeholder than the data-type=all-options
			this.$('div[data-type="option"]').each(function (index, container)
			{
				var $container = jQuery(container).empty()
				,	option_id = $container.data('cart-option-id')
				,	macro = $container.data('macro') || '';
				
				$container.append(self.model.renderOptionSelector(option_id, macro));
			});
			
			// Will render all options with the macros they were configured
			this.$('div[data-type="all-options"]').each(function (index, container)
			{
				var $container = jQuery(container).empty()
				,	exclude = _.map(($container.data('exclude-options') || '').split(','), function (result)
					{
						return jQuery.trim(result);
					})
				,	result_html = '';
				
				_.each(posible_options, function (posible_option)
				{
					if (!_.contains(exclude, posible_option.cartOptionId))
					{
						result_html += self.model.renderOptionSelector(posible_option);
					}
				});

				$container.append(result_html);
			});
		}

		// view.tabNavigationFix:
		// When you blur on an input field the whole page gets rendered, 
		// so the function of hitting tab to navigate to the next input stops working
		// This solves that problem by storing a a ref to the current input
	,	tabNavigationFix: function (e) 
		{
			this.hideError();
			// If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
			this.tabNavigation = (e.type === 'keydown' && e.which === 9);
			this.tabNavigationUpsidedown = e.shiftKey;
			this.tabNavigationCurrent = SC.Utils.getFullPathForElement(e.target);
		}

	,	showContent: function (options)
		{
			var self = this;
			// Once the showContent has been called, this make sure that the state is preserved
			// REVIEW: the following code might change, showContent should recieve an options parameter
			this.application.getLayout().showContent(this, options && options.dontScroll).done(function ()
			{
				self.afterAppend();
			});
		}

	,	afterAppend: function ()
		{
			this.renderOptions();
			this.focusedElement && this.$(this.focusedElement).focus();

			if (this.tabNavigation)
			{
				var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
				,	next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

				this.$(':input:eq('+ next_index +')').focus();
			}

			this.storeColapsiblesStateCalled ? this.resetColapsiblesState() : this.storeColapsiblesState();
			this.application.getUser().addHistoryItem && this.application.getUser().addHistoryItem(this.model);
		}

		// view.setOption:
		// When a selection is change, this computes the state of the item to then refresh the interface.
	,	setOption: function (e)
		{
			var self = this
			,	$target = jQuery(e.target)
			,	value = $target.val() || $target.data('value') || null
			,	cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');
			
			// prevent from going away
			e.preventDefault();
			// e.stopPropagation();
			
			// if option is selected, remove the value
			if ($target.data('active'))
			{
				value = null;
			}

			// it will fail if the option is invalid 
			try 
			{
				this.model.setOption(cart_option_id, value);
			}
			catch (error)
			{
				// Clears all matrix options 
				_.each(this.model.getPosibleOptions(), function (option)
				{
					option.isMatrixDimension && self.model.setOption(option.cartOptionId, null);
				});
				// Sets the value once again
				this.model.setOption(cart_option_id, value);
			}
			
			this.refreshInterface(e);
		}
	});
});

// ItemOptionsHelper.js
// --------------------
// Defines function that will be extended into ItemDetails.Model
define('ItemOptionsHelper', function ()
{
	'use strict';

	var ItemOptionsHelper = {
		// itemOptionsHelper.renderOptionSelected:
		// Renders the option defaulting to the "selected" macro
		renderOptionSelected: function(option_name_or_option_config, macro) 
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option = (_.isObject(option_name_or_option_config)) ? option_name_or_option_config : this.getPosibleOptionByCartOptionId(option_name_or_option_config)
			// gets the selected value from the macro
			,	selected_value = this.getOption(option.cartOptionId);
			// Uses the passed in macro or the default macro selector 
			macro = macro || option.macros.selected;

			// if no value is selected just return an empty string
			if (!selected_value)
			{
				return '';
			}
			
			return SC.macros[macro](option, selected_value, this);
		}

		// itemOptionsHelper.renderAllOptionSelected:
		// Renders all the options defaulting to the "selected" macro
	,	renderAllOptionSelected: function(options_to_render)
		{
			var self = this;

			options_to_render = options_to_render || this.getPosibleOptions();

			return _.reduce(
				options_to_render
			,	function(memo, option) 
				{
					return memo + self.renderOptionSelected(option);
				}
			,	''
			);
		}

		// itemOptionsHelper.renderOptionSelector:
		// Renders the option defaulting to the "selector" macro
	,	renderOptionSelector: function(option_name_or_option_config, macro)
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option = (_.isObject(option_name_or_option_config)) ? option_name_or_option_config : this.getPosibleOptionByCartOptionId(option_name_or_option_config)
			// gets the selected value from the macro
			,	selected_value = this.getOption(option.cartOptionId);
			// Uses the passed in macro or the default macro selector 
			macro = macro || option.macros.selector;

			// If it's a matrix it checks for valid combinations 
			if (option.isMatrixDimension)
			{
				var available = this.getValidOptionsFor(option.itemOptionId);
				_.each(option.values, function(value)
				{
					value.isAvailable = _.contains(available, value.label);
				});
			}
			
			return SC.macros[macro](option, selected_value, this);
		}

		// itemOptionsHelper.renderAllOptionSelector:
		// Renders all the options defaulting to the "selector" macro
	,	renderAllOptionSelector: function(options_to_render)
		{
			var self = this;

			options_to_render = options_to_render || this.getPosibleOptions();

			return _.reduce(
				options_to_render
			,	function(memo, option) 
				{
					return memo + self.renderOptionSelector(option);
				}
			,	''
			);
		}

		// itemOptionsHelper.getValidOptionsFor:
		// returns a list of all valid options for the option you passed in
	,	getValidOptionsFor: function(item_option_id)
		{
			var selection = this.getMatrixOptionsSelection();
			delete selection[item_option_id];
			return _.uniq(_.map(this.getSelectedMatrixChilds(selection), function(model) { return model.get(item_option_id); }));
		}

		// itemOptionsHelper.isSelectionComplete
		// returns true if all mandatory options are set,
		// if it's a mtrix it also checks that there is only one sku sleected
	,	isSelectionComplete: function()
		{
			var posible_options = this.getPosibleOptions()
			,	is_matrix = false;
			
			// Checks all mandatory fields are set
			// in the mean time 
			for (var i = 0; i < posible_options.length; i++)
			{
				var posible_option = posible_options[i];
				
				is_matrix = is_matrix || posible_option.isMatrixDimension;
				
				if (posible_option.isMandatory && !this.getOption(posible_option.cartOptionId))
				{
					return false;
				}
			}
			
			// If its matrix its expected that only 1 item is selected, not more than one nor 0 
			if (is_matrix && this.getSelectedMatrixChilds().length !== 1)
			{
				return false;
			}

			return true;
		}

		// itemOptionsHelper.getPosibleOptionsFor:
		// gets the configuration for one option by its cart id.
	,	getPosibleOptionByCartOptionId: function (cart_option_id)
		{
			return _.where(this.getPosibleOptions(), {cartOptionId: cart_option_id})[0];
		}

		// itemOptionsHelper.getPosibleOptionsFor:
		// gets the configuration for one option by its url component.
	,	getPosibleOptionByUrl: function (url)
		{
			return _.where(this.getPosibleOptions(), {url: url})[0];
		}

		// itemOptionsHelper.getPosibleOptions
		// returns an array of all the posible options with values and information 
	,	getPosibleOptions: function() 
		{
			if (this.cachedPosibleOptions)
			{
				return this.cachedPosibleOptions;
			}

			var result = [];
			if (this.get('_optionsDetails') && this.get('_optionsDetails').fields)
			{
				var self = this;

				// Prepeares a simple map of the configuration 
				var options_config_map = {};
				_.each(this.itemOptionsConfig, function(option)
				{
					if (option.cartOptionId)
					{
						options_config_map[option.cartOptionId] = option;
					}
				});

				// if you are an child in the cart it then checks for the options of the parent
				var fields = (this.get('_matrixParent').get('_id')) ? this.get('_matrixParent').get('_optionsDetails').fields : this.get('_optionsDetails').fields;

				// Walks the _optionsDetails to generate a standar options responce.
				_.each(fields, function(option_details)
				{
					var option = {
						label: option_details.label
					,	values: option_details.values
					,	type: option_details.type
					,	cartOptionId: option_details.internalid
					,	isMatrixDimension: option_details.ismatrixdimension || false
					,	isMandatory: option_details.ismandatory || false
					,	macros: {}
					};

					// Makes sure all options are availabe by defualt
					_.each(option.values, function(value)
					{
						value.isAvailable = true;
					});

					// Merges this with the configuration object 
					if (options_config_map[option.cartOptionId])
					{
						option = _.extend(option, options_config_map[option.cartOptionId]);
					}

					if (option_details.ismatrixdimension)
					{
						var item_values = self.get('_matrixChilds').pluck(option.itemOptionId);
						
						option.values = _.filter(option.values, function(value)
						{

							if (value.internalid)
							{
								return _.contains(item_values,value.label);
							}
							else
							{
								return true;
							}
						});

					}


					// Sets macros for this option
					if (!option.macros.selector)
					{
						option.macros.selector = (self.itemOptionsDefaultMacros.selectorByType[option.type]) ? self.itemOptionsDefaultMacros.selectorByType[option.type] : self.itemOptionsDefaultMacros.selectorByType['default']; // using .default brakes ie :(
					}

					if (!option.macros.selected)
					{
						option.macros.selected = (self.itemOptionsDefaultMacros.selectedByType[option.type]) ? self.itemOptionsDefaultMacros.selectedByType[option.type] : self.itemOptionsDefaultMacros.selectedByType['default']; // using .default brakes ie :(
					}

					// Makes sure the url key of the object is set, 
					// otherways sets it to the cartOptionId (it should allways be there)
					if (!option.url)
					{
						option.url = option.cartOptionId;
					}

					result.push(option);
				});
				
				// Since this is not going to change in the life of the model we can cache it
				this.cachedPosibleOptions = result;
			}
			
			return result;
		}

		// itemOptionsHelper.isProperlyConfigured
		// returns true if all matrix options are mapped to the cart options 
	,	isProperlyConfigured: function ()
		{
			var options = this.getPosibleOptions()
			,	option;

			if (options.length)
			{
				for (var i = 0; i < options.length; i++)
				{
					option = options[i];

					if (option.isMatrixDimension && !option.itemOptionId)
					{
						return false;
					}
				}	
			}
			// If you omit item options from the fieldset and use matrix, that an issue.
			else if (this.get('_matrixChilds').length)
			{
				return false;
			}

			return true;
		}
		
		// itemOptionsHelper.getMatrixOptionsSelection
		// returns an object of all the matrix options with its setted values
	,	getMatrixOptionsSelection: function() 
		{
			var matrix_options = _.where(this.getPosibleOptions(), {isMatrixDimension: true})
			,	result = {}
			,	self = this;

			_.each(matrix_options, function (matrix_option)
			{
				var value = self.getOption(matrix_option.cartOptionId);
				if (value && value.label)
				{
					result[matrix_option.itemOptionId] = value.label;
				}
			});

			return result; 
		}

		// itemOptionsHelper.getSelectedMatrixChilds
		// Returns all the children of a matrix that complies with the current or passed in selection
	,	getSelectedMatrixChilds: function(selection) 
		{
			selection = selection || this.getMatrixOptionsSelection();
			var selection_key = JSON.stringify(selection);

			// Creates the Cache container
			if (!this.matrixSelectionCache)
			{
				this.matrixSelectionCache = {};
			}

			// Caches the entry for the item
			if (!this.matrixSelectionCache[selection_key])
			{
				this.matrixSelectionCache[selection_key] = (_.values(selection).length) ? this.get('_matrixChilds').where(selection) : this.get('_matrixChilds').models;
			}
			
			return this.matrixSelectionCache[selection_key];
		}
		
		// itemOptionsHelper.getQueryString
		// Computes all the selected options and transforms them into a url query string
	,	getQueryString: function() 
		{
			var self = this
			,	result = '?quantity=' + (this.get('quantity') || 1);

			_.each (this.getPosibleOptions(), function(option)
			{
				var value = self.getOption(option.cartOptionId);
				if (value)
				{
					result += '&' + option.url + '=' + encodeURIComponent(value.label);
				}
			});

			return result;
		}

		// itemOptionsHelper.parseQueryStringOptions
		// Given a url query string, it sets the options in the model
	,	parseQueryStringOptions: function(options) 
		{
			var self = this;
			_.each(options, function(value, name)
			{
				if (name === 'quantity')
				{
					self.setOption('quantity', value);
				}
				else if (name === 'cartitemid')
				{
					self.cartItemId = value;
				}
				else if (value && name)
				{
					value = decodeURIComponent(value);
					var option = self.getPosibleOptionByUrl(name);

					if (option)
					{
						if (option.values)
						{
							// We check for both Label and internal id because we detected that sometimes they return one or the other
							value = _.where(option.values, {label: value})[0] || _.where(option.values, {internalid: value})[0];
							self.setOption(option.cartOptionId, value);
						}
						else
						{
							self.setOption(option.cartOptionId, value);
						}
					}
									
				}
			});
		}
	};

	return ItemOptionsHelper;
});

// LanguageSupport.js
// -------------------
// Handles the change event of the language selector combo
define('LanguageSupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="lenguage-selector"]' : 'setLanguage'});
			
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setLanguage: function (e)
				{
					var language_code = jQuery(e.target).val()
					,	selected_language = _.find(SC.ENVIRONMENT.availableLanguages, function (language) { return language.locale === language_code; })
					,	url;
					
					if (selected_language && selected_language.host)
					{
						if (Backbone.history._hasPushState)
						{
							// Seo Engine is on, send him to the root
							url = selected_language.host;
						}
						else 
						{
							// send it to the current path, it's probably a test site
							url = selected_language.host+location.pathname;
						}
					}
					else
					{
						// Worst case scenario there is no hosts properly configured
						// then we use the param **"lang"** to pass this to the ssp environment
						var current_search = SC.Utils.parseUrlOptions(window.location.search);
					
						current_search.lang = selected_language.locale;

						window.location.search =  _.reduce(current_search, function (memo, val, name) {
							return val ? memo + name + '=' + val + '&' : memo;
						}, '?');
						
						return window.location.search;
					}

					window.location.href = location.protocol + '//' + url;
				}
			});
		}
	};
});

// LoginRegister.js
// ----------------
// Handles views and routers of Login/Register Page
// Includes Register Guest, Forgot Passowrd and Reset password
define('LoginRegister'
,	['LoginRegister.Router', 'LoginRegister.Views']
,	function (Router, Views)
{
	'use strict';

	return {
		Router: Router
	,	Views: Views
	,	mountToApp: function (application, options)
		{
			if (options && options.startRouter)
			{
				return new Router(application);
			}
		}
	};
});
// LoginRegister.Router.js
// -----------------------
// Initializes the different views depending on the requested path
define('LoginRegister.Router', ['LoginRegister.Views'], function (Views)
{
	'use strict';

	return Backbone.Router.extend({
		
		routes: {
			'login-register': 'loginRegister'
		,	'forgot-password': 'forgotPassword'
		,	'reset-password': 'resetPassword'
		}
		
	,	initialize: function (application)
		{
			// application is a required parameter for all views
			// we save the parameter to pass it later
			this.application = application;
		}

	,	loginRegister: function ()
		{
			var view = new Views.LoginRegister({
				application: this.application
			});
			
			view.showContent();
		}

	,	forgotPassword: function ()
		{
			var view = new Views.ForgotPassword({
				application: this.application
			});
			
			view.showContent();
		}

	,	resetPassword: function ()
		{
			var view = new Views.ResetPassword({
				application: this.application
			});
			
			view.showContent();
		}
	});
});
// LoginRegister.Views.js
// ----------------------
// Handles the form saving
define('LoginRegister.Views'
,	[
		'Account.Login.Model'
	,	'Account.Register.Model'
	,	'Account.ForgotPassword.Model'
	,	'Account.ResetPassword.Model'
	,	'ErrorManagement'
	]
,	function (
		AccountLoginModel
	,	AccountRegisterModel
	,	AccountForgotPasswordModel
	,	AccountResetPasswordModel
	,	ErrorManagement
	)
{
	'use strict';

	// We override the default behaviour of the save form for all views
	// to add an error handler using the ErrorManagement module
	var customSaveForm = function (e)
	{
		e.preventDefault();
		
		var	self = this
		,	promise = Backbone.View.prototype.saveForm.apply(this, arguments);

		promise && promise.error(function (jqXhr)
		{
			jqXhr.preventDefault = true;
			var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
			self.showError(message);
		});
	};

	var Views = {};

	Views.Login = Backbone.View.extend({

		template: 'login'

	,	attributes: {
			'id': 'login-view'
		,	'class': 'view login-view'
		}
		
	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			this.model = new AccountLoginModel();
			// on save we reidrect the user out of the login page
			// as we know there hasn't been an error
			this.model.on('save', _.bind(this.redirect, this));
		}

	,	saveForm: customSaveForm

	,	redirect: function ()
		{
			var url_options = _.parseUrlOptions(window.location.search)
			,	touchpoints = this.model.get('touchpoints');

			// if we know from which touchpoint the user is coming from
			if (url_options.origin && touchpoints[url_options.origin])
			{
				// we save the url to that touchpoint
				var url = touchpoints[url_options.origin];
				// if there is an specific hash
				if (url_options.origin_hash)
				{
					// we add it to the url as a fragment
					url = _.addParamsToUrl(url, {fragment: url_options.origin_hash});
				}

				window.location.href = url;
			}
			else
			{
				// otherwise we need to take it to the customer center
				window.location.href = touchpoints.customercenter;
			}
		}
	});

	Views.Register = Backbone.View.extend({

		template: 'register'

	,	attributes: {
			'id': 'register-view'
		,	'class': 'view register-view'
		}
		
	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			this.model = new AccountRegisterModel();
			// on save we reidrect the user out of the registration page
			// as we know there hasn't been an error
			this.model.on('save', _.bind(this.redirect, this));
		}

	,	saveForm: customSaveForm

	,	redirect: function ()
		{
			var url_options = _.parseUrlOptions(window.location.search)
			,	touchpoints = this.model.get('touchpoints');

			// if we know from which touchpoint the user is coming from
			if (url_options.origin && touchpoints[url_options.origin])
			{
				// we save the url to that touchpoint
				var url = touchpoints[url_options.origin];
				// if there is an specific hash
				if (url_options.origin_hash)
				{
					// we add it to the url as a fragment
					url = _.addParamsToUrl(url, {fragment: url_options.origin_hash});
				}

				window.location.href = url;
			}
			else
			{
				// otherwise we need to take it to the customer center
				window.location.href = touchpoints.customercenter || touchpoints.home;
			}
		}
	});

	Views.CheckoutAsGuest = Backbone.View.extend({

		template: 'checkout_as_guest'

	,	attributes: {
			'id': 'checkout-as-guest'
		,	'class': 'view checkout-as-guest'
		}

	,	events: {
			'submit form': 'checkoutAsGuest'
		}

	,	checkoutAsGuest: function (e)
		{
			e && e.preventDefault();

			this.$('[type="submit"]').attr('disabled', true);

			// all we do is thake the user to the checkout touchpoint
			// with the checkout_as_guest parameter
			window.location.href = _.addParamsToUrl(this.options.application.getConfig('siteSettings.touchpoints.checkout'), {
				checkout_as_guest: 'T'
			});
		}
	});

	Views.LoginRegister = Backbone.View.extend({

		template: 'login_register'

	,	title: _('Sign In | Register').translate()

	,	attributes: {
			'id': 'login-register'
		,	'class': 'view login-register'
		}

	,	events: {
			// login error message could contain link to registration page
			'click .alert-error a': 'handleErrorLink'
		}

	,	initialize: function (options)
		{
			var application = options.application;
			
			this.pageTitle = _('Sign In').translate();

			// On the LoginRegister view we initialize all of the views
			this.sub_views = {
				Login: new Views.Login({ application: application })
			,	Register: new Views.Register({ application: application })
			,	CheckoutAsGuest: new Views.CheckoutAsGuest({ application: application })
			};

			this.enableRegister = application.getConfig('siteSettings.loginrequired') === 'F' && application.getConfig('siteSettings.registration.registrationallowed') === 'T';
			this.enableCheckoutAsGuest =  this.enableRegister && application.getConfig('siteSettings.registration.registrationoptional') === 'T' && application.getCart().get('lines').length > 0;
		}

	,	handleErrorLink: function (e)
		{
			// if the link contains the register touchpoint
			if (~e.target.href.indexOf(this.options.application.getConfig('siteSettings.touchpoints.register')))
			{
				e.preventDefault();
				this.showRegistrationForm();
				this.sub_views.Login.hideError();
			}
		}

	,	showRegistrationForm: function ()
		{
			// show the form
			this.sub_views.Register.$el.closest('.collapse').addClass('in');
			// hide the conatiner of the link to show it
			this.sub_views.CheckoutAsGuest.$('.collapse.register').removeClass('in');
		}

	,	render: function()
		{
			var result = this._render()
			,	self = this;

			// on render we render all of the sub views
			_.each(this.sub_views, function (sub_view, key)
			{
				sub_view.render();
				self.$('[data-placeholder="' + key + '"]').append(sub_view.$el);
			});

			return result;
		}
	});

	Views.ForgotPassword = Backbone.View.extend({

		template: 'forgot_password'

	,	title: _('Reset Password').translate()

	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			this.model = new AccountForgotPasswordModel();
			this.model.on('save', _.bind(this.showSuccess, this));
		}

	,	showSuccess: function()
		{
			this.$('form').empty().html(
				SC.macros.message(
					_('We sent an email with instructions on how to reset your password to <b>$(0)</b>').translate(this.model.get('email'))
				,	'success'
				)
			);
		}
	});

	Views.ResetPassword = Backbone.View.extend({

		template: 'reset_password'

	,	title: _('Reset Password').translate()

	,	events: {
			'submit form': 'saveForm'
		}

	,	initialize: function ()
		{
			// TODO: refactor _.parseUrlOptions(location.search)
			this.model = new AccountResetPasswordModel();
			this.email = unescape(_.parseUrlOptions(location.search).e);
			this.model.set('params', {'e':this.email, 'dt':_.parseUrlOptions(location.search).dt, 'cb':_.parseUrlOptions(location.search).cb});
			this.model.on('save', _.bind(this.showSuccess, this));
		}

	,	showSuccess: function()
		{
			this.$('form').empty().html(
				SC.macros.message(
					_('Your password has been reset.').translate()
				,	'success'
				)
			);
		}
	});

	return Views;
});
// Merchandising.Context
// ---------------------
define('Merchandising.Context', function ()
{
	'use strict';
	
	var MerchandisingContext = function MerchandisingContext (view)
	{
		if (view.MerchandisingContext)
		{
			return view.MerchandisingContext;
		}
		// REVIEW
		this.view = view;
		view.MerchandisingContext = this;
	};
	
	_.extend(MerchandisingContext, {

		// list of registered handlers
		handlers: []

		// registerHandlers
		// pushes a new handler for a specific view to the handler list
	,	registerHandlers: function (view_constructor, methods)
		{
			if (view_constructor)
			{
				// if there was already a handler for that view
				// we remove it from the list, and extend the new
				// handler with any events that the previous one had
				var new_handler = _.extend(
					this.removeHandler(view_constructor)
				,	methods
				);

				new_handler.viewConstructor = view_constructor;
				// then we add it first on the list
				this.handlers.unshift(new_handler);
			}

			return this;
		}

		// based on the constructor passed as a parameter
		// it removes any handler that matches the constructor
		// from the handlers list.
		// returns the removed handler
	,	removeHandler: function (view_constructor)
		{
			var removed = {};

			this.handlers = _.reject(this.handlers, function (handler)
			{
				if (handler.viewConstructor === view_constructor)
				{
					removed = handler;
					return true;
				}
			});

			return removed;
		}

		// retuns a handler based on the view
	,	getHandlerForView: function (view)
		{
			return _.find(this.handlers, function (handler)
			{
				return view instanceof handler.viewConstructor;
			});
		}

	,	escapeValue: function (value)
		{
			return value ? value.toString().replace(/\s/g, '-') : '';
		}

		// callHandler
		// calls 'callback_key' from the handler for that view passing all of the arguments
	,	callHandler: function (callback_key, context, parameters)
		{
			var handler = this.getHandlerForView(context.view);
			return handler && _.isFunction(handler[callback_key]) && handler[callback_key].apply(context, parameters);
		}
	});
	
	_.extend(MerchandisingContext.prototype, {

		callHandler: function (callback_key)
		{
			return MerchandisingContext.callHandler(callback_key, this, _.toArray(arguments).slice(1));
		}

	,	getFilters: function (filters, isWithin)
		{
			return this.callHandler('getFilters', filters, isWithin) || filters;
		}

	,	getIdItemsToExclude: function ()
		{
			return this.callHandler('getIdItemsToExclude') || [];
		}
	});

	return MerchandisingContext;
});
// Merhcandising Item Collection
// -----------------------------
// Item collection used for the merchandising zone
define('Merchandising.ItemCollection', ['ItemDetails.Collection'], function (ItemDetailsCollection)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	return ItemDetailsCollection.extend({
		urlRoot: '/api/items'
	});
});
// Merchandising.jQueryPlugin
// --------------------------
// Creates a jQuery plugin to handle the Merchandising Zone's intialization
// ex: jQuery('my-custom-selector').merchandisingZone(options)
// options MUST include the application its running
// id of the Zone to be rendered is optional IF it is on the element's data-id
define('Merchandising.jQueryPlugin', ['Merchandising.Zone'], function (MerchandisingZone)
{
	'use strict';
	// [jQuery.fn](http://learn.jquery.com/plugins/basic-plugin-creation/)
	jQuery.fn.merchandisingZone = function (options)
	{
		return this.each(function ()
		{
			new MerchandisingZone(this, options);	
		});
	};
});
// Merchandising.js
// ----------------
// Module to handle MerchandisingZones
// (ex: Featured Items section)
define('Merchandising'
,	['Merchandising.ItemCollection', 'Merchandising.Rule', 'Merchandising.Zone', 'Merchandising.Context', 'Merchandising.jQueryPlugin']
,	function (ItemCollection, Rule, Zone, Context)
{
	'use strict';

	function renderMerchandisingZone ($element, options)
	{
		// if the merchandising jquery plugin was added
		if ('merchandisingZone' in jQuery())
		{
			// for merchandising zone elements, we trigger the plugin
			$element.merchandisingZone(options);
		}
	}

	return {
		renderMerchandisingZone: renderMerchandisingZone
	,	ItemCollection: ItemCollection
	,	Context: Context
	,	Rule: Rule
	,	Zone: Zone
	,	mountToApp: function (application)
		{
			// we add the default options to be added when fetching the items
			// this includes language and shoper's currency
			ItemCollection.prototype.url = SC.Utils.addParamsToUrl(
				ItemCollection.prototype.url, application.getConfig('searchApiMasterOptions.merchandisingZone')
			);

			// afterAppendView is triggered whenever a view or modal is appended
			application.getLayout()
				.on('afterAppendView', function ()
				{
					// we dont want to discover unwanted merch zones, specifically
					// those in a the main screen (layout) behind the current modal.
					// give preference to modalCurrentView if available
					// otherwise inspect layout since merch zones can live outsie of the currentview.
					var currentView = this.modalCurrentView || this.currentView;

					renderMerchandisingZone(currentView.$('[data-type="merchandising-zone"]'), {
						application: application
					});
				})
				// content service triggers this event when rendering a new enhanced page
				.on('renderEnhancedPageContent', function (view, content_zone)
				{
					// if the type of the content zone is merchandising
					if (content_zone.contenttype === 'merchandising')
					{
						// target = selector
						// $view_target = jQuery.find(selector, view), view is the context
						var target = content_zone.target
						,	$view_target = view.$(target)
						,	merchandising_zone_options = {
								application: application
							,	id: content_zone.content
							};

						// if the target is in the current view
						// we add the merchandising zone there
						if ($view_target.length)
						{
							renderMerchandisingZone($view_target, merchandising_zone_options);
						}
						else
						{
							// else, we search for the target in the layout
							this.$(target).filter(':empty').each(function (index, element)
							{
								renderMerchandisingZone(jQuery(element), merchandising_zone_options);
							});
						}
					}
				});

			application.getMerchandisingRules = function getMerchandisingRules ()
			{
				return Rule.Collection.getInstance();
			};
		}
	};
});
// Merchandising.Rule
// ------------------
// Object that contains both model and collection of Merchandising Rules
// Each MerchandisingRule.Model is a Merchandising Rule record on the backend
define('Merchandising.Rule', function ()
{
	'use strict';

	var MerchandisingRule = {};	

	// Standard Backbone.Model, we call extend in case
	// we want to override some methods
	MerchandisingRule.Model = Backbone.Model.extend({});

	// Handles the merchandising rules, it is a Singleton as
	// there is only one set of the rules
	MerchandisingRule.Collection = Backbone.CachedCollection.extend({
		url: '/dls/services/merchandising.ss'
	,	model: MerchandisingRule.Model
	}, SC.Singleton);

	return MerchandisingRule;
});
// Merchandising.Zone
// ------------------
define('Merchandising.Zone'
,	['Merchandising.ItemCollection', 'Merchandising.Rule', 'Merchandising.Context']
,	function (MerchandisingItemCollection, MerchandisingRule, MerchandisingContext)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	var MerchandisingZone = function MerchandisingZone (element, options)
	{
		this.$element = jQuery(element).empty();
		// we try to get the model based on option.id (if passed) or the elements data id
		this.model = MerchandisingRule.Collection.getInstance().get(
			options.id || this.$element.data('id')
		);

		if (this.model)
		{
			var layout = options.application.getLayout();

			this.options = options;
			this.application = options.application;
			this.items = new MerchandisingItemCollection();
			this.context = new MerchandisingContext(layout.modalCurrentView || layout.currentView);

			this.initialize();
		}
	};

	_.extend(MerchandisingZone.prototype, {

		initialize: function ()
		{
			this.addLoadingClass();
			// the listeners MUST be added before the fetch ocurrs
			this.addListeners();

			// add the error handling
			this.items.fetch({
				cache: true
			,	data: this.getApiParams()
			});
		}

	,	addListeners: function ()
		{
			// [jQuery.proxy](http://api.jquery.com/jQuery.proxy/)
			var proxy = jQuery.proxy;

			this.items.on({
				sync: proxy(this.excludeItems, this)
			,	excluded: proxy(this.appendItems, this)
			,	appended: proxy(this.removeLoadingClass, this)
			,	error: proxy(this.handleRequestError, this)
			});
		}

		// pre: this.model and this.options must be defined
	,	getApiParams: function ()
		{
			var filters = this.parseApiFilterOptions()
			,	sorting = this.parseApiSortingOptions();

			if (sorting.length)
			{
				filters.sort = sorting.join(',');
			}
			
			// # Response
			// parameters to be passed to the item's fetch query
			return _.extend({
				limit: this.getLimit()
			,	fieldset: this.model.get('fieldset')
			}, filters);
		}

	,	parseApiFilterOptions: function ()
		{
			var	filters = {};

			// parses the merchandising rule filters into the filters obj
			_.each(this.model.get('filter'), function (rule_filter)
			{
				filters[rule_filter.field_id] = rule_filter.field_value;
			});

			return this.context.getFilters(filters, this.model.get('within'));
		}

	,	parseApiSortingOptions: function ()
		{
			// turn sorting obj into a string for the query
			return _.map(this.model.get('sort'), function (value)
			{
				return value.field_id +':'+ value.dir;
			});
		}

		// if there are items to get excluded from the collection
		// we need to ask for more items from the api
		// because the filtering gets done after the request
	,	getLimit: function ()
		{
			var model = this.model
			,	limit = model.get('show')
			,	exclude = model.get('exclude');
			
			if (exclude.length)
			{
				if (_.contains(exclude, '$cart'))
				{
					limit += this.application.getCart().get('lines').length;
				}
				
				if (_.contains(exclude, '$current'))
				{
					limit += this.context.getIdItemsToExclude().length;
				}
			}
			
			return limit <= 100 ? limit : 100;
		}

	,	excludeItems: function ()
		{
			var self = this;

			_.each(this.model.get('exclude'), function (filter)
			{
				self.applyFilterToItems(filter);
			});

			this.items.trigger('excluded');

			return this;
		}

		// narrows down the collection if excludes set up on the merchandising rule
	,	applyFilterToItems: function (filter)
		{
			var self = this;

			switch (filter)
			{
			case '$cart':

				var id = 0
				,	item = null;

				this.application.getCart().get('lines').each(function (line)
				{
					item = line.get('item');
					id = item.get('_matrixParent').get('_id') || item.get('_id');

					self.items.remove(self.items.get(id));
				});

			break;

			case '$current':

				_.each(this.context.getIdItemsToExclude(), function (id)
				{
					self.items.remove(self.items.get(id));
				});

			break;
			}

			return this;
		}
		
		// pre: this.$element must be defined
	,	appendItems: function ()
		{
			var items = this.items;

			if (items.length)
			{
				// we try to get the 'template' from either
				// the merchandising rule or the default configuration
				var model = this.model
				,	application = this.application
				,	template = SC.macros[model.get('template')] || SC.macros[application.getConfig('macros.merchandisingZone')];

				// then we append the parsed template to the element
				this.$element.append(
					template({
						application: application
					,	title: model.get('title')
					,	description: model.get('description')
					,	items: _.first(items.models, model.get('show'))
					})
				);
			}

			items.trigger('appended');

			return this;
		}

	,	loadingClassNames: 'loading loading-merchandising-zone'

	,	addLoadingClass: function ()
		{
			this.$element.addClass(this.loadingClassNames);
		}

	,	removeLoadingClass: function ()
		{
			this.$element.removeClass(this.loadingClassNames);
		}

	,	handleRequestError: function ()
		{
			this.removeLoadingClass();
			console.error('Merchandising Zone - Request Error', arguments);
		}
	});

	return MerchandisingZone;
});
// MultiCurrencySupport.js
// -----------------------
// Handles the change event of the currency selector combo
define('MultiCurrencySupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="currency-selector"]' : 'setCurrency'});
			
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setCurrency: function (e)
				{
					var currency_code = jQuery(e.target).val()
					,	selected_currency = _.find(SC.ENVIRONMENT.availableCurrencies, function (currency) { return currency.code === currency_code; });

					// We use the param **"cur"** to pass this to the ssp environment
					var current_search = SC.Utils.parseUrlOptions(window.location.search);
					
					// if we are in a facet result we will remove all facets and navigate to the default search 
					if (window.location.hash !== '' && application.getLayout().currentView.translator)
					{
						window.location.hash = application.getConfig('defaultSearchUrl', '');
					}
					
					current_search.cur = selected_currency.code;

					window.location.search =  _.reduce(current_search, function (memo, val, name) {
						return val ? memo + name + '=' + val + '&' : memo;
					}, '?');
				}
			});
		}
	};
});

// MultiHostSupport.js
// -------------------
// Handles the change event of the currency selector combo
define('MultiHostSupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="host-selector"]' : 'setHost'});
			
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setHost: function (e)
				{
					var host = jQuery(e.target).val()
					,	url;
					
					if (Backbone.history._hasPushState)
					{
						// Seo Engine is on, send him to the root
						url = host;
					}
					else 
					{
						// send it to the current path, it's probably a test site
						url = host+location.pathname;
					}
				
					window.location.href = location.protocol + '//' + url;
				}
			});
		}
	};
});

// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
// This variable has to be already defined when our module loads
var _gaq = _gaq || [];

// NavigationHelper.js
// -------------------
// This file intersect all clicks on a elements and computes what to do, if navigate useing backbone or navigate away

define('NavigationHelper', ['UrlHelper'], function ()
{
	'use strict';
	
	var NavigationHelper = {
	
		mountToApp: function (application)
		{
			// there is a soft dependency with Content.EnhancedViews
			// we only want it to disable the function that sets the title of the page, 
			// we don't want to do that pages that open in modals
			try
			{
				ContentEnhancedViews = require('Content.EnhancedViews');
			}
			catch (e)
			{
				console.log('Couldn\'t load ContentEnhancedViews');
			}
			
			// Layout
			var Layout = application.getLayout()
			,	ContentEnhancedViews;
			
			// Touchpoints navigation
			_.extend(Layout, {

				// layout.showInternalLinkInModal
				// for links that has the data-toggle=show-in-modal we will open them in a modal, 
				// we do this by overriding the showContent function of the layout 
				// and by disabeling the overrideViewSettings of the Content.EnhancedViews package
				// Then we just navigate to that url to call the router and execute the logic as normal 
				showInternalLinkInModal: function (e, href, target)
				{
					var self = this
					,	current_fragment = Backbone.history.fragment;
					
					this.isRewrited = true;
					this.originalShowContent = this.showContent;
					
					if (ContentEnhancedViews)
					{
						this.originalOverrideViewSettings = ContentEnhancedViews.overrideViewSettings;
						ContentEnhancedViews.overrideViewSettings = function (view) { return view; };
					}
					
					var original_view;
					
					// Here we override the showContent function
					this.showContent = function (view)
					{
						var promise = jQuery.Deferred();
						/// If you ever try to set a view that is not the original one
						// this code will cathc it an do an undo
						if (!original_view)
						{
							original_view = view;
						}
						else if (original_view !== view)
						{
							promise = self.originalShowContent.apply(self.application.getLayout(), arguments);
							original_view.$containerModal.modal('hide');
							return promise;
						}
						
						if (view && _.isFunction(view.showInModal))
						{
							// Then we just call the show in modal of the same view that we were passed in.
							promise = view.showInModal({className: target.data('modal-class-name')});
							
							// once this model closes we undo the override of the function
							view.$containerModal.on('hide.bs.modal', function ()
							{
								self.undoNavigationHelperFunctionRewrite();
							});
						}
						else
						{
							self.undoNavigationHelperFunctionRewrite();
							Backbone.history.navigate(href, {trigger: false, replace: true});
						}

						return promise;
					};
					
					// Here we navigate to the url and we then change the url to what it was originaly set in page that opened the modal
					Backbone.history.navigate(href, {trigger: true, replace: true});
					Backbone.history.navigate(current_fragment, {trigger: false, replace: true});
				}

				// layout.undoNavigationHelperFunctionRewrite
				// helper method to undo the override performed by layout.showInternalLinkInModal
			,	undoNavigationHelperFunctionRewrite: function ()
				{
					if (this.isRewrited)
					{
						this.showContent = this.originalShowContent;

						if (ContentEnhancedViews)
						{
							ContentEnhancedViews.overrideViewSettings = this.originalOverrideViewSettings;
						}

						this.isRewrited = false;
					}
				}

				// layout.showExternalLinkInModal
				// Opens an external page in a modal, by rendering an iframe in it
			,	showExternalLinkInModal: function (e, href, target)
				{
					var view = new Backbone.View({
						application: this.application
					});

					view.src = href;
					view.template = 'iframe';
					view.page_header = target.data('page-header') || '';

					view.showInModal({
						className: (target.data('modal-class-name') || '') +' iframe-modal'
					});
				}

				// layout.clickEventListener
				// Handles the unatended link event
			,	clickEventListener: function (e)
				{
					e.preventDefault();
					
					// Grabs info from the event element
					var $this = jQuery(e.currentTarget)
					,	href = $this.attr('href') || ''
					,	target_is_blank = e.button === 1 || e.ctrlKey || e.metaKey || $this.attr('target') === '_blank'
					,	target_is_modal = $this.data('toggle') === 'show-in-modal'
					,	is_disabled = $this.attr('disabled')


					// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
					// in data-href (only if we are in IE7)
					// IE7 detection courtesy of Backbone
					// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
					,	isExplorer = /msie [\w.]+/
					,	docMode = document.documentMode
					,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

					if (is_disabled)
					{	
						e.stopPropagation();
						return;
					}

					if (oldIE)
					{
						href = $this.data('href');
					}

					if ($this.data('original-href'))
					{
						href = $this.data('original-href');
					}

					var is_external = ~href.indexOf('http:') || ~href.indexOf('https:');

					// use href=# or href=""
					if (href === '#' || href === '')
					{
						return;
					}

					// if the href contains a # and this is not a touchpoint, it will let you know in the console
					if (~href.indexOf('#') && !$this.data('touchpoint') && !$this.data('fixed-href'))
					{
						console.error('This link has a # take it off');
					}

					// The navigation is within the same browser window
					if (!target_is_blank)
					{
						// There is a modal open
						if (this.$containerModal)
						{
							this.$containerModal.modal('hide');
						}
						
						// Wants to open this link in a modal
						if (target_is_modal)
						{
							if (is_external)
							{
								this.showExternalLinkInModal(e, href, $this);
							}
							else
							{
								this.showInternalLinkInModal(e, href, $this);
							}
						}
						else
						{
							if (is_external)
							{
								document.location.href = href;
							}
							else
							{
								Backbone.history.navigate(href, {trigger: true});
							}
						}
					}
					else
					{
						window.open(href, _.uniqueId('window'));
					}

				}

				// intercepts mousedown events on all anchors with no data-touchpoint attribute and fix its href attribute to work when opening in a new tab
			,	fixNoPushStateLink: function(e)
				{
					var anchor = jQuery(e.target)
					,	href = anchor.attr('href') || '#'; 

					if (Backbone.history.options.pushState || href === '#' || 
						href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || //external links
						anchor.data('fixed-href'))
					{
						return;
					}
					else if (anchor.data('toggle') === 'show-in-modal')
					{
						anchor.data('original-href', href);
						anchor.attr('href', window.location.href); 
						return;
					}

					anchor.data('fixed-href', 'true');
					var fixedHref;
					
					if (window.location.hash)
					{
						fixedHref = window.location.href.replace(window.location.hash, '#' + href);
					}
					else if (window.location.href.lastIndexOf('#')  ===  window.location.href.length - 1)
					{
						fixedHref = window.location.href +  href;
					}
					else
					{
						fixedHref = window.location.href + '#' + href;
					}

					anchor.attr('href', fixedHref); 
				}

			,	getTargetTouchpoint: function ($target)
				{
					var touchpoints = this.application.getConfig('siteSettings.touchpoints')
					,	target_data = $target.data()
					,	target_touchpoint = touchpoints[target_data.touchpoint] || ''
					,	hashtag = target_data.hashtag
					,	new_url = ''
					,	url = window.location.href;

					//if we already are in the target touchpoint then we return the hashtag or the original href. 
					if (target_data.touchpoint === this.application.getConfig('currentTouchpoint'))
					{
						return hashtag || $target.attr('href');					
					}

					if (target_data.parameters)
					{
						target_touchpoint += (~target_touchpoint.indexOf('?') ? '&' : '?') + target_data.parameters;
					}

					if (hashtag && hashtag !== '#' && hashtag !== '#/')
					{
						var hashtag_no_numeral = hashtag.replace('#/', '').replace('#', ''); 
						new_url = _.fixUrl(target_touchpoint + (~target_touchpoint.indexOf('?') ? '&' : '?') + 'fragment=' + hashtag_no_numeral + '#' + hashtag_no_numeral);
					}
					else
					{
						new_url = _.fixUrl(target_touchpoint);
					}

					// [Tracking Multiple Domains](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite)
					if (this.application.getConfig('tracking.trackPageview') && (
						this.getProtocol(url) !== this.getProtocol(new_url) || 
						this.getDomain(url) !== this.getDomain(new_url)
					))
					{
						_gaq.push(function ()
						{
							var track_url = _gat._getTrackerByName()._getLinkerUrl(new_url);
							// This validation is due to Tracking Blockers overriding the default anlaytics methods
							if (typeof track_url === 'string')
							{
								new_url = track_url;
							}
						});
					}

					// We need to make this url absolute in order for this to navigate
					// instead of being triggered as a hash
					if (!(~new_url.indexOf('http:') || ~new_url.indexOf('https:')))
					{
						new_url = location.protocol + '//' + location.host + new_url;
					}

					return new_url;
				}

				// layout.touchpointMousedown
				// On mousedown we will set the href of the the link, passing google analitics if needed
			,	touchpointMousedown: function (e)
				{
					this.isTouchMoveEvent = false;

					if (e.type === 'touchstart')
					{
						e.stopPropagation();
					}

					var $target = jQuery(e.currentTarget)
					,	new_url = this.getTargetTouchpoint($target);

					if ( ! $target.data('fixed-href'))
					{
						$target.attr('href', new_url);
						$target.data('fixed-href', 'true');
					}
				}

				// layout.touchpointClick
				// This detects if you are tring to access a different hashtag within the same touchpoint
			,	touchpointMouseup: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	target_data = $target.data();

					if (!$target.data('fixed-href') && this.application.getConfig('currentTouchpoint') && this.application.getConfig('currentTouchpoint') === target_data.touchpoint && target_data.hashtag)
					{
						var new_url = target_data.hashtag;
						// Removes the hastag if it's there remove it  
						new_url = new_url[0] === '#' ? new_url.substring(1) : new_url;
						// if it doesnot has a slash add it
						new_url = new_url[0] === '/' ? new_url : '/' + new_url;
						// we just set the hastag as a relative href and the app should take care of itself

						$target.attr('href', new_url);
					}

					if (e.type === 'touchend' && !this.isTouchMoveEvent)
					{
						e.stopPropagation();
						e.preventDefault();

						$target.trigger('click');
					}
				}

			,	touchpointTouchMove: function()
				{
					this.isTouchMoveEvent = true;
				}

				// layout.getDomain()
				// helper to extract the domain of a url
			,	getDomain: function(url)
				{
					return url.split('/')[2] || null;
				}

				// layout.getProtocol()
				// helper to extract the protocol of a url
			,	getProtocol: function(url)
				{
					return url.split('/')[0] || null;
				}

				// layout.collapseNav
				// collapsed the contextual menues once one of the links are cliked
			,	openMenus: {}
			,	toggleCollapseListener: function (e)
				{
					// e might be a jQuery btn
					var $btn = e instanceof jQuery ? e : jQuery(e.target).closest('a')
					,	target = $btn.data('target')
					,	$menu = jQuery(target)
					,	touchStart = null
					,	self = this;

					// if the menue is open
					if (target in this.openMenus)
					{
						delete this.openMenus[target];
						// stop listening the dom, as this is beeing closed
						jQuery('body')
							.off('mousedown'+ target +' touchstart'+ target +' touchend'+ target);
					}
					else
					{
						// else we add it the the open menus collection
						this.openMenus[target] = $menu;
						// and start listening the dom to close menu when "outofocused"
						jQuery('body')
							// we save the time when the touchstart happened
							.on('touchstart'+ target, function ()
							{
								touchStart = new Date().getTime();
							})
							// code for touchend and mousdown is the same
							.on('touchend'+ target +' mousedown'+ target, function ()
							{
								// if there wasn't a touch event, or the time difference between
								// touch start and touch end is less that 200 miliseconds
								// (this is to allow scrolling without closing the facet navigation area)
								if (!touchStart || new Date().getTime() - touchStart < 200)
								{
									$menu.collapse('toggle');
									self.toggleCollapseListener($btn);
								}
							});
					}
				}
			});
			
			// Adds event listeners to the layout
			_.extend(Layout.events, {

				// touchpoints, this needs to be before the other click event, so they are computed early
				'touchstart a[data-touchpoint]': 'touchpointMousedown'
			,	'touchmove a[data-touchpoint]': 'touchpointTouchMove'
			,	'mousedown a[data-touchpoint]': 'touchpointMousedown'
			,	'touchend a[data-touchpoint]': 'touchpointMouseup'
			,	'mouseup a[data-touchpoint]': 'touchpointMouseup'
		
				//intercept clicks on anchor without touchpoint for fixing its href when user try to open it on new tabs / windows. 
			,	'mousedown a:not([data-touchpoint])': 'fixNoPushStateLink'
				// Listen to the click event of all a elements of the layout
			,	'click a': 'clickEventListener'
				// Collapses nav 
			//,	'click .btn-navbar': 'toggleCollapseListener'
			});
		}
	};
	
	return NavigationHelper;
});

// LiveOrder.Collection.js
// -----------------------
// Live Orders collection
define('LiveOrder.Collection', ['LiveOrder.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});
// LiveOrder.Model.js
// -----------------------
// Model for showing information about an open order
define('LiveOrder.Model', ['Order.Model', 'OrderLine.Model', 'OrderLine.Collection', 'ItemDetails.Model'], function (OrderModel, OrderLineModel, OrderLineCollection, ItemDetailsModel)
{
	'use strict';

	var LiveOrderLine = {};

	LiveOrderLine.Model = OrderLineModel.extend({
		urlRoot: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	LiveOrderLine.Collection = OrderLineCollection.extend({
		model: LiveOrderLine.Model
	,	url: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	return OrderModel.extend({
		
		urlRoot: _.getAbsoluteUrl('services/live-order.ss')

	,	linesCollection: LiveOrderLine.Collection
		
	,	initialize: function ()
		{
			// call the initialize of the parent object, equivalent to super()
			OrderModel.prototype.initialize.apply(this, arguments);

			// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
			this.on('change:touchpoints', function (model, touchpoints)
			{
				if (SC.ENVIRONMENT.siteSettings) 
				{
					SC.ENVIRONMENT.siteSettings.touchpoints = touchpoints;
				}

				_.each(SC._applications, function (application)
				{
					if (application.getConfig('siteSettings'))
					{
						application.getConfig('siteSettings').touchpoints = touchpoints;
					}
				});

			});
		}
	,	getRelatedItems: function ()
		{
			var relatedItems = []
			,	relatedItemsId = []
			,	lines = this.get('lines');			
			// TODO: add support for sites type standard
			if (lines.models && SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED')
			{
				_.each(lines.models, function (line)
				{
					var item = line.get('item');

					if (item)
					{
						var relatedItemsDetail = item.get('relateditems_detail');

						_.each(relatedItemsDetail, function (relatedItem)
						{
							if (!_.contains(relatedItemsId, relatedItem.internalid))
							{
								// we create an item detail object for easy templating								
								var itemDetail = new ItemDetailsModel(relatedItem);
								relatedItems.push(itemDetail);		
								// then we add the id to our check array for algorithm optimization
								relatedItemsId.push(relatedItem.internalid);
							}						
						});
					}
				});
			}

			return relatedItems; 
		}

	,	getLatestAddition: function ()
		{
			var model = null;

			if (this.get('latest_addition'))
			{
				model = this.get('lines').get(this.get('latest_addition'));
			}

			if (!model && this.get('lines').length)
			{
				model = this.get('lines').at(0);
			}

			return model;
		}

	,	wrapOptionsSuccess: function (options)
		{
			var self = this;
			// if passing a succes function we need to wrap it
			options = options || {};
			options.success = _.wrap(options.success || function (){}, function (fn, item_model, result)
			{
				// This method is called in 2 ways by doing a sync and by doing a save 
				// if its a save result will be the raw object 
				var attributes = result;
				// If its a sync resilt will be a string
				if (_.isString(result))
				{
					attributes = item_model;
				}

				// Tho this should be a restfull api, the live-order-line returns the full live-order back (lines and summary are interconnected)
				self.set(attributes);
				
				// Calls the original success function
				fn.apply(self, _.toArray(arguments).slice(1));
			});

			return options;
		}

	,	addItem: function (item, options)
		{
			// Calls the addItems funtion passing the item as an array of 1 item 
			return this.addItems([item], options);
		}

	,	addItems: function (items, options)
		{
			// Obteins the Collection constructor
			var LinesCollection = this.linesCollection;

			// Prepares the input for the new collection
			var lines = _.map(items, function (item)
			{
				var line_options = item.getItemOptionsForCart();

				return {
					item: {
						internalid: item.get('internalid')
					}
				,	quantity: item.get('quantity')
				,	options: _.values(line_options).length ? line_options : null
				};
			});

			// Creates the Colection 
			var lines_collection = new LinesCollection(lines);

			// Saves it
			return lines_collection.sync('create', lines_collection, this.wrapOptionsSuccess(options));
		}

	,	updateItem: function (line_id, item, options)
		{
			var line = this.get('lines').get(line_id)
			,	line_options = item.getItemOptionsForCart();
			
			line.set({
				quantity: item.get('quantity')
			,	options: _.values(line_options).length ? line_options : null
			});

			return line.save({}, this.wrapOptionsSuccess(options));
		}

	,	updateLine: function (line, options)
		{
			// Makes sure the quantity is a number
			line.set('quantity', parseInt(line.get('quantity'), 10));
			
			return line.save({}, this.wrapOptionsSuccess(options));
		}

	,	removeLine: function (line, options)
		{
			return line.destroy(this.wrapOptionsSuccess(options));
		}

	,	submit: function ()
		{
			var self = this;
			
			this.set('internalid', null);
			var creditcard = this.get('paymentmethods').findWhere({type: 'creditcard'});
			if (creditcard && !creditcard.get('creditcard'))
			{
				this.set(this.get('paymentmethods').remove(creditcard));
			}
			var paypal = this.get('paymentmethods').findWhere({type: 'paypal'});
			if (paypal && !paypal.get('complete'))
			{
				//this.set(this.get('paymentmethods').remove(paypal));
paypal .set('complete',  true);
			}
			return this.save().fail(function ()
			{
				self.set('internalid', 'cart');
			});
			//.success(_.bind(this.showContent, this))
		}


	,	save: function ()
		{console.log('save liveorder');
			if (this.get('confirmation'))
			{
				return jQuery.Deferred().resolve();
			}

			return OrderModel.prototype.save.apply(this, arguments);
		}
		
	,	getTotalItemCount: function ()
		{
			return _.reduce(this.get('lines').pluck('quantity'), function (memo, quantity)
			{
				return memo + (parseFloat(quantity) || 1);
			}, 0);
		}

	,	parse: function (resp, options)
		{
			if (options && !options.parse)
			{
				return;
			}
			
			return resp;
		}
	});
});
// Order.Model.js
// -----------------------
// Model for showing information about an order
define('Order.Model', ['OrderLine.Collection', 'OrderShipmethod.Collection', 'Address.Collection', 'CreditCard.Collection','OrderPaymentmethod.Collection'], function (OrderLinesCollection, ShipmethodsCollection, AddressesCollection, CreditCardsCollection, OrderPaymentmethodCollection)
{
	'use strict';

	return Backbone.Model.extend({
		
		linesCollection: OrderLinesCollection

	,	initialize: function (attributes)
		{
			this.on('change:lines', function (model, lines)
			{
				model.set('lines', new model.linesCollection(lines), {silent: true});
			}); 

			this.trigger('change:lines', this, attributes && attributes.lines || []);

			this.on('change:shipmethods', function (model, shipmethods)
			{
				model.set('shipmethods', new ShipmethodsCollection(shipmethods), {silent: true});
			});
			this.trigger('change:shipmethods', this, attributes && attributes.shipmethods || []);

			this.on('change:addresses', function (model, addresses)
			{
				model.set('addresses', new AddressesCollection(addresses), {silent: true});
			});
			this.trigger('change:addresses', this, attributes && attributes.addresses || []);

			this.on('change:paymentmethods', function (model, paymentmethods)
			{
				model.set('paymentmethods', new OrderPaymentmethodCollection(paymentmethods), {silent: true});
			});
			this.trigger('change:paymentmethods', this, attributes && attributes.paymentmethod || []);
		}
	});
});

// OrderLine.Collection.js
// -----------------------
// Order Line collection
define('OrderLine.Collection', ['OrderLine.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});
// OrderLine.Model.js
// -----------------------
// Model for showing information about a line in the order
define('OrderLine.Model', ['ItemDetails.Model'], function (ItemDetailsModel)
{
	'use strict';

	return Backbone.Model.extend({
		
		initialize: function (attributes)
		{
			this.on('change:item', function (model, item)
			{
				model.set('item', new ItemDetailsModel(_.extend(item, {
					line_id: model.get('internalid')
				,	options: model.get('options')
				,	quantity: model.get('quantity')
				})), {silent: true});
			});
			
			this.trigger('change:item', this, attributes && attributes.item || {});

			this.on('error', function(model, jqXhr)
			{
				var result = JSON.parse(jqXhr.responseText)
				,	error_details = result.errorDetails;

				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					model.set('internalid', error_details.newLineId);
				}
			});
		}
		
	,	toJSON: function()
		{
			var options = this.attributes.options;

			// Custom attributes include the id and value as part of the array not the format expected in service
			if (options instanceof Array)
			{
				var newOptions = {};

				_.each(options, function (e) {
					newOptions[e.id.toLowerCase()] = e.value;
				});

				options = newOptions;
			}

			return {
				item: {
					internalid: (this.attributes.item.get('_matrixParent').get('_id')) ? this.attributes.item.get('_matrixParent').get('_id') : this.attributes.item.get('_id') 
				}
			,	quantity: this.attributes.quantity
			,	options: options
			};
		}
	});	
});

// OrderPaymentmethod.Collection.js
// --------------------------------
// Collection of posible payment method
define('OrderPaymentmethod.Collection', ['OrderPaymentmethod.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});

// OrderPaymentmethod.Model.js
// ---------------------------
// Payment method Model
define('OrderPaymentmethod.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		getFormattedPaymentmethod: function ()
		{
			return this.get('type');
		}
	});
});

// OrderShipmethod.Collection.js
// -----------------------------
// Shipping methods collection
define('OrderShipmethod.Collection', ['OrderShipmethod.Model'], function (Model) {

	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});
// OrderShipmethod.Model.js
// ------------------------
// Single ship method
define('OrderShipmethod.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		getFormattedShipmethod: function ()
		{
			return this.get('name');
		}
	});

	
});

// OrderWizzard.js
// ---------------
// 
define('OrderWizard', ['OrderWizard.Router', 'OrderWizard.View', 'LiveOrder.Model'], function (Router, View, Model)
{
	'use strict';

	return {
		Router: Router
	,	View: View
	,	Model: Model
	,	mountToApp: function(application)
		{
			var router = new Router(application, {
				model: application.getCart()
			,	profile: application.getUser()
			,	steps: application.getConfig('checkoutSteps')
			});

			return router;
		}
	};
});

// OrderWizard.Module.Address.Billing.js
// -------------------------------------
// 
define('OrderWizard.Module.Address.Billing', ['OrderWizard.Module.Address'],  function (OrderWizardModuleAddress)
{
	'use strict';

	return OrderWizardModuleAddress.extend({

		manage: 'billaddress'
	,	sameAsManage: 'shipaddress'
	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_SELECT_BILLING_ADDRESS', 'ERR_CHK_INVALID_BILLING_ADDRESS', 'ERR_WS_INVALID_BILLING_ADDRESS']
	,	sameAsMessage: _('Same as shipping address').translate()

	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_BILLING_ADDRESS'
		,	errorMessage: _('Please select a billing address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_BILLING_ADDRESS'
		,	errorMessage: _('The selected billing address is invalid').translate()
		}
	});
});

// OrderWizard.Module.Address.js
// -----------------------------
define('OrderWizard.Module.Address', ['Wizard.Module', 'Address.Views', 'Address.Model'], function (WizardModule, AddressViews, AddressModel)
{
	'use strict';

	return WizardModule.extend({
 
		template: 'order_wizard_address_module'

	,	changeLinkText: SC.ENVIRONMENT.PROFILE.isGuest !== 'T' ? _('Change address').translate() : _('Edit Address').translate()

	,	selectMessage: _('Use this address').translate()
	,	sameAsMessage: _('Same as address').translate()
	,	selectAddressErrorMessage: _('Please select an address').translate()

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_ADDRESS'
		,	errorMessage: _('The selected address is invalid').translate()
		}
	,	events: {
			'click [data-action="submit"]': 'submit'
		,       'click .setsuggestion': 'useSuggestedAddress'
		,       'click #usethisaddress':'useSuggestedAddress'
		,	'click [data-action="select"]': 'selectAddress'
		//,	'click [data-action="setselectedaddressid"]': 'setSelectedAddressId'
		,	'click [data-action="canceladdreesselection"]': 'cancelAddreesSelection'
		,	'click [data-action="change-address"]': 'changeAddress'
		,	'change [data-action="same-as"]': 'markSameAs'
		,	'change form': 'changeForm'
		,	'click #copyshipping' : 'setSameAsShipping'
		}

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_INVALID_ADDRESS']
	,	initialize: function(options)
		{
			WizardModule.prototype.initialize.apply(this, arguments);
			Backbone.on('usethisaddress', function ()
						{
							
							console.log('rendered');
						}, this);
		}
	
//	,	initialize: function(){
//		var temp_addr;
//		console.log(this.getAddressesToShow());
//		if(this.addressId==null && this.getAddressesToShow().length>0){
////			this.manualSelectAddress(this.getAddressesToShow().models[0].id);
////			console.log(address_book.models[0].id);
//		}
//	}
		// module.render
		// -------------
	,	render: function (not_trigger_ready)
		{
			var profile = this.wizard.options.profile;

			this.addresses = profile.get('addresses');
			var creditcards = profile.get('creditcards');
			//if (!this.addresses.length && !creditcards.length) 
			//{
			this.isGuest = profile.get('isGuest') === 'T';
			this.isSameAsEnabled = this.options.enable_same_as;

			this.addressId = this.model.get(this.manage);

			// if the selected manage address is the fake one
			if (this.addressId && ~this.addressId.indexOf('null'))
			{
				// we silently remove it
				this.setAddress(null, {
					silent: true
				});
			}

			this.evaluateSameAs();
			this.address = this.getSelectedAddress();
			
			this.address.set("payPalUrl",profile.get("paypalUrl"));
			if(this.address.isNew() && this.step.wizard.currentStep=="shipping/method"){
				this.address.set("firstfullname",profile.get("firstname"));
				this.address.set("lastfullname",profile.get("lastname"));
				this.address.set("company",profile.get("companyname"));
//				this.address.set("label",this.wizard.currentStep);
			}
	if(this.addressId==null && this.getAddressesToShow().length > 0 && this.manage == 'shipaddress'){
				console.log(this.getAddressesToShow());
				   this.manualSelectAddress(this.getAddressesToShow().models[0].id);
				  }
				 if(this.addressId==null && this.getAddressesToShow().length > 1 && this.manage == 'billaddress'){
					 console.log("RENDERRRRRR billaddress");
				   this.manualSelectAddress(this.getAddressesToShow().models[0].id);
				   
				  }
			// Add event listeners to allow special flows
			this.eventHandlersOn();

			// Calls the render function
			this._render();

			this.addressView = null;
			this.addressListView = null;

			var is_address_new = this.address.isNew()
			,	show_address_form = is_address_new || (this.isGuest && !this.addressId);

			// The following is used to match the logic on file order_wizard_address_module.txt
			// when the conditions apply, only the address details are shown
			// that means there are no form or list views required
	/**		if ((this.isSameAsEnabled && this.sameAs) || this.addressId && !is_address_new)
			{
				null;
			}
			else*/ 
			if(this.address.isNew()){
				console.log("Afress new details");
				this.addressView = new AddressViews.Details({
					application: this.wizard.application
				,	collection: this.addresses
				,	model: this.address
				,	manage: this.manage
				});

				// as the form was already renderd within the template of this, we just grab a reference to it 
				this.addressView.$el = this.$('#address-module-form-placeholder');

				// then we bind the events and validation
				Backbone.Validation.bind(this.addressView);
				this.addressView.delegateEvents();

				// if the user is a guest, and its editing the already submited address
				// we set that address as the current one so we don't create a new address
				// in the guest's address book.
				if (this.isGuest && !is_address_new)
				{
					this.setAddress(this.address.id, {
						silent: true
					});
				}
			}
			else if (this.getAddressesToShow().length)
			{
				this.addressListView = new AddressViews.List({
					application: this.wizard.application
				,	collection: this.addresses
				});

				// as the list was already renderd within the template of this, we just grab a reference to it 
				this.addressListView.$el = this.$('#address-module-list-placeholder');

				// then we bind the events and validation
				Backbone.Validation.bind(this.addressListView);
				this.addressListView.delegateEvents();
			}
			else
			{
				this.addressView = new AddressViews.Details({
					application: this.wizard.application
				,	collection: this.addresses
				,	model: this.address
				,	manage: this.manage
				});

				// as the form was already renderd within the template of this, we just grab a reference to it 
				this.addressView.$el = this.$('#address-module-form-placeholder');

				// then we bind the events and validation
				Backbone.Validation.bind(this.addressView);
				this.addressView.delegateEvents();

				// if the user is a guest, and its editing the already submited address
				// we set that address as the current one so we don't create a new address
				// in the guest's address book.
				if (this.isGuest && !is_address_new)
				{
					this.setAddress(this.address.id, {
						silent: true
					});
				}
			}

			// TODO: Add comments
			if (!show_address_form && !this.addressId)
			{
				this.trigger('navbar_toggle', false);
			}
			else
			{
				this.trigger('navbar_toggle', true);
			}

			// TODO: Add comments
			if ((!_.isBoolean(not_trigger_ready) || !not_trigger_ready) && this.address && this.addressId)
			{
				this.trigger('ready', true);
			}

			// when you remove the address the macro is re-rendered but not the view.
			this.$('[data-toggle="tooltip"]').tooltip({
				html: true
			});
			//}
		}
, useSuggestedAddress: function () { console.log('used this'); }
	,	evaluateSameAs: function ()
		{
			var manage_address_id = this.addressId
			,	other_address = this.getTheOtherAddress()
			,	other_address_id = other_address && other_address.get('internalid') || null;

			if (manage_address_id && manage_address_id === other_address_id)
			{
				this.sameAs = true;
			}
			else if (!this.tempAddress && manage_address_id !== other_address_id)
			{
				this.sameAs = false;
			}
			else
			{	
				// We need a default sameAs value so is no longer undefined
				// if the sameAs was checked, and we have an address id set or there is a temporary address
				this.sameAs = this.sameAs && (manage_address_id || this.tempAddress || (this.isGuest && this.addresses.length));
			}
		}

	,	eventHandlersOn: function ()
		{
			var self = this
			,	other_address = this.sameAsManage;

			this.eventHandlersOff();

			this.addresses
				// Adds events to the collection
				.on('reset destroy change add', jQuery.proxy(this, 'render', true), this)
				.on('change add', function (changed_address){
				if(self.manage === 'shipaddress' && changed_address.changed.defaultshipping){
					if( changed_address.changed.defaultshipping == 'T' ){ 
//self.render();
//self.addressId = changed_address.id 
this.manualSelectAddress(changed_address.id);
}
				}
				}, this)
				.on('add', function (new_address){
					this.manualSelectAddress(new_address.id);					
				}, this)
				.on('destroy', function (deleted_address)
				{
					self.model.set('addresses',this.getAddressesToShow());
					// if the destroyed address was used as the sameAs
					if (self.model.get(other_address) === deleted_address.id)
					{
						// we need to remove it, as it doesn't exists
						self.model.set(other_address, null);
					}
					if(this.getAddressesToShow().length === 0){
						self.model.set('billaddress', null);
						self.model.set('shipaddress', null);
					
					}
					if(this.addressId==deleted_address.id && this.getAddressesToShow().length>0){
						this.manualSelectAddress(this.getAddressesToShow().models[0].id);
					}
				}, this);

			// when the value for the other address changes
			this.model
				.on('change:' + other_address, function (model, value)
				{
					console.log('change event');
					// If same as is enabled
					// and its selected, and the other address changes to a "truthy" value
					if (self.isSameAsEnabled && self.sameAs)
					{
						// we change this manage to the value
						self.setAddress(value);
						// and re-render
						self.render();
					}
				}, this);

			if (this.isSameAsEnabled && this.sameAs)
			{
				this.model.on('change:temp' + other_address, function (model, temp_address)
				{
					self.tempAddress = temp_address;
					self.render();
				}, this);
			}
		}

	,	eventHandlersOff: function ()
		{
			// Removes prevously added events on the address collection
			this.addresses && this.addresses.off(null, null, this);
			this.model
				.off('change:' + this.sameAsManage, null, this)
				.off('change:temp' + this.sameAsManage, null, this);
		}

	,	past: function () 
		{
			this.eventHandlersOff();
		}

	,	future: function ()
		{
			this.eventHandlersOff();
		}

		// module.selectAddress
		// --------------------
		// Captures the click on the select button of the addresses list 
	,	selectAddress: function (e)
		{
			jQuery('.wizard-content .alert-error').hide(); 

			// Grabs the address id and sets it to the model
			// on the position in which our sub class is manageing (billaddress or shipaddress)
			this.setAddress(jQuery(e.target).data('id').toString());

			// re render so if there is changes to be shown they are represented in the view
			this.render();              

			// As we already set the address, we let the step know that we are ready
			this.trigger('ready', true);
		}
	,	manualSelectAddress: function (addressid)
	{
		jQuery('.wizard-content .alert-error').hide(); 

		// Grabs the address id and sets it to the model
		// on the position in which our sub class is manageing (billaddress or shipaddress)
		this.setAddress(addressid);

		// re render so if there is changes to be shown they are represented in the view
		this.render();              

		// As we already set the address, we let the step know that we are ready
		this.trigger('ready', true);
	}

	,	setAddress: function (address_id, options)
		{
			this.model.set(this.manage, address_id, options);
			this.addressId = address_id;

			return this;
		}

	,	unsetAddress: function (norender, options)
		{
			this.setAddress(null, options);
			this.tempAddress = null;

			if (!norender)
			{
				this.render();
			}
		}

	,	changeAddress: function (e)
		{
			e.preventDefault();
			e.stopPropagation();
			
			if (this.options.edit_url)
			{
				this.unsetAddress(true);
				
				Backbone.history.navigate(this.options.edit_url + '?force=true', {
					trigger: true
				});
			}
			else
			{
				this.unsetAddress();
			}
		}
	,	parsePhoneNumber: function(phone_number){
			var s2 = (""+phone_number).replace(/\D/g, '');
			var m = s2.match(/^(\d{6})(\d{4})$/);
			return (!m) ? null : [m[1], m[2]];
		}
	,	setSameAsShipping: function(e)
		{
			var addressmodels = this.getAddressesToShow();
			var defaultshippingresult = null;
			if(addressmodels.models.length==1){
				defaultshippingresult =  addressmodels.models[0];
			}
			else{
				for(var i=0;i< addressmodels.models.length;i++){
					if(addressmodels.models[i].attributes.defaultshipping=='T'){
						defaultshippingresult = addressmodels.models[i];
					}
				}
				if(defaultshippingresult==null){
					defaultshippingresult =  addressmodels.models[0];
				}
			}
			
			//var defaultshippingresult = _.filter(addressmodels.models,function(model){ return model.attributes.defaultshipping=='T';});
//			var defaultshippingresult = _.filter(addressmodels.models,function(model){ return model.attributes.defaultshipping=='T';});
//			if(defaultshippingresult.length==0){
//				defaultshippingresult = addressmodels.models[0];
//			}
			
			var shipping_source = defaultshippingresult;
			console.log("same as shipping");
			
			if(jQuery(e.target).prop('checked')){
				this.temp_addr = {
						"firstfullname": this.$('input[name="firstfullname"]').val(),
						"lastfullname": this.$('input[name="lastfullname"]').val(),
						"company": this.$('input[name="company"]').val(),
						"addr1": this.$('input[name="addr1"]').val(),
						"addr2": this.$('input[name="addr2"]').val(),
						"namePrefix": this.$('select[name="namePrefix"]').val(),
						"city": this.$('input[name="city"]').val(),
						"state": this.$('select[name="state"]').val(), 
						"zip": this.$('input[name="zip"]').val(),
						"phone": this.$('input[name="phone"]').val(), 
						"ext": this.$('input[name="ext"]').val()
				};
			}
			
			
			if(jQuery(e.target).prop('checked')){
			/*	var formPhoneNumber = this.$('input[name="phone"]').val()+this.$('input[name="ext"]').val();
				if(this.$('input[name="addr1"]').val()!=''
				||	this.$('input[name="firstfullname"]').val()!=''
				||	this.$('input[name="lastfullname"]').val()!=''
				||	this.$('input[name="company"]').val()!=''
				|| this.$('input[name="addr2"]').val()!=''
				|| this.$('select[name="namePrefix"]').val()!=''
				|| this.$('input[name="city"]').val()!=''
				|| this.$('select[name="state"]').val()!='' 
				|| this.$('input[name="zip"]').val()!=''
				|| formPhoneNumber!=''
				){
					if(confirm('You have entered another address, by checking this box we will use your shipping address as your billing address')){
						this.$('input[name="firstfullname"]').val(shipping_source.attributes.firstfullname);
						this.$('input[name="lastfullname"]').val(shipping_source.attributes.lastfullname);
						this.$('input[name="company"]').val(shipping_source.attributes.company);
						this.$('input[name="addr1"]').val(shipping_source.attributes.addr1);
						this.$('input[name="addr2"]').val(shipping_source.attributes.addr2);
						this.$('select[name="namePrefix"]').val(shipping_source.attributes.namePrefix);
						this.$('input[name="city"]').val(shipping_source.attributes.city);
						this.$('select[name="state"]').val(shipping_source.attributes.state);
						this.$('input[name="zip"]').val(shipping_source.attributes.zip);
						this.$('input[name="phone"]').val(shipping_source.attributes.phone);
						this.$('input[name="ext"]').val(shipping_source.attributes.ext);
					}
			}
			else{*/
				this.$('input[name="firstfullname"]').val(shipping_source.attributes.firstfullname);
				this.$('input[name="lastfullname"]').val(shipping_source.attributes.lastfullname);
				this.$('input[name="company"]').val(shipping_source.attributes.company);
				this.$('input[name="addr1"]').val(shipping_source.attributes.addr1);
				this.$('input[name="addr2"]').val(shipping_source.attributes.addr2);
				this.$('select[name="namePrefix"]').val(shipping_source.attributes.namePrefix);
				this.$('input[name="city"]').val(shipping_source.attributes.city);
				this.$('select[name="state"]').val(shipping_source.attributes.state);
				this.$('input[name="phone"]').val(shipping_source.attributes.phone);
				this.$('input[name="ext"]').val(shipping_source.attributes.ext);
				this.$('input[name="zip"]').val(shipping_source.attributes.zip);
				
		//	}
			}
			else{
				this.$('input[name="firstfullname"]').val(this.temp_addr.firstfullname);
				this.$('input[name="lastfullname"]').val(this.temp_addr.lastfullname);
				this.$('input[name="company"]').val(this.temp_addr.company);
				this.$('input[name="addr1"]').val(this.temp_addr.addr1);
				this.$('input[name="addr2"]').val(this.temp_addr.addr2);
				this.$('select[name="namePrefix"]').val(this.temp_addr.namePrefix);
				this.$('input[name="city"]').val(this.temp_addr.city);
				this.$('select[name="state"]').val(this.temp_addr.state);
				this.$('input[name="phone"]').val(this.temp_addr.phone);
				this.$('input[name="ext"]').val(this.temp_addr.ext);
				this.$('input[name="zip"]').val(this.temp_addr.zip);
			}
			
		}

		// module.submit
		// -------------
		// The step will call this function when the user clicks next or all the modules are ready
		// Will take care of saving the address if its a new one. Other way it will just 
		// return a resolved promise to comply with the api
	,	submit: function ()
	{
		console.log('submit form address');
		var self = this;
		// its a new address
		if (this.addressView)
		{
			// The saveForm function expects the event to be in an element of the form or the form itself, 
			// But in this case it may be in a button outside of the form (as the bav buttosn live in the step)
			//  or tiggered by a module ready event, so we need to create a fake event which the target is the form itself
			console.log('form0')
			console.log(this.addressView.$('form').get(0));
			var fake_event = jQuery.Event('submit', {
					target: this.addressView.$('form').get(0)
				})
				// Calls the saveForm, this may kick the backbone.validation, and it may return false if there were errors, 
				// other ways it will return an ajax promise
			,	result = this.addressView.saveForm(fake_event);
			// Went well, so there is a promise we can return, before returning we will set the address in the model 
			// and add the model to the profile collection
			if (result)
			{
				result.done(function (model)
				{
					// Address id to the order model. This has to go after before the following model.add() as it triggers the render
					self.setAddress(model.id);

					// we only want to trigger an event on add() when the user has some address and is not guest because if not, 
					// in OPC case (two instances of this module in the same page), the triggered re-render erase the module errors. 
					var add_options = (self.isGuest || self.addresses.length === 0) ? {silent: true} : null; 
					self.addresses.add(model, add_options);
					
					self.model.set('temp' + self.manage, null);
					
					self.render();
				});
				return result;
			}
			else 
			{
				// There were errors so we return a rejected promise
				return jQuery.Deferred().reject({
					errorCode: 'ERR_CHK_INCOMPLETE_ADDRESS'
				,	errorMessage: _('The address is incomplete').translate()
				});
			}
		}
		else
		{
			return this.isValid();              
		}		}

	,	isValid: function () 
		{console.log('isvalid111');
			console.log(this.tempAddress);
			if (this.tempAddress)
			{
				return jQuery.Deferred().resolve();
			}

			var addresses = this.wizard.options.profile.get('addresses')
			,	selected_address = addresses && addresses.get(this.model.get(this.manage));

			if (selected_address)
			{
				if (selected_address.get('isvalid') === 'T')
				{
					console.log(selected_address);
//					additional_validation.resolve();
					return jQuery.Deferred().resolve();
				}

				return jQuery.Deferred().reject(this.invalidAddressErrorMessage);
			}

			return jQuery.Deferred().reject(this.selectAddressErrorMessage);
		}

	,	changeForm: function (e)
		{
			this.model.set('temp' +  this.manage, jQuery(e.target).closest('form').serializeObject());
		}

	,	markSameAs: function (e)
		{
			var is_checked = jQuery(e.target).prop('checked');

			this.sameAs = is_checked;

			this.setAddress(is_checked ? this.model.get(this.sameAsManage) : null);

			this.tempAddress = is_checked ? this.model.get('temp' + this.sameAsManage) : null;

			this.render();
		}
	
		// returns the selected address
	,	getSelectedAddress: function ()
		{
			if (!this.addressId)
			{
				if (this.sameAs && this.tempAddress)
				{
					return new AddressModel(this.tempAddress);
				}
	
				// if the user is guest it only has 1 address for this module so we return that address or a new one
				if (this.isGuest)
				{
					return this.getFixedAddress();
				}
			}

			return this.addresses.get(this.addressId) || this.getEmptyAddress();
		}

	,	getEmptyAddress: function ()
		{
			// If the same as checkbox is not checked
			// we return a new model with any attributes that were already typed into the address form
			// that's what the temp + this.manage is, the temporary address for this manage.
			return new AddressModel(this.isSameAsEnabled && this.sameAs ? null : this.model.get('temp' + this.manage));
		}

	,	getTheOtherAddress: function ()
		{
			return this.addresses.get(this.model.get(this.sameAsManage));
		}

		// returns the list of addresses available for this module, if the module has enable_same_as then it removes the sameAsManage address
	,	getAddressesToShow: function ()
		{
		//	if(this.isGuest)
		//	{
		//		var is_same_as_enabled = this.isSameAsEnabled
		//		,	same_as_address_id = this.model.get(this.sameAsManage);

		//		return new Backbone.Collection(this.addresses.reject(function (address)
		//		{
		//			return is_same_as_enabled && address.id === same_as_address_id;
		//		}));
		//	}
		//	else 
		//	{				
				return new Backbone.Collection(this.addresses.models);
		//	}
		}

		// return the fixed address for this module. This is used only when user=guest
	,	getFixedAddress: function ()
		{			
			var addresses = this.getAddressesToShow();
			return addresses.length ? addresses.at(0) : this.getEmptyAddress();
		}

	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_ADDRESS')
			{
				WizardModule.prototype.manageError.apply(this, arguments);
			}
		}
	});
});
// OrderWizard.Module.Address.Shipping.js
// --------------------------------------
// 
define('OrderWizard.Module.Address.Shipping', ['OrderWizard.Module.Address'],  function (OrderWizardModuleAddress)
{
	'use strict';

	return OrderWizardModuleAddress.extend({

		manage: 'shipaddress'
	,	sameAsManage: 'billaddress'

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_SELECT_SHIPPING_ADDRESS', 'ERR_CHK_INVALID_SHIPPING_ADDRESS', 'ERR_WS_INVALID_SHIPPING_ADDRESS']
	,	sameAsMessage: _('Same as billing address').translate()

	,	selectAddressErrorMessage: {
			errorCode: 'ERR_CHK_SELECT_SHIPPING_ADDRESS'
		,	errorMessage: _('Please select a shipping address').translate()
		}

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_SHIPPING_ADDRESS'
		,	errorMessage: _('The selected shipping address is invalid').translate()
		}
		
	,	selectMessage: _('Ship to this address').translate()

	,	eventHandlersOn: function ()
		{	
			OrderWizardModuleAddress.prototype.eventHandlersOn.apply(this, arguments);

			this.model.on('change:tempshipaddress', jQuery.proxy(this, 'estimateShipping'), this);
		}

	,	eventHandlersOff: function ()
		{
			OrderWizardModuleAddress.prototype.eventHandlersOff.apply(this, arguments);

			this.model.off('change:tempshipaddress', null, this);
		}

	,	changeAddress: function ()
		{
			console.log('change address main module');
			OrderWizardModuleAddress.prototype.changeAddress.apply(this, arguments);

			if (this.address)
			{
				this.model.trigger('change:' + this.manage);
			}
		}
	
	,	estimateShipping: function (model, address)
		{
			var	country = address && address.country
			,	zip = address && address.zip;

			if (country && zip && (country !== model.previous('country') || zip !== model.previous('zip')))
			{
				// TODO: review if required
				var addresses = this.model.get('addresses')
				,	address_id = country + '---' + zip + '----null'
				,	current_address = addresses.get(address_id);

				if (!current_address)
				{
					addresses.add({
						internalid: address_id
					,	country: country
					,	zip: zip
					});
				}
				else
				{
					current_address.set({
						country: country
					,	zip: zip
					});
				}

				if (this.addressId !== address_id)
				{
					model.set({
						shipaddress: address_id
					,	isEstimating: true
					});
				}
			}
			else
			{
				model.set('isEstimating', false);
			}
		}
	});
});
// OrderWizard.Module.CardMessage.js
// --------------------------------
// 
define('OrderWizard.Module.CardMessage', ['Wizard.Module', 'CardMessage.Model'], function (WizardModule, CardMessageModel)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_cardmessage_module',
				initialize: function() {
			WizardModule.prototype.initialize.apply(this, arguments);
			var profile = this.wizard.options.profile;
			
			this.model = new CardMessageModel();
			this.enabled = false;
			this.cardmessages = [];

			var self = this;
			$j.ajax({
				type : 'GET',
				url : 'https://secure.poppin.com/CardMessage/cardmessage.ss' + '?action=get',
				cache : false
			}).done(function(data){ 
				_.each(data, function(entry){
					if (entry.columns.custrecord_cardmessage_occasion !== undefined) {
							self.cardmessages.push({
								id		 : entry.columns.custrecord_cardmessage_occasion.name,
								occasion : entry.columns.custrecord_cardmessage_occasion.name,
								message	 : entry.columns.custrecord_cardmessage_message
								});
								}
				});
				self.render();
			});
		},
		events: {
			'change #cardmessage-options': 'changeCardMessage',
			'change #cardmessagetoggle'  : 'cardMessageToggle',
			'keyup #cardmessagetext': 'countmessage'
		},
		render: function(){
			var self = this;
			this._render();

			$j.ajax({
				type : 'GET',
				url : 'https://secure.poppin.com/CardMessage/cardmessage.ss' + '?action=getordermessage',
				cache : false
			}).always(function(data){
				
				console.log("Card message data = " + data);
				if(data.ocation != '' || data.message != ''){
					jQuery('#cardmessagetoggle').prop('checked',true);
					jQuery('#cardmessage-options').val(data.ocation);
					jQuery('#cardmessagetext').val(data.message);
					jQuery('#cardmessageblock').show();
					self.enabled = true;
					
					//self.render();
				}
			});
		},
		submit: function(){
			if(this.enabled){
				var messagelink = {
						msg: jQuery('#cardmessagetext').val(),
						occassion: jQuery('#cardmessage-options option:selected').text().trim()
				};
				$j.ajax({
					type : 'POST',
					data : messagelink,
					url : 'https://secure.poppin.com/CardMessage/cardmessage.ss' + '?action=set',
					cache : false
				});
			}
		},
		isValid: function(){
			//promises
		},
		getCardMessageList: function(){
			
		},
		changeCardMessage: function(e){
			 var value = jQuery(e.currentTarget).val();
		        var result = this.getValueByKey(value);
		        if(result){
		        	jQuery('#cardmessagetext').val(result);
		        	this.countmessage();
		        }
		        
		},
		cardMessageToggle: function(e){
			if(jQuery(e.currentTarget).prop('checked')){
				jQuery('#cardmessageblock').show();
				this.enabled = true;
			}
			else{
				this.enabled = false;
				jQuery('#cardmessageblock').hide();
			}
		},
		getValueByKey: function(key) {
            for (var i=0; i< this.cardmessages.length; i++){
                    if (this.cardmessages[i].id == key) {                    
                        return this.cardmessages[i].message;
                    }
                }
           return false;
        },
        countmessage: function(e) {
        	//jQuery(e.currentTarget).parent().show();
        	var message_total = 250;
        	var longitud = jQuery('#cardmessagetext').val().length;
        	var resto = message_total - longitud;
        	jQuery('#textcounter').html(resto);
        }
	});
});
// OrderWizard.Module.CardMessage.js
// --------------------------------
// 
define('OrderWizard.Module.CheckoutCart', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_checkoutcart_module'
			
			,	events: {
					'change #delivery-options': 'changeDeliveryOptions'
				}

			,	render: function ()
				{
					this.application = this.wizard.application;
					this.profile = this.wizard.options.profile;
					this.options.application = this.wizard.application;
					this._render();
				}
	});
});
// OrderWizard.Module.Confirmation.js
// --------------------------------
// 
define('OrderWizard.Module.Confirmation', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_confirmation_module'
	
	,	render: function()
		{
			var confirmation = this.model.get('confirmation')
				// store current order id in the hash so it is available even when the checkout proccess ends. 
			,	newHash = SC.Utils.addParamsToUrl(Backbone.history.fragment, {
					last_order_id: confirmation.internalid
				});

			this.confirmationNumber = confirmation.confirmationnumber;

			Backbone.history.navigate(newHash, {
				trigger: false
			});
			
			this._render();
		}
	});
});
// OrderWizard.Module.PaymentAndBilling.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentAndBilling', ['Wizard.Module', 'OrderWizard.Module.PaymentMethod.Creditcard'], function (WizardModule, OrderWizardModulePaymentMethodCreditcard)
{
	'use strict';

	return WizardModule.extend(
	{
		
			template: 'order_wizard_paymentandbilling_module'
		
		,	events: {
				
			}
		,	initialize: function(options)
			{
				WizardModule.prototype.initialize.apply(this, arguments);
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				
				//bse===
				var self = this;
				this.credircardmodule = {
						classModule: 'OrderWizard.Module.PaymentMethod.Creditcard'
							,	name: _('Credit / Debit Card').translate()
							,	type: 'creditcard'
							,	options: {}
				};
				var ModuleClass = require(this.credircardmodule.classModule);

				this.credircardmodule.instance = new ModuleClass(_.extend({
						wizard: self.wizard
					,	step: self.step
					,	stepGroup: self.stepGroup
					}, this.credircardmodule.options));

				this.credircardmodule.instance.on('ready', function(is_ready)
				{	
					self.moduleReady(is_ready);
				});
				//bse===	
			}
		,	moduleReady: function(is_ready)
			{
				this.trigger('ready', is_ready);
			}
		,	render: function()
			{
				this.eventHandlersOn();
				this._render();
				//bse===
				//if (this.wizard.options.profile.get('creditcards').length == 0) {
					var self = this;
					this.credircardmodule.instance.isReady = false;
					this.credircardmodule.instance.render();
					self.$('#showpaymentsandbillings-' + this.credircardmodule.type).empty().append(this.credircardmodule.instance.$el);
				//}
				//bse===
			}
		,	eventHandlersOn: function(){
				this.eventHandlersOff();
				var self = this;
				Backbone.on('refresh', function ()
						{
							self._render();
							console.log('rendered');
						}, this);
		}
		,	eventHandlersOff: function(){
				this.model && this.model.off(null, null, this);
				
		}	
		,	getPaymentmethods: function()
		{
			return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
			{
				return paymentmethod.get('type') === 'giftcertificate';
			});
		}
		,	past: function()
			{
				this.model.off('change', this.totalChange, this);
			}
		,	present: function()
			{
				this.model.off('change', this.totalChange, this);
				this.model.on('change', this.totalChange, this);
			}

		,	future: function()
			{
				this.model.off('change', this.totalChange, this);
			}
		,	submit: function()
			{
				//var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
				
				
				//credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
				//bse===
				if (this.credircardmodule && this.credircardmodule.instance)
				{
					return this.credircardmodule.instance.submit();
				}
				//bse===
			
				//this.cardMessageModule.instance.submit();
			}
		,   shouldBeRendered : function() {
			var profile = this.wizard.options.profile;
			console.log("PAM rendered" + profile.id);
			return (profile.id == 285599 || profile.id == 274261);
		}
	});
});
// OrderWizard.Module.PaymentMethod.Creditcard.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.Creditcard'
,	['OrderWizard.Module.PaymentMethod', 'CreditCard.Views', 'CreditCard.Model', 'OrderPaymentmethod.Model', 'Address.Model']
,	function (OrderWizardModulePaymentMethod, CreditCardViews, CreditCardModel, OrderPaymentmethodModel, AddressModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_creditcard_module'

	,	securityNumberErrorMessage: {errorCode:'ERR_CHK_INCOMPLETE_SECURITY_NUMBER', errorMessage:_('Security Number is required').translate()}
	
	,	selectMessage: _('Use this Card').translate()

	,	events: {
			'click [data-action="select-creditcard"]': 'selectCreditCard'
		,	'click [data-action="change-creditcard"]': 'changeCreditCard'
		,	'click [data-action="setSelectedCreditcardId"]': 'setSelectedCreditcardId'
		}

	,	errors: ['ERR_CHK_INCOMPLETE_CREDITCARD', 'ERR_CHK_SELECT_CREDITCARD', 'ERR_CHK_INCOMPLETE_SECURITY_NUMBER', 'ERR_WS_INVALID_PAYMENT']
	,	isActive: function ()
		{
			var a_credit_card = _.findWhere(this.wizard.application.getConfig('siteSettings.paymentmethods', []), {
				creditcard: 'T'
			});
			
			return a_credit_card && a_credit_card.internalid;
		}

	,	createCookie: function(name, value, days) {
		debugger;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";

        var fixedName = '<%= Request["formName"] %>';
        name = fixedName + name;

        document.cookie = name + "=" + value + expires + "; path=/";
    }

	,	render: function ()
		{
			var self = this
				// currently we only support 1 credit card as payment method
			,	order_payment_method = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				});
			
			this.creditcard = null;

			this.paymentMethod = order_payment_method || new OrderPaymentmethodModel({
				type: 'creditcard'
			});

			var	order_creditcard = this.paymentMethod.get('creditcard');

			this.requireccsecuritycode = SC.ENVIRONMENT.siteSettings.checkout.requireccsecuritycode === 'T';

			// creditcard set up
			this.creditcards = this.wizard.options.profile.get('creditcards');

			// Removes prevously added events on the address collection
			this.creditcards.off(null, null, this);
			
			this.creditcards.on('reset destroy change', function ()
			{	
				//search for the paymentmethod in the order that is creditcard
				var order_payment_method = self.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				})
				,	order_creditcard_id = order_payment_method && order_payment_method.get('creditcard') && order_payment_method.get('creditcard').internalid;
				
				//if the order has a credit card and that credit card exists on the profile we set it (making sure it is the same as in the profile)
				if (order_creditcard_id && self.creditcards.get(order_creditcard_id))
				{
					self.setCreditCard({
						id: order_creditcard_id
					});	
				}
				// if the creditcard in the order is not longer in the profile we delete it. 
				else if (order_creditcard_id) 
				{
					self.unsetCreditCard(); 
				}

				self.render();

			}, this);

			
			this.creditcards.on('add', function (new_card)
					{
						//search for the paymentmethod in the order that is creditcard
						var order_payment_method = self.model.get('paymentmethods').findWhere({
							type: 'creditcard'
						})
						,	order_creditcard_id = order_payment_method && order_payment_method.get('creditcard') && order_payment_method.get('creditcard').internalid;
						
						//if the order has a credit card and that credit card exists on the profile we set it (making sure it is the same as in the profile)
//						if (order_creditcard_id && self.creditcards.get(order_creditcard_id))
//						{
							self.setCreditCard({
								id: new_card.id
							});	
						//}
						// if the creditcard in the order is not longer in the profile we delete it. 
//						else if (order_creditcard_id) 
//						{
//							self.unsetCreditCard(); 
//						}

						self.render();

					}, this);
console.log("Validation----------");
			if (!this.creditcards.length)
			{

				this.creditcard = new CreditCardModel({}, {
					paymentMethdos: this.wizard.application.getConfig('siteSettings.paymentmethods')
				});
			        var profile = this.wizard.options.profile;
				//this.creditcard.set("ccname",profile.get("firstname")+ ' ' + profile.get("lastname"));
				if (this.requireccsecuritycode)
				{
					this.creditcard.validation.ccsecuritycode = {
						fn: function (cc_security_code)
						{
							if (!_.validateSecurityCode(cc_security_code))
							{
								return self.securityNumberErrorMessage.errorMessage;
							}
									
						}
					};
				}

			}
			else
			{	
				if (order_creditcard)
				{
					this.creditcard = this.creditcards.get(order_creditcard.internalid);
				}
				else if (this.wizard.options.profile.get('isGuest') === 'T')
				{
					// if the order is empty and is a guest use the first credit card in the list
					this.creditcard = this.creditcards.at(0);
					
					this.setCreditCard({
						id: this.creditcard.id
					});
				}
			}
			
			this._render();		
			if (!this.creditcards.length)
			{
				this.creditcardView = new CreditCardViews.Details({
					application: this.wizard.application
				,	collection: this.creditcards
				,	model: this.creditcard
				});

				this.creditcardView.$el = this.$('#creditcard-module-form-placeholder');
				
				Backbone.Validation.bind(this.creditcardView);
				this.creditcardView.delegateEvents();
			}
			else
			{

				this.creditcardListView = new CreditCardViews.List({
					application: this.wizard.application
				,	collection: this.creditcards
				});

				this.creditcardListView.$el = this.$('#creditcard-module-list-placeholder');

				Backbone.Validation.bind(this.creditcardListView);
				this.creditcardListView.delegateEvents();
			}
			
			/* TODO: make this work in case that someone wants to put only the credit card module on a step
			if (!this.this.creditcard)
			{
				this.trigger('navbar_toggle', false);
			}
			else
			{
				this.trigger('navbar_toggle', true);
			}*/
		}

	,	changeCreditCard: function (e)
		{
		
			if (this.wizard.application.getUser().get('isGuest') !== 'T')
			{
				this.unsetCreditCard(e); 
			}
			else
			{
				var self = this;

				e.preventDefault();
				e.stopPropagation();
				
				this.creditcard.destroy({
					wait: true
				}).then(function ()
				{
					self.creditcards.reset([]);
					self.wizard.application.getUser().get('creditcards').reset([]);
				});
			}
		}
		
	,	selectCreditCard: function (e)
		{	createCookie("cvc", "", -1);
			console.log('select creditcard');
		    var id = jQuery(e.target).data('id') || this.selectedCreditcardId;
			console.log('select creditcard');
			this.setCreditCard({
				id: id
			});
			
			// As we alreay already set the credit card, we let the step know that we are ready
			this.trigger('ready', !this.requireccsecuritycode);
			console.log(this.requireccsecuritycode);
		}
	
	,   setSelectedCreditcardId : function (e)
		{
			console.log('selected creditcard' + jQuery(e.target).data('id'));
			this.selectedCreditcardId = jQuery(e.target).data('id');
		}

	,	setSecurityNumber: function ()
		{
			if (this.requireccsecuritycode)
			{
				var credit_card = this.paymentMethod.get('creditcard');

				if (credit_card)
				{
					credit_card.ccsecuritycode = this.ccsecuritycode;
				}
			}
		}

	,	setCreditCard: function (options)
		{	
			var ccattributes;
			if(this.creditcards.get(options.id)!=undefined){
				ccattributes = this.creditcards.get(options.id).attributes;
			}
			
			this.paymentMethod = new OrderPaymentmethodModel({
				type: 'creditcard'
			,	creditcard: options.model || ccattributes
			});

			this.setSecurityNumber();

			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

			// We re render so if there is changes to be shown they are represented in the view
			this.render();
		}
		
	,	unsetCreditCard: function (e)
		{
			if(e)
			{
				e.preventDefault();
				e.stopPropagation();
			}
			this.paymentMethod = new OrderPaymentmethodModel({
				type: 'creditcard'
			});
			
			this.ccsecuritycode = null;

			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

			// We re render so if there is changes to be shown they are represented in the view
			this.render();
		}

	,	submit: function ()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			var self = this;

			if (this.requireccsecuritycode)
			{
				this.isSecurityNumberInvalid = false;
				// we need to store this temporarly (frontend) in case a module in the same step
				// fails validation, making the credit card section re-rendered.
				// We don't want the user to have to type the security number multiple times
				this.ccsecuritycode = this.$('input[name="ccsecuritycode"]').val();
			}

			// if we are adding a new credit card
			if (this.creditcardView)
			{	
				var fake_event = jQuery.Event('click', {
						target: this.creditcardView.$('form').get(0)
					})
				,	result = this.creditcardView.saveForm(fake_event);
				
				if (!result)
				{
					// There were errors so we return a rejected promise
					return jQuery.Deferred().reject({
						errorCode: 'ERR_CHK_INCOMPLETE_CREDITCARD'
					,	errorMessage: _('The Credit Card is incomplete').translate()
					});

				}

				return result.then(function (model)
				{
					self.creditcardView = null;

					delete self.creditcard.validation.ccsecuritycode;
					
					self.wizard.options.profile.get('creditcards').add(model, {
						silent: true
					});

					self.setCreditCard({
						model: model
					});
				});
			}
			// if there are already credit cards
			else
			{
				this.setSecurityNumber();

				OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);

				return this.isValid().fail(function (error)
				{
					if (error === self.securityNumberErrorMessage)
					{
						self.isSecurityNumberInvalid = true;
					}
					self._render();
				});
			}
		}

	,	past: function ()
		{
			delete this.ccsecuritycode;
		}

	,	future: function ()
		{
			delete this.ccsecuritycode;
		}

	,	isValid: function () 
		{

			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

				// user's credit cards
			var creditcards = this.wizard.options.profile.get('creditcards')
				// current order payment method
			,	order_payment_method = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				})
				// current order credit card
			,	order_creditcard = order_payment_method && order_payment_method.get('creditcard');

			// Order is using a credit card
			// and there is a collection of creditcards
			// and the order's creditcard is on that collection
			if (order_creditcard && creditcards.length && creditcards.get(order_creditcard.internalid))
			{
				if (!this.requireccsecuritycode || _.validateSecurityCode(order_creditcard.ccsecuritycode))
				{
					return jQuery.Deferred().resolve();	
				}
				else
				{
					return jQuery.Deferred().reject(this.securityNumberErrorMessage);
				}
			}
			else
			{
				// if it not set, then lets reject it
				return jQuery.Deferred().reject({errorCode: 'ERR_CHK_SELECT_CREDITCARD', errorMessage: _('Please select a credit card').translate()});
			}
		}

	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_CREDITCARD')
			{	
				OrderWizardModulePaymentMethod.prototype.manageError.apply(this, arguments);
				if (error.errorCode === 'ERR_WS_INVALID_PAYMENT')
				{
					this.unsetCreditCard();
				}
			}
		}
	});
});

// OrderWizard.Module.Confirmation.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.GiftCertificates', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_paymentmethod_giftcertificates_module'
		
	,	events: {
			'submit form': 'applyGiftCertificate'
		,	'click [data-action="remove"]': 'removeGiftCertificate'
		,	'shown #gift-certificate-form' : 'onShownGiftCertificateForm' 
		}

	,	errors: ['ERR_WS_INVALID_GIFTCERTIFICATE', 'ERR_WS_APPLIED_GIFTCERTIFICATE', 'ERR_WS_EMPTY_GIFTCERTIFICATE']

	,	render: function()
		{
			this.giftCertificates = this.model.get('paymentmethods').where({
				type: 'giftcertificate'
			});

			this.trigger('ready', true);

			this._render();
		}

	,	eventHandlersOff: function ()
		{
			this.model.off('change:paymentmethods', this.render, this);
		}

	,	past: function ()
		{
			this.eventHandlersOff();
		}
	
	,	present: function ()
		{
			this.eventHandlersOff();
			this.model.on('change:paymentmethods', this.render, this);
		}

	,	future: function ()
		{
			this.eventHandlersOff();
		}

	,	updateGiftCertificates: function (codes)
		{
			var self = this;

			// disable navigation buttons
			this.wizard.getCurrentStep().disableNavButtons();
			// disable inputs and buttons
			this.$('input, button').prop('disabled', true);

			return new Backbone.Model().save(
				{
					giftcertificates: codes
				}
			,	{
					url: _.getAbsoluteUrl('services/live-order-giftcertificate.ss')

				,	success: function (model, attributes)
					{
						self.model.set({
							paymentmethods: attributes.paymentmethods
						,	summary: attributes.summary
						,	touchpoints: attributes.touchpoints
						});
						var primary_paymentmethod = self.model.get('paymentmethods').findWhere({primary: true});
						if ( primary_paymentmethod.get('type') === 'paypal') {
							primary_paymentmethod.set('complete',  true);
						}
					}

				,	error: function (model, jqXhr)
					{
						jqXhr.preventDefault = true;
						self.wizard.manageError(JSON.parse(jqXhr.responseText));
					}
				}
			).always(function(){
				// enable navigation buttons
				self.wizard.getCurrentStep().enableNavButtons();
				// enable inputs and buttons
				self.$('input, button').prop('disabled', false);
			});
		}

	,	applyGiftCertificate: function (e)
		{
			e.preventDefault();


			var code = jQuery.trim(jQuery(e.target).find('[name="code"]').val())
			,	is_applied = _.find(this.giftCertificates, function (certificate)
				{
					return certificate.get('giftcertificate').code === code;
				});
			
			if (!code)
			{
				this.wizard.manageError({
					errorCode: 'ERR_WS_EMPTY_GIFTCERTIFICATE'
				,	errorMessage: 'This gift card does not have any credit left'
				});
			}
			else if (is_applied)
			{
				this.wizard.manageError({
					errorCode: 'ERR_WS_APPLIED_GIFTCERTIFICATE'
				,	errorMessage: 'Gift Certificate is applied'
				});
			}
			else
			{
				this.updateGiftCertificates(this.getGiftCertificatesCodes().concat(code));
			}
		}
		
	,	removeGiftCertificate: function (e)
		{
			var code = jQuery(e.target).data('id')
			,	is_applied = _.find(this.giftCertificates, function (payment_method)
				{
					return payment_method.get('giftcertificate').code === code;
				});

			if (is_applied && confirm(_('Are you sure you want to remove this Gift certificate?').translate()))
			{
				this.updateGiftCertificates(_.without(this.getGiftCertificatesCodes(), code));
			}
		}

	,	getGiftCertificatesCodes: function ()
		{
			return _.map(this.giftCertificates, function (payment_method)
			{
				return payment_method.get('giftcertificate').code;
			});
		}

	,	showError: function ()
		{
			this.$('.control-group').addClass('error');
			WizardModule.prototype.showError.apply(this, arguments);
		}

		// onShownGiftCertificateForm
		// Handles the shown of promocode form
	,	onShownGiftCertificateForm: function (e)
		{
			jQuery(e.target).find('input[name="code"]').focus();
		}
	});
});
// OrderWizard.Module.PaymentMethod.Creditcard.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.Invoice', ['OrderWizard.Module.PaymentMethod', 'OrderPaymentmethod.Model'], function (OrderWizardModulePaymentMethod, OrderPaymentmethodModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_invoice_module'

	,	events: {
			'click [data-toggle="show-terms"]': 'showTerms'
		}
	
	,	errors: ['ERR_CHK_INVOICE_CREDIT_LIMIT']

	,	showTerms: function()
		{
			var self = this; 
			var TermsView = Backbone.View.extend({
				title: _('Terms and Conditions').translate()	
			,	render: function ()
				{
					this.$el.html(self.wizard.application.getConfig('invoiceTermsAndConditions'));
					return this;
				}
			});
			this.wizard.application.getLayout().showInModal(new TermsView());
		}

	,	isActive: function ()
		{
			var terms = this.terms = this.getProfile().get('paymentterms');
			return terms && terms.internalid;
		}

	,	getProfile: function ()
		{
			return this.wizard.options.profile;
		}

	,	render: function ()
		{
			if (this.isActive())
			{
				return this._render();
			}
		}

	,	submit: function ()
		{
			var self = this;

			return this.isValid().done(function ()
			{
				self.paymentMethod = new OrderPaymentmethodModel(
				{ 
						type: 'invoice'
					,	terms: self.wizard.options.profile.get('paymentterms')
					,	purchasenumber: self.$('[name=purchase-order-number]').val() || ''
				});

				OrderWizardModulePaymentMethod.prototype.submit.apply(self);
			});
		}
	});
});
// OrderWizard.Module.PaymentMethod.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		submit: function()
		{
			// Gets teh payment methos collection
			var payment_methods = this.model.get('paymentmethods');

			// Removes the primary if any
			payment_methods.remove(
				payment_methods.where({primary: true})
			);

			// Gets the payment method for this object
			var payment_method = this.paymentMethod;

			// Sets it as primary
			payment_method.set('primary', true);

			// Adds it to the collection
			payment_methods.add(payment_method);

			// We just return a resolved promise
			return jQuery.Deferred().resolve();
		}
	});
});
// OrderWizard.Module.PaymentMethod.Creditcard.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.PayPal', ['OrderWizard.Module.PaymentMethod', 'OrderPaymentmethod.Model'], function (OrderWizardModulePaymentMethod, OrderPaymentmethodModel)
{
	'use strict';

	return OrderWizardModulePaymentMethod.extend({
		
		template: 'order_wizard_paymentmethod_paypal_module'

	,	isActive: function()
		{
			var paypal = _.findWhere(this.wizard.application.getConfig('siteSettings.paymentmethods', []), {ispaypal: 'T'});
			return (paypal && paypal.internalid);
		}

	,	past: function()
		{
			if (this.isActive() && this.wizard.isPaypal() && !this.wizard.isPaypalComplete() && !this.wizard.hidePayment())
			{

				var checkout_url = this.wizard.application.getConfig('siteSettings.touchpoints.checkout')
				,	joint = ~checkout_url.indexOf('?') ? '&' : '?'
				,	previous_step_url = this.wizard.getPreviousStepUrl();
				
				checkout_url += joint + 'paypal=T&next_step=' + previous_step_url;

				Backbone.history.navigate(previous_step_url, {trigger: false, replace: true});
				
				document.location.href = checkout_url;

				throw new Error('This is not an error. This is just to abort javascript');
			}
		}

	,	render: function()
		{
			if (this.isActive())
			{
				this.paymentMethod = new OrderPaymentmethodModel({ type: 'paypal' });

				this._render();

				if (this.wizard.isPaypalComplete())
				{
					this.paymentMethod.set('primary', null);
					this.paymentMethod.set('complete',true);
					var is_ready = this.options && this.options.backFromPaypalBehavior !== 'stay';
					this.trigger('ready', is_ready);
				}
				
			}
		}

	});
});
// OrderWizard.Module.PaymentMethod.Selector.js
// --------------------------------
// 
define('OrderWizard.Module.PaymentMethod.Selector', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_paymentmethod_selector_module'

	,	selectedPaymentErrorMessage: {errorCode: 'ERR_CHK_SELECT_PAYMENT', errorMessage: _('Please select a payment option').translate()}

	,	errors: ['ERR_CHK_SELECT_PAYMENT', 'ERR_WS_SET_PAYMENT', 'ERR_WS_INVALID_PAYMENT']

	,	events: {
			'shown a[data-toggle="tab"]': 'selectPaymentMethod'
		}

	,	initialize: function(options)
		{
			var self = this;
			WizardModule.prototype.initialize.apply(this, arguments);

			this.modules = options.modules || [
				{
					classModule: 'OrderWizard.Module.PaymentMethod.Creditcard'
				//,	name: _('Credit / Debit Card').translate()
				,	type: 'creditcard'
				,	options: {}
				}
			,	{
					classModule: 'OrderWizard.Module.PaymentMethod.Invoice'
				,	name: _('Invoice').translate()
				,	type: 'invoice'
				,	options: {}
				}
			,	{
					classModule: 'OrderWizard.Module.PaymentMethod.PayPal'
				,	name: _('PayPal').translate()
				,	type: 'paypal'
				,	options: {}

				}
			];

			_.each(this.modules, function(module)
			{
				var ModuleClass = require(module.classModule);

				module.instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self.step
				,	stepGroup: self.stepGroup
				}, module.options));

				module.instance.on('ready', function(is_ready)
				{	
					self.moduleReady(is_ready);
				});
			});


			
			// this.setModuleByType()
		}
	,	moduleReady: function(is_ready)
		{
			this.trigger('ready', is_ready);
		}

	,	past: function()
		{
			var primary_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			if (!primary_paymentmethod) {
				this.selectedModule = null;
			}
			if (!this.selectedModule)
			{
				this.setModuleByType(primary_paymentmethod && primary_paymentmethod.get('type'));
			}
			if (this.selectedModule.type === 'paypal') {
				primary_paymentmethod.set('complete',  true);
//this.model.attributes.isPaypalComplete = true;
			}
			
			this.selectedModule && this.selectedModule.instance.past && this.selectedModule.instance.past();
			this.model.off('change', this.totalChange, this);
		}

	,	present: function()
		{
			this.selectedModule && this.selectedModule.present && this.selectedModule.present();

			
			this.model.off('change', this.totalChange, this);
			this.model.on('change', this.totalChange, this);
		}

	,	future: function()
		{
			this.selectedModule && this.selectedModule.future && this.selectedModule.future();
			this.model.off('change', this.totalChange, this);
		}

	,	totalChange: function()
		{
			var was = this.model.previous('summary').total
			,	is = this.model.get('summary').total;

			// Changed from or to 0
			if ((was === 0 && is !== 0) || (was !== 0 && is === 0))
			{
				this.render();
			}
		}

	,	setModuleByType: function(type)
		{
			this.selectedModule = _.findWhere(this.modules, {type: type});
			
			if (!this.selectedModule)
			{	
				this.selectedModule = _.first(this.modules);
			}

			// set continue button label.
			if (this.selectedModule.type === 'paypal' && !this.model.get('isPaypalComplete'))
			{
				this.trigger('change_label_continue', _('Continue to Paypal').translate());
			}
			else
			{
				this.trigger('change_label_continue');
			}

		}
	
	,	render: function()
		{
			if (this.wizard.hidePayment())
			{
				this.$el.empty();
				this.trigger('change_label_continue');
				return;
			}
			var selected_payment = this.model.get('paymentmethods').findWhere({primary: true}),
				moduleType = selected_payment && selected_payment.get('type');
			console.log("selected_payment = " + selected_payment);
			console.log("paymentmethods = " + this.model.get('paymentmethods'));
			if (!this.selectedModule || this.selectedModule.type != moduleType)
			{
				this.setModuleByType(moduleType);
			} else
			{
				this.trigger('change_label_continue');
			}
			
			// We do this here so we give time for information to be bootstrapped
			_.each(this.modules, function(module)
			{
				module.isActive = module.instance.isActive();
			});

			this._render();

			var self = this;
			_.each(this.modules, function(module)
			{
				if (module.isActive)
				{
					module.instance.isReady = false;
					module.instance.render();
					self.$('#payment-method-selector-' + module.type).empty().append(module.instance.$el);
				}
			});
		}

	,	selectPaymentMethod: function(e)
		{
			this.setModuleByType(jQuery(e.target).data('type'));
		}

	,	submit: function()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			if (this.selectedModule && this.selectedModule.instance)
			{
				return this.selectedModule.instance.submit();
			}
			else
			{
				return jQuery.Deferred().reject(this.selectedPaymentErrorMessage);	
			}
		}

	,	isValid: function()
		{
			// This order is bing payed with some other method (Gift Cert probably)
			if (this.wizard.hidePayment())
			{
				return jQuery.Deferred().resolve();
			}

			if (this.selectedModule && this.selectedModule.instance)
			{
				return this.selectedModule.instance.isValid();
			}
			else
			{
				return jQuery.Deferred().reject(this.selectedPaymentErrorMessage);	
			}
		}
	});
});
// OrderWizard.Module.RegisterEmail.js
// --------------------------------
// 
define('OrderWizard.Module.RegisterEmail', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_registeremail_module'

	,	invalidEmailErrorMessage: {errorCode:'ERR_CHK_INVALID_EMAIL', errorMessage:_('Invalid email address').translate()}
	
	,	errors: ['ERR_CHK_INVALID_EMAIL']

	,	render: function ()
		{
			var profile = this.profile = this.wizard.options.profile;

			// if the user is logged we dont render the module
			if (profile.get('isGuest') !== 'T')
			{
				this.trigger('ready', true);
			}
			else
			{
				this._render();

				if (profile.get('email') && this.wizard.isPaypalComplete())
				{
					this.trigger('ready', true);
				}
			}
		}

	,	submit: function ()
		{
			var profile = this.profile
			,	fake_promise = jQuery.Deferred()
			,	self = this
			,	email = this.$('input[name=email]').val()
			,	emailsubscribe = this.$('input[name=sign-up-newsletter]').is(':checked') ? 'T' : 'F';
			
			// if the user is not guest or not change the current values we just resolve the promise
			if (profile.get('isGuest') !== 'T' || (profile.get('email') === email && profile.get('emailsubscribe') === emailsubscribe))
			{
				return this.isValid();
			}
			
			profile.set({
				email: email
			,	confirm_email: email
			});

			this.isValid().then(function ()
			{
				// TODO: do we need to subscribe the guest to a campaign???
				profile
					.set('emailsubscribe', emailsubscribe)
					.save()
					.then(function ()
					{
						self.render();
						fake_promise.resolve();
					}, function (message)
					{
						fake_promise.reject(message);
					});
			}, function (message)
			{
				fake_promise.reject(message);
			});

			return fake_promise;
		}

	,	isValid: function() 
		{
			var promise = jQuery.Deferred()
			,	profile = this.wizard.options.profile;

			if (profile.get('isGuest') !== 'T' || Backbone.Validation.patterns.email.test(profile.get('email')))
			{
				return promise.resolve();
			}

			return promise.reject(this.invalidEmailErrorMessage);
		}

	,	showError: function ()
		{
			this.$('.control-group').removeClass('error');
			this.$('.control-group').addClass('error');
			WizardModule.prototype.showError.apply(this, arguments);
		}	

	});
});
// OrderWizard.Module.Shipmethod.js
// --------------------------------
// 
define('OrderWizard.Module.RegisterGuest', ['Wizard.Module', 'Account.Register.Model'], function (WizardModule, AccountRegisterModel)
{
	'use strict';

	return WizardModule.extend({

		template: 'order_wizard_register_guest_module'

	,	events: {
			'submit form': 'saveForm'
		}

	,	errors: [
			'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS'
		,	'ERR_WS_CUSTOMER_REGISTRATION'
		,	'ERR_WS_INVALID_EMAIL'
		]

	,	render: function ()
		{
			var application = this.wizard.application;
			
			this.model = new AccountRegisterModel();

			if (application.getUser().get('isGuest') === 'T')
			{
				this.guestEmail = this.wizard.options.profile.get('email');				
				this._render();
			}
			else
			{
				this.trigger('ready', true);
			}
		}

	,	showSuccess: function ()
		{
			var self = this; 

			this.$('form').empty().html(
				SC.macros.message(
					_('Account successfully created').translate()
				,	'success'
				)
			);

			this.wizard.application.getCart().fetch({
				success: function ()
				{
					var layout = self.wizard.application.getLayout();
					layout.$('#site-header').html(SC.macros[self.wizard.getCurrentStep().headerMacro](layout));
					layout.$('#site-footer').html(SC.macros[self.wizard.getCurrentStep().footerMacro](layout));
				}
			}); 
		}

	,	saveForm: function (e)
		{
			e.preventDefault();

			var self = this
			,	$target = jQuery(e.target)
			,	user_data = $target.serializeObject();

			this.$savingForm = $target.closest('form');
			
			this.model.save(user_data)
				.success(function ()
				{	
					self.wizard.application.getUser().set(self.model.get('user'));
					self.showSuccess();
				})
				.error(function (jqXhr)
				{
					jqXhr.preventDefault = true;
					self.wizard.manageError(JSON.parse(jqXhr.responseText));
				});
		}
	
	,	showError: function ()
		{
			if (this.error && this.error.errorCode === 'AN_ACCOUNT_WITH_THAT_NAME_AND_EMAIL_ADDRESS_ALREADY_EXISTS')
			{
				this.error.errorMessage = this.error.errorMessage.replace('href=\'{1}\'', 'href="#" data-touchpoint="login"');
			}
			
			WizardModule.prototype.showError.apply(this, arguments);
		}
	});
});
// OrderWizard.Module.Shipmethod.js
// --------------------------------
// 
define('OrderWizard.Module.Shipmethod', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_shipmethod_module'

	,	events: {
			'click input[name="delivery-options"]': 'changeDeliveryOptions'
		}

	,	errors: ['ERR_CHK_SELECT_SHIPPING_METHOD','ERR_WS_INVALID_SHIPPING_METHOD']

	,	initialize: function ()
		{
			console.log(SC.ENVIRONMENT.CART.shipmethod);
			this.waitShipmethod = !SC.ENVIRONMENT.CART.shipmethod;
			WizardModule.prototype.initialize.apply(this, arguments);
			// So we allways have a the reload promise
			this.reloadMethodsPromise = jQuery.Deferred().resolve();
		}

	,	present: function ()
		{
			this.currentAddress = this.previousAddress = this.model.get('shipaddress');
			this.eventHandlersOn();
		}

	,	future: function() 
		{
			this.currentAddress = this.previousAddress = this.model.get('shipaddress');
			this.eventHandlersOn();
		}

	,	past: function() 
		{
			this.waitShipmethod = !this.model.get('shipmethod');
			this.currentAddress = this.previousAddress = this.model.get('shipaddress');
			this.eventHandlersOn();
		}

	,	eventHandlersOn: function ()
		{
			// Removes any leftover observer
			this.eventHandlersOff();
			// Adds the observer for this step
			this.model.on('change:shipaddress', this.shipAddressChange, this);

			this.model.on('change:shipmethods', function(){
				_.defer(_.bind(this.render, this));
			}, this);

			var selected_address = this.wizard.options.profile.get('addresses').get(this.currentAddress);

			if (selected_address)
			{
				selected_address.on('change:country change:zip', jQuery.proxy(this, 'reloadMethods'), this);
			}
		}

	,	eventHandlersOff: function ()
		{
			// removes observers
			this.model.off('change:shipmethods', null, this);
			this.model.off('change:shipaddress', this.shipAddressChange, this);

			var addresses = this.wizard.options.profile.get('addresses')
			,	current_address = addresses.get(this.currentAddress)
			,	previous_address = addresses.get(this.previousAddress);

			if (current_address)
			{
				current_address.off('change:country change:zip', null, this);
			}

			if (previous_address && previous_address !== current_address)
			{
				previous_address.off('change:country change:zip', null, this);
			}
		}

	,	render: function ()
		{

			if (this.state === 'present')
			{
				if (this.model.get('shipmethod') && !this.waitShipmethod)
				{
					this.trigger('ready', true);
				}
				this._render();
			}
		}

	,	shipAddressChange: function (model, value)
		{
			// if its not null and there is a difference we reload the methods
			if (this.currentAddress !== value)
			{
				this.currentAddress = value;

				var user_address = this.wizard.options.profile.get('addresses')
				,	order_address = this.model.get('addresses')
				,	previous_address = this.previousAddress && (order_address.get(this.previousAddress) || user_address.get(this.previousAddress))
				,	current_address = this.currentAddress && order_address.get(this.currentAddress) || user_address.get(this.currentAddress)
				,	changed_zip = previous_address && current_address && previous_address.get('zip') !== current_address.get('zip')
				,	changed_country = previous_address && current_address && previous_address.get('country') !== current_address.get('country');

				// if previous address is equal to current address we compare the previous values on the model.
				if (this.previousAddress && this.currentAddress && this.previousAddress === this.currentAddress)
				{
					changed_zip = current_address.previous('zip') !== current_address.get('zip');
					changed_country = current_address.previous('country') !== current_address.get('country');
				}

				// reload ship methods only if there is no previous address or when change the country or zipcode
				if ((!previous_address && current_address) || changed_zip || changed_country)
				{
					this.reloadMethods();
				}
				else 
				{
					this.render();
				}

				if (value)
				{
					this.previousAddress = value;	
				}
			}
		}

	,	reloadMethods: function ()
		{
			// to reload the shipping methods we just save the order
			var self = this
			,	$container = this.$el;

			$container.addClass('loading');
			this.step.disableNavButtons();
			this.reloadMethodsPromise = this.model.save(null, {
				parse: false
			,	success: function (model, attributes)
				{
					model.set({
							shipmethods: attributes.shipmethods
						,	summary: attributes.summary
					});
				}
			}).always(function ()
			{
				$container.removeClass('loading');
				self.render();
				self.step.enableNavButtons();
			});
		}

	,	submit: function ()
		{
			var self = this;
			this.model.set('shipmethod', this.$('input[name=delivery-options]:checked').val());
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.clearError();
				self.step.enableNavButtons();
			});
			return this.isValid();
		}

	,	isValid: function () 
		{
			var model = this.model
			,	valid_promise = jQuery.Deferred();

			this.reloadMethodsPromise.always(function ()
			{
				if (model.get('shipmethod') && model.get('shipmethods').get(model.get('shipmethod')))
				{
					valid_promise.resolve();
				}
				else
				{
					valid_promise.reject({
						errorCode: 'ERR_CHK_SELECT_SHIPPING_METHOD'
					,	errorMessage: _('Please select a shipping method').translate()
					});
				}
			});

			return valid_promise;
		}
		
	,	changeDeliveryOptions: function (e) 
		{
			var self = this;

			this.waitShipmethod = true;

			this.model.set('shipmethod', this.$(e.target).val());
//			this.step.disableNavButtons();
//			this.model.save().always(function()
//			{
//				self.clearError();
//				self.step.enableNavButtons();
//			});
		}

		// render the error message
	,	showError: function ()
		{
			// Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder. 
			this.$('[data-type="alert-placeholder-module"]:first').html( 
				SC.macros.message(this.error.errorMessage, 'error', true) 
			);
		}
	});
});

// OrderWizard.Module.ShowPayments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowPayments', ['Wizard.Module','OrderWizard.Module.CardMessage'], function (WizardModule, OrderWizardModuleCardMessage)
{
	'use strict';

	return WizardModule.extend(
	{
			template: 'order_wizard_showpayments_module'
		,	errors: ['ERR_WS_CC_AUTH']
		,	events: {
				'click input[name="delivery-options"]': 'changeDeliveryOptions'
			, 	'click input[name="review-delivery-options"]': 'changeChecked'
			,	'click [name="submit-shipping-method"]': 'submit_shipping_method'
		}

		,	changeChecked: function(e){
			console.log(e.target);
			var names = document.getElementsByName("review-delivery-options");
			console.log(names[0].getAttribute("checked"));
			_.each(names,function(name){
				if(name.getAttribute("checked")=="checked"){
					name.setAttribute("checked","");
				}
				e.target.setAttribute("checked","checked");
			});

		}

		, 	submit_shipping_method: function() {
//			if (!this.$('#ccsecuritycode').val() || (this.$('#ccsecuritycode').val() && !isNumeric(this.$('#ccsecuritycode').val()))) {
//				var errorMsg;
//				(this.$('#ccsecuritycode').val() && !isNumeric(this.$('#ccsecuritycode').val())) ?  errorMsg = _('Security Number is not valid').translate() : errorMsg = _('Security Number is required').translate();
//				var $group = this.$('#ccsecuritycode').parents('.control-group').addClass('error');
//				$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
//				$group.find('.help-block').text(errorMsg);
//				return jQuery.Deferred().reject(errorMsg);
//			}
//			var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
//			console.log(credit_card_pm);
//		
//			credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
			
			var cvsError = this.validateAndSetCVC();
			if (cvsError) {
				return jQuery.Deferred().reject(cvsError);
			}
			
			var names = document.getElementsByName("review-delivery-options"),
				self  = this,	
				value;
			
			_.each(names,function(name){
				if(name.getAttribute("checked")=="checked"){
					value = name.getAttribute("value");
				}
			});

			this.model.set('shipmethod', value);
				this.step.disableNavButtons();
				this.model.save().always ( function()
				{
					self.render();
					self.step.enableNavButtons();
				});
		}
	
		,	initialize: function(options)
			{
				WizardModule.prototype.initialize.apply(this, arguments);
				var self = this;
				this.cardMessageModule =        {
				                   					classModule: 'OrderWizard.Module.CardMessage'
				                   				,	options: {}
				                   				};
				var ModuleClass = require(this.cardMessageModule.classModule);

				this.cardMessageModule.instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self.step
				,	stepGroup: self.stepGroup
				}, this.cardMessageModule.options));

				this.cardMessageModule.instance.on('ready', function(is_ready)
				{	
					self.moduleReady(is_ready);
				});
				this.model.set('ipAddress',ipAddress);				
			}
		,	moduleReady: function(is_ready)
			{
				this.trigger('ready', is_ready);
			}
		,	render: function()
			{
				console.log("Render Show Payments Module.");
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				this.eventHandlersOn();
				var wasChecked = false,
			    	cvcBeforeRender;
if(this.getPaymentmethods().length > 0 && this.getPaymentmethods()[0].attributes.creditcard){
				if (!this.currentCardId && this.getPaymentmethods().length > 0 ) {
					this.currentCardId = this.getPaymentmethods()[0].attributes.creditcard.internalid;
				} else if (this.getPaymentmethods().length > 0 && (this.currentCardId != this.getPaymentmethods()[0].attributes.creditcard.internalid)) {
					this.currentCardId = this.getPaymentmethods()[0].attributes.creditcard.internalid;
					cvcBeforeRender = undefined;
				} else {
					if (this.$('#ccsecuritycode') && this.$('#ccsecuritycode')[0] && jQuery("#in-modal-ccsecuritycode").length==0) {
						cvcBeforeRender = this.$('#ccsecuritycode')[0].value;
					}
				}
}
				if (this.$('#cardmessageblock').length != 0) {
					     wasChecked = this.$('#cardmessagetoggle')[0].checked;
					 var selIndex   = this.$('#cardmessage-options')[0].selectedIndex,
						 text       = this.$('#cardmessagetext')[0].value,
						 remChars   = this.$('#textcounter')[0].innerHTML;
				}
				
				this._render();
				this.cardMessageModule.instance.render();
				this.$('#cardmessage-container').empty().append(this.cardMessageModule.instance.$el);
				if (wasChecked) {
					this.$('#cardmessagetoggle')[0].checked = true;
					this.$('#cardmessageblock').show();
					this.$('#cardmessagetext')[0].value = text;
					if (selIndex) {this.$('#cardmessage-options')[0].selectedIndex = selIndex;}
					this.$('#textcounter')[0].innerHTML = remChars;
				}
				if (cvcBeforeRender && this.$('#ccsecuritycode')) {
					this.$('#ccsecuritycode')[0].value = cvcBeforeRender;
				}
			}
		,	eventHandlersOn: function(){
				this.eventHandlersOff();
				var self = this;
				Backbone.on('refresh', function ()
						{
							var wasChecked = this.$('#cardmessagetoggle')[0].checked,
								selIndex   = this.$('#cardmessage-options')[0].selectedIndex,
								text       = this.$('#cardmessagetext')[0].value,
								remChars   = this.$('#textcounter')[0].innerHTML;
							self._render();
							this.cardMessageModule.instance.render();
							this.$('#cardmessage-container').empty().append(this.cardMessageModule.instance.$el);
							if (wasChecked) {
								this.$('#cardmessagetoggle')[0].checked = true;
								this.$('#cardmessageblock').show();
								this.$('#cardmessagetext')[0].value = text;
								if (selIndex) {this.$('#cardmessage-options')[0].selectedIndex = selIndex;}
								this.$('#textcounter')[0].innerHTML = remChars;
							}
							
							console.log('refreshed');
						}, this);
		}
		,	eventHandlersOff: function(){
				this.model && this.model.off(null, null, this);
				
		}	
		,	getPaymentmethods: function()
			{
				return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
				{
					return paymentmethod.get('type') === 'giftcertificate';
				});
			}
		
		,   getPrimaryPaymentmethods: function()
		{
			
				return this.model.get('paymentmethods').where({primary: true});
			
		}
		,	getGiftCertificates: function()
			{
				return this.model.get('paymentmethods').where({type: 'giftcertificate'});
			}
		,	past: function()
			{
				this.model.off('change', this.totalChange, this);
			}
		,	present: function()
			{
				this.model.off('change', this.totalChange, this);
				this.model.on('change', this.totalChange, this);
			}

		,	future: function()
			{
				this.model.off('change', this.totalChange, this);
			}

		,	totalChange: function()
			{
				var was = this.model.previous('summary').total
				,	was_confirmation = this.model.previous('confirmation')
				,	is = this.model.get('summary').total;

				// Changed from or to 0
				if ( ((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation )
				{
					this.render();
				}
			}
		,	changeDeliveryOptions: function(e) 
		{
			var currentBillAddress = this.model.attributes.billaddress;
			var cvsError = this.validateAndSetCVC();
			if (cvsError) {
				this.render();
				this.validateAndSetCVC();
				return jQuery.Deferred().reject(cvsError);
			}
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				if (currentBillAddress && self.model.attributes.billaddress !=currentBillAddress ) {
					self.model.set('billaddress', currentBillAddress  ,'billaddress')
				}
				var primary_paymentmethod = self.model.get('paymentmethods').findWhere({primary: true});
				if (  primary_paymentmethod && primary_paymentmethod.get('type') === 'paypal') {
					primary_paymentmethod.set('complete',  true);
				}
				self.render();
				self.step.enableNavButtons();
			});
		}
		,	submit: function(e, additional_validation)
			{
				if(additional_validation!=undefined){additional_validation.resolve();}
				var cvsError = this.validateAndSetCVC();
				if (cvsError) {
					return jQuery.Deferred().reject(cvsError);
				}
				
				this.cardMessageModule.instance.submit();
			}
		
		, 	validateAndSetCVC: function () {
	if(this.model.get('paymentmethods').where({type: 'paypal'}).length>0 ){
				return null;
			}
				var val = this.$('#ccsecuritycode').val(),
					errorMsg;
				if (!val || (val && (/[^0-9]/.test(val) || val.length < 3))) {
					var errorMsg;
					(!val) ?  errorMsg = _('Security Number is required').translate() : errorMsg = _('Security Number is not valid').translate();
					var $group = this.$('#ccsecuritycode').parents('.control-group').addClass('error');
					$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: -9px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					$group.find('.help-block').text(errorMsg);
					return errorMsg;
				} else {
					var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
					console.log(credit_card_pm);
					credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
					return null;
				}
		}
		,	showError: function ()
		{
			if (this.error && this.error.errorCode === 'ERR_WS_CC_AUTH')
			{
				this.error.errorMessage = "Unfortunately we were unable to authorize this purchase with the credit card information given. Please review and update your payment details below.";
				this.$('.wizard-showpayments-billing-payment-method').css('border','2px solid red');
			}
			
			WizardModule.prototype.showError.apply(this, arguments);
		}
	});
});
// OrderWizard.Module.ShowPayments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowPaymentsAndBillings', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		
			template: 'order_wizard_showpaymentsandbillings_module'
		
		,	events: {
				'click input[name="delivery-options"]': 'changeDeliveryOptions'
			}
		, shouldBeRendered : function ()
		{
			var profile     = this.wizard.options.profile,
			creditcards = profile.get('creditcards'),
			//creditcards = this.getPaymentmethods(),
			addresses   = profile.get('addresses');
			return addresses.length && creditcards.length;
		}
		
		, getAddresses : function () 
		{
			var profile     = this.wizard.options.profile;
			return profile.get('addresses').models;
		}

		,	render: function()
			{
			    console.log("showPaymantAndBillings");
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				this.eventHandlersOn();
				console.log(this.model);
				
				this._render();

			}
		,	eventHandlersOn: function(){
				this.eventHandlersOff();
				var self = this;
				Backbone.on('refresh', function ()
						{
							self._render();
							console.log('rendered');
						}, this);
		}
		,	eventHandlersOff: function(){
				this.model && this.model.off(null, null, this);
				
		}	
		,	getPaymentmethods: function()
			{
				return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
				{
					return paymentmethod.get('type') === 'giftcertificate';
				});
			}
		,	getGiftCertificates: function()
			{
				return this.model.get('paymentmethods').where({type: 'giftcertificate'});
			}
		,	past: function()
			{
				this.model.off('change', this.totalChange, this);
			}
		,	present: function()
			{
				this.model.off('change', this.totalChange, this);
				this.model.on('change', this.totalChange, this);
			}

		,	future: function()
			{
				this.model.off('change', this.totalChange, this);
			}

		,	totalChange: function()
			{
				var was = this.model.previous('summary').total
				,	was_confirmation = this.model.previous('confirmation')
				,	is = this.model.get('summary').total;

				// Changed from or to 0
				if ( ((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation )
				{
					this.render();
				}
			}
		,	changeDeliveryOptions: function(e) 
		{
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.render();
				self.step.enableNavButtons();
			});
		}
		,	submit: function()
			{
				var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
				console.log(credit_card_pm);
				
				credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
			}
	});
});
// OrderWizard.Module.ShowShipments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowShipments', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_showshipments_module'
	
	,	events: {
			'change #delivery-options': 'changeDeliveryOptions'
		}

	,	render: function ()
		{
jQuery('#content').css('background','#e5e5e5').css('width','936px');
jQuery('#shop_by_color').show();
jQuery('#nav').css('margin','0px auto');
jQuery('#confirmation_search').show();
jQuery('#confirmation_search_button').show();
jQuery('#help_info_checkout').css('margin-top','-7px');
			this.application = this.wizard.application;
			this.profile = this.wizard.options.profile;
			this.options.application = this.wizard.application;
			this._render();
		}

	,	changeDeliveryOptions: function(e) 
		{
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.render();
				self.step.enableNavButtons();
			});
		}
	});
});
// OrderWizard.Module.TermsAndConditions.js
// --------------------------------
// 
define('OrderWizard.Module.TermsAndConditions', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend({
		
		template: 'order_wizard_termsandconditions_module'

	,	events: {
			'click [data-toggle="show-terms"]': 'showTerms'
		}
	
	,	errors: ['ERR_CHK_ACCEPT_TERMS']

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.step = options.step;
			this.model = options.wizard.model;
			this.options = _.extend({
				show_checkbox: false
			}, this.options || {});
		}

	,	render: function ()
		{
			// the module is rendered only if the site requires agreement to the terms and conditions
			if (SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions === 'T')
			{
				this._render();
				var is_ready = SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions !== 'T' || !this.options.show_checkbox || this.$('input[name=termsandconditions]').is(':checked');
				this.trigger('ready', is_ready);
			}
			else
			{
				this.trigger('ready', true);
			}
		}
		
	,	submit: function ()
		{
			var value = SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions !== 'T' || !this.options.show_checkbox || this.$('input[name=termsandconditions]').is(':checked');
			this.model.set('agreetermcondition', value);

			return this.isValid();
		}
	
	,	showTerms: function ()
		{
			var TermsView = Backbone.View.extend({
				title: _('Terms and Conditions').translate()	
			,	render: function ()
				{
					this.$el.html(SC.ENVIRONMENT.siteSettings.checkout.termsandconditionshtml);
					return this;
				}
			});

			this.wizard.application.getLayout().showInModal(new TermsView());
		}

	,	isValid: function() 
		{
			var promise = jQuery.Deferred()
			,	value = SC.ENVIRONMENT.siteSettings.checkout.requiretermsandconditions !== 'T' || !this.options.show_checkbox || this.model.get('agreetermcondition');

			if (!value)
			{
				return promise.reject({errorCode: 'ERR_CHK_ACCEPT_TERMS', errorMessage:_('You must accept the Terms and Conditions').translate()});
			}
			else
			{
				return promise.resolve();
			}
		}
	});
});
// OrderWizzard.Router.js
// ----------------------
// 
define('OrderWizard.Router', ['Wizard.Router', 'OrderWizard.View', 'OrderWizard.Step', 'Order.Model'], function (WizardRouter, OrderWizardView, OrderWizardStep, OrderModel)
{
	'use strict';
	
	return WizardRouter.extend({

		view: OrderWizardView

	,	step: OrderWizardStep

	,	initialize: function()
		{
			WizardRouter.prototype.initialize.apply(this, arguments);
			if (this.application.getConfig('startCheckoutWizard') && !~_.indexOf(this.stepsOrder, ''))
			{
				this.route('', 'startWizard');
				this.route('?:options', 'startWizard');
			}
		}

	,	startWizard: function()
		{		
			if(this.model.attributes.shipaddress.indexOf('null') == -1 && this.model.attributes.billaddress.indexOf('null') == -1 ){
				var current_creditcards = this.model.get('paymentmethods').findWhere({
					type: 'creditcard'
				});
			var paypal = this.model.get('paymentmethods').findWhere({type: 'paypal'}),
			    shipaddress = this.model.attributes.addresses.get(this.model.attributes.shipaddress);
			
			if (!paypal && shipaddress && !shipaddress.phone) {
				Backbone.history.navigate(this.stepsOrder[0], {trigger: true});
			}
				
				
				
			console.log(current_creditcards);
			if(!current_creditcards && !paypal){
					Backbone.history.navigate(this.stepsOrder[1], {trigger: true});
				}
				else{
					Backbone.history.navigate(this.stepsOrder[2], {trigger: true});
				}
			}
			else{
				Backbone.history.navigate(this.stepsOrder[0], {trigger: true});
			}
		}

	,	hidePayment: function()
		{
			return this.application.getConfig('siteSettings.checkout.hidepaymentpagewhennobalance') === 'T' && this.model.get('summary').total === 0;
		}
	
	,	isPaypal: function()
		{
			var selected_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			return selected_paymentmethod && selected_paymentmethod.get('type') === 'paypal';
		}
	
	,	isPaypalComplete: function()
		{
			var selected_paymentmethod = this.model.get('paymentmethods').findWhere({primary: true});
			return selected_paymentmethod && selected_paymentmethod.get('type') === 'paypal' && selected_paymentmethod.get('complete');
		}
		
	,	runStep: function(options)
		{
			// Computes the position of the user in the flow
			var url = (options) ? Backbone.history.fragment.replace('?' + options, '') : Backbone.history.fragment
			,	position = this.getStepPosition(url)
			,	layout = this.application.getLayout()
			,	content = ''
			,	page_header = ''
			,	last_order_id = options && ~options.indexOf('last_order_id='); 

			if (last_order_id || !this.application.getCart().getTotalItemCount()) 
			{ 
				if(this.application.getUser().get('isGuest') !== 'T' && last_order_id)
				{
					//checkout just finnished and user refreshed the doc. 
					var orderId = options.substring(options.indexOf('last_order_id=') + 'last_order_id='.length, options.length); 
					page_header = _('Your Order has been placed').translate(); 
					content += _('If you want to review your last order you can go to <a href="#" data-touchpoint="$(0)" data-hashtag="#/ordershistory/view/$(1)">Your Account</a>. ')
						.translate('customercenter', orderId) + 
						_('Or you can continue Shopping on our <a href="/" data-touchpoint="home">Home Page</a>. ').translate(); 
				}
				else 
				{
					page_header = _('Your Shopping Cart is empty').translate(); 
					content = _('Continue Shopping on our <a href="/" data-touchpoint="home">Home Page</a>. ').translate(); 
				}

				return this.application.getLayout().internalError(content, page_header, _('Checkout').translate());
			}

			// if you have already placed the order you can not be in any other step than the last
			if (this.model && this.model.get('confirmation') && this.model.get('confirmation').confirmationnumber && position.toLast !== 0)
			{
				window.location = this.application.getConfig('siteSettings.touchpoints.home');
				return;
			}

			WizardRouter.prototype.runStep.apply(this, arguments);

			// if you are in the last step we are going to clear your minicart
			if (position.toLast === 0)
			{
				layout.$(layout.key_elements.miniCart).html(SC.macros.miniCart(new OrderModel(), this.application));
				layout.$(layout.key_elements.miniCartSummary).html(SC.macros.miniCartSummary(0));
			}
		}
	});
});

// Wizard.Step.js
// --------------
// Step View, Renders all the components of the Step
define('OrderWizard.Step', ['Wizard.Step'], function (WizardStep)
{
	'use strict';

	return WizardStep.extend({

		headerMacro: 'simplifiedHeader'
	,	footerMacro: 'simplifiedFooter'

	,	stepAdvance: function()
		{
			return WizardStep.prototype.stepAdvance.apply(this, arguments) && this.wizard.isPaypalComplete();
		}
		
	,	render: function ()
		{
			var layout = this.wizard.application.getLayout();

			// We store a copy of the current state of the head when it starts, to then restore it once the WizardView is destroyed
			if (!layout.originalHeader)
			{
				layout.originalHeader = layout.$('header.site-header').html();
			}

			// Every step can show its own version of header,
			layout.$('#site-header').html(SC.macros[this.headerMacro](layout));
			layout.$('#site-footer').html(SC.macros[this.footerMacro](layout));

			WizardStep.prototype.render.apply(this, arguments);

			// Notify the layout that we have modified the DOM (specially we want it to update the reference layout.$search).			
			layout.updateUI();

			// Also trigger the afterRender event so the site search module can load the typeahead. 
			layout.trigger('afterRender');
		}

	});

});
// OrderWizzard.View.js
// --------------------
//
define('OrderWizard.View', ['Wizard.View', 'OrderWizard.Module.TermsAndConditions','ErrorManagement', 'OrderPaymentmethod.Model', 'OrderWizard.Module.PaymentMethod','OrderWizard.Module.CardMessage'], 
		function (WizardView, TermsAndConditions, ErrorManagement, OrderPaymentmethodModel, OrderWizardModulePaymentMethod, OrderWizardModuleCardMessage)
{
	'use strict';

	return WizardView.extend({
		
		template: 'order_wizard_layout'
	,	title: _('Checkout').translate()

	,	attributes: {
			'id': 'order-wizard-layout'
		,	'class': 'order-wizard-layout'
		}

	,	events: {
			'submit form[data-action="apply-promocode"]': 'applyPromocode'
		,	'click [data-action="remove-promocode"]': 'removePromocode'
		,	'shown #promo-code-container' : 'onShownPromocodeForm' 
		,	'click [data-action="submit-step"]' : 'submitStep' //only for Order Place button in the Order Summary
		,	'click [data-toggle="show-terms-summary"]' : 'showTerms' //only for "Show terms and cond" in the Order Summary
		,	'click [data-action="remove-item"]': 'removeItem'//minicart remove item
		,	'submit [data-action="update-quantity"]': 'updateItemQuantity'//minicart update item quantity
		//,	'blur [name="quantity"]': 'updateItemQuantity'//minicart update quantity
		,	'submit form[data-action="apply-giftcert"]': 'applyGiftCertificate'
		,	'click [data-action="remove-giftcert"]': 'removeGiftCertificate'
		,	'shown #gift-certificate-form' : 'onShownGiftCertificateForm'	
		,	'click .keep-in-touch-checkbox':'optin'
		,	'click [data-action="select"]': 'selectAddress'
		,	'click [data-action="setselectedaddressid"]': 'setSelectedAddressId'
		,	'click [data-action="canceladdressselection"]': 'cancelAddressSelection'
		,	'click [data-action="changeaddress"]': 'changeAddress'
		,	'click [data-action="select-creditcard"]': 'selectCreditCard'
		,	'click [data-action="setSelectedCreditcardId"]': 'setSelectedCreditcardId'
		,	'change #cccheckbox'  : 'ccFuturePurchases'
		}
	,	ccFuturePurchases: function(e){
		if(jQuery(e.currentTarget).prop('checked')){
			console.log("checked");
		}else{console.log("unchecked");}
	}
	
	,	changeAddress: function (e)
	{	
		this.manageAddress = jQuery(e.target).data('id');
		if (this.manageAddress == "shipaddress") {
			jQuery('#change-shipping').show();
		} else {
			jQuery('#change-billing').show();
		}
		
	}
	
		,	createCookie: function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";

        var fixedName = '<%= Request["formName"] %>';
        name = fixedName + name;

        document.cookie = name + "=" + value + expires + "; path=/";
    }
	
,	selectCreditCard: function (e)
	{	createCookie("cvc", "", -1);

		var selcardid = jQuery(e.target).data('id') || this.selectedCreditcardId;
		_.each(this.creditcards.models,function(cc){
			if(selcardid == cc.get("internalid")){
				cc.attributes.ccsecuritycode = null;
			}
		});
		if (selcardid) {
			this.setCreditCard({
				id: selcardid
			});
//			this.model.get("paymentmethods").models[0].get("creditcard").ccsecuritycode = null;
		} else {
			this.render();
		}
		
		// As we alreay already set the credit card, we let the step know that we are ready
		this.trigger('ready', !this.requireccsecuritycode);
		console.log(this.requireccsecuritycode);
	}
	
	,   setSelectedCreditcardId : function (e)
	{
		console.log('selected creditcard' + jQuery(e.target).data('id'));
		this.selectedCreditcardId = jQuery(e.target).data('id');
		
	}
	,	setSelectedAddressId : function (e)
	{
		console.log('selected address id');
		var addressType = e.target.getAttribute("id");
		if (addressType == "shipaddress") {
			this.selectedShippingAddressId = jQuery(e.target).data('id').toString();
			this.selectedShippingAddressOptions = e.target.getAttribute("id");
		} else {
			this.selectedBillingAddressId = jQuery(e.target).data('id').toString();
			this.selectedBillingAddressOptions = e.target.getAttribute("id");
		}
	}

	,	cancelAddressSelection : function (e)
	{
		console.log('Cancel address selection');
		this.selectedShippingAddressId = undefined;
		this.selectedBillingAddressId = undefined;
		this.selectedShippingAddressOptions = undefined;
		this.selectedBillingAddressOptions = undefined;
		this.manageAddress = undefined;
		// re render so if there is changes to be shown they are represented in the view
		this.render();              

		// As we already set the address, we let the step know that we are ready
		this.trigger('ready', true);
	}
	
,	setSecurityNumber: function ()

	{
		if (this.requireccsecuritycode)
		{	console.log("setSecurityNumber");
			var credit_card = this.paymentMethod.get('creditcard');

			if (credit_card)
			{
				credit_card.ccsecuritycode = this.ccsecuritycode;
			}
		}
	}

,	setCreditCard: function (options)
	{	
		var ccattributes;
		if (this.creditcards.get (options.id) != undefined) {
			ccattributes = this.creditcards.get(options.id).attributes;
		}
		ccattributes.ccdafault = "T";
		console.log("setCreditCard. ccattributes = "+ ccattributes);
		this.paymentMethod = new OrderPaymentmethodModel({
			type: 'creditcard'
		,	creditcard: options.model || ccattributes
		});
		this.setSecurityNumber();
		OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);
		// We re render so if there is changes to be shown they are represented in the view
		this.render();
	}
	
	,	selectAddress: function (e)
	{
		jQuery('.wizard-content .alert-error').hide(); 
		
		var seladdrid  = jQuery(e.target).data('id') || this.selectedShippingAddressId || this.selectedBillingAddressId,
			seladdropt = e.target.getAttribute("id") || this.selectedShippingAddressOptions || this.selectedBillingAddressOptions;
		
		// Grabs the address id and sets it to the model
		// on the position in which our sub class is manageing (billaddress or shipaddress)
		if (seladdrid) {
			this.selectedShippingAddressId = undefined;
			this.selectedBillingAddressId = undefined;
			this.selectedShippingAddressOptions = undefined;
			this.selectedBillingAddressOptions = undefined;
			this.manageAddress = undefined;
			this.setAddress(seladdrid,seladdropt);
		}
		// re render so if there is changes to be shown they are represented in the view
		this.render();              

		// As we already set the address, we let the step know that we are ready
		this.trigger('ready', true);
	}
	,	setAddress: function (address_id, options)
	{
		

		var billing_address = this.model.attributes.addresses.find(function (model)
				{
					return model.get('defaultbilling') === 'T';
				});
		
		if (!billing_address) {
			var billaddress = this.wizard.options.profile.get('addresses').get(address_id);
this.model.attributes.addresses.add(billaddress);
		}
		this.model.set(options, address_id, options);

		this.addressId = address_id;

		return this;
	}
	,	initialize: function(options)
		{	
			if(Backbone.history.fragment.indexOf('review')>-1){
				jQuery("#sipmethod-div").append(jQuery("#shipmethod-content"));
				jQuery("#paypal_button").hide();
			} else {
				jQuery("#paypal_button").show();
			}

			console.log('crC');
			console.log(this);
			
			var self = this;
			this.wizard = options.wizard;
			this.currentStep = options.currentStep;
			console.log("initialize");
//				this.wizard.options.profile.get("creditcards").destroy({ wait: true });
				console.log(this.wizard.options.profile.get("creditcards"));

			if(this.wizard.options.profile.attributes.companyname!=null){jQuery("#header-phone-number").html("(866) 926-4922");}
//			this.model.manualSelectAddress
//			console.log(this.model.attributes.addresses.models[0]);
//			_.each(this.model.attributes.addresses.models, function(address){
//				
//			});
			
			//on change model we need to refresh summary
			this.model.on('sync change:summary', function ()
			{
				// TODO: nasty hack, review: when 'change' is  triggered before sync then the models are not backbone collections but arrays. 
				if (!_.isArray(self.wizard.model.get('lines')))
				{				
					self.updateCartSummary();	
				}
			});
			this.model.on('refresh', function(){
				console.log('refreshing');
				this.render();
			});
		}

	,	render: function()
		{
			console.log("Render of the step: " + Backbone.history.fragment);
			var self = this
			// currently we only support 1 credit card as payment method
		,	order_payment_method = this.model.get('paymentmethods').findWhere({
				type: 'creditcard'
			});
		
	
		this.paymentMethod = order_payment_method || new OrderPaymentmethodModel({
			type: 'creditcard'
		});
		this.creditcards = this.wizard.options.profile.get('creditcards');
		var addresses = this.wizard.options.profile.get('addresses');
		addresses.on('add', function (new_address) {
			if (this.manageAddress) {
		
				this.setAddress(new_address.id,this.manageAddress);
			}
		}, this);
		this.creditcards.on('add change', function (new_card) {
			var ccattributes = new_card.attributes;
			ccattributes.ccdafault = "T";
			console.log("setCreditCard. ccattributes = "+ ccattributes);
			this.paymentMethod = new OrderPaymentmethodModel({
				type       : 'creditcard'
			,	creditcard : ccattributes
			});
			this.setSecurityNumber();
			OrderWizardModulePaymentMethod.prototype.submit.apply(this, arguments);
			// We re render so if there is changes to be shown they are represented in the view
			this.render();
		}, this);
			
			this.giftCertificates = this.model.get('paymentmethods').where({
				type: 'giftcertificate'
			});
			WizardView.prototype.render.apply(this, arguments);
//			Backbone.View.prototype._render.apply(this, arguments);
			this.updateCartSummary();
		}

	,	updateCartSummary: function()
		{
			console.log("Update cart summary. this.wizard.model = " + this.wizard.model);
			var current_step = this.wizard.getCurrentStep()
			,	was_confirmation = this.wizard.model.previous('confirmation');
			
			var profile = this.wizard.options.profile;

			if (!current_step.hideSummary && !was_confirmation)
			{
				this.$('#order-summary').empty().html(
					SC.macros.checkoutCartSummary({
						cart: this.wizard.model
					,	application: this.options.application
					,	stepPosition: this.wizard.getStepPosition()
					,	continueButtonLabel: current_step.changedContinueButtonLabel || current_step.continueButtonLabel || _('Place Order').translate()
					,	hideItems: current_step.hideSummaryItems
					,	payPalUrl: profile.get("paypalUrl")
					,	subscription: this.wizard.options.profile.attributes.emailsubscribe
					})
					
				);
				
			}
			
			this.$('[data-toggle="tooltip"]').tooltip({html: true});
		}

		// applyPromocode:
		// Handles the submit of the apply promo code form
	,	applyPromocode: function (e)
		{
			this.wizard.application.trackEvent({category: "Custom Checkout", action: "Apply Promo Code", label: this.currentStep.stepGroup.name });
			var self = this
			,	$target = jQuery(e.target)
			,	options = $target.serializeObject();

			e.preventDefault();
			
			this.$('[data-type=promocode-error-placeholder]').empty();

			// disable navigation buttons
			this.currentStep.disableNavButtons();
			// disable inputs and buttons
			$target.find('input, button').prop('disabled', true);

//			this.model.save({ promocode: { code: options.promocode.trim() } }).error(
//				function (jqXhr) 
//				{
//					self.model.unset('promocode');
//					jqXhr.preventDefault = true;
//					var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
//					if(message.indexOf("Coupon code is invalid or unrecognized")>-1)
//						message = "Gone are the days of humdrum office products and that promo code";
//					if(message.indexOf("This coupon code has expired or is invalid")>-1)
//						message = "This promo code has expired or is invalid";
//					//powertip error for promocode
////					powerTip.create('promocode', message, 'powerTipPromo', -49, -10);
////					$target.find('#promocode').on('focusin', function() { powerTip.hide('powerTipPromo'); });
////					$target.find('#promocode').css('border', '2px solid red').css('padding', '1px 6px');
//					//end of promo powertip
//
//					self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
//					$target.find('input[name=promocode]').val('').focus();
//				}
//			).always(
//				function(){
//					// enable navigation buttons
//					self.currentStep.enableNavButtons();
//					// enable inputs and buttons
//					$target.find('input, button').prop('disabled', false);
////self.render();
//				}
//			);
			
			
			this.model.save(
					{
						 promocode: { code: options.promocode.trim() }
					}
					,{
						success: function(){
							self.render();
						}
					,	error: function(model, jqXhr){
							self.model.unset('promocode');
							jqXhr.preventDefault = true;
							var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
							if(message.indexOf("Coupon code is invalid or unrecognized")>-1)
								message = "Gone are the days of humdrum office products and that promo code";
							if(message.indexOf("This coupon code has expired or is invalid")>-1)
								message = "This promo code has expired or is invalid";
							self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
//							$target.find('input[name=promocode]').focus();
						}
					}
			).always(
				function(){
					// enable navigation buttons
					self.currentStep.enableNavButtons();
					// enable inputs and buttons
					$target.find('input, button').prop('disabled', false);
				});
			
			
		}


		// removePromocode:
		// Handles the remove promocode button
	,	removePromocode: function (e)
		{
			this.wizard.application.trackEvent({category: "Custom Checkout", action: "Remove Promo Code", label: this.currentStep.stepGroup.name });
			var self = this;

			e.preventDefault();

			// disable navigation buttons
			this.currentStep.disableNavButtons();

			this.model.save({ promocode: null }).always(function(){
				// enable navigation buttons
				self.currentStep.enableNavButtons();
self.render();
			});
		}

		// onPromocodeFormShown
		// Handles the shown of promocode form
	,	onShownPromocodeForm: function(e)
		{
			jQuery(e.target).find('input[name="promocode"]').focus();
		}
	//Gift certificate methods
	,	updateGiftCertificates: function (codes)
	{
		var self = this;

		// disable navigation buttons
		this.wizard.getCurrentStep().disableNavButtons();
		// disable inputs and buttons
		this.$('input, button').prop('disabled', true);
		
		return new Backbone.Model().save(
			{
				giftcertificates: codes
			}
		,	{
				url: _.getAbsoluteUrl('services/live-order-giftcertificate.ss')

			,	success: function (model, attributes)
				{
					self.model.set({
						paymentmethods: attributes.paymentmethods
					,	summary: attributes.summary
					,	touchpoints: attributes.touchpoints
					});
					self.render();
				}

			,	error: function (model, jqXhr)
				{
					jqXhr.preventDefault = true;
					//self.wizard.manageError(JSON.parse(jqXhr.responseText));
					var error =JSON.parse(jqXhr.responseText);

					if(error.errorMessage.indexOf('Error: The gift card entered has no remaining value')>-1){
						error.errorMessage = "The gift card entered has no remaining value";
					}
					if(error.errorMessage.indexOf("Gift certificate redemption amount exceeds available amount on the gift certificate")>-1){
						error.errorMessage = "You've waited to long, this gift card has expired";
					}

					self.$('[data-type=giftcertificate-error-placeholder]').html(SC.macros.message(error.errorMessage,'error',true));
				}
			}
		).always(function(){
			// enable navigation buttons
			self.wizard.getCurrentStep().enableNavButtons();
			// enable inputs and buttons
			self.$('input, button').prop('disabled', false);
//			self.render();
		});
	}

,	applyGiftCertificate: function (e)
	{
		
		e.preventDefault();
		this.wizard.application.trackEvent({category: "Custom Checkout", action: "Apply Gift Card", label: this.currentStep.stepGroup.name });
		
		var code = jQuery.trim(jQuery(e.target).find('[name="code"]').val())
		,	is_applied = _.find(this.giftCertificates, function (certificate)
			{
				return certificate.get('giftcertificate').code === code;
			});
		
		if (!code)
		{
//			this.wizard.manageError({
//				errorCode: 'ERR_WS_EMPTY_GIFTCERTIFICATE'
//			,	errorMessage: 'This gift card does not have any credit left'
//			});
			
			var error = {
					errorCode: 'ERR_WS_EMPTY_GIFTCERTIFICATE'
				,	errorMessage: 'This gift card does not have any credit left'
				};
			self.$('[data-type=giftcertificate-error-placeholder]').html(SC.macros.message(error.errorMessage,'error',true));
			this.wizard.application.trackEvent({category: "Custom Checkout Errors", action: "Wizard Error", label: error.errorMessage });
		}
		else if (is_applied)
		{
			console.log('is applioed');
			this.wizard.manageError({
				errorCode: 'ERR_WS_APPLIED_GIFTCERTIFICATE'
			,	errorMessage: 'Gift Certificate is applied'
			});
		}
		else
		{
			console.log(this.getGiftCertificatesCodes().concat(code));
			this.updateGiftCertificates(this.getGiftCertificatesCodes().concat(code));
		}
	}
	
,	removeGiftCertificate: function (e)
	{
//		console.log(this.giftCertificates);
		this.wizard.application.trackEvent({category: "Custom Checkout", action: "Remove Gift Card", label: this.currentStep.stepGroup.name });
		var code = jQuery(e.target).data('id')
		,	is_applied = _.find(this.giftCertificates, function (payment_method)
			{
				return payment_method.get('giftcertificate').code === code;
			});

		if (is_applied && confirm(_('Are you sure you want to remove this Gift certificate?').translate()))
		{
			this.updateGiftCertificates(_.without(this.getGiftCertificatesCodes(), code));
		}
	}

,	getGiftCertificatesCodes: function ()
	{
//		console.log("aaa");
//		console.log(this.giftCertificates);
		return _.map(this.giftCertificates, function (payment_method)
		{
			console.log(payment_method.get('giftcertificate'));
			return payment_method.get('giftcertificate').code;
		});
	}


,	showError: function (message)
	{
		this.wizard.application.trackEvent({category: "Custom Checkout Errors", action: "Wizard Error", label:message });
		//this.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
//		this.$('.control-group').addClass('error');
		//WizardModule.prototype.showError.apply(this, arguments);
//		self.showError(result.errorMessage, $line, result.errorDetails);
	}
	// onShownGiftCertificateForm
	// Handles the shown of promocode form
,	onShownGiftCertificateForm: function (e)
	{
		jQuery(e.target).find('input[name="code"]').focus();
	}
	// minicart updateItemQuantity:
	// executes on blur of the quantity input
	// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateItemQuantity: function (e)
	{
		console.log("OrederWizard. updateItemQuantity");
		e.preventDefault();
		var self = this
		,	$line = null
		,	options = jQuery(e.target).closest('form').serializeObject()
		,	line = this.model.get('lines').get(options.internalid),
			quantityavailable = line.get("item").get("quantityavailable");

		if (parseInt(line.get('quantity'),10) !==  parseInt(options.quantity,10))
		{
			if (options.quantity > quantityavailable){
				var error_msg = '<p>Your quantity must be</p><p> less than ' + (quantityavailable+1)  + '</p>';
				jQuery('#' + 'quantity-' + options.internalid).addClass("input-red");
				powerTip.create('quantity-'+options.internalid, error_msg, 'powerTip' + options.internalid, 142, 450);
				jQuery('#powerTip' + options.internalid ).css('font-weight', 'normal');
				jQuery('#powerTip' + options.internalid ).css('line-height', '0.5')
				jQuery('#' + 'quantity-' + options.internalid).on('focusin', function() { powerTip.hide('powerTip' + options.internalid); }) ;
			} else {		
				jQuery('#' + 'quantity-' + options.internalid).removeClass("input-red");
				line.set('quantity', options.quantity);

				$line = this.$('#' + options.internalid);

				this.model.updateLine(line)
					.success(_.bind(this.showContent, this))
					.error(
							function (jqXhr)
							{
								jqXhr.preventDefault = true;
								var result = JSON.parse(jqXhr.responseText);

								self.showError(result.errorMessage, $line, result.errorDetails);
							}
					)
.					always(
							function()
							{
								if (self.model.get('lines').length==0) {
									window.location=self.model.get('touchpoints').viewcart 
								} 
							}
					);
			}
		}
	}
	//minicart actions
	,	removeItem: function (e)
	{
var self = this;
		this.model.removeLine(this.model.get('lines').get(jQuery(e.target).data('internalid')))
		.success(_.bind(this.showContent, this))
.always(function(){if(self.model.get('lines').length==0){window.location=self.model.get('touchpoints').viewcart } });
		
	}
	,optin:function(e){
		console.log("optin");
		var self=this,
		d=jQuery(e.target);
		if(d.prop("checked")){
			self.wizard.options.profile.attributes.emailsubscribe="T";
		}
		else{
			self.wizard.options.profile.attributes.emailsubscribe="F";
		}
	}

	,	destroy: function ()
		{
			var layout = this.options.application.getLayout();
			// The step could've resetted the header, we now put it back
			if (layout.originalHeader)
			{
				layout.$('#site-header').html(layout.originalHeader);
			}

			this._destroy();
		}

	,	submitStep: function(e) { //only for Order Place button in the Order Summary
		//console.log('lalala');
		//if(this.currentStep.wizard.currentStep==='billing'){
			//console.log('lalala2');
			//this.wizard.model.submit();
			var step = this.currentStep;
			this.wizard.application.trackEvent({category: "Custom Checkout", action: step.continueButtonLabel, label:step.stepGroup.name });
			jQuery.Deferred().reject({
			errorCode: 'ERR_CHK_INCOMPLETE_ADDRESS'
		,	errorMessage: _('The address is incomplete').translate()
		});
			step.submit(e);

		//}
			//var step = this.currentStep;
			//step.submit(e);
		}

	,	showTerms: TermsAndConditions.prototype.showTerms //only for "Show terms and cond" in the Order Summary
	});
});
// Profile.js
// -----------------
// Defines the Profile module (Collection, Views, Router)
// As the profile is instanciated in the application (without definining a model) 
// the validation is configured here in the mountToApp
define('Profile', ['User.Model'], function (UserModel) {
	
	'use strict';
	
	return	{
		mountToApp: function (application)
		{
			application.UserModel = UserModel.extend({
				urlRoot: 'services/profile.ss'
			});
			
			if (application.getConfig('siteSettings.registration.companyfieldmandatory') !== 'T')
			{
				delete application.UserModel.prototype.validation.companyname;
			}
		}
	};
});

// SiteSearch.js
// -------------
// Defines listeners and methods for the Global Site Search (macro siteSearch.txt)
// Uses Bootstrap's Typeahead plugin
// http://twitter.github.com/bootstrap/javascript.html#typeahead
define('SiteSearch', ['Facets.Translator', 'Facets.Model'], function (Translator, Model)
{
	'use strict';
	// This object's methods are ment to be added to the layout
	var SiteSearch = {
	
		// method call on submit of the Search form
		searchEventHandler: function (e)
		{
			e.preventDefault();
			this.search(jQuery(e.target).find('input').val());
			// on any type of search, the search term is removed from the global input box
			this.$search.find('input').val('');
		}

	,	seeAllEventHandler: function (e, typeahead)
		{
			this.search(typeahead.query);
		}

	,	focusEventHandler: function ()
		{
			this.$search.find('input').typeahead('lookup');
		}
		 
		//SiteSearch.formatKeywords() - format a search query string according to configuration.js (searchPrefs)
	,	formatKeywords: function(app, keywords)
		{
			var keywordFormatter = app.getConfig('searchPrefs.keywordsFormatter'); 
			if (keywordFormatter && _.isFunction(keywordFormatter))
			{
				keywords = keywordFormatter(keywords); 
				var maxLength = app.getConfig('searchPrefs.maxLength') || 99999; 
				if (keywords.length > maxLength)
				{
					keywords = keywords.substring(0, maxLength); 
				}
			}
			return keywords; 
		}

	,	search: function (keywords)
		{
			var currentView = this.currentView;
			
			keywords = SiteSearch.formatKeywords(this.getApplication(), keywords); 

			if (this.getApplication().getConfig('isSearchGlobal') || !(currentView && currentView.options.translator instanceof Translator))
			{
				var search_url = this.getApplication().getConfig('defaultSearchUrl');
				//If we are not in Shopping we have to redirect to it
				if (this.getApplication().getConfig('currentTouchpoint') !== 'home')
				{
					window.location.href = this.application.getConfig('siteSettings.touchpoints.home') + '#' + search_url + '?keywords=' + keywords;
				}
				//Else we stay in the same app
				else
				{
					// We navigate to the default search url passing the keywords
					Backbone.history.navigate(search_url +'?keywords='+ keywords, {trigger: true});
				}

			}
			// if search is not global and we are on the Browse Facet View
			// we might want to use the search to narrow the current list of items
			else
			{
				Backbone.history.navigate(currentView.options.translator.cloneForOption('keywords', keywords).getUrl(), {trigger: true});
			}
		}

	,	processAnchorTags: function (e, typeahead)
		{
			var $anchor, value, item, path
			,	search_url = this.getApplication().getConfig('defaultSearchUrl');

			typeahead.$menu.find('a').each(function (index, anchor)
			{

				$anchor = jQuery(anchor);
				value = $anchor.parent().data('value');
				item = typeahead.results[value];
				path = item ? item.get('_url') : search_url +'?keywords='+ value.replace('see-all-', '');

				$anchor
					.attr({
						'href': path
					,	'data-touchpoint': 'home'
					,	'data-hashtag': '#'+ path
					}).data({
						touchpoint: 'home'
					,	hashtag: '#'+ path
					});
			});

			typeahead.$menu.off('click');
		}
		// typeaheadConfg:
		// methods to customize the user experience of the typeahead
		// http://twitter.github.com/bootstrap/javascript.html#typeahead
		// (important to read the source code of the plugin to fully understand)
	,	typeaheadConfg: {
			// source:
			// trims de query
			// adds the 'see-all' label
			// fetches the data from the model
			// and pre-process it
			source: function (query, process)
			{
				var self = this;
				self.ajaxDone = false;

				this.model = this.model || this.options.model;
				this.labels = this.labels || this.options.labels;
				this.results = this.results || this.options.results;
				this.application = this.application || this.options.application;

				query = SiteSearch.formatKeywords(this.application, jQuery.trim(query)); 

				// if the character length from the query is over the min length
				if (query.length >= this.options.minLength)
				{
					this.labels = ['see-all-'+ query];
					process(this.labels);
				}

				// silent = true makes it invisible to any listener that is waiting for the data to load
				// http://backbonejs.org/#Model-fetch
				// We can use jQuery's .done, as the fetch method returns a promise
				// http://api.jquery.com/deferred.done/
				this.model.fetch(
					{
						data: {q: query}
					,	killerId: _.uniqueId('ajax_killer_')
					}
				,	{
						silent: true
					}
				).done(function ()
				{
					self.ajaxDone = true;
					self.results = {};
					self.labels = ['see-all-'+ query];

					self.model.get('items').each(function (item)
					{
						// In some ocations the search term meay not be in the itemid
						self.results[item.get('_id') + query] = item;
						self.labels.push(item.get('_id') + query);
					});
					
					process(self.labels);
					self.$element.trigger('processed', self);
				});
			}

			// matcher:
			// Method used to match the query within a text
			// we lowercase and trim to be safe
			// returns 0 only if the text doesn't contains the query
		,	matcher: function (text)
			{
				return ~text.indexOf(SiteSearch.formatKeywords(this.application, jQuery.trim(this.query)));
			}

			// highlighter:
			// method to generate the html used in the dropdown box bellow the search input
		,	highlighter: function (itemid)
			{
				var template = ''
				,	macro = this.options.macro
				,	item = this.results[itemid];

				if (item)
				{
					// if we have macro, and the macro exists, we use that for the html
					// otherwise we just highlith the keyword in the item id
					// _.highlightKeyword is in file Utils.js
					template = macro && SC.macros[macro] ? SC.macros[macro](item, this.query, this.application) : _.highlightKeyword(itemid, this.query);
				}
				else
				{
					if (_.size(this.results))
					{
						// 'See All Results' label
						template = '<strong>'+ this.options.seeAllLabel +'<span class="hide">'+ this.query +'</span></strong>';
					}
					else if(this.ajaxDone)
					{
						template = '<strong>'+ this.options.noResultsLabel +'<span class="hide">'+ this.query +'</span></strong>';	
					}
					else
					{							
						template = '<strong>'+ this.options.searchingLabel +'<span class="hide">'+ this.query +'</span></strong>';	
					}
				}

				return template;
			}
			
			// its supposed to return the selected item
		,	updater: function (itemid)
			{
				// But we are going to use it to trigger the click event 
				
				// We find the 'a' element that the user is selecting
				var a = this.$menu.find('li[data-value=' + itemid + '] a');
				
				// and then we trigger the events so the navigation helper takes care of it
				a.trigger('mousedown');
				a.trigger('mouseup');
				a.trigger('click');
				
				// on any type of search, the search term is removed from the global input box
				return '';
			}
			
		,	labels: []
		,	results: {}
		,	model: new Model()
		,	seeAllLabel: _('See all results').translate()
		,	noResultsLabel: _('No results').translate()
		,	searchingLabel: _('Searching...').translate()
		}
	};
	
	return {

		SiteSearch: SiteSearch

	,	mountToApp: function (application)
		{
			var Layout = application.getLayout();
			// we add the methods to the layout
			_.extend(Layout, SiteSearch);
			// then we extend the key elements
			_.extend(Layout.key_elements, {search: '#site-search-container'});
			// and then the event listeners
			_.extend(Layout.events, {
				'submit #site-search-container form': 'searchEventHandler'
			,	'focus #site-search-container input': 'focusEventHandler'
			,	'seeAll #site-search-container input': 'seeAllEventHandler'
			,	'processed #site-search-container input': 'processAnchorTags'
			});
			
			// We extend the previously defined typeaheadConfg
			// with options from the configuration file
			SiteSearch.typeaheadConfg = _.extend(SiteSearch.typeaheadConfg, {
				application: application
			,	minLength: application.getConfig('typeahead.minLength')
			,	items: application.getConfig('typeahead.maxResults') + 1
			,	macro: application.getConfig('typeahead.macro')
			});
			
			Layout.on('afterRender', function ()
			{
				// after the layout has be rendered, we initialize the plugin
				Layout.$search.find('input').typeahead(SiteSearch.typeaheadConfg);
			});
		}
	};
});

// UrlHelper.js
// ------------
// Keeps track of the URL, triggering custom events to specific parameters
// Provides moethods to add, get and remove parameters from the url
// Extends SC.Utils and add this methods to underscore
define('UrlHelper', function ()
{
	'use strict';
	
	var UrlHelper = {

		url : ''
	,	listeners : {}
	,	parameters : {}

	,	setUrl: function (url)
		{
			var self = this;

			this.url = url;
			this.parameters = {};

			// for each of the listeners
			_.each(this.listeners, function(fn, token)
			{
				var parameter_value = self.getParameterValue(token);

				// if the key (token) is in the url
				if (parameter_value)
				{
					// we trigger the function
					var value = _.isFunction(fn) ? fn(parameter_value) : fn;

					// if there is a value, we store it in our parameters object
					if (value)
					{
						if (_.isBoolean(value))
						{
							self.parameters[token] = parameter_value;
						}
						else
						{
							self.parameters[token] = value;
						}
					}
				}
			});
		}

	,	addTokenListener: function (token, fn)
		{
			this.listeners[token] = fn;
		}

	,	getParameters: function ()
		{
			return this.parameters;
		}

	,	getParameterValue: function (parameter)
		{
			var value = this.url.match(parameter +'{1}\\={1}(.*?[^&#]*)');
			
			if (value && value[1])
			{
				return value[1];
			}
			else
			{
				return '';
			}
		}

	,	clearValues: function ()
		{
			this.url = '';
			this.listeners = {};
			this.parameters = {};
		}
	};

	function fixUrl (url)
	{
		if (!new RegExp('^http').test(url))
		{
			var parameters = UrlHelper.getParameters()
			,	charValue = ''
			,	value = '';

			// for each of the parameters in the helper
			_.each(parameters, function (i, parameter)
			{
				value = url.match(new RegExp(parameter +'{1}\\={1}(.*?[^&]*)'));

				// if the parameter is not in the url
				if (!value)
				{
					charValue = ~url.indexOf('?') ? '&' : '?';
					// we append it
					url += charValue + parameter +'='+ parameters[parameter];
				}
			});
		}

		return url;
	}

	// changes the value of a parameter in the url
	function setUrlParameter(url, parameter, new_value)
	{
		var value = url.match(new RegExp(parameter + '{1}\\={1}(.*?[^(&|#)]*)'))
		,	charValue = '';

		if (value)
		{
			return url.replace(value[0], parameter +'='+ new_value);
		}
		else
		{
			charValue = ~url.indexOf('?') ? '&' : '?';

			return url + charValue + parameter +'='+  new_value;
		}
	}

	function removeUrlParameter(url, parameter)
	{
		var value = url.match(new RegExp('(\\?|&)' + parameter + '{1}\\={1}(.*?[^(&|#)]*)'));

		if (value)
		{
			if (~value[0].indexOf('?') && ~url.indexOf('&'))
			{
				return url.replace(value[0] +'&', '?');
			}
			else
			{
				return url.replace(value[0], '');
			}
		}
		else
		{
			return url;
		}
	}

	_.extend(SC.Utils, {
		fixUrl: fixUrl
	,	setUrlParameter: setUrlParameter
	,	removeUrlParameter: removeUrlParameter
	});

	// http://underscorejs.org/#mixin
	_.mixin(SC.Utils);
	
	return _.extend(UrlHelper, {

		mountToApp: function (Application)
		{
			var self = this;

			Application.getLayout().on('afterAppendView', function ()
			{
				// Every time afterAppendView is called, we set the url to the helper
				self.setUrl(window.location.href);
			});
		}
	});
});
define('User.Model',['Address.Collection','CreditCard.Collection'], function (AddressCollection, CreditCardsCollection)
{
	'use strict';
	return Backbone.Model.extend({
	
		validation: {
			firstname: { required: true, msg: _('First Name is required').translate() }
			
			// This code is commented temporally, because of the inconsistences between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
		,	lastname: { required: true, msg: _('Last Name is required').translate() }
			
		,	email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		,	phone: { required: true, fn: _.validatePhone }

		,	companyname:  { required: true, msg: _('Company Name is required').translate() }

			// if the user wants to change its email we need ask for confirmation and current password.
			// We leave this validation in this model, instead of creating a new one like UpdatePassword, because
			// the email is updated in the same window than the rest of the attributes
		,	confirm_email: function (confirm_email, attr, form)
			{
				if (jQuery.trim(form.email) !== this.attributes.email && jQuery.trim(confirm_email) !== jQuery.trim(form.email))
				{
					return _('Emails do not match match').translate();
				}
			}
		,	current_password: function (current_password, attr, form)
			{
				if (jQuery.trim(form.email) !== this.attributes.email &&
					(_.isNull(current_password) || _.isUndefined(current_password) || (_.isString(current_password) && jQuery.trim(current_password) === '')))
				{
					return _('Current password is required').translate();
				}
			}
		}

	,	initialize: function (attributes)
		{
			this.on('change:addresses', function (model, addresses)
			{
				model.set('addresses', new AddressCollection(addresses), {silent: true});
				this.get('addresses').on('change:defaultshipping change:defaultbilling add destroy reset', this.checkDefaultsAddresses, this);
			});

			this.on('change:creditcards', function (model, creditcards)
			{
				model.set('creditcards', new CreditCardsCollection(creditcards), {silent: true});
				this.get('creditcards').on('change:ccdefault add destroy reset', this.checkDefaultsCreditCard, this);
			});
			this.on('change:lastname', function (model)
			{
				model.validation.lastname = { required: true, msg: _('Last Name is required').translate() };
			});			
			this.on('change:phone', function (model)
			{
				model.validation.phone = { required: true, fn: _.validatePhone };
			});

			this.set('addresses', attributes && attributes.addresses || new AddressCollection());
			this.set('creditcards', attributes && attributes.creditcards || new CreditCardsCollection());
		}

	,	checkDefaultsAddresses: function(model) 
		{
			//TODO: improve this algorithm
			var	addresses = this.get('addresses')
			,	Model = addresses.model;
			
			if (model instanceof Model)
			{
				// if the created/modified address is set as default for shipping we set every other one as not default
				if (model.get('defaultshipping') === 'T')
				{
					_.each(addresses.where({defaultshipping: 'T'}), function (address)
					{
						if (model !== address) {
							address.set({defaultshipping: 'F'}, {silent: true});
						}
					});
				}

				// if the created/modified address is set as default for billing we set every other one as not default
				if (model.get('defaultbilling') === 'T')
				{
					_.each(addresses.where({defaultbilling: 'T'}), function (address)
					{
						if ( model !== address)
						{
							address.set({ defaultbilling: 'F' }, { silent: true });
						}
					});
				}
			}

			// set the default addresses in the collection as the profile's default cards
			var default_shipping = addresses.find(function (model)
				{
					return model.get('defaultshipping') === 'T';
				})

			,	default_billing = addresses.find(function (model)
				{
					return model.get('defaultbilling') === 'T';
				});

			this.set('defaultBillingAddress', default_billing || new Model({ defaultshipping: 'T' }) )
				.set('defaultShippingAddress', default_shipping || new Model({ defaultbilling: 'T' }) );
		}

	,	checkDefaultsCreditCard: function (model)
		{
			
			//TODO: improve this algorithm
			var	creditcards = this.get('creditcards')
			,	Model = creditcards.model;

			// if the created/modified card is set as default we set every other card as not default
			if (model.get('ccdefault') === 'T')
			{
				_.each(creditcards.where({ccdefault: 'T'}), function (creditCard)
				{
					if (creditCard && model !== creditCard)
					{
						creditCard.set({ccdefault: 'F'}, {silent: true});
					}
				});
			}

			var default_creditcard = creditcards.find(function (model) {
				return model.get('ccdefault') === 'T';
			});

			// set the default card in the collection as the profile's default card
			this.set('defaultCreditCard', default_creditcard || new Model({ccdefault: 'T'}));
		}
	});
});
// Wizard.js
// ---------
// Index of the wizard module, provides access to all of its components
define('Wizard', ['Wizard.Module', 'Wizard.Router', 'Wizard.Step', 'Wizard.StepGroup', 'Wizard.View'], function (Module, Router, Step, StepGroup, View)
{
	'use strict';
	
	return {
		Module: Module
	,	Router: Router
	,	Step: Step
	,	StepGroup: StepGroup
	,	View: View
	};
});
// Wizard.Module.js
// ----------------
// Abstract Representation of a Wizard Module
define('Wizard.Module', function ()
{
	'use strict';

	return Backbone.View.extend({
		
		tagName: 'article'
	
	,	template: 'wizard_module'

	,	errors: []

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.step = options.step;
			this.model = options.wizard.model;
			
			// errors array in the configuration file completely overrides the default one.
			if (options.errors)
			{
				this.errors = options.errors;
			}
		}

	,	_render: function ()
		{
			this.$el.addClass('module-rendered');
			var ret = Backbone.View.prototype._render.apply(this, arguments);

			// add the error message box to the module
			if (!this.$('[data-type="alert-placeholder-module"]').length)
			{
				this.$el.prepend('<div data-type="alert-placeholder-module"></div>');
			}

			// we show module errors (if any) and remove the error object
			if (this.error)
			{
				this.showError();
			}

			// We trigger the resize event of the body as the dom is changed
			// and some components might be positioned based on the body size
			jQuery(document.body).trigger('resize');

			return ret;
		}

		// by default, a module returns it's validation promise
	,	submit: function ()
		{
			return this.isValid();
		}

	,	cancel: function ()
		{
			return jQuery.Deferred().resolve();
		}

		// validate resolves a promise because maybe it needs to do some ajax for validation
	,	isValid: function () 
		{
			return jQuery.Deferred().resolve();
		}

		// returns the title of the module, can be overriden in the configuration file
	,	getTitle: function ()
		{
			return this.options.title || this.title || '';
		}

	,	manageError: function (error)
		{
			if (this.state !== 'future')
			{
				this.error = error;
				this.trigger('error', error);

				// if the module is being shown we show the error
				if (this.wizard.getCurrentStep() === this.step)
				{
					this.showError();
				}
			}
		}

		// render the error message
	,	showError: function ()
		{
			this.wizard.application.trackEvent({category: "Custom Checkout Errors", action: "Step Error", label:this.error.errorMessage });
			if(this.error.errorMessage == "Security Number is required"){
				jQuery("#cvc-error").html(SC.macros.message(this.error.errorMessage, 'error', true));
$('.credit-card-security-number').parent().parent().css("border","red 1px solid").css("width","300px");
			}else{
			//Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder. 
			this.$('[data-type="alert-placeholder-module"]:first').html( 
				SC.macros.message(this.error.errorMessage, 'error', true) 
			);
			}
			this.error = null;
		}

		// empty the error message container
	,	clearError: function ()
		{
			this.$('[data-type="alert-placeholder-module"]').empty();
			this.error = null;
		}

	,	setEnable: function (enabled)
		{				
			if (enabled)
			{
				this.delegateEvents();
			}
			else
			{
				this.undelegateEvents();
			}
		}
	});
});
// Wizard.Router.js
// ----------------
// Main component of the wizard, controls routes, the step flow, and to show each step
define('Wizard.Router', ['Wizard.View', 'Wizard.Step', 'Wizard.StepGroup'], function (View, Step, StepGroup)
{
	'use strict';

	return Backbone.Router.extend({

		step: Step

	,	view: View

	,	stepGroup: StepGroup

		// router.initialize
		// -----------------
		// Initializes internals and loads configuration
	,	initialize: function(application, options)
		{
			this.application = application;
			this.steps = {};
			this.stepsOrder = [];
			this.stepGroups = {};
			this.handledErrors = [];

			this.options = options;
			

			if (options && options.model)
			{
				this.model = options.model;
			}

			if (options && options.steps)
			{
				this.compileConfiguration(options.steps);
			}

			// remove duplicates from the handledErrors array
			this.handledErrors = _.uniq(this.handledErrors);
		}

		// router.compileConfiguration
		// ---------------------------
		// Instanciates all the Steps and StepGroups based on the configuration
		// The Expected configuration is as follows
		/* jsHint :(
		[
			{
				name: "Step Group"
			,	steps: [
					{
						name: "Step"
					,	url: "step-url"
					,	modules: [
							'Module.Name'
						]
					}
				]
			}
		]
		*/
		// This is an Array of Step Groups (Name nad Steps), 
		// where Steps is an Array of Steps (Name, Url, Modules), 
		// where Modules is an Array of Strings that will be required()
	,	compileConfiguration: function(step_groups)
		{
			var self = this;
			// Iterates all the steos
			_.each(step_groups, function(step_group)
			{
				if (step_group.steps)
				{
					// Instaciates the StepGroup
					var step_group_instance = new self.stepGroup(step_group.name, step_group.steps[0].url);
					self.stepGroups[step_group.name] = step_group_instance;

					// Iterates the step of the step group
					_.each(step_group.steps, function(step)
					{
						// Extends the base class with your configuration
						var StepClass = self.step.extend(step);

						// Initializes it 
						self.steps[step.url] = new StepClass({
							wizard: self
						,	stepGroup: step_group_instance

						});

						// add the step to the stepgroup
						step_group_instance.steps.push(self.steps[step.url]);

						// sets it in an orderled group 
						self.stepsOrder.push(step.url);

						// Routes it
						self.route(step.url, 'runStep');
						self.route(step.url + '?:options', 'runStep');
					});
				}
			});
		}

		// route.getCurrentStep
		// ------------------
		// return the current step object
	,	getCurrentStep: function()
		{
			return this.steps[this.currentStep]; 
		}
		
		// route.goToNextStep
		// ------------------
		// Well... finds the next steps and navigates to it 
	,	goToNextStep: function()
		{
			var next_step_url = this.getNextStepUrl();
			console.log(next_step_url);
			if (next_step_url)
			{
				this.navigate(next_step_url, {trigger: true});	
			}
		}

	,	getNextStepUrl: function()
		{
			var index = _.indexOf(this.stepsOrder, this.currentStep);
			if (~index && index + 1 < this.stepsOrder.length)
			{
				return this.stepsOrder[index + 1];
			}
		}

		// route.goToPreviousStep
		// ----------------------
		// Same as before but goes the other way
	,	goToPreviousStep: function()
		{
			var previous_step_url = _.addParamsToUrl(this.getPreviousStepUrl(), {force: true});
			if (previous_step_url)
			{
				this.navigate(previous_step_url, {trigger: true});	
			}
		}

	,	getPreviousStepUrl: function()
		{
			var index = _.indexOf(this.stepsOrder, this.currentStep);
			if (index > 0)
			{
				return this.stepsOrder[index - 1];
			}
			var next_step_url = this.navigate(next_step_url, {trigger: true});
		}

		// route.getStepPosition
		// ---------------------
		// Retuns the distance of the current step from the start and to the end
		// If you are in the 2nd step of a 5 steps wizard it will return:
		// { fromBegining: 1, toLast: 3 }
	,	getStepPosition: function(url)
		{
			var index = _.indexOf(this.stepsOrder, url || this.currentStep);
			return {
				fromBegining: index
			,	toLast: this.stepsOrder.length - index - 1
			};
		}


		// route.runStep
		// -------------
		// Executes the current step:
		// Calls the status methods of the steps (past, present, future)
		// Ands Render the Frame view.
	,	runStep: function()
		{
			var url = Backbone.history.fragment
			,	self = this;

			// We allow urls to have options but they are still identified by the original string, 
			// so we need to thake them out if present 
			url = url.split('?')[0];
			

			if (this.steps[url])
			{
				// We keep a reference to the current step url here
				this.currentStep = url;

				// Iterates all the steps and calls the status methods
				var method_to_call = 'past'
				,	current_group;
				_.each(this.stepsOrder, function(step)
				{
					if (step === url)
					{
						self.steps[step].present();
						self.steps[step].state = 'present';
						self.steps[step].stepGroup.state = 'present';
						self.steps[step].tellModules('present');
						method_to_call = 'future';
						current_group = self.steps[step].stepGroup;
					}
					else
					{
						self.steps[step].tellModules(method_to_call);
						self.steps[step][method_to_call]();
						self.steps[step].state = method_to_call;

						// if the step is contained in the current_group we don't change the group state
						if (self.steps[step].stepGroup !== current_group)
						{
							self.steps[step].stepGroup.state = method_to_call;	
						} 
					}
				});

				// Creates an instance of the frame view and pass the current step
				var view = new this.view({
					model: this.model
				,	wizard: this
				,	currentStep: this.steps[url]
				,	application: this.application
				});

				view.showContent();
			}
		}

	// central hub for managing errors, the errors should be in the format:
	// {errorCode:'ERR_WS_SOME_ERROR', errorMessage:'Some message'}
	// the method also receives the step in case that the error is not handled by any module
	,	manageError: function(error,step)
		{
			if (_.isObject(error) && error.responseText)
			{
				error = JSON.parse(error.responseText);
			}
			else if (_.isString(error) || _.isNumber(error))
			{
				error = {errorCode:'ERR_WS_UNHANDLED_ERROR', errorMessage: error};
			}
			else if (!_.isObject(error))
			{
				return;
				//hide generic error, if no object. Try not to throw eerors without objects.
				//error = {errorCode:'ERR_WS_UNHANDLED_ERROR', errorMessage:_('An error has ocurred').translate()};
				//error = {errorCode:'ERR_WS_UNHANDLED_ERROR'};
			}
			
			if (~_.indexOf(this.handledErrors, error.errorCode))
			{
				this.trigger(error.errorCode, error);
			}
			else
			{
				// if the error is not handled but we receive a step we delegate the error to it
				if (step )
				{
					step.moduleError(null, error);
				}
				else
				{
					// if no one is listening for this error, we show the message on the current step
					this.getCurrentStep().$('[data-type="alert-placeholder-step"]').html( 
						SC.macros.message( error.errorMessage, 'error', true ) 
					);
				}
			}
		}
	});
});

// Wizard.Step.js
// --------------
// Step View, Renders all the components of the Step
define('Wizard.Step', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'wizard_step'

	,	events: {
			'click [data-action="previous-step"]': 'previousStep'
		,	'click [data-action="submit-step"]': 'submit'
		}
	
		// default label for the "continue" button, this is overridden in the configuration file
	,	continueButtonLabel: _('Continue').translate() 

		// by defaul the back button is shown, this is overridden in the configuration file
	,	hideBackButton: false 

	,	bottomMessage: null
	
		// Will be extended with the modules to be instanciated
	,	modules: []

		// step.initialize
		// initializes some variables and Instanciates all the modules
	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.stepGroup = options.stepGroup;
			this.moduleInstances = [];

			// This is used to know when to execute the eventns
			this.renderPromise = jQuery.Deferred().resolve();

			var self = this;

			_.each(this.modules, function (module)
			{
				var module_options = {};

				if (_.isArray(module))
				{
					module_options = module[1];
					module = module[0];
				}
				// Requires the module
				var ModuleClass = require(module);

				var module_instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self
				,	stepGroup: self.stepGroup
				//	set the classname of the module to the module's name
				,	className: 'orderwizard-module ' + module.replace(/\./g,'-').toLowerCase()
				}, module_options));

				// add listeners to some events available to the modules
				module_instance.on({
					ready: function (is_ready)
					{
						self.moduleReady(this, is_ready);
					}
				,	navbar_toggle: function (toggle)
					{
						self.moduleNavbarToggle(this, toggle);
					}
				,	change_label_continue: function (label)
					{
						self.changeLabelContinue(label);
					}
				,	error: function (error)
					{
						self.moduleError(this, error);
					}
				});

				// attach wizard events to error handling
				_.each(module_instance.errors, function (errorId)
				{
					self.wizard.handledErrors.push(errorId);

					self.wizard.on(errorId, function (error)
					{
						module_instance.manageError(error);
					});
				});

				if (module_instance.modules)
				{
					_.each(module_instance.modules, function (submodule)
					{
						_.each(submodule.instance.errors, function (errorId)
						{
							self.wizard.handledErrors.push(errorId);

							self.wizard.on(errorId, function (error)
							{
								submodule.instance.manageError(error);
							});
						});
					});
				}
			
				// ModuleClass is expected to be a View
				self.moduleInstances.push(module_instance);
			});
		}
		// when a module is ready triggers this
		// if all the modules in the step are ready, and the advance conditions are met, the step submits itself
	,	moduleReady: function(module, ready)
		{
			var self = this;
			// submit the step if changed the state of isReady and step is in the present.
			if (module.isReady !== ready)
			{	
				module.isReady = ready;

				this.renderPromise.done(function() 
				{
					if (self.stepAdvance() && self.state === 'present')
					{
						self.submit();
					}
				});
			}	
		}
		
	,	moduleError: function (module, error)
		{
			// if the error doesnt come from a module, and this step is being shown, display the error
			if (!module && this.state !== 'future')
			{
				this.error = error;
				if (this === this.wizard.getCurrentStep())
				{
					this.showError();
				}
			}
		}

	,	hasErrors: function ()
		{
			return this.error || _.some(this.moduleInstances, function (module)
			{
				return module.error;
			});
		}

	,	showError: function ()
		{
			if (this.error)
			{
				this.$('[data-type="alert-placeholder-step"]').html( 
					SC.macros.message(this.error.errorMessage, 'error', true ) 
				);
				this.error = null;
			}	
		}

		// auxiliar function to determine if we have to advante to the next step, see below
	,	stepAdvance: function ()
		{
			var ready_state_array = _(this.moduleInstances).chain().pluck('isReady').uniq().value()
			,	url_options = _.parseUrlOptions(Backbone.history.location.hash);
			
			return !url_options.force && ready_state_array.length === 1 && ready_state_array[0] === true;
		}

		// when a module doesn't need the navigation bar triggers this
		// if no modules in the step needs it, the step hide the navigation buttons
	,	moduleNavbarToggle: function (module, toggle)
		{
			var self = this;
			this.renderPromise.done(function () 
			{
				module.navigationToggle = toggle;

				var toggle_state_array = _(self.moduleInstances).chain().pluck('navigationToggle').uniq().value();

				if (toggle_state_array.length === 1 && toggle_state_array[0] === false)
				{
					self.$('.step-navigation-buttons').hide();
				}
				else
				{
					self.$('.step-navigation-buttons').show();
				}
			});
		}

		// communicate the status of the step to it's modules (past, present, future)
	,	tellModules: function (what)
		{
			_.each(this.moduleInstances, function (module_instance)
			{
				_.isFunction(module_instance[what]) && module_instance[what]();
				module_instance.state = what;
			});
		}

		// step.past
		// ---------
		// Will be called ever time a step is going to be renderd 
		// and this step is previous in the step order
	,	past: function () 
		{
			this.validate();
		}

		// step.present
		// ------------
		// Will be called ever time a step is going to be renderd 
		// and this is the step
	,	present: jQuery.noop

		// step.future
		// -----------
		// Will be called ever time a step is going to be renderd 
		// and this step is next in the step order
	,	future: function ()
		{
			// cleanup future errors
			this.error = null;
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.error = null;
			});
		}

		// step.render
		// -----------
		// overrides the render function to not only render itself 
		// but also call the render function of its modules
	,	render: function ()
		{
			var self = this
			,	position = this.wizard.getStepPosition();

			this.renderPromise = jQuery.Deferred();

			this.currentModelState = JSON.stringify(this.wizard.model);

			// ***** WARNING *****
			// Please do NOT take this as a reference
			// we are using it only as a last resort
			// to show/hide some elements on the last
			// page of the checkout process
			this.$el.attr({
				'data-from-begining': position.fromBegining
			,	'data-to-last': position.toLast
			});

			// Renders itself
			this._render();
			var content_element = this.$('#wizard-step-content');
			
			// Empties the modules container
			content_element.empty();

			// Then Renders the all the modules and append them into the container
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.isReady = false;
				module_instance.render();
				content_element.append(module_instance.$el);
			});

			this.wizard.application.getLayout().once('afterAppendView', function ()
			{
				self.renderPromise.resolve();
			});

			this.showError();

			return this;
		}

		// step.previousStep
		// -----------------
		// Goes to the previous step.
		// Calls the cancel of each module 
		// and asks the wizard to go to the previous step
	,	previousStep: function (e)
		{
			// Disables the navigation Buttons
			e && this.disableNavButtons();
			
			// Calls the submite method of the modules and collects errors they may have
			var promises = [];
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.cancel()
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).then(
				// Success Callback
				function ()
				{
					// Makes the wizard gon to the previous step
					self.wizard.goToPreviousStep();
				}
				// Error Callback
			,	function (error)
				{
					if (error)
					{
						self.wizard.manageError(error, self);
						e && self.enableNavButtons();
					}
				}
			);
		}

		// step.submit
		// -----------
		// Calls the submit method of each module 
		// cals our save function 
		// and asks the wizard to go to the next step
	,	submit: function (e)
		{
			console.log('dadada');
			// Disables the navigation Buttons
			e && this.disableNavButtons();

			// Calls the submite method of the modules and collects errors they may have
			var promises = [];
			
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.submit(e)
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).then(
				// Success Callback
				function ()
				{
					self.save().then(
						// if everything goes well we go to the next step
						function ()
						{
							self.wizard.goToNextStep();
						}
						// Other ways we re render showing errors
					,	function (error)
						{
							self.wizard.manageError(error,self);
							e && self.enableNavButtons();
						}
					).always(function ()
					{
						self.enableNavButtons();
					});
				}
				// Error Callback
			,	function (error)
				{
					self.wizard.manageError(error,self);
					e && self.enableNavButtons();
				}
			);
		}

		// Change the label of the 'continue' button
	,	changeLabelContinue: function (label)
		{	
			var self = this;

			if (this.renderPromise.state() !== 'resolved')
			{
				this.renderPromise.done(function ()
				{
					self.wizard.application.getLayout().$('[data-action="submit-step"]').html(label || self.continueButtonLabel);
				});
			}
			else
			{
				this.wizard.application.getLayout().$('[data-action="submit-step"]').html(label || this.continueButtonLabel);
			}

			this.changedContinueButtonLabel = label || this.continueButtonLabel;
		}

		// step.save
		// ---------
		// If there is a model calls the save function of it.
		// other ways it returns a resolved promise, to return something standard
	,	_save: function ()
		{
			if (this.wizard.model && this.currentModelState !== JSON.stringify(this.wizard.model))
			{
				return this.wizard.model.save().error(function (jqXhr)
				{
					jqXhr.preventDefault = true;
				});
			}
			else
			{
				return jQuery.Deferred().resolveWith(this);
			}
		}

	,	save: function ()
		{
			return this._save();
		}	

		// calls validation on all modules and call the error manager
	,	validate: function () 
		{
			var promises = [];
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.isValid()
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).fail(
				// Error Callback
				function (error)
				{
					self.wizard.manageError(error,self);
				}
			);
		}

		// step.disableNavButtons
		// ----------------------
		// Disables the navigation buttons
		// TODO: implement overlay to block navigation.
	,	disableNavButtons: function ()
		{
			this.wizard.application.getLayout().$('[data-action="previous-step"], [data-action="submit-step"], [data-touchpoint]').attr('disabled', true);	

			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.setEnable(false);
			});	
		}

	,	enableNavButtons: function ()
		{
			this.wizard.application.getLayout().$('[data-action="previous-step"], [data-action="submit-step"], [data-touchpoint]').attr('disabled', false);

			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.setEnable(true);
			});
		}

	,	getName: function ()
		{
			return this.name;
		}
	});
});
// Wizard.StepGroup.js
// --------------
// Utility Class to represent a Step Group 
define('Wizard.StepGroup', function ()
{
	'use strict';

	function StepGroup(name, url)
	{
		this.name = name;
		this.url = '/' + url;

		// collection of steps
		this.steps = [];

		this.hasErrors = function ()
		{
			return _.some(this.steps, function (step)
			{
				return step.hasErrors();
			});
		};
	}

	return StepGroup;
});
// Wizard.View.js
// --------------
// Frame component, Renders the steps
define('Wizard.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'wizard'

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.currentStep = options.currentStep;
		}

	,	render: function ()
		{
			// Renders itself
			this._render();

			// Then Renders the current Step 
			this.currentStep.render();
			
			// Then adds the step in the #wizard-content element of self 
			this.$('#wizard-content').empty().append(this.currentStep.$el);

			// initializes tooltips.
			// TODO: NOT NECESARY WITH LATEST VERSION OF BOOTSTRAP
			this.$('[data-toggle="tooltip"]').tooltip({html: true});
		}
		
		// we're handling error messages on each step so we disable the global ErrorManagment
	,	showError: function(message)
		{
			this.wizard.manageError(message);
		}

	});
});



