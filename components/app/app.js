/*
 * Main app code
 * - read CSV file
 * - build the MapController, which starts the application code (tree and map components) 
 */
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
