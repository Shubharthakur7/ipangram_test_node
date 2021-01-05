 
const mysql = require('mysql2');
/**
 *Database Service 
 */
module.exports.execQuery = function (query,params){
  return new Promise((resolve,rejects) => {

    const connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'Nutee01@s',
      database : 'ipangram_ecom'
    });
    
    connection.connect();
    
    connection.query(query,params, function (error, results) {
      if (error) rejects(error);
      resolve(results);
    });
    
    connection.end();
  });
}