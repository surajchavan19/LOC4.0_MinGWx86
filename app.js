const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const ejs=require('ejs');
const nodemailer = require('nodemailer');
var uuid="";
var ngo="";
var link=[];
// const TextToSpeech=require('text-to-speech-js');
//
var fs = require('fs');
var path=require("path")
var multer=require('multer');
const req = require('express/lib/request');
var stripe=require('stripe')('sk_test_51KKGYLSJY5jGZ1U6CB3P2pYYDzQd9CLtQfRrq0QfXIy7JBlGif4rpWih0XOJN5k2kL9dhT0vq3Rzr9KHpCLUrw9900Qm1SC8CI');
var Publishable_Key = 'pk_test_51KKGYLSJY5jGZ1U6Faj9ROrEStt3NI2qncthXP5P8AduYGeOp3Me8N1iVWhfgErk6t6hzvpkheCtM7neFuuClYF600xTSUEeyr'
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var email="";
var pass="";

var upload = multer({ storage: storage });
const DonerSchema={
    Name:String,
    Email:String,
    Password:String,
    Donated:Number,
    Donated_organization:[String],
}
const eventSchema={
    Ngo_name:String,
    Event_name:String,
    time:Number,

}
const ngoSchema={
    Name:String,
    Email:String,
    Password:String,
    Phone:String,
}

const mainSchema={
    Ngo_name:String,
    Tagline:String,
    About:String,
    Goal:Number,
    Raised:Number,
    Bank:{
        Name:String,
      Account:Number,
    IFSCCode:String,
    BankName:String,
    Branch:String,

    },
 Phone:Number,
    Email:String,
    verified:Boolean,
    userimage:{
        data:Buffer,
        contentType:String

    },
    hospitalimage:{
        data:Buffer,
        contentType:String
    },

}

const User=mongoose.model('User',mainSchema);
const Doner=mongoose.model('Doner',DonerSchema);
const NGO=mongoose.model('NGO', ngoSchema);

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/Hand',{useNewUrlParser:true});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "petcheckmpr122@gmail.com",
      pass: "Done342@",
    },
});


function exportMail(receiver, subject, html){
    let info = transporter.sendMail({
        from: 'petozone update', // sender address
        to: receiver, // list of receivers
        subject: "", // Subject line
        text: "", // plain text body
        html: html, // html body
    });
}


app.get('/',(req,res)=>{
    User.find({},(err,data)=>{
        if(err) throw err;
        res.render('home',{data:data});
    }
    )   ;
})
app.get('/register',(req,res)=>{
    res.render('register')
})
app.post('/payment', function(req, res){
  const id=req.body.id;
  const amount=req.body.amount;
 User.findByIdAndUpdate(id,{$inc:{Raised:amount}},(err,data)=>{
    if(err) throw err;
    // console.log(data);

    })
// Doner.find
console.log(email);
 Doner.find({Email:email},(err,data)=>{
    if(err) throw err;

    // console.log(data);
    var ans=data[0].Donated;

    data[0].Donated=ans+amount;;
    data[0].Donated_organization.push(id);
    data[0].save();
    console.log(data.name);
    // console.log(data.Donated);
    // console.log(data.Donated_organization);
 })

    // Doner.findByIdAndUpdate(email,{$push:{Donated_organization:id}},(err,data)=>{
    //     if(err) throw err;
    //     // console.log(data);

    // })


    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gourav Hammad',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        }
    })
    .then((customer) => {
        console.log(customer);

        return stripe.charges.create({

            amount: 2500,
                // Charing Rs 25

            description: 'Web Development Product',
            currency: 'INR',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success")  // If no error occurs
    })
    .catch((err) => {
        res.send(err)       // If some error occurs
    });
})


app.post('/signupngo',(req,res)=>{
    var ngo=new NGO({
        Name:req.body.name,
        Email:req.body.email,
        Password:req.body.password,
        Phone:req.body.phone,
    })
    ngo.save();
    res.redirect('/loginngo');
   
})
app.get('/ngologin',(req,res)=>{
    res.render('ngologin');
})

app.post('/loginngo',(req,res)=>{
    const email=req.body.email;
   const pass=req.body.password;

    NGO.find({Email:email,Password:pass},(err,data)=>{
        if(err) throw err;
        if(data.length==0){
          ngo=data.Email;
            res.send("Invalid Email or Password");
        }
        else{
            res.redirect('/ngo');
        }
    })
})
app.get('/ngo',(req,res)=>{
  
        res.render('ngo');
    
})
app.post('/link',(req,res)=>{
    link.push(req.body.link);
    res.redirect('/ngo');
})
app.post('/next',(req,res)=>{
    const id=req.body.id;
    User.findOne({_id:id},(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render('Inform',{item:data,Publishable_Key:Publishable_Key});
        }
    })
})
app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/event',(req,res)=>{
    res.render('event',{link:link});
})
app.get('/voice',(req,res)=>{
    res.render('voice');
})
app.post('/login',(req,res)=>{
  email=req.body.email;
  console.log(email);
    const password=req.body.password;
    pass=password;
   Doner.findOne({Email:email,Password:password},(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            if(data){
                uuid=data._id;
                User.find({},(err,data1)=>{
                    if(err) throw err;
                    res.render('home1',{data:data1,link:link});
                }
                )   ;
            }
            else{
                res.send('invalid');
            }
        }
    })
})
app.get('/userdash',(req,res)=>{
    console.log(uuid);
    Doner.find({_id:uuid},(err,data)=>{
        if(err) throw err;
        else{

        res.render('userdash',{data:data});
        }
    })
    // res.render('userdash');
})
app.get('/signup',(req,res)=>{
    res.render('Signup');
})
app.get('/donate',(req,res)=>{
    User.find({},(err,data)=>{
        if(err) throw err;
        res.render('donate',{data:data});
    }
    )   ;

})
app.post('/signup',(req,res)=>{
    var obj=new Doner({
        Name:req.body.name,
        Email:req.body.email,
        Password:req.body.password,
        Donated:0,
    })
    obj.save();
    res.redirect('/signup');
})
app.post('/Register', upload.single('image'), async (req, res, next) => {
    var obj=new User({
        Tagline:req.body.Tagline,
        About:req.body.About,
        Goal:req.body.Goal,
        Raised:0,
        Bank:{
            Name:req.body.Name,
            Account:req.body.Account,
            IFSCCode:req.body.IFSCCode,
            BankName:req.body.BankName,
            Branch:req.body.Branch,
        },
        Phone:req.body.Phone,
        Email:req.body.Email,
        verified:false,
    //    userimg: {
    //         data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    //         contentType: 'image/png'
    //     },
        hospitalimage:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType:'image/png'
        }


    })
    obj.save()
    // console.log(req.file.image)
    Doner.find({},(er,data)=>{
        data.forEach(element => {
          const html = `
          <html>
          <head>
          </head>
          <style>
              .header{
                  text-align: center;
                  background-color:black ;
                  color: beige;
                  font-size: medium;
              }
              .container{
                  color: black;
                  font-size: medium;

              }
              .text{
                  font-size: medium;
                  text-align: center;


              }
              .footer{
                  background-color: black;
                  color: white;
              }
          </style>
          <body style="background-color:rgb(193, 250, 250);">
           <div class="header" style=" text-align: center;
           background-color:black ;">  <h1>Congratulation!!!!</h1></div>
           <hr>
           <div class="container">
               <h2><i>DEAR <%=data.Name%>,</i></h2>
              <div class="text" style=" text-align: center;"> <P><b><i>We are here to inform you that you have succesfully booked an appoinment with are verified doctor <br>
                   and it is your first appointment so it will be free of cost.Other details like video calling link will be <br> sent to you
                   your registered mobile number as your mentioned timing.:):):)</b></i>
               </P>
              </div>
           </div>
           <hr>
           <div class="footer">
               <h2><i>Thank You!!</i></h2>

               <h3><i>Regards:PetoZone</i></h3>
           </div>

          </body>
          </html>



          `
          // console.log(data.Email)
          var email1=element.Email;
          console.log(email1);
          exportMail(email1, "Confirmation for booking", html)
      })

        })

    res.redirect('/')


})
app.get('/maps',(req,res)=>{
  res.render("maps")
})

app.get('/verify',(req,res)=>{
    User.find({},(er,data)=>{
        res.render('verification',{data:data})

    })
})
app.post('/accept',(req,res)=>{
    User.findByIdAndUpdate(req.body.id,{verified:true},(er,data)=>{
        res.redirect('/verify')
    })
})
// TextToSpeech.talk("Hello Beautiful World!");
app.listen(80,(req,res)=>{
    console.log("Server started");

})
