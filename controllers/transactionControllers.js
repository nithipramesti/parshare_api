const { db } = require("../database");

module.exports = {
  incomeTransaction: (req, res) => {
    if (req.user.role === "admin") {
      let scriptQuery = `SELECT
        date_format(
          db_parshare.transactions.transaction_date,
          '%Y-%m-%d'
        ) as date,
        SUM(income) as income,
        SUM(db_parshare.transactions.transaction_totalprice) as totalPrice
      FROM
        db_parshare.transactions
      WHERE
        db_parshare.transactions.transaction_date BETWEEN CURDATE() - INTERVAL 30 DAY
        AND CURDATE()
        AND db_parshare.transactions.status = "confirmed"
      GROUP BY
        date_format(
          db_parshare.transactions.transaction_date,
          '%Y-%m-%d'
        ),
        income,
        db_parshare.transactions.transaction_totalprice;`;
        
      db.query(scriptQuery, (err, results) => {
        if (err){ 
          res.status(500).send({
            success: false,
            data: error,
          });
        } else {
          const d = new Date();
          let data = []
          d.setMonth(d.getMonth()+1)
          for(let i = 0; i < 30; i++){
            const dateFormat = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
            
            for(let j = 0; j < results.length; j++){
              if(results[j].date === dateFormat){
                data.push({
                  ...results[j]
                })
                break
              }else{
                data.push({
                  date: dateFormat,
                  income: 0,
                  totalPrice: 0
                })
                break
              }
            }
            d.setDate(d.getDate()-1)
          }
          if(data.length === 30){
            return res.status(200).send({
              success: true,
              data,
            });
          }
        }
      });
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  }
}
