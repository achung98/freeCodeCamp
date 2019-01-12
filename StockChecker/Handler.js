const quote = require('stock-quote');

function Handler() {

  //Check if user is in the database
  this.findUser = async function(user, ip) {
    let localUser = await user.findOne({"Ip": ip}).exec();
    return localUser;
  }

  //Create new user in the database
  this.newIp = async function(user, ip) {
    var saveIp = await new user({
       "Ip": ip,
     }).save();
    return saveIp;
  }

  //If the given stock is not the "likes" field, and the user wants to like that stock, push given stock in the "likes" field
  this.updateLikes = async function(doc, stock, like) {
     let updatedLikes;
    if(!doc.get("likes").includes(stock) && like) {
      updatedLikes = await doc.updateOne({"$push": {"likes": stock}});
    }
    return updatedLikes;
  }

  //If the user does not has the given stock in the "likes" field, increase the likes number.
  this.newLike = function(doc, stock, like) {
    let checkIfLiked = like ? doc.get("likes").includes(stock) ? 0 : 1 : 0;
    return checkIfLiked;
  }

  //Find if stock is already in the stocks database
  this.findStock = async function(stocks, stock) {
    let found = await stocks.findOne({"stock": stock}).exec();
    return found;
  }

  this.addLike = async function(stocks, stock, like) {
    let price;
    //Get price with stock-quote npm
    await quote.getQuote(stock).then(data => price = String(data.currentPrice)).catch(err => console.log("Stock not found"));
    //Chcek if given stock is in the database
    let added = await this.findStock(stocks, stock).then(doc => {
      //It it nos not, create a new stock, save it in the database, and update the likes
      if(doc == null) {
           new stocks({
             "stock": stock,
             "price": price,
             "likes": like
          }).save();
      } else
          //If the stock is in the database, update the likes depending of the user input
          doc.updateOne({"$inc": {"likes": like}}).exec();
    });
    return added;
  }
}

module.exports = Handler;
