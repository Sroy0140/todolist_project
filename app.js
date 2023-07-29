//jshint esversion:6

const express= require("express");
const bodyParser=require("body-parser");
const date=require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _ =require("lodash");
require('dotenv').config();

const app= express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view-engine", "ejs");

const connectionurl="mongodb+srv://shroy016797:7Tytb760kgVa7MtR@cluster0.ph7oewe.mongodb.net/todolistDB"
mongoose.connect(connectionurl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const itemsSchema=new mongoose.Schema({
    name: String,
});
const Item=mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
    listTitle: String,
    listItems: [itemsSchema],
});
console.log("list schema created succesfully")
const List= mongoose.model("List", listSchema);
var items=[];

async function insertData(){
    try{
        const newItem1= new Item({
            name: "Exercise",
        });

        const newItem2= new Item({
            name: "get Fresh",
        });
      
        const newItem3= new Item({
            name: "have breakfast",
        });
      
        const newItem4= new Item({
            name: "web dev",
        });
        
        items = await Item.find({});
        if(items.length===0){
            try {
                await newItem1.save();
                await newItem2.save();
                await newItem3.save();
                await newItem4.save();
                console.log(' Four Items successfully inserted.');
              } catch (err) {
                console.error('Error inserting item:', err);
              }
              res.redirect("/");
        }
        console.log('All items in the collection:');
        console.log(items);
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        //mongoose.connection.close(); // Close the connection when done
    }
} 



async function insertNewData(itemName){
    try{
        const newItem= new Item({
            name: itemName,
        });
        try{
            await newItem.save();
            console.log("new item inserted successfully");
        }catch (err) {
            console.error('Error inserting item:', err);
        }
    }catch (err) {
        console.error('Error inserting data:', err);
    }
}

async function deleteItemById(itemId) {
    try {
      const deletedItem = await Item.findOneAndDelete({ _id: itemId });

      if (deletedItem) {
        console.log('Deleted item:', deletedItem);
      } else {
        console.log('Item not found.');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    } 
}

var list=[];
async function insertList(Title){
    try{
        list=await List.findOne({listTitle:Title});
        console.log(list);
        if(!list){
            const newList=new List({
                listTitle:Title,
                listItems:items,
            });
            try{
                await newList.save();
                console.log("new list inserted");
                list=await List.findOne({listTitle:Title});
                console.log("list is:");
                console.log(list);
            }catch (err) {
                console.error('Error inserting item:', err);
            }
        }else{
            console.log("list already exists");
        }
    }catch (err) {
        console.error('Error inserting data:', err);
    }   
}

async function insertNewListData(title,item){
    try{
        const newItem= new Item({
            name: item,
        });
        var foundlist= await List.findOne({listTitle:title});
        
        foundlist.listItems.push(newItem);
        foundlist.save();
    }catch(err){
        console.error("error in inserting list data:",err);
    }
    
}

var arritems=[];
arritems.push("Exercise");
arritems.push("get fresh");
arritems.push("have breakfast");
arritems.push("web devlopment");

var workItems=[];

app.get("/",function(req,res){
    // var today=new Date();
    // var activity=""; 
    // var day="";
    // const week=["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // if(today.getDay()===6 || today.getDay()===0){
    //     //res.send("relax!!")
    //     day=week[today.getDay()];
    //     activity="relax! it's "+day+" \nit's a weekand";
    // }else{
    //     //res.send("let's start the day with full of energy!! :)")
    //     day=week[today.getDay()];
    //     activity="it's "+day+"\nlet's start the day with full of energy!!";
    // }
    
    insertData();
    var day= date.getDate();
    res.render("list.ejs", {listTitle:day , newListItem:items});

});

// app.get("/work", function(req,res){

//     res.render("list.ejs", {listTitle:"Work", newListItem:workItems});
// });

app.get("/about", function(req,res){
    res.render("about.ejs");
});

app.get("/:customListTitle", function(req,res){
    const customListTitle=_.capitalize(req.params.customListTitle);
    if(customListTitle!=="Favicon.ico"){
        insertList(customListTitle);
        //res.render("list.ejs", {listTitle:customListTitle , newListItem:list.listItems});
        //res.redirect("/"+customListTitle);
    }
    //insertList(customListTitle);
    res.render("list.ejs", {listTitle:customListTitle , newListItem:list.listItems});
})

async function findList(listname){
    var foundList=await List.findOne({name:listname});
    return foundList;
}
app.post("/", function(req,res){
    var newItemName = req.body.newItem;
    var listName=req.body.list;
    //insertNewData(newItemName,listName);
    var today= date.getDate();
    if(listName===today){
        insertNewData(newItemName);
        insertData();
        res.redirect("/");
    }else{
        //insertData();
        insertNewListData(listName,newItemName);
        //insertData();
        res.redirect("/"+listName);
    }
    
    
    // if(req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // items.push(item);
    // res.redirect("/");
    //console.log(item);

});

// Function to find a list by its name and delete an item from its listItems array
async function deleteItemFromList(listName, itemIdToDelete) {
    try {
      const updatedList = await List.findOneAndUpdate(
        { listTitle: listName }, // Find the list by its name
        { $pull: { listItems: { _id: itemIdToDelete } } }, // Remove the item from the listItems array
        { new: true } // Return the updated list after the update is applied
      );

      if (updatedList) {
        console.log('Updated list:', updatedList);
      } else {
        console.log('List not found.');
      }
      window.location.reload();
      window.location.reload();
    } catch (err) {
      console.error('Error updating list:', err);
    } finally {
      //mongoose.connection.close(); // Close the connection when done
    }
  }
app.post("/delete", function(req,res){
    const idOfitemToRemove=req.body.checkbox;
    const list_name=req.body.listName;
    console.log(list_name);
    var today= date.getDate();
    if(list_name===today){
        deleteItemById(idOfitemToRemove);
        insertData();
        res.redirect("/");
    }else{
        deleteItemFromList(list_name, idOfitemToRemove);
        
        res.redirect("/"+list_name);
    }

})

const port=process.env.PORT;
if(port==null || port == ""){
    port=4000;
}
app.listen(port, function(){
    console.log("server started on port 4000");
});