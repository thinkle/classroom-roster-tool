/* Return all values AA that are not found in BB */
function disunion(aa, bb) {
  let cola = aa.map((a) => a[0])//[0];
  let colb = bb.map((b) => b[0])//[0];
  console.log('Find members of', cola, 'that do not belong to', colb)
  let results = cola.filter(
    (a) => {
      let exists = colb.indexOf(a) == -1;
      return exists;
    }
  );
  console.log('Got me results', results);
  return results;
}

function testMe() {
  console.log(disunion([1, 2, 3], [2, 3]));
}

function zeroPad(num, len) {
  var s = String(num);
  while (s.length < (len || 2)) s = '0' + s;
  return s;
}

// Lightweight timestamped operation logger for debugging performance/breadcrumbs
function logOperation(filename, callname, desc) {
  try {
    var now = new Date();
    var time = zeroPad(now.getHours(), 2) + ':' + zeroPad(now.getMinutes(), 2) + ':' + zeroPad(now.getSeconds(), 2) + '.' + zeroPad(now.getMilliseconds(), 3);
    var message = time + ' ' + filename + '.' + callname + (desc ? ' - ' + desc : '');
    console.log(message);
    return time;
  } catch (e) {
    console.log(new Date().toISOString() + ' ' + filename + '.' + callname + ' ' + (desc || ''));
  }
}