module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            vendor: {
                src: ['vendor/components/jquery/jquery.min.js', 'vendor/mbostock/d3/d3.min.js'],
                dest: 'public/js/vendor.js'
            },
            dist: {
                src: 'js/**/*.js',
                dest: 'public/js/scrollgraph.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                mangle: true
            },
            dist: {
                files: {
                    '<%= concat.dist.dest %>': ['<%= concat.dist.dest %>']
                }
            }
        },
        watch: {
            files: ['<%= concat.vendor.src %>', '<%= concat.dist.src %>'],
            tasks: ['concat', 'uglify']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'uglify', 'watch']);

};