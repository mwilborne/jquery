/**
 * Special concat/build task to handle various jQuery build requirements
 * Concats AMD modules, removes their definitions, and includes/excludes specified modules
 */

module.exports = function( grunt ) {

	grunt.registerMultiTask(
		"build",
		"Concatenate source, remove sub AMD definitions, (include/exclude modules with +/- flags), embed date/version",
		function() {

			// Concat specified files.
			var compiled = "",
				modules = this.flags,
				optIn = !modules["*"],
				explicit = optIn || Object.keys(modules).length > 1,
				name = this.data.dest,
				src = this.data.src,
				deps = {},
				excluded = {},
				version = grunt.config( "pkg.version" ),
				excluder = function( flag, needsFlag ) {
					// optIn defaults implicit behavior to weak exclusion
					if ( optIn && !modules[ flag ] && !modules[ "+" + flag ] ) {
						excluded[ flag ] = false;
					}

					// explicit or inherited strong exclusion
					if ( excluded[ needsFlag ] || modules[ "-" + flag ] ) {
						excluded[ flag ] = true;

					// explicit inclusion overrides weak exclusion
					} else if ( excluded[ needsFlag ] === false &&
						( modules[ flag ] || modules[ "+" + flag ] ) ) {

						delete excluded[ needsFlag ];

						// ...all the way down
						if ( deps[ needsFlag ] ) {
							deps[ needsFlag ].forEach(function( subDep ) {
								modules[ needsFlag ] = true;
								excluder( needsFlag, subDep );
							});
						}
					}
				};

			// append commit id to version
			if ( process.env.COMMIT ) {
				version += " " + process.env.COMMIT;
			}

			// figure out which files to exclude based on these rules in this order:
			//  dependency explicit exclude
			//  > explicit exclude
			//  > explicit include
			//  > dependency implicit exclude
			//  > implicit exclude
			// examples:
			//  *                  none (implicit exclude)
			//  *:*                all (implicit include)
			//  *:*:-css           all except css and dependents (explicit > implicit)
			//  *:*:-css:+effects  same (excludes effects because explicit include is trumped by explicit exclude of dependency)
			//  *:+effects         none except effects and its dependencies (explicit include trumps implicit exclude of dependency)
			src.forEach(function( filepath ) {
				var flag = filepath.flag;

				if ( flag ) {

					excluder(flag);

					// check for dependencies
					if ( filepath.needs ) {
						deps[ flag ] = filepath.needs;
						filepath.needs.forEach(function( needsFlag ) {
							excluder( flag, needsFlag );
						});
					}
				}
			});

			// append excluded modules to version
			if ( Object.keys( excluded ).length ) {
				version += " -" + Object.keys( excluded ).join( ",-" );
				// set pkg.version to version with excludes, so minified file picks it up
				grunt.config.set( "pkg.version", version );
			}


			// conditionally concatenate source
			src.forEach(function( filepath ) {
				var flag = filepath.flag,
						specified = false,
						omit = false,
						messages = [];

				if ( flag ) {
					if ( excluded[ flag ] !== undefined ) {
						messages.push([
							( "Excluding " + flag ).red,
							( "(" + filepath.src + ")" ).grey
						]);
						specified = true;
						omit = !filepath.alt;
						if ( !omit ) {
							flag += " alternate";
							filepath.src = filepath.alt;
						}
					}
					if ( excluded[ flag ] === undefined ) {
						messages.push([
							( "Including " + flag ).green,
							( "(" + filepath.src + ")" ).grey
						]);

						// If this module was actually specified by the
						// builder, then set the flag to include it in the
						// output list
						if ( modules[ "+" + flag ] ) {
							specified = true;
						}
					}

					filepath = filepath.src;

					// Only display the inclusion/exclusion list when handling
					// an explicit list.
					//
					// Additionally, only display modules that have been specified
					// by the user
					if ( explicit && specified ) {
						messages.forEach(function( message ) {
							grunt.log.writetableln( [ 27, 30 ], message );
						});
					}
				}

				if ( !omit ) {
					compiled += grunt.file.read( filepath );
				}
			});

			// Embed Version
			// Embed Date
			compiled = compiled.replace( /@VERSION/g, version )
				// yyyy-mm-ddThh:mmZ
				.replace( /@DATE/g, ( new Date() ).toISOString().replace( /:\d+\.\d+Z$/, "Z" ) );

			// Write concatenated source to file
			grunt.file.write( name, compiled );

			// Fail task if errors were logged.
			if ( this.errorCount ) {
				return false;
			}

			// Otherwise, print a success message.
			grunt.log.writeln( "File '" + name + "' created." );
		});
};
