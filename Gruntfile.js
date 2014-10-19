module.exports = function (grunt) {

    var tasks = [
        'uglify', // minify js
        'replace', // replace
        'clean' // cleanup .tmp
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        rest: grunt.file.readJSON('config.json'),
        banner: '/*\n' +
            '* <%= rest.name %> v.<%= rest.version %>\n' +
            '*/\n' +
        '(function() {\n',
        footer: '\n})();',
        jshint: {
            // define the files to lint
            files: ['scripts/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    loopfunc: false
                },
                ignores: [
                    'scripts/libs/**/*.js'
                ]
            }
        },
        uglify: {
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    exportAll: true,
                    banner: '<%= banner %>',
                    footer: '<%= footer %>'
                },
                files: {
                    'build/<%= rest.name %>.js': [
                        'src/helpers/*.js',
                        'src/bootstrap.js'
                    ]
                }
            },

            build_min: {
                options: {
                    report: 'min',
                    wrap: '<%= rest.name %>',
                    banner: '<%= banner %>',
                    exportAll: true
                },
                files: {
                    'build/<%= rest.name %>.min.js': [
                        'build/<%= rest.name %>.js'
                    ]
                }
            }
        },
        replace: {
            dist: {
                options: {
                    prefix: '!!',
                    patterns: [
                        {
                            match: 'name',
                            replacement: '<%= rest.name %>'
                        },
                        {
                            match: 'resources',
                            replacement: '<%= rest.resources %>'
                        }
                    ]
                },
                files: [
                    {
                        src: ['build/<%= rest.name %>.js'],
                        dest: 'build/<%= rest.name %>.js'
                    },
                    {
                        src: ['build/<%= rest.name %>.min.js'],
                        dest: 'build/<%= rest.name %>.min.js'
                    }
                ]
            }
        },
        clean: {
            tmp: ['.tmp']
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-replace');

    grunt.registerTask('default', tasks);

};