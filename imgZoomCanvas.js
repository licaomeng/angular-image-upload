/**
 * Created by Caomeng Li on 8/23/2016.
 */
angular.module('appModule')
    .factory('imgZoomCanvas', [function () {

        //singleton
        var INSTANCE = null;

        var getInstance = function (options) {
            return INSTANCE || ( INSTANCE = new CanvasZoom(options) );
        }

        var destroyInstance = function () {
            if (INSTANCE) {
                INSTANCE = null;
            }
        }

        var stopAnimate = function () {
            return INSTANCE ? INSTANCE.stopAnimate() : null;
        }

        var onZoom = function (zoom) {
            return INSTANCE ? INSTANCE.doZoom(zoom) : null;
        }

        var CanvasZoom = function (options) {
            if (!options || !options.canvas) {
                throw 'CanvasZoom constructor: missing arguments canvas';
            }
            if (!options.image) {
                throw 'CanvasZoom constructor: missing arguments image';
            }

            this.canvas = options.canvas;
            this.image = options.image;
            this.currentAnimationId = 0;
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.context = this.canvas.getContext('2d');

            this.lastX = 0;
            this.lastY = 0;

            this.position = {
                x: 0,
                y: 0
            };

            this.initPosition = {
                x: 0,
                y: 0
            }

            this.scale = {
                x: 1,
                y: 1
            };

            this.initScale = {
                x: 1,
                y: 1
            };

            this.init = false;

            this.checkRequestAnimationFrame();
            this.currentAnimationId = requestAnimationFrame(this.animate.bind(this));

            this.setEventListeners();
        }

        CanvasZoom.prototype = {
            stopAnimate: function () {
                cancelAnimationFrame(this.currentAnimationId);
            },

            animate: function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                var imgWidth = this.image.width,
                    imgHeight = this.image.height;
                if (!this.init) {
                    if (imgWidth > imgHeight) {
                        this.scale.x = this.scale.y = this.canvas.height / imgHeight;
                    } else {
                        this.scale.x = this.scale.y = this.canvas.width / imgWidth;
                    }
                    this.initScale.x = this.scale.x;
                    this.initScale.y = this.scale.y;
                }
                var currentWidth = (this.image.width * this.scale.x);
                var currentHeight = (this.image.height * this.scale.y);

                if (!this.init) {
                    if (imgWidth > imgHeight) {
                        this.position.x = (currentWidth - this.canvas.width) / 2;
                        this.position.x = this.position.x > 0 ? -this.position.x : this.position.x;
                    } else {
                        this.position.y = (currentHeight - this.canvas.height) / 2;
                        this.position.y = this.position.y > 0 ? -this.position.y : this.position.y;
                    }
                    this.initPosition.x = this.position.x;
                    this.initPosition.y = this.position.y
                    this.init = true;
                }

                this.context.drawImage(this.image, this.position.x, this.position.y, currentWidth, currentHeight);
                this.currentAnimationId = requestAnimationFrame(this.animate.bind(this));
            },

            doZoom: function (zoom) {
                if (!zoom) return;

                //new scale
                var currentScale = this.scale.x;
                var newScale = this.scale.x + zoom * this.scale.x / 100;

                //some helpers
                var deltaScale = newScale - currentScale;
                var currentWidth = (this.image.width * this.scale.x);
                var currentHeight = (this.image.height * this.scale.y);
                var deltaWidth = this.image.width * deltaScale;
                var deltaHeight = this.image.height * deltaScale;

                //by default scale doesnt change position and only add/remove pixel to right and bottom
                //so we must move the image to the left to keep the image centered
                //ex: coefX and coefY = 0.5 when image is centered <=> move image to the left 0.5x pixels added to the right
                var canvasmiddleX = this.canvas.clientWidth / 2;
                var canvasmiddleY = this.canvas.clientHeight / 2;
                var xonmap = (-this.position.x) + canvasmiddleX;
                var yonmap = (-this.position.y) + canvasmiddleY;
                var coefX = -xonmap / (currentWidth);
                var coefY = -yonmap / (currentHeight);
                var newPosX = this.position.x + deltaWidth * coefX;
                var newPosY = this.position.y + deltaHeight * coefY;

                //edges cases
                var newWidth = currentWidth + deltaWidth;
                var newHeight = currentHeight + deltaHeight;

                if (newPosX > 0) {
                    newPosX = 0;
                }
                if (newPosX + newWidth < this.canvas.clientWidth) {
                    newPosX = this.canvas.clientWidth - newWidth;
                }

                if (newHeight < this.canvas.clientHeight) return;
                if (newPosY > 0) {
                    newPosY = 0;
                }
                if (newPosY + newHeight < this.canvas.clientHeight) {
                    newPosY = this.canvas.clientHeight - newHeight;
                }

                //finally affectations
                this.scale.x = newScale;
                this.scale.y = newScale;
                this.position.x = newPosX;
                this.position.y = newPosY;

                //edge cases
                if (this.scale.x < this.initScale.x) {
                    this.scale.x = this.initScale.x;
                    this.scale.y = this.initScale.x;
                    this.position.x = this.initPosition.x;
                    this.position.y = this.initPosition.y;
                }
            },

            doMove: function (relativeX, relativeY) {
                if (this.lastX && this.lastY) {

                    console.log('relativeX', relativeX);
                    console.log('relativeY', relativeY);

                    console.log('this.lastX', this.lastX);
                    console.log('this.lastY', this.lastY);

                    var deltaX = relativeX - this.lastX;
                    var deltaY = relativeY - this.lastY;
                    console.log('deltaX', deltaX);
                    console.log('deltaY', deltaY);

                    var currentWidth = (this.image.width * this.scale.x);
                    var currentHeight = (this.image.height * this.scale.y);

                    this.position.x += deltaX;
                    this.position.y += deltaY;
                    console.log('this.position.x', this.position.x);
                    console.log('this.position.y', this.position.y);

                    // edge cases
                    if (this.position.x >= 0) {
                        this.position.x = 0;
                    } else if (this.position.x < 0 && this.position.x + currentWidth < this.canvas.width) {
                        this.position.x = this.canvas.width - Math.round(currentWidth);
                    }

                    if (this.position.y >= 0) {
                        this.position.y = 0;
                    } else if (this.position.y < 0 && this.position.y + currentHeight < this.canvas.height) {
                        this.position.y = this.canvas.height - Math.round(currentHeight);
                    }
                }
                this.lastX = relativeX;
                this.lastY = relativeY;
            },

            setEventListeners: function () {
                this.canvas.addEventListener('mousedown', function (e) {
                    this.mdown = true;
                    this.lastX = 0;
                    this.lastY = 0;
                }.bind(this));

                this.canvas.addEventListener('mouseup', function (e) {
                    this.mdown = false;
                }.bind(this));

                this.canvas.addEventListener('mousemove', function (e) {
                    var relativeX = e.pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.pageY - this.canvas.getBoundingClientRect().top;

                    if (e.target == this.canvas && this.mdown) {
                        this.doMove(relativeX, relativeY);
                    }

                    if (relativeX <= 0 || relativeX >= this.canvas.clientWidth || relativeY <= 0 || relativeY >= this.canvas.clientHeight) {
                        this.mdown = false;
                    }
                }.bind(this));
            },

            checkRequestAnimationFrame: function () {
                var lastTime = 0;
                var vendors = ['ms', 'moz', 'webkit', 'o'];
                for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                        || window[vendors[x] + 'CancelRequestAnimationFrame'];
                }

                if (!window.requestAnimationFrame) {
                    window.requestAnimationFrame = function (callback, element) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = window.setTimeout(function () {
                            callback(currTime + timeToCall);
                        }, timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };
                }

                if (!window.cancelAnimationFrame) {
                    window.cancelAnimationFrame = function (id) {
                        clearTimeout(id);
                    };
                }
            }
        }
        return {
            getInstance: getInstance,
            destroyInstance: destroyInstance,
            stopAnimate: stopAnimate,
            onZoom: onZoom
        };
    }]);