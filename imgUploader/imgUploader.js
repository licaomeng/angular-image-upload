/**
 * Created by Caomeng Li on 8/21/2016.
 */
angular.module("appModule")
    .directive("imgUploader", [function () {
        return {
            templateUrl: "./imgUploader/imgUploader.html",
            restrict: 'E',
            scope: {
                onUpload: '&',
                image: '=',
                isEditable: '='
            },

            link: function () {

            },
            controller: ['$scope', '$element', 'imgZoomCanvas', function ($scope, $element, imgZoomCanvas) {
                $scope.fileSelected = false;
                $scope.isEditable = false;
                $scope.isHasAvatar = false;
                var imageObj = new Image();

                $scope.deleteAvatar = function () {
                    if ($scope.isEditable) {
                        var cf = confirm("Are you sure to remove the avatar?");
                        if (cf) {
                            clearCanvas();
                            if ($scope.latestImage) {
                                loadCanvas($scope.latestImage, false);
                            } else {
                                loadCanvas('./image/default_avatar.png', false);
                            }
                            var node = nodeToString($("#container #file")[0]);
                            $("#container #file").remove();
                            $(node).change(fileChanged).appendTo($("#container"));
                            imgZoomCanvas.stopAnimate();
                            imgZoomCanvas.destroyInstance();
                            $scope.fileSelected = false;
                            // $scope.$apply();
                        }
                    } else {
                        $scope.onUpload({image: '', isDelete: true, isHasAvatar: $scope.isHasAvatar});
                        imgZoomCanvas.stopAnimate();
                        imgZoomCanvas.destroyInstance();
                    }
                    $scope.isEditable = false;
                }

                $scope.uploadAvatar = function () {
                    var file = document.getElementById('file').files[0];
                    if (file) {
                        var canvas = document.getElementById('myCanvas');
                        $scope.onUpload({image: canvas.toDataURL('png'), isDelete: false, isHasAvatar: $scope.isHasAvatar});
                    } else {
                        alert("Please add avatar first!");
                    }
                }

                $scope.zoomOut = function () {
                    imgZoomCanvas.onZoom(-5);
                }

                $scope.zoomIn = function () {
                    imgZoomCanvas.onZoom(5);
                }

                function loadCanvas(dataURL, isEditable) {
                    var canvas = document.getElementById('myCanvas');
                    var context = canvas.getContext('2d');

                    var canvasWidth = canvas.width,
                        canvasHeight = canvas.height,
                        scale = 1,
                        offsetX = 0,
                        offsetY = 0;

                    imageObj.src = dataURL;

                    imageObj.onload = function () {
                        if ($scope.isEditable) {
                            imgZoomCanvas.destroyInstance();
                            imgZoomCanvas.getInstance({
                                canvas: document.getElementById('myCanvas'),
                                image: imageObj
                            });
                        } else {
                            var imgWidth = imageObj.width,
                                imgHeight = imageObj.height,
                                currentImgWidth = imageObj.width,
                                currentImgHeight = imageObj.height;

                            if (imgWidth > imgHeight) {
                                scale = canvas.width / imgWidth;
                            } else {
                                scale = canvas.height / imgHeight;
                            }
                            currentImgWidth = imgWidth * scale;
                            currentImgHeight = imgHeight * scale;
                            if (imgWidth > imgHeight) {
                                offsetY = (canvasHeight - currentImgHeight) / 2;
                            } else {
                                offsetX = (canvasWidth - currentImgWidth) / 2;
                            }
                            context.drawImage(this, offsetX, offsetY, currentImgWidth, currentImgHeight);
                        }
                    };
                }

                function clearCanvas() {
                    var canvas = document.getElementById('myCanvas');
                    var context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }

                $scope.$watch(function () {
                    return $scope.image;
                }, function (newVal, oldVal) {
                    $scope.latestImage = newVal;
                    $scope.fileSelected = false;
                    if (newVal == undefined || newVal == '') {
                        $scope.isHasAvatar = false;
                        loadCanvas('./image/default_avatar.png', false);
                    } else {
                        $scope.isHasAvatar = true;
                        loadCanvas(newVal, false);
                    }
                }, true)

                function nodeToString(node) {
                    console.log(node);
                    var tmpNode = document.createElement("div");
                    tmpNode.appendChild(node.cloneNode(true));
                    var str = tmpNode.innerHTML;
                    tmpNode = node = null; // prevent memory leaks in IE
                    return str;
                }

                function fileChanged() {
                    var file = document.getElementById('file').files[0];
                    if (!/image\/\w+/.test(file.type)) {
                        clearCanvas();
                        loadCanvas('./image/default_avatar.png', false);
                        alert("Please make sure the file type is image!");
                        $(this).remove();
                        $(nodeToString(this)).change(fileChanged).appendTo($("#container"));
                    } else {
                        $scope.isEditable = true;
                        var URL = window.webkitURL || window.URL;
                        var url = URL.createObjectURL(file);
                        clearCanvas();
                        loadCanvas(url, $scope.isEditable);

                        $scope.fileSelected = true;
                        $scope.$apply();
                    }
                }

                console.log("$element: ", $element);

                loadCanvas('./image/default_avatar.png');
                $element.find('#container #file').change(fileChanged);

            }]
        }
    }])