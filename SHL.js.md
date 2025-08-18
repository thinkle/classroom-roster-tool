// Simple interface for reading a table with headers
//
// TableObj(range)
//
// Each row of data then can be accessed via header names OR indices
//
// t = TableObj(range)
// t[1]['Name'] -> returns value of 2nd row in
//                    column with header "Name"
// or
// t[1].Name -> Same diff

/** Return a sheet given ID. 
 * @param {Spreadsheet} spreadsheet - the Spreadsheet Object
 * @param {string} id - the ID of the sheet 
 * This implements a missing method in the google API
 * which supports only getting sheets by name.
 */
function getSheetById (ss, id) {
    if (! ss) {
	throw "No Spreadsheet handed to getSheetById!"
    }
    var sheets = ss.getSheets();
    for (var i=0; i<sheets.length; i++) {
	if (sheets[i].getSheetId()==id) {
	    return sheets[i]
	}
	else {
	    //logVerbose('Oops, '+sheets[i].getSheetId()+'!='+id);
	}
    }
}

/** @classdesc
 * Create an Table object representation of a range that can
 * be looped through, assigned to, etc. in a natural way.
 * 
 * Range needs to have unique headers for header based 
 * assignment to work properly
 * 
 * 
 * Usage: 
 * <pre>
 *     var t = Table(range)
 *     t[1].Name -> Return value of column "Name" in second row
 *     t[1].Name = 'New Name' // supports assignment (writes to spreadsheet)
 *     t.forEach(function (row) { 
 *         // do something with row.Name, etc...
 *     }
 * </pre>
 * _WARNING_: you cannot simply push to the table array.
 * To add new content, use:
 * <pre>
 * t.pushRow(ROW) to add content either via object or array.
 * </pre>
 * OR, with IDs, we can be a bit fancier...
 * 
 * Imagine we have a range of a spreadsheet referring to nutritional info
 * indexed by a column "Food"
 * <pre>
 *     t = Table(range,'Food') /??? Does this actually work this way
 *     t.Apple.Calories = 80 // write to row w/ Food "Apple" in column "Calories"
 *     t.Apple.Fiber = 40 // write to row w/ Food "Apple" column "Fiber"
 *</pre>
 * Or...
 * <pre>
 * row = t.update({Food:'Banana',calories:100,fiber:10})
 * </pre>
 * 
 * @constructor
 * @param range {Range} - the range we are reprsenting.
 * @param {string} idHeader - name of the column header which
 * represents a unique ID. If we have such a header, we support
 * updating tables by ID.
 */
function Table (range, idHeader) {
    var values = range.getValues()
    //logVerbose('Table(' + JSON.stringify(range) + ')')
    var sheet = range.getSheet()
    var rowOffset = range.getRow()
    var colOffset = range.getColumn()
    var headers = values[0]
    var rowsById = {}
    
    //logVerbose('headers=>'+JSON.stringify(headers))  
    
    function processRow (row) {
	//newObj = {'foo':'bar'}
	//logVerbose('processRow('+JSON.stringify(row)+')')
	
	//    row.setValue = function (name, val) {
	//      var i = headers.indexOf(name)
	//      if (! i) {
	//        var i = name; // assume we got a number
	//        var[name] = headers[i]
	//      }
	//      var rowNum = values.indexOf(row);
	//      var cell = sheet.getRange(rowOffset+rowNum, colOffset+i);
	//      cell.setValue(val);
	//      row[i] = val;
	//    } // end row.setValue
	
	var rowObj = {}
	var rowNum = values.indexOf(row);

	function buildProperties (i, h) { // for closure purposes
	    //logVerbose('Setting '+h+'->'+i);
	    if (rowObj.hasOwnProperty(h)) {
		console.log('Ignore duplicate column: %s (col %s). %s will refer to the first column by that name.',h,i,h);
		return
	    }
            Object.defineProperty(rowObj,'cell_'+h,
                                  {'get':function () {
                                      return sheet.getRange(Number(rowOffset) + Number(rowNum),Number(colOffset)+Number(i))
                                  }});
            Object.defineProperty(rowObj,'cell_'+i,
                                  {'get':function () {
                                      return sheet.getRange(Number(rowOffset) + Number(rowNum),Number(colOffset)+Number(i))
                                  }});
	    Object.defineProperty(rowObj,
				  h,
				  {
				      'enumerable': true,
				      'set': function(v) {
					  var cell = sheet.getRange(Number(rowOffset) + Number(rowNum),Number(colOffset) + Number(i))
					  cell.setValue(v);
					  row[i]=v;
				      },
				      'get': function() {return row[i]}
				  });
	    Object.defineProperty(rowObj,
				  i,
				  {
				      'enumerable': true,
				      'set': function(v) {row[i] = v;
							  sheet.getRange(rowOffset + rowNum,colOffset + i).setValue(v);
							 },
				      'get': function() {return row[i]},
				  }
				 )   
	    if (idHeader && h==idHeader) {
		rowsById[row[i]] = rowObj
	    }
	}      // end buildProperties
	
	
	for (var i in headers) {
	    var h = headers[i] 
	    buildProperties(i,h)
	}    
	
	return rowObj
    } // end processRow
    
    var table = []
    Object.defineProperty(
	table,
	'sheet',
	{'value': sheet, configurable: false, writable: false}
    )
    Object.defineProperty(
	table,
	'range',
	{'value': range, configurable: false, writable: false
	})    
    // process each row into a row object...
    for (var rn in values) {
	table.push(processRow(values[rn]));
    }

    /** @method Table.pushRow 
    * @inner
    * @desc 
    * Add a row to our table.
    * 
    * Return updated row.
    *
    * *Note: we have to use this method to append to our table if we want our
    * magic to keep working. Simply pushing to the table with Table.push will
    * fail to update the sheet*
    *
    * @param data (object) - an object containing k:v pairs for our table.
    * where k is a column header or an integer column number (0-indexed)
    * 
    */
    table.pushRow = function (data) {
	var pushArray = []
	for (var i=0; i<headers.length; i++) {pushArray.push('')}
	for (var key in data) {  
	    if (data.hasOwnProperty(key)) {
		if (isNaN(Number(key))) {
		    var i = headers.indexOf(key);
		    if (i > -1) {
			pushArray[i] = spreadsheetify(data[key]) // set to the integer...          
		    }
		}
		else {
		    // Otherwise we're looking at a numerical key...
		    pushArray[key] = spreadsheetify(data[key])
		} 
	    }
	} // end for    
	// Now that we've created our data, let's push ourselves onto the spreadsheet...
	if (! pushArray[headers.length-1]) {
	    pushArray[headers.length-1] = ""; // extend array to proper length...
	}
	//cell = sheet.getRange(rowOffset+values.length,colOffset,1,headers.length)
	var appendRow = [];
	for (var i=1; i<colOffset; i++) {
	    appendRow.push(''); // pad beginning of array...
	}
	appendRow = appendRow.concat(pushArray);
	//cell.setValues([pushArray]); // push to sheet...
	sheet.appendRow(appendRow);
	values.push(pushArray); // push to array
	table.push(processRow(pushArray));
    } // end values.pushRow

    /**  @method Table.hasRow
    *
    * @param id - value of ID column
    * Return True if we have this row
    */
    table.hasRow = function (id) {
	return rowsById.hasOwnProperty(id)
    }

    /** @method Table.getRow
     *
     * @param id - value of ID column
     * Return the row identified by id.
     */
    table.getRow = function (id) {
	return rowsById[id];
    }

    /** @method Table.updateRow 
    * @param data - k:v data for row in table.
    * Update a row based on data. Table must have an 
    * id column and data must have that column as well.
    * Return updated row if successful; false if we encounter an error.
    */
    table.updateRow = function (data) {
	var id = data[idHeader]; var success
	if (rowsById.hasOwnProperty(id)) {
	    var lock = LockService.getScriptLock()
	    try {
		lock.waitLock(240000);
		var row = rowsById[id];
		for (var prop in data) {
		    if (data.hasOwnProperty(prop) && row.hasOwnProperty(prop)) {
			if (data[prop]===undefined) {
			    row[prop] = ''
			}
			else {
			    row[prop] = data[prop]
			}
			//if (data[prop] !== undefined) {
			//row[prop] = data[prop]
			//}
		    }
		}
		success = true;
	    }
	    catch (err) {
		//emailError('Error during table write',err);
		console.log('Error during table write',err);
	    }
	    finally {
		lock.releaseLock();
		if (success) {
		    return row
		}
		else {
		    return false;
		}
	    }
	}
	else {
	    return table.pushRow(data)
	}
    }
    
    table.headers = headers;
    
    return table;
}

function spreadsheetify (value) {
    if (Array.isArray(value)) {
	return value.map(function (o) {return spreadsheetify(o)}).join(", ");
    }
    if (typeof value == 'object') {
	return JSON.stringify(value)
    }
    if (typeof value == 'undefined') {
	return ''
    }
    if (typeof value == 'boolean') {
	if (value) {return 1}
	else {return 0}
    }
    else {
	return value;
    }
}

function testTableWithIDs () {
    var ss = SpreadsheetApp.openById('1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk') 
    var sheet = getSheetById(ss,'98430562')  
    var table = Table(sheet.getDataRange(),'ID');
    table.updateRow({'ID':78,'Name':'Merwin','Age':105})
    table.updateRow({'ID':3,'Name':'Clara-boo','Age':6})
}

function testTable () {
    var ss = SpreadsheetApp.openById('1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk')  
    var sheet = getSheetById(ss,'573504329')  
    //var sheet = ss.getSheetByName("testGrid");
    var table = Table(sheet.getDataRange())
    logNormal('Table length is : '+table.length);
    logNormal('Table row 1: '+table[1].First+' '+table[1].Last)
    logNormal('Table row 1: '+table[1][0]+' '+table[1][1])
    logNormal('Got table '+shortStringify(table))
    table[1]['Last'] = 'Sayre'
    table[2]['Last'] = 'Hinkle'
    table[3]['Last']='Holy Shit It Worked'
    table.pushRow(['Jon','Churchill',42])  
    table.pushRow({'Last':'Gross','First':"Terry",'Age':'Unknown'})
    table.pushRow({'Last':'Clifford','First':"Stephen",'Age':'42','Extra':'Stuff','What':'Happens?'})
    table[5]['Age'] = '28'
    logNormal('Table length is now: '+table.length)
}



var updateTest, dupTest

function _initZZZTestTableReader () {

    dupTest = Test ({
        metadata : {name:'Test Handling of Duplicate Columns'},
        
        setup : function (p) {
	    p.ss = p.getScratchSS();
	    p.ss.getActiveSheet().clear();
	    [['h1','h2','h1','h3'], // duplicate h1
	     [1,2,3,4],
	     [2,3,4,5],
	     [3,4,5,6,]].forEach(function (r) {
	         p.ss.appendRow(r)
	     })},
    
        test : function (p) {
	    var t = Table(p.ss.getActiveSheet().getDataRange());
	    // Succeed with pushing row
	    t.pushRow({h1:4,h2:7,h3:9});
	    Logger.log('Got: %s',t[1].h1)
	    assertEq(t[1].h1, 1) // first column value should win, not second
	    assertEq(t[4][0],4) // we pushed to the first column
	    assertEq(t[4][2],undefined) // we have a blank third column
        }
    })

    updateTest=  Test( {
        metadata : {name :'Test Table pushRow and updateRow'},
        setup : function (p) {
	    p.ss = p.getScratchSS();
	    [['ID','Name','Number','Foo','Bar'],
	     [1,'Tom',82,'asdf','owiaeru'],
	     [2,'Dick',82,'asdfqqq','zzz'],
	     [3,'Harry',82,'asdfasdf','iii'],
	     [4,'Falsey',false,true,'bar bar bar '],
	    ].forEach(function (r) {p.ss.appendRow(r)});
        },
        test : function (p) {
	    var t = Table(p.ss.getActiveSheet().getDataRange(),'ID');
	    t.updateRow({ID:1,Name:'Mary','Foo':false,Bar:'',Number:77});
	    t.updateRow({ID:2,Name:'Fred','Foo':undefined,Bar:false,Number:-72.123});
	    t.pushRow({ID:27,Name:"Foo",Bar:undefined,Foo:false});
	    // access in straight row/col fashion for test...
	    var newT = Table(p.ss.getActiveSheet().getDataRange());
	    assertEq(newT[1].Name,'Mary')
	    assertEq(newT[1].Foo,false)
	    assertEq(newT[2].Name,'Fred')
	    assertEq(newT[2].Foo,'')
	    assertEq(newT[2].Number,-72.123)
	    assertEq(newT[5].Name,'Foo')
	    assertEq(newT[5].Number,'')
	    assertEq(newT[5].ID,27)
	    assertEq(newT[5].Foo,false)
	    //t.updateRow({ID:3,Number:17});
	    return {url:p.ss.getUrl()}
        },
    })
}

function doUpdateTest () {
    updateTest.solo();
}

function doDupTest () {
    dupTest.solo();
}

/** @function resubmitForm
* @param formId {string} id of form
* @param i {number} index of response to resubmit
* @desc
* Generates a fake event and runs onFormSubmitTrigger
* as if response i had been submitted from formid.
**/
function resubmitForm (formId,i) {
    Logger.log('Resubmit form: %s',formId);
    var form = FormApp.openById(formId);
    var firstResp = form.getResponses()[i];
    fakeEvent = {
	source : form,
	response : firstResp
    }
    onFormSubmitTrigger(fakeEvent)
}

/** @function getOldResponse
* @param formId {string} id of form
* @param i {number} index of response to resubmit
* @returns response object.
**/
function getOldResponse (formId, i) {
  var form = FormApp.openById(formId);
  var firstResp = form.getResponses()[i];
  return firstResp
}


function getProp () {
    Logger.log(PropertiesService.getUserProperties().getProperty('scratchSS'));//,'1MVfqdE8Y5R_3Ua2fm3L6FHahv4yM8dc6u-pYzTn2nOg'));
}


function addDefaultParams (params) {
    var defaults = {
	configSS : '1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk',
	fileForm : '1iXj_oTMfPhjBeYDYbkQptf-MafpFdKp-Ml3eY9hwvaY',
	masterSS : '1lldMEo4F5K_T8Zb2kURh2CZfgL4-K1yesILGrnmDT5Q',
	getScratchForm : function () {
	    var fid = PropertiesService.getUserProperties().getProperty('scratchForm');
	    if (!fid) {
		var f = FormApp.create('Scratch Form for Testing');
		PropertiesService.getUserProperties().setProperty('scratchForm',f.getId())
		return f
	    }
	    else {
		var f = FormApp.openById(fid);
		return f;
	    }
	},
	getScratchSS : function () {
	    var ssid = PropertiesService.getUserProperties().getProperty('scratchSS');
	    if (!ssid) {
          var ss = SpreadsheetApp.create('Scratch Spreadsheet for Testing');
          PropertiesService.getUserProperties().setProperty('scratchSS',ss.getId())
          return ss
	    }
	    else{
		var ss = SpreadsheetApp.openById(ssid);
		ss.getActiveSheet().clear();
		return ss;
	    }
	},
    }
    for (var key in defaults) {
      if (!params[key]) {
        params[key]=defaults[key]
      }
    }
}

/** @function setupTests
* @desc
* setup tests for the first time. Creates a global array tests that will hold our tests.
* Singleton pattern.
**/
function setupTests () {
  try {
    setup;
  }
  catch (err) {
      //Logger.log('Do setup!');
      /** global **/
      tests = [] // global
    setup = true; // global
  }
}

/** @class Test
* @desc
* @param {object} params
* @param {object} params.params - Parameters passed to figure. We provide bunch of standard defaults
* for convenience: 
* <pre>{configSS, fileForm, masterSS, getScratchForm, getScratchSS}</pre>
* @param {function} params.setup - function to run before running test (gets passed params.params)
* @param {function} params.test - function to run test (this function gets passed params.params)
* @param {function} params.cleanup - function to run after test (gets passed params.params)
*
* @desc
* Create a test object.
* Note: Our house style constructor does not require the *new* keyword.
*
* <pre>
* {
*     params : params that are passed to setup/cleanup/test
*     setup : setup function to run before running test
*     metadata : information about test
*     test : test function to run to DO test. Returns result or throws error.
*     cleanup : function to run after test has succeeded or failed.
* }
* </pre>
* @returns {object}
* <pre>
* {
*    metadata : metadata,
*    test : test,
*    result : result of test
*    success : true or false   
* }
* </pre>
* @desc
* <pre>
* In practice, we use a Test this like this:
* Test({
*    test: function (params) {some function we want to test},
*    params : {some:params,we:want,to:hand,to:our,fun:ction},
*    metadata:{name:'Name of test'},
* });
* 
* You can create tests anywhere in your code and then use runTestSuite
* to run all of them at once.
*
* Each function gets handed params, so if your test needs a value
* created by your setup function, setup can just modify the object
* it is handed. Similary, your test can store values needed by
* cleanup in the same params object -- the same object is handed
* from setup to test to cleanup.
* </pre>    
**/
function Test (o) { // test, params, metadata) {
  setupTests();
  //Logger.log('Registering test: %s',o);
  //Logger.log('We have %s tests so far',tests.length);
  
  if (!o.params) {o.params = {}}
    addDefaultParams(o.params);
    t = {
	run : function () {
	    if (o.setup) {o.params.setupResult = o.setup(o.params)}
	    try {
		var result = o.test(o.params);
		var success = true;
	    }
	    catch (err) {
		var result = err;
		var success = false;
	    }
	    if (o.cleanup) {o.cleanup(o.params,result,success)}
	    return {
		metadata:o.metadata,
		test:o.test,
		result:result,
		success:success
	    }
	},
	solo : function () {
	    if (o.setup) {o.setup(o.params)}
	    r = o.test(o.params);
	    if (o.cleanup) {o.cleanup(o.params)}
	    Logger.log('Got result: %s',r);
	},
	metadata : o.metadata,
	params : o.params,
    }
    tests.push(t)
    return t;
}

Test({
  test:function (a) {Logger.log('This one works every time: %s',a.a);},
  params:{a:'test param'},
  metadata:{name:'Successful test test',extra:'Arbitrary metadata allowed'}
});
Test({
  test:function (a) {Logger.log('This one fails every time: %s',a.a);a=duck;},
  params:{a:'test param'},
  metadata:{name:'Failing test test'}
});

/** @function runTestSuite
* @desc Run all tests defined in our library
**/
function runTestSuite () {
    var results = []
    console.log('TestSuite: Running Test Suite');
    console.log('Running %s tests',tests.length);
    var i = i;
    tests.forEach(function (test) {
        console.log('Running test %s of %s',i,tests.length);
        i+=1;
	results.push(test.run())
    })
    console.log('TestSuite RESULTS...');
    successful = 0;
    results.forEach(function (r) {
      if (r.success) {
          console.log('TestSuite SUCCESS: ',r.metadata.name,'Success',r)
          Logger.log('SUCCESS: %s, result: %s',r.metadata.name,r.result)
          successful += 1;
      }
      else {
          console.error('TestSuite FAILURE: ',r.metadata.name,r)
          Logger.log('FAILURE: %s',r)
      }
    });
    console.log('TestSuite finished: %s of %s tests succeeded; %s failures',
                successful, tests.length, tests.length - successful
               );
}   
var VERBOSITY

function _initAAALog () {
    VERBOSITY = 1
}

function testLogNormal () {
  logNormal('Foo bar baz %s','what what?');

}

function doLog (verbosity) {    
  if (VERBOSITY >= verbosity) {
    var args = Array.prototype.slice.call(arguments);
    args.shift()
		args = args.map(tidyLog)
    //console.log.apply(console,args);
    Logger.log.apply(Logger,args)
  }
}

logVerbose = function () {
	args = [5]
	args.push.apply(args,arguments)
   // console.log.apply(console,args)
	doLog.apply(doLog,args)
}
logNormal = function () {
	args = [1]
    args.push.apply(args,arguments)
    console.info.apply(console,args)
    doLog.apply(doLog,args)
    
}
logAlways = function () {
	args = [-1]
	args.push.apply(args,arguments)
    console.log.apply(console,args)
	doLog.apply(doLog,args)
}

function emailError (msg, err, params) {
    console.log('ERROR %s %s %s',err, msg, params);
    if (! params) {params = {}};
    subject = params.subject ? params.subject : 'Error';
    to = params.to ? params.to : 'thinkle@innovationcharter.org';
    msg += '<br>Error '+JSON.stringify(err);
    msg += '<br>Exception: '+err.name+': '+err.message;
    msg += '<br>Stack: '+err.stack
    console.error('Emailing error: %s, %s',subject,msg);
    sendEmail(to, subject, msg, true);
    //sendEmail('thinkle@innovationcharter.org','Error in Budget Script',msg)
}

function assertEq (a, b) {
  if (a==b) {
    logVerbose(a+'='+b+'! Success');
  }
  else {
      Logger.log('ASSERTION ERROR: '+shortStringify(a)+'!='+JSON.stringify(b))
      console.error('Assertion Error: %s!=%s',a,b)
    throw 'AssertionError'+shortStringify(a)+'!='+JSON.stringify(b);
  }
}

function testLogs () {
	[-1,1,10].forEach( function (l) {
      VERBOSITY = l
      Logger.log('Testing verbosity level %s',l);
		logNormal('Log normal message - verbosity=%s',l)
		logVerbose('Log verbose message - verbosity=%s',l)
		logAlways('Log always message - verbosity=%s',l)
	});
}

function testError () {
	try {
		Logger.log('Here we go');
		var soup = bar * 3 + 6
	}
	catch (err) {
		emailError('Oops',err);
	}
}

function tidyLog (obj) {return obj}

function tidyLogSucks (obj) {
	if (Array.isArray(obj)) {
		return obj.map(tidyLog)
	}
	if (typeof obj == 'object') {
		var objCopy = {}
		for (key in obj) {
			var val = obj[key]
			objCopy[key] = val
			if (typeof val == 'string') {
				if (val.length > 20) {
					objCopy[key] = val.substr(0,17)+'...'
				}
			}
			if (Array.isArray(val)) {
				objCopy[key] = val.map(function (o) {return tidyLog(o)});
			}
			if (typeof val == 'object') {
				objCopy[key] = tidyLog(val)
			}
		}
		return objCopy
	}
	else {
		return obj
	}

}

function testTidyLog () {
	bigObj = {}
	bigSubObj = {}
	bugSubSub = {}
	bigObj['subObj'] = bigSubObj
	bigSubObj['subObj'] = bigSubSub
	for (var i=0; i<20; i++) {
		bigObj[i] = 'Foo is a long string'
		bigObj[i+'Foo'] = 'Foo is a longer string'
		bigObj[i+'FooFoo'] = paragraphify('Foo is an even much longer string. ')
		bigSubObj[i] = bigObj[i];
		bigSubSub[i] = bigObj[i];
		bigSubObj[i+'Foo'] = bigObj[i+'Foo'];
		bigSubSub[i+'FooFoo'] = bigObj[i+'Foo'];
		bigSubObj[i+'Foo'] = bigObj[i+'FooFoo'];
		bigSubSub[i+'FooFoo'] = bigObj[i+'FooFoo'];		
	}
	logNormal('Log: %s',bigObj);
}

function shortStringify (obj) {
	return JSON.stringify(tidyLog(obj))
}
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function sendEmail (email, subject, htmlBody) {
  Logger.log('Result of sendmail=>%s, %s, %s',email,subject,htmlBody);
  Logger.log(shortStringify(
    MailApp.sendEmail(
      {to:email,
       htmlBody:htmlBody,
       subject:subject}
    )
  )
            )
}

function checkForSelfApproval (settings) {
	// We are checking whether the form allows self approval or what...
	if (! settings.allowSelfApproval || settings.allowSelfApproval=='0') {
		if (settings.FormUser==settings.Approver) {
			Logger.log('Uh oh self approval -- better fix it');
			if (settings.ApproverDefault != settings.FormUser) {
				settings.Approver = settings.ApproverDefault
			}
			else {
				// fallback
				settings.Approver = settings.ApproverBackup
			}
		}
	}
}

// function checkSelfApproval (val, addressSettings, results) {
// 	if (! addressSettings['PreventSelfApprove']) {return val}
// 	// Otherwise we *are* requiring that value != self
// 	if (val != results['FormUser']) {
// 		return val
// 	}
// 	if (results['EmailLookup']['Default']!=results['FormUser']) {
// 		return results['EmailLookup']['Default']
// 	}
// 	if (results['DefaultBackup']!=results['FormUser']) {
// 		return results['DefaultBackup']
// 	}
// }

function getEmail (addressSettings, results) {
  // Given somewhat complex addressSettings config sheet, get correct
  // email for results...
  // Email Field => Field that maps directly to email
  // ORRRRRR
  // Lookup Field => Field that tells us what to look up in the other fields
  if (addressSettings['Lookup Field']) {
    // If we have a lookup field...
    var fieldValue = results[addressSettings['Lookup Field']]
    var value = addressSettings[fieldValue]
    if (value) {
			return checkSelfApproval(value,addressSettings,results)
		}
    else {
      if (addressSettings['Default']) {
        return checkSelfApproval(addressSettings['Default'],addressSettings,results)
      }
    }
  }
  if (addressSettings['Email Field']) {
    return checkSelfApproval(results[addressSettings['Email Field']],addressSettings,results)
  }
}

function checkBool (value) {
	switch (value) {
	case false:
		return false;
		break;
	case 'no':
		return false;
		break;
	case 'No':
		return false;
		break;
	case 'false':
		return false;
		break
	case 'False':
		return false;
		break
	case 0:
		return false;
		break
	case 'untrue':
		return false;
		break;
	default:
		return value;
		break
	}
}

function sendFormResultEmail (results, settings) {
  Logger.log('sendFormResultEmail'+shortStringify([results,settings]));
	var config = lookupFields(settings, results)
	// Add support for conditional email...
	if (config.hasOwnProperty('onlyEmailIf')) {
		Logger.log('Checking onlyEmailIf field!');
		if (! checkBool(config.onlyEmailIf)) {
		    logNormal('Not sending email: \nresults:%s \nsettings:%s config: %s',results,settings,config);
			return 'No Email Sent';
		}
	}
	//
	templateFields = getTemplateFields(config, results);
	logNormal('config=>%s',config);
	if (config.emailFormUser) {
		config.To = results.FormUser+','+config.To
	}
	sendEmailFromTemplate(
    //getEmail(config, results),
		config.To,
    config.Subject,
    config.Body,
    templateFields,
    true
	);
	return {config:config,fields:templateFields}
}

function sendEmailFromTemplate (email, subj, template, fields, fixWhiteSpace) {
	debug = 0;
	if (debug) {
      msg = '<pre>';
		msg += 'Email being sent: here is what we got.\n';
		msg +=  'Template: '+template+'\n\n';
		msg += 'Fields: '+shortStringify(fields)+'\n\n';
		msg += 'Result: \nSubject: '+applyTemplate(subj,fields);
		msg += 'Result: \nBody: '+applyTemplate(template,fields,fixWhiteSpace);
    msg += '</pre>';
		emailError(msg, 'No real error :)', {'subject':'Email Debug Info: '+applyTemplate(subj,fields)});
	}
  sendEmail(email, applyTemplate(subj, fields), applyTemplate(template, fields, fixWhiteSpace));
}

function getTemplateFields (config, results) {
	var templateFields = {}
	for (var setting in results) {
		templateFields[setting] = spreadsheetify(results[setting]);
	} // end forEach result
	for (var setting in config) {
		if (templateFields[setting]) {
			logAlways('sendFormResultsEmail - Potential conflict between results[%s]=>%s and config[%s]=>%s; using results',
								setting, templateFields[setting], setting, config[setting]
							 )
		}
		else {
			templateFields[setting] = spreadsheetify(config[setting]);
		}
	} // end for each setting
	return templateFields
}

function applyTemplate (template, fields, fixWhiteSpace) {
  if (fixWhiteSpace) {
    template = template.replace(/\n/g,'<br>');
  }
  for (var target in fields) {
    var replacement = spreadsheetify(fields[target]);
		if (fixWhiteSpace) {
			if (typeof replacement == 'string') {
				replacement = replacement.replace(/\n/g,'<br>')
			}
		}
    template = template.replace(new RegExp(escapeRegExp('<<'+target+'>>'),'g'),replacement);
    template = template.replace(new RegExp(escapeRegExp('{{'+target+'}}'),'g'),replacement);
  }
  template = template.replace(/{{[^}]*}}/g,''); // remove empty ones
  template = template.replace(/<<[^>]*>>/g,''); // remove empty ones
  return template
}

function testTemplateEmail () {
  template = '<p>This is a <<adj>> paragraph. <<empty>> One day, Mr. <<name>> went on a walk and came upon a <<animal>>.</p><p>When Mr. <<name>> saw the <<animal>>, he <<verb1>>ed!</p><p>This ends my mad lib story. I hope you <<verb2>>ed it.</p>'
  fields = {
    animal: 'bear',
    name: 'Johnson',
    verb1: 'regulate',
    verb2: 'animate',
    adj: 'beautiful'
  }
  sendEmailFromTemplate('tmhinkle@gmail.com','Test Template Message',template, fields);
}


function testEmail () {
  sendEmail('tmhinkle@gmail.com','This is a test message from Workflows','<b>This is bold</b><br><table><tr><td>This</td><td>is</td></tr><tr><td><i>a</i></td><td>table</td></tr></table><h3>Heading!</h3>');
}


var templateTest
function _initZZZTestEmailer () {

    templateTest = Test ( {
        metadata : {name:'Template test'},
        test : function () {
	    assertEq(applyTemplate('foo <<bar>>',{bar:'yippee'}),'foo yippee')
    	    assertEq(applyTemplate('foo <<empty>><<bar>>',{bar:'yippee'}),'foo yippee')
            
	    assertEq(applyTemplate('foo \n<<bar>>',{bar:'yippee'}),'foo \nyippee')
	    assertEq(applyTemplate('foo \n{{bar}}',{bar:'yippee'},true),'foo <br>yippee') 
	    assertEq(applyTemplate('foo \n<<bar>>\n<<bar>>\n',{bar:'yippee'},true),'foo <br>yippee<br>yippee<br>')
	    assertEq(applyTemplate('<<first>>:<<middle>>:<<last>>',{'first':'Thomas','middle':'M','last':'Hinkle'}),
		     'Thomas:M:Hinkle')
            return 'Success!'
        }
    })


}
function testTemplate () {templateTest.solo()}
// Simple interface for handling our configuration sheets.
// The configuration sheets are a bit of an unusual format. 
//
// The first two columns are for simple key->value pairs
//
// A     |      B
// KEY   ->   VAL
// KEY   ->   VAL
// KEY   ->   VAL
//
// Repeated keys are not checked for but are not advised -- the later key
// will wipe out the earlier one.
//
// Columns 3 on are used for list-values, with the orientation changing as follows:
//
// C   |   D   |  E  | ...
// KEY |  KEY  | KEY | ...
// VAL |  VAL  | VAL | ...
// VAL |  VAL  | VAL | ...
// VAL |  VAL  | VAL | ...
// VAL |  VAL  | VAL | ...
//
//
// If the column names here contain Key and Value, then we create additional
// Dictionaries with the name...
//
// FooKey | FooVal
// KEY    | VAL
// KEY    | VAL
//
// Will produce...
//
// {FooKey : [KEY, KEY, ...],
//  FooVal : [VAL, VAL, ...],
//  FooLookup : {KEY : VAL, KEY : VAL}
//  }
// 
// The key object here is ConfigurationSheet, used as follows
//
// cs = ConfigurationSheet( sheet )
// var table = cs.loadConfigurationTable()
// // table is a simple lookup containing either the single
// // items or the list of items:
// // 
// // {k:v, k:v, k:v, k:[v,v,v,v], k:[v,v,v,v]}
//
// // Updated values can be written with...
// cs.writeConfigurationTable(table)
//
// Note: the master spreadsheet contains the following...
//
// Form 1 - Action - Configuration 1 - Configuration 2 - Configuration 3 - Configuration 4...
// 

var COLORS

/** @function _initConfigSheets
 * @desc
 * Initializes all of our globals as needed.
 * 
 **/
function _initConfigSheets () {
    COLORS = {
        'key' : {'even' : {'fg' : '#ffffff',
                           'bg': '#283593'},
                 'odd' : {'fg': '#E8EAF6',
                          'bg' : '#303F9F'},
                },
        'val' : {'even': {'fg':'#1A237E',
                          'bg':'#FFECB3'},
                 'odd': {'fg':'#1A237E',
                         'bg':'#FFF8E1'},
                },
        'lkey' : {'odd' : {'fg' : '#F5F5F5',
                           'bg': '#212121'},
	          'even' : {'fg': '#E0E0E0',
			    'bg' : '#424242'},
                 },
        'lval' : {'even': {'fg':'#424242',
                           'bg':'#F5F5F5'},
	          'odd': {'fg':'#212121',
		          'bg':'#E0E0E0'},
                 },           
    }
}
var baseTest, modTest

/* @function _initZZZTestsConfigSheets 
 * @desc Initialize tests for config sheets (needs to be called *after* other init methods)
 */

function _initZZZTestsConfigSheets () {
    baseTest = {
        test : function (p) {
	    var config = createTestSheet(p);
	    var sid = config.getSheetId();
	    var cs = getConfigurationSheetById(p.configSS,sid);
	    cs.loadConfigurationTable();
	    assertEq(cs.table['NumProp'],1);
	    assertEq(cs.table['StrProp'],'okay')
	    assertEq(cs.table['Array1'][2],7)
	    assertEq(cs.table['Array2'][0],'foo')
	    assertEq(cs.table.dicLookup[7],7)
	    assertEq(cs.table.mixedDicLookup['hi'],1)
	    return {config:config,
		    link:config.getSheetLink(),
		    id:config.getSheetId()
                    
                   }
        },
        cleanup : function (p,r,success) {
            console.log('Cleanup got: %s,%s,%s',p,r,success);
	    if (success) {
	        ss = SpreadsheetApp.openById(p.configSS);
                console.log('Deleting sheet %s %s',ss,r.id);
	        ss.deleteSheet(getSheetById(ss,r.id))
	    }
	    else {
	        console.log('Test failed, not deleting sheet. Investigate @ %s',r.link);
	    }
        },
        metadata : {name:'Config Sheet Test',
	           }
    }

    Test(baseTest);

    var modTest = Test({
        metadata : {name: 'Config - Modify Sheet'},
        setup : baseTest.test,
        test : function (p) {
	    var config = p.setupResult.config
	    config.loadConfigurationTable();
	    config.table['New Prop'] = 'New Val';
	    config.table['NumProp'] = 2; // change it
	    config.table.dicLookup[7] = 17; // change it
	    config.writeConfigurationTable(config.table,{newDic:{a:'a'}})
	    var cs = getConfigurationSheetById(p.configSS,config.getSheetId())
	    cs.loadConfigurationTable();
	    assertEq(cs.table.NumProp,2)
	    assertEq(cs.table.dicLookup[7],17)
	    assertEq(cs.table['New Prop'],'New Val')
	    assertEq(cs.table.newDicLookup.a,'a')
            return {result:"Modificaiton worked",id:cs.getSheetId(),link:cs.getSheetLink()}
        },
        cleanup : baseTest.cleanup,
    })

    Test(modTest);

}



/**
 * @function getSheetById
 * @param ss Spreadsheet Object
 * @param id {string}
 * @desc
 * Provide utility to get sheet by ID number.
 * This is just an oversight in the google API we're fixing here.
 **/
function getSheetById (ss, id) {
    var sheets = ss.getSheets()
    for (var i=0; i<sheets.length; i++) {
        if (sheets[i].getSheetId()==id) {
            return sheets[i]
        }
        else {
            Logger.log('Oops, '+sheets[i].getSheetId()+'!='+id);
        }
    }  
}

/**
 * @function getConfigTable
 * @param ssId {string}
 * @param sheetId {string}
 * @returns
 * Return loaded {@link ConfigurationTable}
 * stored in Spreadsheet ssId on Sheet sheetId.
 **/
function getConfigTable (ssId, sheetId) {
    cs = getConfigurationSheetById (ssId, sheetId)
    cs.loadConfigurationTable()
    return cs.table
}

function getConfigurationSheetById (ssID, sheetID, settings) {
    if (! ssID.getSheets) { // Handle case where we get handed a SS obj.
        Logger.log('Grabbing sheet from ID: '+ssID+' obj: '+shortStringify(ssID));
        var ss = SpreadsheetApp.openById(ssID);
    }
    else{
        var ss = ssID
    }
    var sheet = getSheetById(ss, sheetID);
    if (sheet) {
        logVerbose('Got sheet '+shortStringify(sheet))
        return ConfigurationSheet(sheet, settings) 
    }
    else {
        throw 'Did not find sheet'+ss+sheetID
    }
}


function formatKeys (sheet, i) {    
    var keyc = i % 2 ? COLORS.key.even : COLORS.key.odd;
    var valc = i % 2 ? COLORS.val.even : COLORS.val.odd;
    var key = sheet.getRange(i,1,1,1)
    logVerbose('Setting key: '+keyc.fg+' on '+keyc.bg);
    key.setFontColor(keyc.fg); key.setBackground(keyc.bg);
    key.setFontWeight('bold');key.setFontStyle('normal');
    var val = sheet.getRange(i,2,1,1)
    logVerbose('Setting val: '+valc.fg+' on '+valc.bg);
    val.setFontColor(valc.fg); val.setBackground(valc.bg);
    val.setFontWeight('normal');val.setFontStyle('italic');  
}

function formatLKeys (sheet, colnum) {
    var keyc = colnum % 2 ? COLORS.lkey.even : COLORS.lkey.odd;
    var valc = colnum % 2 ? COLORS.lval.even : COLORS.lval.odd;  
    var key = sheet.getRange(1,colnum,1,1)
    key.setFontColor(keyc.fg); key.setBackground(keyc.bg);  
    key.setFontWeight('bold');key.setFontStyle('normal');
    var rows = sheet.getLastRow();
    var val = sheet.getRange(2,colnum,rows-1,1);
    val.setFontColor(valc.fg); val.setBackground(valc.bg);
    val.setFontWeight('normal'); val.setFontStyle('italic');
}

/** @constructor ConfigurationSheet
 * @desc
 * Simple interface for handling our configuration sheets.
 * The configuration sheets are a bit of an unusual format. 
 * 
 * The first two columns are for simple key->value pairs
 * <pre>
 * A     |      B
 * KEY   ->   VAL
 * KEY   ->   VAL
 * KEY   ->   VAL
 * </pre>
 *
 * Repeated keys are not checked for but are not advised -- the later key
 * will wipe out the earlier one.
 * 
 * Columns 3 on are used for list-values, with the orientation changing as follows:
 * <pre>
 *     C   |   D   |  E  | ...
 *     KEY |  KEY  | KEY | ...
 *     VAL |  VAL  | VAL | ...
 *     VAL |  VAL  | VAL | ...
 *     VAL |  VAL  | VAL | ...
 *     VAL |  VAL  | VAL | ...
 *</pre> 
 * 
 * If the column names here contain Key and Value, then we create additional
 * Dictionaries with the name...
 * <pre>
 *     FooKey | FooVal
 *     KEY    | VAL
 *     KEY    | VAL
 * </pre>
 * Will produce...
 * <pre>
 *     {
 *       FooKey : [KEY, KEY, ...],
 *       FooVal : [VAL, VAL, ...],
 *       FooLookup : {KEY : VAL, KEY : VAL}
 *      }
 * </pre>
 * The key object here is ConfigurationSheet, used as follows
 * <pre>
 *     cs = ConfigurationSheet( sheet )
 *     var table = cs.loadConfigurationTable()
 *     // table is a simple lookup containing either the single
 *     // items or the list of items:
 *     
 *     {K:v, k:v, k:v, k:[v,v,v,v], k:[v,v,v,v]}
 * </pre>
 * Updated values can be written with...
 * <pre>
 *     cs.writeConfigurationTable(table)
 * </pre>
 * Note: the master spreadsheet contains the following...
 * <pre>
 * Form 1 - Action - Configuration 1 - Configuration 2 - Configuration 3 - Configuration 4...
 * </pre>
 **/
function ConfigurationSheet (sheet, settings) {
    /** 
     * @method ConfigurationSheet.overwriteConfiguration
     * @param keyValues {object}

     * @param listValues {object}
     * listValues contain lists, like:
     * <pre>
     * {
     *     favoriteColors : ['red','blue','green'],
     *     favoriteFruits : ['apple','kiwi','mango']
     * }
     * </pre>
     * @inner
     **/
    function overwriteConfiguration (keyValues, listValues) {
        console.log('overwriteConfiguration(%s,%s)',keyValues,listValues);
        sheet.clear();
        for (var k in keyValues) {
            if (keyValues.hasOwnProperty(k)) {
                var v = keyValues[k];
                //logVerbose('Pushing row: '+k+'=>'+v);
                sheet.appendRow([k,v]);
                // Now format the sheet...
            }
        } // en for each key
        formatKeys(sheet,sheet.getLastRow())    
        // Now handle list values...
        var column = 3; 
        for (var k in listValues) {
            //logVerbose('Pushing list of values for: '+k);
            if (listValues.hasOwnProperty(k)) {
                var v = listValues[k];
                sheet.getRange(1,column,1,1).setValue(k);
                for (var i in v) {
                    // push each item in list...          
                    var val = v[i];
                    logVerbose('Pushing value: '+val);
                    logVerbose('push list item '+i+' '+val+' into row '+(i+2)+' column '+column)
                    sheet.getRange((Number(i)+2),column,1,1).setValue(val);
                }      
                formatLKeys(sheet,column);
                column += 1; // increment
            } // end if
        } // end for loop     
        sheet.getDataRange().setWrap(true);
    } // end overwriteConfiguration
    
    function overwriteConfigurationTable (table, lookups) {
        console.log('overwriteConfigurationTable(%s,%s)',table,lookups);
        keyValues = {}
        listValues = {}
        for (var key in table) {
            if (table.hasOwnProperty(key)) {
                var value = table[key];
                if (Array.isArray(value)) {
                    listValues[key] = value;
                }
                else {
                    keyValues[key] = value;
                }
            }
        }
        if (lookups) {
            for (var lname in lookups) {
                var d = lookups[lname]
                listValues[lname+'Key'] = []
                listValues[lname+'Val'] = []
                for (var k in d) {
                    var v = d[k];
	            if (k) {
		        listValues[lname+'Key'].push(k);
		        listValues[lname+'Val'].push(v);
	            }
                }
            }
        }
        overwriteConfiguration(keyValues, listValues);
    }
    
    function getConfigurationTable () {
        var lastRow = sheet.getLastRow(); // this call turns out to be really expensive -- do it JUST ONCE
        var keyValues = sheet.getRange(1,1,lastRow,2).getValues()
        logVerbose('working with keyValues='+shortStringify(keyValues));
        var data = {}
        for (var r=0; r<keyValues.length; r++) {
            var row = keyValues[r]
            // warning -- if a value is duplicated, only the second value counts
            data[row[0]] = row[1]
        }
        var listValues = sheet.getRange(1,3,lastRow,sheet.getLastColumn()).getValues();
	var valueListHeaders = []
        for (var c=0; c<(sheet.getLastColumn()-2); c++) {
            // each column is a list of values w/ a header on top
            var header = listValues[0][c]
	    valueListHeaders.push(header)
            if (header) {
                var valueList = []
                for (var r=1; r<lastRow; r++) {
                    var value = listValues[r][c]
                    //if (value) {
                    valueList.push(value);
                    //}
                }
                data[header] = valueList;
            }
        } // end forEach column...
        valueListHeaders.forEach(
	    function (listHeader) {
		if (listHeader.indexOf('Key')==listHeader.length-3) {
		    // If we have a key... look for a value
		    var rootName = listHeader.substr(0,listHeader.length-3)
		    if (data.hasOwnProperty(rootName+'Val')) {
			// Yippee - we have values...
                        Object.defineProperty(data,
                                              rootName+'Lookup',
                                              {value:LookupArray(data[listHeader],data[rootName+'Val']),
					       enumerable:false});
                    }
                }
            }); // end forEach valueListHeader...
        return data;
    } // end getConfigurationTable  
    
    var configurationSheet = { // object we will return
        
        /** @method ConfigurationSheet.getSheetLink 
         * @inner
	 * @desc 
         * Return link to configuration sheet.
         **/
        getSheetLink : function () {
	    return sheet.getParent().getUrl()+'#gid='+sheet.getSheetId();
        },

        /** @method ConfigurationSheet.getSheetId 
         * @inner
         * @desc
         * Return id of configuration sheet
         **/
        getSheetId: function () {
	    return sheet.getSheetId();
        },

        /** @method ConfigurationSheet.getSheetId
         * @inner
         * @desc
         * Return spreadsheet with configuration table
         **/
        getSpreadsheet : function () {return sheet.getParent()},

        /** @method ConfigurationSheet.loadConfigurationTable
         * @inner
         * @desc
         * Load configuration table from google sheet
         **/
        loadConfigurationTable: function () {
	    this.table = getConfigurationTable();
	    return this.table
        },    

        /** @method ConfigurationSheet.writeConfigurationTable
         * @inner
         * Overwrite configuraton table or write for the first time.
         * @param table {object} 
         * table is an object of simple lookups like <pre>{first:'Joe',last:'Shmoe'}</pre>
         * (optional - if not specified, we write current table)
         * @param {Object} lookups
         **/
        writeConfigurationTable: function (table, lookups) {
            if (table) { this.table = table };
	    overwriteConfigurationTable(this.table,lookups);
	    return this.table;
        },
    } // end configurationSheet
    
    return configurationSheet
} 

function LookupArray (array1, array2) {
    var lookupArray = {};      
    array1.forEach(function (key) {
        if (! key) {return};
        logVerbose('Key='+key);
        Object.defineProperty(
	    lookupArray,
	    key,
	    {get : function () {
		var idx = array1.indexOf(key);
		if (idx > -1) {
		    return array2[idx]
		}
	    }, // end get
	     set : function (v) {
		 var idx = array1.indexOf(key);
		 if (idx > -1) {
		     array2[idx] = v
		 }
		 else {
		     array1.push(key)
		     array2.push(v)
		 }
	     }, // end set
             enumerable: true,
	    })
    }) // end forEach key
    Object.preventExtensions(lookupArray); // prevent confusion
    return lookupArray;
}


function createConfigurationSheet (ss, sheetName, table, lookups) {
    //ss = SpreadsheetApp.getActiveSpreadsheet()
    var nameIterator = 1; var origSheetName = sheetName;
    while (ss.getSheetByName(sheetName)) {    
        var sheetName = origSheetName + '-' + nameIterator
        nameIterator += 1
    }
    var sheet = ss.insertSheet(sheetName)    
    var cs = ConfigurationSheet(sheet)
    logVerbose('Writing data values'+shortStringify(table))
    cs.writeConfigurationTable(
        table,lookups
    )  
    return cs
}


function initializeMasterConfig (ss) {
    // Set up our master config...
    var sheet = getSheetById(ss,0);
    sheet.clear();
    var initialRow = ['Form','FormID','Action','Config 1 Link', 'Config 1 ID', 'Config 2 Link','Config 2 ID', 'Config 3 Link', 'Config 3 ID']
    var hiddenVals = [2,5,7,9]  
    sheet.getRange(1,1,1,initialRow.length).setValues([initialRow])
    // hide IDs
    for (var i=0; i<hiddenVals.length; i++) {
        sheet.hideColumns(hiddenVals[i])
    }
    return getMasterConfig(ss);
}

function getMasterConfig (ss) {
    // Our master sheet is the first sheet (0)
    var sheet = getSheetById(ss,0)
    // If not initialized, initialize...
    if (sheet.getDataRange().getValues()[0].length===1) {
        logNormal('Empty master - initialize');
        return initializeMasterConfig(ss)
    }
    else {
        logNormal('Master has '+sheet.getDataRange().getValues()[0].length);
        logNormal('Presumably we are fine...');
    }
    var table =  Table(sheet.getDataRange())  

    table.pushConfig = function (form, action, configSheets) {
        var pushData = {'Form':form.getEditUrl(),'FormID':form.getId(),'Action':action}
        n = 1
        configSheets.forEach( function (configSheet) {
            logAlways('Pushing configSheet '+n+': '+shortStringify(configSheet));
            pushData['Config '+n+' Link'] = configSheet.getSheetLink();      
            pushData['Config '+n+' ID'] = configSheet.getSheetId();  
            n += 1;
        }) // end forEach configSheet...
        logAlways('pushRow '+shortStringify(pushData));
        table.pushRow(pushData);
    }


    table.getConfigsForRow = function (row) {
        //row.getConfigurationSheets = function () {
        for (var i=1; i<4; i++) {            
            configId = row['Config '+i+' ID']          
            if (configId) {
                logNormal('Grabbing config '+i+' from sheet '+configId)
                try {
		    row['Config'+i] = getConfigurationSheetById(sheet.getParent(), configId)
		    row['Config'+i].loadConfigurationTable();
                }
                catch (err) {
		    Logger.log('Odd: unable to load Config'+i+': '+configId);
                }
            }
            else {
                row['Config'+i] = 'FOO!'
            }
        } // end for each config
        return row
    }
    
    table.getConfigsForId = function (id) {
        var retRows = []
        table.forEach(function (row) {
            if (row.FormID==id) {
                //return configs;
                //} // end getConfigurationSheets
                table.getConfigsForRow(row);
                retRows.push(row)
            }
        }) // end forEach row...
        return retRows;
    }
    
    return table;

} // end getMasterConfig

function testReadConfigsFromMaster () {
    var formId = '1FZSNYuDWpf1scB1_CvJrt7mnyIBH_-AALxXyIDUJWR0';
    var ss = SpreadsheetApp.openById('1-mHEuYtRNQDtQO1vX0WY49RsB6noRXQuV_sBLUl0DJ0');
    var masterConfig = getMasterConfig(ss)
    var configs = masterConfig.getConfigsForId(formId)
    configs.forEach(function (cRow) {
        logVerbose('Config row: '+shortStringify(cRow))
        logVerbose('Has method: '+shortStringify(cRow.getConfigurationSheets));
        //cRow.getConfigurationSheets().forEach( function (sheet) {
        var sheet = cRow['Config1']
        logVerbose('Got sheet: '+JSON.stringify(sheet.table))
        logVerbose('From fields: '+JSON.stringify(sheet.table.fromFields))
        logVerbose('Approval Form ID: '+JSON.stringify(sheet.table['Approval Form ID']))
	// })
    })
}


function testCreateConfig () {
    var ss = SpreadsheetApp.openById('1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk');
    createConfigurationSheet(ss,'Test',
                             {'Regular Key':123,
                              'Other key':'This is a cool value',
                              'Some other key':123.120391823,
                              'Listy Key':[1,2,3,4,5],
                              'Other List':['Red','Blue','Green','Purple']
                             })
}// end testCreateConfig


function testReadConfigurationSheet () {
    var cs = getConfigurationSheetById(
        '1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk',
        '286151412'
    )
    Logger.log('Got configuration sheet'+JSON.stringify(cs))
    cs.loadConfigurationTable()
    Logger.log('Got data table: '+JSON.stringify(cs.table));
    cs.table['Places'].push('Westford')
    cs.table['Colors'].push('Green')
    cs.writeConfigurationTable();
    Logger.log('Edit URL: ' + cs.getSheetLink());
    Logger.log('Sheet ID: '+cs.getSheetId());
}

function testLookupFieldsStuff () {
    var ss = SpreadsheetApp.openById('1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk');
    var config = createConfigurationSheet(ss, 'TestMagicDict',
                                          {'Key':'321',
                                           'FieldKey':'%Name',
                                           'LookupFieldKey':'@Supervisor>>Supervisor',
					   'Colors':'@Colors>>Color',
                                           'SupervisorKey':['Arnold','Ringwall','Kapeckas'],
                                           'SupervisorVal':['earnold@innovationcharter.org','cringwall@innovationcharter.org','mkapeckas@innovationcharter.org'],
					   'ColorKey':['Red','Blue','Green'],
					   'ColorVal':['#f00','#00f','0f0'],
                                           'OtherList':['a','b','c',1,2,3,'asdfasdf'],
                                          })
    config.loadConfigurationTable()
    Logger.log('Got %s',JSON.stringify(lookupFields(
	config.table,
	{'Name':'Harry Potter',
	 'Supervisor':'Ringwall',
	 'Colors':['Red','Blue','Green'],
	}
    )));
}

function updateConfigurationSheet (ssid, sheetid, props, lookups) {
    console.log('Pushing config update: SSID: %s, sheetID: %s, props: %s, lookups: %s',ssid,sheetid,props,lookups);
    cs = getConfigurationSheetById(ssid,sheetid);
    cs.writeConfigurationTable(props,lookups);
}

function testUpdateConfigSheet () {
    updateConfigurationSheet(
        '1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk',
        '1515612828',
        {'Regular Key':'Updated value is different for regular only'},
        {'Foo':{'Fruit':'Kiwi','Protein':'Soy Beans','Grain':'Quinoa'},
         Squares:{3:9,5:25,7:49,9:81}
        });      
}

function createTestSheet (p) {
    var ss = SpreadsheetApp.openById(p.configSS);
    return createConfigurationSheet(ss,'Test 2',
                                    {NumProp:1,
                                     StrProp:'okay',
                                     Array1:[1,2,7,'hi'],
                                     Array2:['foo',1,2,7,'hi']
                                    },
                                    {dic:{1:1,2:2,3:3,7:7},
                                     mixedDic:{hi:1,there:2,what:3,is:4,up:5}
                                    });
    
}


function testMagicDictionaryStuff () {
    var ss = SpreadsheetApp.openById('1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk');
    var config = createConfigurationSheet(ss, 'TestMagicDict',
                                          {'Regular Key':123,
                                           'Other key':'foo biz bang',
                                           'FooKey':['Fruit','Vegetable','Protein','Grain'],
                                           'FooVal':['Apple','Kale','Salmon','Flatbread'],
                                           'SquaresKey':[2,4,6,8],
                                           'SquaresVal':[4,16,36,64],
                                           'OtherList':['a','b','c',1,2,3,'asdfasdf'],
                                          })
    Logger.log(JSON.stringify(config));
    Logger.log(JSON.stringify(config['Regular Key']));
    Logger.log(JSON.stringify(config['Other Key']));
    Logger.log(JSON.stringify(config['SquaresKey']));
    Logger.log(JSON.stringify(config['SquaresLookup']));
}

function testReadMagic () {
    var cs = getConfigurationSheetById(
        '1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk',
        '652288327'
    );
    cs.loadConfigurationTable();
    Logger.log('Config:'+JSON.stringify(cs));
    Logger.log(JSON.stringify(cs.table['Regular Key']));
    Logger.log(JSON.stringify(cs.table['Other Key']));
    Logger.log(JSON.stringify(cs.table['SquaresKey']));
    Logger.log(JSON.stringify(cs.table['SquaresLookup']));
    Logger.log(JSON.stringify(cs.table['SquaresLookup'][6]));
    Logger.log(JSON.stringify(cs.table['FooLookup'].Fruit));
    cs.table['FooLookup'].Fruit = 'Banana';
    cs.writeConfigurationTable();
}

function testInitializeConfig () {
    var ss = SpreadsheetApp.openById('1SvKY-4FxRsuJLywL4k4uRxj4MxIV7bPR8lG32jWRtuk');
    Logger.log(initializeMasterConfig(ss));
}
_initAAALog();_initConfigSheets();_initZZZTestTableReader();_initZZZTestsConfigSheets
