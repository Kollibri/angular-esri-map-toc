(function(angular) {
    'use strict';
    angular.module('esri.map.toc', [])
        .directive('esriToc', ['$document', '$q', '$compile', '$http', function($document, $q, $compile, $http) {
            return {
                restrict: 'E',
                //scope: {},
                replace: true,
                link: function(scope, element, attrs) {
                    var tocDeferred = $q.defer();
                    //tree id
                    var treeId = attrs.treeId;


                    scope.buildTOC = function(layerInfos) {
                        var layer = {};
                        scope.tocArray = [];
                        scope.tocArray.loaded = false;

                        // IF ALL LAYERS ARE IN LAYERINFOS, THEN SET LOADED PROPERTY TO TRUE
                        var layerElements = $document[0].getElementsByTagName('esri-dynamic-map-service-layer');
                        if (layerElements.length === layerInfos.length) {
                            angular.forEach(layerInfos, function(parentValue, parentKey) {
                                var legendDeferred = $q.defer();
                                var layersDeferred = $q.defer();
                                var layerUrl = layerInfos[parentKey].layer.url;
                                legendDeferred = $http.get(layerUrl + '/legend?f=pjson');
                                layersDeferred = $http.get(layerUrl + '?f=pjson');
                                $q.all([legendDeferred, layersDeferred]).then(function(response) {
                                    var legendResponse = response[0];
                                    var layerResponse = response[1];

                                    var layerList = layerResponse.data;
                                    var legendList = legendResponse.data;
                                    var tocLayers = layerElements[parentKey].attributes['toc-Layers'].nodeValue;
                                    var visibleLayers = layerElements[parentKey].attributes['visible-Layers'].nodeValue;
                                    var mapServiceLayerId = layerInfos[parentKey].layer.id;
                                    scope.mergedLists = [];
                                    var parentCounter = 0;
                                    angular.forEach(layerList.layers, function(value, key) {
                                        // IF LAYER EXISTS IN tocLayers, THEN ADD TO TOC
                                        if (tocLayers.indexOf(value.id) !== -1) {
                                            layer = {};
                                            layer.collapsed = true;
                                            // IF LAYER EXISTS IN visibleLayers THEN CHECK IT
                                            layer.checked = (visibleLayers.indexOf(value.id) !== -1);
                                            // IF CHECKED, CHECK PARENT(S)
                                            if (layer.checked) {
                                                scope.checkParents(value);
                                            }

                                            layer.layerId = value.id;
                                            layer.mapServiceLayerId = mapServiceLayerId;
                                            layer.layerName = value.name;
                                            layer.subLayerIds = value.subLayerIds;
                                            layer.parentLayerId = value.parentLayerId;
                                            if (!angular.isObject(layer.subLayerIds)) {
                                                layer.legend = legendList.layers[key - parentCounter].legend;
                                            } else {
                                                parentCounter++;
                                            }

                                            scope.mergedLists.push(layer);
                                        }
                                    });

                                    var rootLayer = {};
                                    rootLayer.layerId = -1;
                                    rootLayer.checked = true;
                                    rootLayer.collapsed = true;
                                    rootLayer.layerName = layerInfos[parentKey].title;
                                    rootLayer.mapServiceLayerId = mapServiceLayerId;
                                    var tocLayer = {};
                                    tocLayer = scope.buildTreeforTOC(rootLayer);
                                    scope.tocArray.push(tocLayer);
                                    scope.tocArray.loaded = true;

                                });
                            });
                        }
                    };

                    scope.checkParents = function(childLayer) {
                        angular.forEach(scope.mergedLists, function(value) {
                            if (value.layerId === childLayer.parentLayerId) {
                                value.checked = true;
                                scope.checkParents(value);
                            }
                        });
                    };

                    scope.buildTreeforTOC = function(parentLayer) {
                        angular.forEach(scope.mergedLists, function(value) {
                            if (value.parentLayerId === parentLayer.layerId) {
                                var childLayer = value;
                                if (parentLayer.subLayers) {
                                    parentLayer.subLayers.push(childLayer);
                                } else {
                                    parentLayer.subLayers = [childLayer];
                                }
                                if (childLayer.subLayerIds !== null) {
                                    scope.buildTreeforTOC(childLayer);
                                }
                            }
                        });
                        if (parentLayer.layerId === -1) {
                            //scope.toc = parentLayer;
                            return parentLayer;
                        }
                    };



                    scope.refreshTOC = function(treeModel) {
                        var mapId = attrs.mapId;
                        //tree model
                        if (angular.isDefined(attrs.treeModel)) {
                            treeModel = attrs.treeModel;
                        }
                        //tree template
                        var template =
                            '<p ng-show="!tocArray.loaded">Loading...</p>' +
                            '<ul>' +
                            '<li ng-repeat="parentNode in ' + treeModel + '">' +
                            '<div ng-if="parentNode.subLayers && parentNode.layerId == -1">' +
                            '<input type="checkbox" ng-click="' + treeId + '.toggleParentCheckbox(parentNode)" checked="true" value="-1">' +
                            '<i class="glyphicon glyphicon-plus" ng-show="parentNode.collapsed" ng-click="' + treeId + '.selectNodeHead(parentNode)"></i>' +
                            '<i class="glyphicon glyphicon-minus" ng-show="!parentNode.collapsed" ng-click="' + treeId + '.selectNodeHead(parentNode)"></i>' +
                            '<label>{{parentNode.layerName}}</label>' +
                            '</div>' +
                            '<ul ng-hide="parentNode.collapsed">' +
                            '<li data-ng-repeat="node in parentNode.subLayers">' +
                            '<input type="checkbox" ng-click="' + treeId + '.toggleNodeCheckbox(node);" ng-checked="{{node.checked}}" value="{{node.layerId}}">' +
                            '<i class="glyphicon glyphicon-plus" ng-show="(node.subLayers.length || node.legend.length > 1) && node.collapsed" ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                            '<i class="glyphicon glyphicon-minus" ng-show="(node.subLayers.length || node.legend.length > 1) && !node.collapsed" ng-click="' + treeId + '.selectNodeHead(node)"></i>' +

                            '<label ng-if="!node.legend">' +
                            '{{node.layerName}}</label>' +

                            '<label ng-if="node.legend.length == 1">' +
                            '<img src="data:{{node.legend[0].contentType}};base64,{{node.legend[0].imageData}}"/>' +
                            '{{node.layerName}}</label>' +

                            '<label ng-if="node.legend.length > 1">{{node.layerName}}</label>' +
                            '<ul ng-hide="node.collapsed" ng-if="node.legend.length > 1">' +
                            '<li ng-repeat="legendNode in node.legend">' +
                            '<img src="data:{{legendNode.contentType}};base64,{{legendNode.imageData}}"/>' +
                            '<span>{{(legendNode.label != "") ? legendNode.label : node.layerName }}</span>' +
                            '</li>' +
                            '</ul>' +
                            '<esri-toc ng-hide="node.collapsed"' +
                            'tree-id="' + treeId + '"' +
                            'map-id="' + mapId + '"' +
                            'tree-model="[node]">' +
                            '</esri-toc>' +
                            '</li>' +
                            '</ul>' +
                            '</li>' +
                            '</ul>';

                        //check tree id, tree model
                        if (treeId && treeModel) {

                            //root node
                            if (attrs.rootNode) {
                                var mapController = angular.element($document[0].getElementById(mapId)).controller('esriMap');


                                //create tree object if not exists
                                scope[treeId] = scope[treeId] || {};

                                //if node head clicks,
                                scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function(selectedNode) {

                                    //Collapse or Expand
                                    selectedNode.collapsed = !selectedNode.collapsed;
                                };

                                //if node label clicks,
                                scope[treeId].toggleNodeCheckbox = scope[treeId].toggleNodeCheckbox || function(selectedNode) {

                                    mapController.getMap().then(function(map) {
                                        angular.forEach(map.layerIds, function(layerId) {

                                            var currentVisibleLayers = [];
                                            var layersToToggle = [];
                                            var returnValue = [];
                                            if ((map.basemapLayerIds.indexOf(layerId) === -1) && layerId === selectedNode.mapServiceLayerId) {
                                                var currentLayer = map.getLayer(layerId);

                                                currentVisibleLayers = currentLayer.visibleLayers.map(function(item) {

                                                    return parseInt(item, 10);

                                                });


                                                selectedNode.checked = !selectedNode.checked;
                                                layersToToggle = scope[treeId].getLeafSubLayers(selectedNode, returnValue);


                                                angular.forEach(layersToToggle, function(layer) {
                                                    var indexOfMatchingLayer = currentVisibleLayers.indexOf(layer.layerId);
                                                    if (indexOfMatchingLayer !== -1) {
                                                        currentVisibleLayers.splice(indexOfMatchingLayer, 1);
                                                        //When removing child layer, remove group layer.
                                                        if (currentLayer.layerInfos[indexOfMatchingLayer].parentLayerId !== -1)
                                                        {
                                                            currentVisibleLayers.splice(currentLayer.layerInfos[indexOfMatchingLayer].parentLayerId, 1);
                                                        }
                                                    } else {
                                                        if (!layer.isParent && selectedNode.checked && layer.checked && layer.parentsChecked) {
                                                            currentVisibleLayers.push(layer.layerId);
                                                        }
                                                    }


                                                });

                                                if (currentVisibleLayers.length === 0) {
                                                    currentVisibleLayers.push(-1);
                                                }
                                                console.log('currentVisibleLayers:' + currentVisibleLayers);
                                                currentLayer.setVisibleLayers(currentVisibleLayers);

                                            }
                                        });

                                    });


                                };



                                scope[treeId].getLeafSubLayers = function(node, returnValue) {

                                    var o = {};
                                    o.layerId = node.layerId;
                                    o.checked = node.checked;
                                    o.isParent = angular.isDefined(node.subLayers);
                                    o.parentsChecked = scope[treeId].areAllParentsChecked(node);
                                    returnValue.push(o);
                                    angular.forEach(node.subLayers, function(value) {
                                        scope[treeId].getLeafSubLayers(value, returnValue);
                                    });
                                    return returnValue;

                                };

                                scope[treeId].areAllParentsChecked = function(node) {
                                    var layersArray = scope[treeId].flattenToc(scope.tocArray[0].subLayers, []);

                                    var parentsArray = [];
                                    parentsArray = scope[treeId].getParents(layersArray, node, parentsArray);

                                    var returnValue = true;

                                    angular.forEach(parentsArray, function(value) {
                                        returnValue = returnValue && value.checked;
                                    });
                                    return returnValue;

                                };

                                scope[treeId].flattenToc = function(layers, returnValue) {
                                  angular.forEach(layers, function(value) {
                                    returnValue.push(value);
                                    scope[treeId].flattenToc(value.subLayers, returnValue);
                                  });
                                  return returnValue;
                                };

                                scope[treeId].getParents = function(layerArray, node, returnValue) {

                                    angular.forEach(layerArray, function(value) {
                                        if (value.mapServiceLayerId === node.mapServiceLayerId && value.layerId === node.parentLayerId) {
                                            returnValue.push(value);
                                            if (angular.isDefined(value.subLayers)) {
                                                returnValue = scope[treeId].getParents(layerArray, value, returnValue);
                                            }
                                        }

                                    });

                                    return returnValue;
                                };

                                //if parent node label clicks,
                                scope[treeId].toggleParentCheckbox = scope[treeId].toggleParentCheckbox || function(selectedNode) {

                                    mapController.getMap().then(function(map) {
                                        angular.forEach(map.layerIds, function(layerId) {
                                            // DON'T PUT BASEMAPS INTO TOC
                                            if (map.basemapLayerIds !== layerId && layerId === selectedNode.mapServiceLayerId) {
                                                var currentLayer = map.getLayer(layerId);
                                                currentLayer.setVisibility(!currentLayer.visible);
                                            }
                                        });

                                    });


                                };


                                var targetId = attrs.targetId;
                                angular.element($document[0].getElementById(targetId)).html('').append($compile(template)(scope));
                            } else {
                                //Rendering template.
                                element.html('').append($compile(template)(scope));
                            }

                        }
                    };

                    if (angular.isDefined(attrs.mapId) && angular.isDefined(attrs.rootNode)) {
                        var mapId = attrs.mapId;
                        var mapController = angular.element($document[0].getElementById(mapId)).controller('esriMap');
                        scope.$watchCollection(function() {
                            return mapController.getLayerInfos();
                        }, function(newValue, oldValue, watchScope) {
                            scope.layerInfos = newValue;
                            if (angular.isDefined(scope.layerInfos)) {
                                scope.buildTOC(scope.layerInfos);
                                scope.refreshTOC('tocArray');
                                tocDeferred.resolve();
                            }
                        });
                    } else {
                        scope.refreshTOC();
                    }








                }

            };
        }]);
})(angular);
