/*
 * Component for leaflet map
 * markers get built with tree_data
 */
function MapComponent( controller ) {
  var component = this;
  this.controller = controller;


  // custom marker, storing an external id for finding nodes in the tree
  var CustomMarker = L.Marker.extend( {
    options: {
      external_id: 0,
    }
  } );

  this.map = L.map( 'mapid' ).setView( [ 53.0997784, 8.7599293 ], 6 );
  L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 6,
    zoomDelta: 0.5
  } ).addTo( this.map );

  this.selection_layer = L.layerGroup();

  this.markers = L.markerClusterGroup( {
    iconCreateFunction: function( cluster ) {
      return L.divIcon( {
        html: '<span class="marker-cluster badge badge-pill badge-primary">' +
          cluster.getChildCount() + '</span>',
        className: 'border-0 lead'
      } );
    }
  } );


  this.map.addLayer( this.markers );
  this.map.addLayer( this.selection_layer );

  this.markers.on( 'clustermouseover', function( a ) {
    var children = a.layer.getAllChildMarkers();
    var marker = children[ 0 ];
    var content = "<ul>";
    for ( var i = 0; i < children.length; i++ ) {
      content += '<li>' + children[ i ].options.title + '</li>';
      //console.log( children[ i ] );
    }
    content += '</ul>';
    var cluster = a.target.getVisibleParent( marker );
    cluster.bindPopup( content ).openPopup();
  } );


  this.load_from_tree = function( tree_data ) {
    for ( var i = 0; i < tree_data.length; i++ ) {
      var node = tree_data[ i ];
      lat = node.data.lat;
      lng = node.data.lng;
      if ( lat && lng ) {
        var marker = new CustomMarker( [ lat, lng ], {
            title: node.text,
            external_id: node.id
          } )
          .bindPopup( this.createPopup( node ) );
        marker.on( 'click', function( a ) {
          //  a.target.bindPopup( '<p>test</p>' ).openPopup();
          var item = a.target;
          var id = a.target.options.external_id;
          //console.log( 'id: ' + id );
          controller.on_map_select( id );
        } );
        marker.bindTooltip( marker.options.title, {
          direction: 'top'
        } );
        this.markers.addLayer( marker );
      }
    }
  }

  this.createPopup = function( node ) {
    var txt = '<strong>' + node.text + '</strong>';
    txt += '<p> Adresse: ' + node.data.adress + ', ' + node.data.zip +
      ', ' + node.data.city + '</p>';
    txt += '<p> Gewerbe: ' + node.data.business + '</p>';
    txt += '<p> Projekte ' + node.data.projects + '</p>';
    return txt;
  }
}
