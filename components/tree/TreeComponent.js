/*
 * Component for jsTree (sidebar)
 * Holds information for each place (data-row)
 */
function TreeComponent( controller, tree_data ) {
  var component = this; // save self for inner functions
  this.tree;
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
          lng: places[ i ][ 10 ],
        }
      };

    }
    return data_obj;
  }

  // parse data and create tree
  this.create = function() {
    component.data = component.parse_places( tree_data ).data;
    this.tree = $( '#tree' ).jstree( {
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


    /*
     * used on selection, adds a details-div to the tree node
     * Use this to customize node details
     */
    this.add_details = function( node ) {

        var node_element = this.tree.jstree( true ).get_node( node, true );
        var adress = node.data.adress + ', ' + node.data.zip + ' ' + node
          .data
          .city;

        // remove  old details, build an append new div
        $( '.company-details' ).remove();

        var details_div = $( '<div/>', {
          class: 'company-details mb-4'
        } );

        var listing = $( '<ul/>', {
          class: 'list-group list-group-flush border:0'
        } ).appendTo( details_div );

        $( '<li/>', {
          class: 'company-address small text-muted list-group-item',
          text: adress
        } ).appendTo( listing );

        var url_element = $( '<li/>', {
          class: 'list-group-item'
        } ).appendTo( listing );

        $( '<a/>', {
          class: 'small company-url',
          text: 'Homepage',
          target: '_blank',
          href: node.data.url
        } ).appendTo( url_element );

        $( '<li/>', {
          class: 'company-projects small list-group-item',
          text: node.data.projects
        } ).appendTo( listing );

        node_element.append( details_div );
      }
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
          // XXX: not used anymore, uncomment to use seperate result div
          //component.controller.display_result( node.data );
        }

        component.add_details( node );

      } )
  }

  this.create();
  return this;

}
