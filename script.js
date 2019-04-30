
var map, infowindow, coords, markers = [], service, request, circles = [];

// types of places that user can find
var types = ['airport','atm','bank','cafe','doctor','fire_station','gym','hospital','restaurant','school','shopping_mall','train_station','university'];


function initMap() {
    var html = '';

    $.each(types, function(index,val) {
        html += '<input type="radio" name="optradio" value="' + val + '">' + val + '</input> <br>'; 
    })

    $('#type-opt').html(html);

    var options = {
        zoom: 15,
        center: { lat: 28.644800, lng: 77.216721}
    }
    
    circles = [];
    markers = [];
    
    map = new google.maps.Map(document.getElementById('map'), options);

}

// set marker on user's current position
function setLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            coords = { lat: position.coords.latitude, lng: position.coords.longitude }

            deleteMarkers();

            // var options = {
            //     zoom: 14,
            //     center: coords
            // }

            // map = new google.maps.Map(document.getElementById('map'), options);
            map.setCenter(coords);

            // Adding marker to my current place

            var CenterMarker = new google.maps.Marker({
                draggable: true,
                position: coords,
                map: map,
                icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            });

            markers.push(CenterMarker);
            
            // update the lattitude and longitude of user loaction when the marker position is changed
            google.maps.event.addListener(CenterMarker, 'dragend', function (evt) {
                coords = {lat: this.getPosition().lat(), lng: this.getPosition().lng()};
                // map.setCenter(coords);
            });

        })
    }
}



function getResult() { 
    // gets the user defined type
    var selectedType = $('input[name="optradio"]:checked').val();

    // get the user defined radius
    var radius = $("#inp-radius").val(); 
    // radius = Math.min(radius,20000);'
    radius = Number(radius);

    
    addCircle(radius);
    
    // place information that we want to find
    request = {
        location: coords,
        radius: radius, // meter
        type: selectedType
    };

    infowindow = new google.maps.InfoWindow;

    service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, callback);

}


// Return result and status based on request data
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            addMarker(results[i]);
        }
    }
    else {
        alert("No Result Found.");
    }
}


function addCircle(radius) {
    // Check whether circle is already present or not
    var circleExist = 0;
    for(var i = 0; i < circles.length; i++) {
        if(circles[i].getCenter().lat().toFixed(6) === coords.lat.toFixed(6) && circles[i].getCenter().lng().toFixed(6) === coords.lng.toFixed(6) && circles[i].getRadius() === radius) {
            circleExist = 1;
            break;
        }
    }

    if(!circleExist) {
        // create a circle of given radius
        var circle = new google.maps.Circle({
            map: map,
            center: coords,
            radius: radius,
            fillColor: 'green',
            fillOpacity: 0.15,
            strokeColor: 'red',
            strokeOpacity: 0.1
        })
        circles.push(circle);
    }
}

// add markers in the map
function addMarker(place) {

    //Check whether the position is already marked or not
    var alreadyPresent = 0;
    for(var i = 0; i < markers.length; i++) {

        if(markers[i].getPosition().lat() === place.geometry.location.lat() && markers[i].getPosition().lng() === place.geometry.location.lng()) {
            alreadyPresent = 1;
            break;
        }
    }
    if(alreadyPresent)
        return;

    // add marker in the map
    var marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
    });
    google.maps.event.addListener(marker, 'click', function () {
        var content = "<h3>" + place.name + "</h3> <br>" + place.vicinity;
        infowindow.setContent(content);
        infowindow.open(map, this);
    });
    markers.push(marker);
}


// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}


$('#btn1').click(function () {
    setLocation();
});


$('#btn2').click(function () {
    getResult();
});


$('#btn3').click(function () {
    initMap();
});

