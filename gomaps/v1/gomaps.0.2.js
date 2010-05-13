/*
----------------------------------------------
 GoMaps v.0.2
 Developed by Ollie Bettany / Twist Internet
 Created: 12/05/10
----------------------------------------------
*/		
		
		var marker;
		//var gmarkers=[]; 
		
		var baseIcon = new GIcon(G_DEFAULT_ICON);
		baseIcon.image = "../images/map-marker-orange.png";
		baseIcon.iconSize = new GSize(34, 33);
				
		var blueIcon = new GIcon(baseIcon);
		blueIcon.image = "../images/map-marker-blue.png";
				
		var yellowIcon = new GIcon(baseIcon);
		yellowIcon.image = "../images/map-marker-yellow.png";

		var mission_id = 0;
		
		var i = 0;
		
		
		function handleNoFlash(errorCode) {
      if (errorCode == FLASH_UNAVAILABLE) {
        alert("Error: Flash doesn't appear to be supported by your browser");
        return;
      }
    } 
    
		function initialize() {
			var map = new GMap2(document.getElementById("map_canvas"));
			map.setMapType(G_HYBRID_MAP);
			
			if (customControls != true) {
				map.addControl(new GLargeMapControl());
			} else {
				map.addControl(new TextualZoomControl());
			}
			map.addControl(new GMapTypeControl());
			
			map.setCenter(new GLatLng(mapLat, mapLng), mapZoom);
			
			if (streetviewEnabled == true) {
				var myPano = new GStreetviewPanorama(document.getElementById("pano"));
				GEvent.addListener(myPano, "error", handleNoFlash);  
				//svOverlay = new GStreetviewOverlay();
				//map.addOverlay(svOverlay);
				GEvent.addListener(map,"click", function(overlay,latlng) {
					myPano.setLocationAndPOV(latlng);
				});
			}
			
			//var maptips = new MapTips(map); // MapTips aqui!

			GEvent.addListener(map, "click", function(overlay, latlng) {
				if (latlng) {
					i++;
					
					markerOptions = { icon:blueIcon, draggable:true };
					marker = new GMarker(latlng, markerOptions);
					
					//alert(form_html);
					
					var html = "<div class='form'><input type='hidden' id='location' value='" + mapLocation + "' />" +
					 "<label for='name'>Name:</label><input type='text' id='name' value='New Marker' />" +
					 "<label for='type'>Content type:</label><select id='type'>";
					 
					if (agentId == 0) {
					 	html += "<option value='0' selected>THIS IS ME!</option>";
					}
					
					html += "<option value='1'>Text</option>" +
					 "<option value='2'>YouTube URL</option>" +
					 // "<option value='3'>Vimeo URL</option>" + 
					 "</select>" +
					 "<label for='markcontent'>Content:</label><input id='markcontent' value='Content here' />" +
					 "<label for='colour'>Colour:</label><select id='colour'>" +
					 "<option value='red' selected>Red</option>" +
					 "<option value='orange'>Orange</option>" +
					 "<option value='green'>Green</option>" +
					 "<option value='yellow'>Yellow</option>" +
					 "<option value='blue'>Blue</option>" +
					 "</select>" + 
					 // "<label for='loc'>Lat/Lng:</label><input type='text' id='loc' value='" + latlng.lat() + ", " + latlng.lng() + "' />" +
					 "<input type='button' class='submit' value='Save & Close' onclick='saveData(1)'/>" + 
					 "<input type='button' class='submit' value='Remove Marker' onclick='removeMarker()'/></div>";				 
					
					map.addOverlay(marker);
					marker.openInfoWindow(html);
					
					GEvent.addListener(marker, "click", function() {
						marker.openInfoWindow(html);
					});
				}
			});
			
			/*
			GEvent.addListener(gmarkers[marker], "click", function() {
				html = "Hello World";
				marker.openInfoWindow(html);
			});
			*/
			
			// arrays to hold copies of the markers and html used by the agents
			// because the function closure trick doesnt work there
			var agents_html = "";
			var gmarkers = [];
			var htmls = [];
			var i = 0;
 
			// A function to create the marker and set up the event window
			createMarker = function(id,point,name,html,colour) {
				var customIcon = new GIcon(baseIcon);
				
				if (id != agentId) {
					customIcon.image = "../images/map-marker-" + colour + ".png";
				} else {
					customIcon.image = "../images/map-marker-agent.png";
				}
				markerOptions = { icon:customIcon,title:name };
			
				var marker = new GMarker(point, markerOptions);
				GEvent.addListener(marker, "click", function() {
					marker.openInfoWindowHtml(html);
					if (streetviewEnabled == true) {
						myPano.setLocationAndPOV(point);
					}
				});
				// save the info we need to use later for the agents
				gmarkers[i] = marker;
				htmls[i] = html;
				// add a line to the agents html
				//agents_html += '<li><a href="javascript:myclick(' + i + ')">' + name + '<\/a><\/li>';
				agents_html += '<option value="' + i + '">' + name + '</option>';
				i++;
				return marker;
			}
			
			function createPolyline(id,points,colour,width,name,html) {
				//alert(points + ", " + name + ", " + html);
				
				var polyline = new GPolyline(points, colour, width)				
			
				GEvent.addListener(polyline, 'click', function() {
						//alert(html);
						displayCustomMessage(html, 1, id);					
				});
				
				GEvent.addListener(polyline, 'mouseover', function() {
						//alert(name);
						displayCustomMessage(name, 2, 0);
				});
				
				GEvent.addListener(polyline, 'mouseout', function() {
						//alert(name);
						displayCustomMessage('', 0, 0);
				});
				return polyline;
			}
			
			$().mousemove(function(e){
				 // e.pageX - gives you X position
				 // e.pageY - gives you Y position
				 $('#top').val(e.pageY);
				 $('#left').val(e.pageX);
			});

			function displayCustomMessage(content, type, id) {
				
				if (type != 0) {
					$('#polydesc').css('top', parseInt($('#top').val()) + 20);
					$('#polydesc').css('left', parseInt($('#left').val()));
					
					if (type == 1) {
						$('#polydesc').addClass('form');
						content += "<input type='hidden' id='mission_id' value='" + id + "' />" +
												"<input type='hidden' id='agent_id' value='" + agentId + "' />" +
												"<input type='button' class='join' value='Join this mission' onclick='saveData(2);' />";
					} else {
						$('#polydesc').addClass('tooltip');
					}
					$('#polydesc').html(content);
					$('#polydesc').show();
				} else {
					$('#polydesc').hide();
					$('#polydesc').removeClass('form');
					$('#polydesc').removeClass('tooltip');
				}
					
				//document.getElementById('ollietip').style.display = "block";
			}		

			
			// This function picks up the click and opens the corresponding info window
			myclick = function(i) {
				gmarkers[i].openInfoWindowHtml(htmls[i]);
				/*
				alert("Hello World");
				*/
			}
			 
			// ================================================================
			// === Define the function thats going to process the JSON file ===
			process_it = function(doc) {

				map.clearOverlays();
				
				// === Parse the JSON document === 
				var jsonData = eval('(' + doc + ')');
				
				// === Plot the markers ===
				
				for (var i=0; i<jsonData.markers.length; i++) {
					var point = new GLatLng(jsonData.markers[i].lat, jsonData.markers[i].lng);
					
					if (jsonData.markers[i].type == 1) {
						var html = '<div class="bubble"><h3>' + jsonData.markers[i].label + '</h3><p>' + jsonData.markers[i].html + '</p></div>';
					}
					if (jsonData.markers[i].type == 2) {
						var html = "<object width='480' height='385'>" +
						 "<param name='movie' value='http://www.youtube.com/v/" + jsonData.markers[i].html + "&hl=en_GB&fs=1&rel=0'></param>" +
						 "<param name='allowFullScreen' value='true'></param>" +
						 "<param name='allowscriptaccess' value='always'></param>" +
						 "<embed src='http://www.youtube.com/v/" + jsonData.markers[i].html + "&hl=en_GB&fs=1&rel=0' " +
						 "type='application/x-shockwave-flash' allowscriptaccess='always' " +
						 "allowfullscreen='true' width='200' height='160'></embed></object>";
					}
					
					var marker = createMarker(jsonData.markers[i].agent_id, point, jsonData.markers[i].label, html, jsonData.markers[i].colour);
					map.addOverlay(marker);
					//maptips.add_tooltip(marker, jsonData.markers[i].label); // MapTips aqui!
				}
 
				// put the assembled agents_html contents into the agents div
				document.getElementById("agent").innerHTML = '<option value="0">ALL AGENTS</option>' + agents_html;
 
				// === Plot the polylines ===

				for (var i=0; i<jsonData.lines.length; i++) {
					var skip_mission = false;
					
					if (mission_id != 0) {
						if (jsonData.lines[i].mission_id != mission_id) {
							skip_mission = true;
						}
					}
					if (skip_mission == false) {
						var points = [];
						for (var j=0; j<jsonData.lines[i].points.length; j++) {
							points[j] = new GLatLng(jsonData.lines[i].points[j].lat, jsonData.lines[i].points[j].lng);
						}
						
						var html = '<div class="bubble"><h3>' + jsonData.lines[i].label + '</h3><p>' + jsonData.lines[i].html + '</p></div>';						
						var polyline = createPolyline(jsonData.lines[i].mission_id, points, jsonData.lines[i].colour, jsonData.lines[i].width, jsonData.lines[i].label, html);
						map.addOverlay(polyline); 
						//maptips.add_tooltip(polyline, jsonData.lines[i].label); // MapTips aqui!
					}
				}
			}
			
			saveData = function(num) {
	
				if (num == 1) {
					var type = escape(document.getElementById("type").value);
					var name = escape(document.getElementById("name").value);
					var content = escape(document.getElementById("markcontent").value);
					var location = escape(document.getElementById("location").value);
					var latlng = marker.getLatLng();
					var lat = latlng.lat();
					var lng = latlng.lng();
					
					if (type == 0) {
						var colour = "user";
					} else {
						var colour = escape(document.getElementById("colour").value);
					}
		
					var url = "dbconnect.php?insert=agent&name=" + name + "&content=" + content +
										"&colour=" + colour + "&lat=" + lat + "&lng=" + lng + "&location=" + location +
										"&type=" + type;
					var message = "Location added."
				
				} else {
					
					var mission_id = escape(document.getElementById("mission_id").value);
					var agent_id = escape(document.getElementById("agent_id").value);
					
					var url = "dbconnect.php?insert=mission&mission=" + mission_id + "&agent=" + agent_id;
					var message = "You are now connected <br />to this mission";
				}
				
				GDownloadUrl(url, function(data, responseCode) {
					if (responseCode == 200 && data.length <= 1) {
						
						document.getElementById("message").innerHTML = message;
						if (num == 1) {
							marker.closeInfoWindow();
							map.removeOverlay(marker);						
							
							var point = new GLatLng(lat, lng);
							var html = '<div class="bubble"><h3>' + unescape(name) + '</h3><p>' + unescape(content) + '</p></div>';
							var new_marker = createMarker(0,point,name,html,colour);
							map.addOverlay(new_marker); 
						} else {
							
						}
					}
				});
			}
			
			// ================================================================
			// === Fetch the JSON data file ====    
			GDownloadUrl("json/vmap-map-loc" + mapLocation + ".json?" + datetime, process_it);
			// ================================================================
			
    }
		
		// A TextualZoomControl is a GControl that displays textual "Zoom In"
		// and "Zoom Out" buttons (as opposed to the iconic buttons used in
		// Google Maps).
		
		// We define the function first
		function TextualZoomControl() {
		}
		
		// To "subclass" the GControl, we set the prototype object to
		// an instance of the GControl object
		TextualZoomControl.prototype = new GControl();
		
		// Creates a one DIV for each of the buttons and places them in a container
		// DIV which is returned as our control element. We add the control to
		// to the map container and return the element for the map class to
		// position properly.
		TextualZoomControl.prototype.initialize = function(map) {
			var container = document.createElement("div");
			container.className = "controls";
		
			var zoomInDiv = document.createElement("div");
			zoomInDiv.className = "zoom zoom-in";

			container.appendChild(zoomInDiv);
			zoomInDiv.appendChild(document.createTextNode("Zoom In"));

			GEvent.addDomListener(zoomInDiv, "click", function() {
				map.zoomIn();
			});
		
			var zoomOutDiv = document.createElement("div");
			zoomOutDiv.className = "zoom zoom-out";
			
			container.appendChild(zoomOutDiv);
			zoomOutDiv.appendChild(document.createTextNode("Zoom Out"));
			
			GEvent.addDomListener(zoomOutDiv, "click", function() {
				map.zoomOut();
			});
		
			map.getContainer().appendChild(container);
			return container;
		}
		
		// By default, the control will appear in the top left corner of the
		// map with 7 pixels of padding.
		TextualZoomControl.prototype.getDefaultPosition = function() {
			return new GControlPosition(G_ANCHOR_TOP_LEFT, new GSize(7, 7));
		}
		
		// Sets the proper CSS for the given button element.
		TextualZoomControl.prototype.setButtonStyle_ = function(button) {
		
			button.style.textDecoration = "underline";
			button.style.color = "#0000cc";
			button.style.backgroundColor = "white";
			button.style.font = "small Arial";
			button.style.border = "1px solid black";
			button.style.padding = "2px";
			button.style.marginBottom = "3px";
			button.style.textAlign = "center";
			button.style.width = "6em";
			button.style.cursor = "pointer";
		}
		
		function setMissionId() {
			mission_id = document.getElementById("mission").value;
			//alert(mission_id);
			//clearMyOverlays();
			GDownloadUrl("json/vmap-map-loc" + mapLocation + ".json?" + datetime, process_it);
		}
		
		function focusAgent() {
			var agent = document.getElementById("agent").value;
			myclick(agent);
		}
		
		function removeMarker() {
			marker.closeInfoWindow();
			marker.remove();
		}
		