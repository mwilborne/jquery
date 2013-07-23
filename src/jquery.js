define([
	"./core",
	"./selector",
	"./callbacks",
	"./deferred",
	"./core/ready",
	"./traversing",
	"./support",
	"./data",
	"./queue",
	"./queue/delay",
	"./attributes",
	"./event",
	"./manipulation",
	"./manipulation/_evalUrl",
	"./wrap",
	"./css",
	"./css/hidden-visible-selectors",
	"./serialize",
	"./event-alias",
	"./ajax",
	"./ajax/xhr",
	"./ajax/script",
	"./ajax/jsonp",
	"./ajax/load",
	"./effects",
	"./effects/animated-selector",
	"./offset",
	"./dimensions",
	"./deprecated"
], function( jQuery ) {

	// Expose jQuery and $ identifiers, even in
	// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	return (window.jQuery = window.$ = jQuery);
});
