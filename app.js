//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect(process.env.URI);

const itemsSchema = new mongoose.Schema({
  name: String
});


const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat food"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {

  

  Item.find({},function(err,result){
    if(result.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Defaut items added to database successfully!!");
          res.redirect("/");
        }
      });
    }else
    if(err){
      console.log(err);
    }else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });

  

});




app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //Show existing list
        res.render("list.ejs",{listTitle: foundList.name, newListItems: foundList.items})
      }
      }
  });

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
   
       newItem.save();
      res.redirect("/");
  
  }else{
      List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  
});


app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  //console.log(checkedItemId);
  
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId.trim(), function(err){
      if(err){
        console.log(err);
        }else{
          console.log("Item Successfully Deleted!");
        }
    });
    res.redirect("/");
  }else{

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId.trim()}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

  
  });

app.listen(3000||process.env.PORT, function() {
  console.log("Server started on port 3000");
});


// password for mongodb atlas: Vijay1999 and userName: admin-V
// 