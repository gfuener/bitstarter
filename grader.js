#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var DEFAULT_URL = "http://powerful-forest-7032.herokuapp.com";
var rest = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
    }
    return instr;
};
var assertUrlExists = function(url) {
    return url.toString();
}
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(url, checksfile) {
    rest.get(url).on('complete', function(data, response){
	$ = cheerio.load(data);
        var checks = loadChecks(checksfile).sort();
        var out = {};
        for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
        });
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};
 
var checkHtmlFile = function(html, checksfile) {
    $ = cheerioHtmlFile(html);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>') 
	.parse(process.argv);
    console.log(program.file);
    console.log(program.url);   
    if(program.file && !program.url) {
        console.log("loaded from file");
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
    if (program.url) {
        console.log("loaded from url");
	cheerioUrl(program.url, program.checks);
	}    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
