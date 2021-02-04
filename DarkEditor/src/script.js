const app = angular.module('app', ['ngRoute']);
const {remote} = require('electron');
const { dirname } = require('path');
const url = require('url');


app.service('image',function(){
    var imagePath = "";
    var dimesions = [];
    this.setImagePath = (path) => {
        imagePath = path;
    };
    this.getImagePath = () => {
        return imagePath;
    };
    this.setImageDimensions = function(imgDimesions) {
		dimesions = imgDimesions;
	};
	this.getImageDimensions = function() {
		return dimesions;
	};
});

app.config(function($routeProvider){
    $routeProvider.when('/',{
        templateUrl: `${__dirname}/components/home/home.html`,
        controller: 'homeCtrl'
    }).when('/edit',{
        templateUrl: `${__dirname}/components/editImage/editImage.html`,
        controller: 'editCtrl'
    }).otherwise({
        template: "404 Bro"
    });
});

app.controller('headCtrl', function($scope){
    const win = remote.getCurrentWindow();

    $scope.close = () => {
        win.close();
    };
    $scope.maximize = () => {
        win.isMaximized() ? win.unmaximize() : win.maximize();
    };
    $scope.minimize = () => {
        win.minimize();
    };
});

app.controller('homeCtrl', function($scope, $location, image){
    $scope.pickFile = () => {
        var {dialog} = remote;
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{
                name: "Images",
                extension: ['jpg', 'jpeg', 'png']
            }]
        }).then(result=> {
            if(!!result){
                var path = result.filePaths[0];
                image.setImagePath(path);
                var sizeof = require('image-size');
                var dimesions = sizeof(path); 
				image.setImageDimensions(dimesions);
                $location.path('/edit');
                $scope.$apply();
            }         
        });
    };
});

app.controller('editCtrl',function($scope, image, $location){
    $scope.ImagePath = image.getImagePath();
    $scope.controlsActive = false;
    var generatedStyles = "";
    var imageReference = document.getElementById('mainImage');

    $scope.effects = {
        'Brightness': {val: 100, min: 0, max:200, delim: '%'}, 
		'Contrast': {val: 100, min: 0, max:200, delim: '%'}, 
		'Invert': {val: 0, min: 0, max:100, delim: '%'}, 
		'Hue-Rotate': {val: 0, min: 0, max:360, delim: 'deg'}, 
		'Sepia': {val: 0, min: 0, max:100, delim: '%'}, 
		'Grayscale': {val: 0, min: 0, max:100, delim: '%'}, 
		'Saturate': {val: 100, min: 0, max:200, delim: '%'}, 
		'Blur': {val: 0, min: 0, max:5, delim: 'px'}
    };

    $scope.imageEffect = (effectName) => {
        $scope.controlsActive = true;
        $scope.activeEffect = effectName;
    };

    $scope.setEffect = (percentage) => {
        generatedStyles = "";
		for(let i in $scope.effects) {
			generatedStyles += `${i}(${$scope.effects[i].val+$scope.effects[i].delim}) `;
		}
		imageReference.style.filter = generatedStyles;

    };

    $scope.hideThis = () => {
        $scope.controlsActive = false;
    };

    $scope.change = function() {
		$location.path('/');
	}

	$scope.save = function() {
		
		const {BrowserWindow} = remote;
		var dimesions = image.getImageDimensions();
		let src = image.getImagePath();
        
		let styles = imageReference.style.filter;

		let win = new BrowserWindow({
			frame: false,
			show: true,
			width: dimesions.width,
			height: dimesions.height,
			webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                enableRemoteModule: true
			}
        });
                
		win.loadURL(`data:text/html,
			<style>*{margin:0;padding:0;}</style><img src="${src}" style="filter: ${styles}">
			
            <script>
            const {remote} = require('electron');
            remote.getCurrentWindow().capturePage(image => {

                fs.writeFile('./test.png', image.toPNG(), (err) => {
                    if (err) throw err;
                });
            });
			</script>
		
        `);
        

    };
    
    

});