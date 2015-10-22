# angular-esri-map-toc
A table of contents directive for use as a plugin to the [angular-esri-map](https://github.com/Esri/angular-esri-map) library.

To use this directive in your project, add it using bower:
```bash
# install via bower
bower install angular-esri-map-toc
```

Then include the module in your angular dependencies as ```esri.map.toc```

<<<<<<< HEAD
Example usage:

[Example](http://kollibri.github.io/angular-esri-map-toc/)
=======


Example:

![App](https://raw.github.com/Kollibri/angular-esri-map-toc/master/angular-esri-map-toc.png)

>>>>>>> origin/master

```html
<!DOCTYPE html>
<html ng-app="esri-map-example">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
    <title>TOC</title>

    <!-- load Esri CSS -->
    <link rel="stylesheet" type="text/css" href="http://js.arcgis.com/3.11/esri/css/esri.css">

    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

    <!-- load angular-esri-map-toc css -->
    <script src="bower_components/angular-esri-map-toc/angular-esri-map-toc.css"></script>
</head>

<body ng-controller="MapController">
    <h2>TOC</h2>
    <!-- add map to page and bind to scope map parameters -->
    <div class="container row">
        <div class="col-xs-9">
            <esri-map id="map" center="map.center" zoom="map.zoom" basemap="topo" style="width: 100%">
                <esri-dynamic-map-service-layer layer-options="{id: 'network'}" title="Network Analysis" url="http://sampleserver5.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/MapServer" visible="true" opacity="1.0" toc-layers="0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20" visible-layers="0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20" />
                <esri-toc tree-id="TOC1" map-id="map" target-id="toc" root-node="true">
                </esri-toc>
            </esri-map>
            <p>Lat: {{ map.center.lat | number:3 }}, Lng: {{ map.center.lng | number:3 }}, Zoom: {{map.zoom}}</p>
        </div>
        <div class="col-xs-3">
            <div id="toc" class="toc"></div>
        </div>
    </div>
    <!-- load Esri JavaScript API -->
    <script type="text/javascript" src="http://js.arcgis.com/3.11compact"></script>
    <!-- load Angular -->
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular.js"></script>
    <!-- load angular-esri-map directives -->
    <script src="bower_components/angular-esri-map/angular-esri-map.js"></script>
    <!-- load angular-esri-map-toc directive -->
    <script src="bower_components/angular-esri-map-toc/angular-esri-map-toc.js"></script>
    <!-- run example app controller -->
    <script type="text/javascript">
        angular.module('esri-map-example', ['esri.map', 'esri.map.toc'])
            .controller('MapController', function($scope) {
                $scope.map = {
                    center: {
                        lng: -117.039,
                        lat: 32.703
                    },
                    zoom:11
                };
            });
    </script>
</body>

</html>

```
