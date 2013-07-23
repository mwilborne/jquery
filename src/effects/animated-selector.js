define([
	"../core",
	"../effects",
	"../selector-sizzle"
], function( jQuery ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
});