;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory)
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory()
    } else {
        // Window
        root.Dragify = factory()
    }
}(this, function () {
    var Watcher = function () {
        this.events = {}
    }

    Watcher.prototype = {
        construct: Watcher,

        on: function (type, fn) {
            this._getEventInfo(type).push(fn)

            return this
        },

        trigger: function (type) {
            var event  = this._getEventInfo(type)
            var params = Array.prototype.slice.call(arguments, 1)

            event.forEach(function (fn) {
                fn.apply(fn, params)
            })

            return this
        },

        _getEventInfo: function (type) {
            if (!this.events[type]) this.events[type] = []

            return this.events[type]
        },

        remove: function (type, fn) {
            var event = this._getEventInfo(type)

            if (!fn) {
                this.events[type] = []
            } else {
                event.splice(event.indexOf(fn), 1)
            }

            return this
        }
    }

    /**
     * 让元素可拖动
     * @param elem 拖动元素
     */
    function Class(elem) {
        this.$elem   = elem
        this.watcher = new Watcher()
        this.init()
    }

    Class.prototype = {
        constructor: Class,

        init: function () {
            var that = this

            that.$elem.addEventListener(EVENTS[0], function (e) {
                var eInfo        = that._getEventInfo(e)
                var $parent      = that.$elem.offsetParent
                var diffX        = eInfo.clientX - that.$elem.offsetLeft
                var diffY        = eInfo.clientY - that.$elem.offsetTop
                var pDiffX       = $parent.offsetLeft || 0
                var pDiffY       = $parent.offsetTop || 0
                var windowWidth  = document.documentElement.clientWidth
                var windowHeight = document.documentElement.clientHeight
                var elemWidth    = that.$elem.offsetWidth
                var elemHeight   = that.$elem.offsetHeight
                var style        = getComputedStyle(that.$elem)
                var transition   = style['transition'] || style['-webkit-transition'] || style['-moz-transition']
                var zIndex       = getComputedStyle(that.$elem).zIndex

                that.watcher.trigger('start', that.$elem)
                document.addEventListener(EVENTS[1], move)
                function move(e) {
                    var eInfo = that._getEventInfo(e)
                    var left  = eInfo.clientX - diffX
                    var top   = eInfo.clientY - diffY

                    if (left + pDiffX < 0) left = left - (left + pDiffX)
                    if (top + pDiffY < 0) top = top - (top + pDiffY)
                    if (left + pDiffX + elemWidth > windowWidth) left = windowWidth - (pDiffX + elemWidth)
                    if (top + pDiffY + elemHeight > windowHeight) top = windowHeight - (pDiffY + elemHeight)

                    that.$elem.style.position      = 'absolute'
                    that.$elem.style['transition'] = that.$elem.style['-webkit-transition'] = that.$elem.style['-moz-transition'] = 'unset'
                    that.$elem.style.left   = left + 'px'
                    that.$elem.style.top    = top + 'px'
                    that.$elem.style.zIndex = 19911125

                    that.watcher.trigger('move', that.$elem)
                }

                document.addEventListener(EVENTS[2], end)
                function end(e) {
                    document.removeEventListener(EVENTS[1], move)
                    document.removeEventListener(EVENTS[2], end)
                    that.$elem.style['transition'] = that.$elem.style['-webkit-transition'] = that.$elem.style['-moz-transition'] = transition
                    that.$elem.style.zIndex = zIndex

                    that.watcher.trigger('end', that.$elem)
                }
            })
        },

        on: function () {
            this.watcher.on.apply(this.watcher, arguments)

            return this.watcher
        },

        _getEventInfo: function (e) {
            return Class.isTouch() ? e.targetTouches[0] : e
        }
    }

    Class.isTouch = function (e) {
        return 'ontouchstart' in window ||
            window.DocumentTouch && document instanceof window.DocumentTouch ||
            navigator.maxTouchPoints > 0 ||
            window.navigator.msMaxTouchPoints > 0
    }

    var EVENTS = Class.isTouch()
        ? ["touchstart", "touchmove", "touchend"]
        : ["mousedown", "mousemove", "mouseup"]

    return Class
}))