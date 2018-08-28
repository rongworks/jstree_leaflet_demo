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
