/* Return all values AA that are not found in BB */
function disunion (aa, bb) {
  let cola = aa.map((a)=>a[0])//[0];
  let colb = bb.map((b)=>b[0])//[0];
  console.log('Find members of',cola,'that do not belong to',colb)
  let results = cola.filter(
    (a)=>{
      let exists = colb.indexOf(a)==-1;
      return exists;
    }
  );  
  console.log('Got me results',results);
  return results;
}

function testMe () {
  console.log(disunion([1,2,3],[2,3]));
}