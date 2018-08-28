//------- GLOBAL STUFF HERE

$( function() {
  // load csv data and build tree+map
  $.ajax( {
    type: "GET",
    url: "data/csv_data.txt",
    dataType: "text",
    success: function( data ) {
      var tree_data = processData( data );
      // controller creates tree and map components
      var tree_map_controller = new TreeMapController( tree_data );
    }
  } );


} )

/*
 * Read CSV, return array of data(rows)
 */
function processData( allText ) {
  var allTextLines = allText.split( /\r\n|\n/ );
  var headers = allTextLines[ 0 ].split( ';' );
  var lines = [];

  for ( var i = 1; i < allTextLines.length; i++ ) {
    var data = allTextLines[ i ].split( ';' );
    if ( data.length == headers.length ) {
      var tarr = [];
      for ( var j = 0; j < headers.length; j++ ) {
        tarr.push( data[ j ].replace( /\"/g, "" ) );
      }
      lines.push( tarr );
    }
  }
  //alert( lines[ 1 ] );
  return lines;

}

//----- END GLOBAL STUFF

/*
 * Controller for components, handles interaction
 * and communication between components
 */
function TreeMapController( tree_data ) {
  controller = this;

  this.tree_data = tree_data;
  this.center_map = function( lat, lng ) {
    //TODO: create function in component
    map_component.map.panTo( new L.LatLng( lat, lng ) );
    var circle = L.circleMarker( new L.LatLng( lat, lng ), {
      color: 'red'
    } );
    map_component.selection_layer.clearLayers();
    circle.addTo( map_component.selection_layer );
  };
  this.on_map_select = function( id ) {
    $( '#tree' ).jstree( true ).deselect_all();
    $( '#tree' ).jstree( true ).select_node( id );
  };
  this.display_result = function( data ) {
    var name = data.name;
    var adress = data.adress;
    var url = data.url;
    if ( !name || !adress || !url ) {
      console.log( 'Can\'t display name, adress, url for ' + JSON.stringify(
        data ) );
    }
    var result_div = $( '#result' );
    result_div.show();
    result_div.find( '.company-name' ).text( name );
    result_div.find( '.company-adress' ).text( adress );
    //result_div.find( '.company-url' ).text( url );
    result_div.find( '.company-url' ).prop( 'href', url );
    var result_props = result_div.find( '.company-properties' );
    result_props.empty();
    for ( key in data ) {
      $( '<li/>', {
        id: 'some-id',
        class: 'list-group-item',
        text: key + ': ' + data[ key ]
      } ).appendTo( result_props );
    }
  }

  var tree_component = new TreeComponent( this, this.tree_data );
  var map_component = new MapComponent( this );
  map_component.load_from_tree( tree_component.data );

  return this;
}


/*
 * Component for jsTree (sidebar)
 * Holds information for each place (data-row)
 */
function TreeComponent( controller, tree_data ) {
  var component = this; // save self for inner functions
  this.data;
  this.controller = controller;

  this.parse_places = function( places ) {
    var data_obj = {
      data: []
    };
    /*
    data_obj.data[0] = {
      id: "kt",
      text: "Kundenliste Kaiser&Tappe GmbH",
      parent : "#",
      data : {}
    }*/
    for ( var i = 0; i < places.length; i++ ) {
      var line = places[ i ];
      data_obj.data[ i ] = {
        id: places[ i ][ 0 ],
        text: places[ i ][ 1 ],
        parent: "#",
        icon: 'home-icon',
        //li_attr: {
        //  'class': 'list-group-item'
        //},
        data: {
          name: places[ i ][ 1 ],
          adress: places[ i ][ 2 ],
          zip: places[ i ][ 3 ],
          city: places[ i ][ 4 ],
          business: places[ i ][ 6 ],
          projects: places[ i ][ 7 ],
          url: places[ i ][ 8 ],
          lat: places[ i ][ 9 ],
          lng: places[ i ][ 10 ]
        }
      };

    }
    return data_obj;
  }

  // parse data and create tree
  this.create = function() {
    component.data = component.parse_places( tree_data ).data;
    $( '#tree' ).jstree( {
      'core': {
        'data': component.data
      },
      "plugins": [ "wholerow", "sort" ],
      "sort": function( a, b ) {
        a1 = this.get_node( a );
        b1 = this.get_node( b );
        if ( a1.icon == b1.icon ) {
          return ( a1.text > b1.text ) ? 1 : -1;
        } else {
          return ( a1.icon > b1.icon ) ? 1 : -1;
        }
      }
    } );

    // listen for events
    $( '#tree' )
      /*
      * Note: not used here, map is static
      .on('changed.jstree', function (e, data) {
        markers.clearLayers();
        var i, j, r = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
          var node = data.instance.get_node(data.selected[i]);
          var lat = data.instance.get_json(node).data.lat;
          var lng = data.instance.get_json(node).data.lng;
          // TODO: extract to method out of tree event
          if(lat && lng){
            var marker = L.marker([lat,lng])
            .bindPopup(createPopup(node));
            markers.addLayer(marker);
          }
          r.push(node.text+'('+lat+','+lng+')');


        }
        //$('#result').html('Selected: ' + r.join(', '));
      })
      */
      .on( 'select_node.jstree', function( e, data ) {
        var node = data.instance.get_node( data.node );
        //console.log( "selected:" + JSON.stringify( node ) );
        var lat = node.data.lat;
        var lng = node.data.lng;
        var name = node.text;
        var adress = node.data.adress + ', ' + node.data.zip + ' ' + node
          .data
          .city;
        if ( lat && lng ) {
          component.controller.center_map( lat, lng );
          //$( '#result' ).html( '<div>' + createPopup( node ) + '<div>' )
          component.controller.display_result( node.data );
        }

      } )
  }

  this.create();
  return this;

}

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
