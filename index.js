const express = require("express");
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const ObjectId = require("mongodb").ObjectId;

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");

const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsConfig));
app.options("", cors(corsConfig));

app.use(bodyParser.json());
app.use(express.static("services"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbmil.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbmil.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const bookingsCollection = client.db("muhurtodb").collection("bookings");
    const adminsCollection = client.db("muhurtodb").collection("admins");
    const reviewsCollection = client.db("muhurtodb").collection("reviews");
    const servicesCollection = client.db("muhurtodb").collection("services");
    //   const ordersCollection = client.db("humayunnamaDb").collection("orders");

    // All Services
    // app.get("/services", (req, res) => {
    //   servicesCollection.find().toArray((err, items) => {
    //     res.send(items);
    //   });
    // });
    app.get("/services", async (req, res) => {
        const result = await servicesCollection.find().toArray();
        res.send(result);
    });


    // Delete Service
    // app.delete("/deleteService/:id", (req, res) => {
    //   servicesCollection
    //     .deleteOne({ _id: ObjectId(req.params.id) })
    //     .then((result) => {
    //       res.send(result.deletedCount > 0);
    //     });
    // });
    app.delete("/deleteService/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await servicesCollection.deleteOne(query);
        res.send(result);
    });


    // All Bookings
    // app.get("/bookings", (req, res) => {
    //   bookingsCollection.find().toArray((err, items) => {
    //     res.send(items);
    //   });
    // });
    app.get("/bookings", async (req, res) => {
        const result = await bookingsCollection.find().toArray();
        res.send(result);
    });


    // Check Admin
    // app.get("/isAdmin", (req, res) => {
    //   adminsCollection
    //     .find({ email: req.query.email })
    //     .toArray((err, admins) => {
    //       res.send(admins.length > 0);
    //     });
    // });
    app.get("/isAdmin", async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await adminsCollection.find(query).toArray();
        res.send(result.length > 0);
    });


    // New Booking
    app.post("/newBooking", (req, res) => {
      const newBooking = req.body;
      bookingsCollection.insertOne(newBooking).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });


    // Booking list of an user
    app.get("/bookingList", (req, res) => {
      bookingsCollection
        .find({ clientEmail: req.query.email })
        .toArray((err, items) => {
          res.send(items);
        });
    });

    // All Reviews
    // app.get("/reviews", (req, res) => {
    //   reviewsCollection.find().toArray((err, items) => {
    //     res.send(items);
    //   });
    // });
    app.get("/reviews", async (req, res) => {
        const result = await reviewsCollection.find().toArray();
        res.send(result);
    });



    // Add Review
    app.post("/addReview", (req, res) => {
      const review = req.body;
      reviewsCollection.insertOne(review).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });



    // Add New Admin
    app.post("/addAdmin", (req, res) => {
      const newAdmin = req.body;
      adminsCollection.insertOne(newAdmin).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });

    

    // Add New Service
    app.post("/addService", (req, res) => {
      const serviceName = req.body.serviceName;
      const serviceCharge = req.body.serviceCharge;
      const image = req.files.serviceImage;

      const newImage = image.data;
      const encImage = newImage.toString("base64");

      var serviceImage = {
        contentType: image.mimetype,
        size: image.size,
        img: Buffer.from(encImage, "base64"),
      };

      servicesCollection
        .insertOne({ serviceName, serviceCharge, serviceImage })
        .then((result) => {
          res.send(result.insertedCount > 0);
        });
    });

    // Update Status
    app.patch("/updateStatus/:id", (req, res) => {
      bookingsCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: { status: req.body.status },
          }
        )
        .then((result) => {
          res.send(result.modifiedCount > 0);
        });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

// client.connect((err) => {
//   console.log("connection error : ", err);
//   const bookingsCollection = client.db("muhurtodb").collection("bookings");
//   const adminsCollection = client.db("muhurtodb").collection("admins");
//   const reviewsCollection = client.db("muhurtodb").collection("reviews");
//   const servicesCollection = client.db("muhurtodb").collection("services");
//   //   const ordersCollection = client.db("humayunnamaDb").collection("orders");

//   // All Services
//   app.get("/services", (req, res) => {
//     servicesCollection.find().toArray((err, items) => {
//       res.send(items);
//     });
//   });

//   // Delete Service
//   app.delete("/deleteService/:id", (req, res) => {
//     servicesCollection
//       .deleteOne({ _id: ObjectId(req.params.id) })
//       .then((result) => {
//         res.send(result.deletedCount > 0);
//       });
//   });

//   // All Bookings
//   app.get("/bookings", (req, res) => {
//     bookingsCollection.find().toArray((err, items) => {
//       res.send(items);
//     });
//   });

//   // Check Admin
//   app.get("/isAdmin", (req, res) => {
//     adminsCollection.find({ email: req.query.email }).toArray((err, admins) => {
//       res.send(admins.length > 0);
//     });
//   });

//   // New Booking
//   app.post("/newBooking", (req, res) => {
//     const newBooking = req.body;
//     bookingsCollection.insertOne(newBooking).then((result) => {
//       res.send(result.insertedCount > 0);
//     });
//   });

//   // Booking list of an user
//   app.get("/bookingList", (req, res) => {
//     bookingsCollection
//       .find({ clientEmail: req.query.email })
//       .toArray((err, items) => {
//         res.send(items);
//       });
//   });

//   // All Reviews
//   app.get("/reviews", (req, res) => {
//     reviewsCollection.find().toArray((err, items) => {
//       res.send(items);
//     });
//   });

//   // Add Review
//   app.post("/addReview", (req, res) => {
//     const review = req.body;
//     reviewsCollection.insertOne(review).then((result) => {
//       res.send(result.insertedCount > 0);
//     });
//   });

//   // Add New Admin
//   app.post("/addAdmin", (req, res) => {
//     const newAdmin = req.body;
//     adminsCollection.insertOne(newAdmin).then((result) => {
//       res.send(result.insertedCount > 0);
//     });
//   });

//   // Add New Service
//   app.post("/addService", (req, res) => {
//     const serviceName = req.body.serviceName;
//     const serviceCharge = req.body.serviceCharge;
//     const image = req.files.serviceImage;

//     const newImage = image.data;
//     const encImage = newImage.toString("base64");

//     var serviceImage = {
//       contentType: image.mimetype,
//       size: image.size,
//       img: Buffer.from(encImage, "base64"),
//     };

//     servicesCollection
//       .insertOne({ serviceName, serviceCharge, serviceImage })
//       .then((result) => {
//         res.send(result.insertedCount > 0);
//       });
//   });

//   // Update Status
//   app.patch("/updateStatus/:id", (req, res) => {
//     bookingsCollection
//       .updateOne(
//         { _id: ObjectId(req.params.id) },
//         {
//           $set: { status: req.body.status },
//         }
//       )
//       .then((result) => {
//         res.send(result.modifiedCount > 0);
//       });
//   });
// });


app.get("/", (req, res) => {
	res.send("Server is running");
});

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});