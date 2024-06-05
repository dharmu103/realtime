async function accessCollection(id, eventType) {
    const uri =
      "mongodb+srv://" +
      process.env.MONGODB_USER +
      ":" +
      process.env.MONGODB_PASSWORD +
      "@" +
      process.env.MONGODB_CLUSTER +
      "/" +
      process.env.MONGODB_DBNAME +
      "?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  
    try {
      // Connect to the MongoDB cluster
      await client.connect();
  
      // Access the database
      const database = client.db("cluster");
  
      // Access the collection
      const collection = database.collection("usertrades");
  
      // Perform operations on the collection
      const document = await collection
        .find({ event_id: id, event_type: eventType })
        .toArray();
      console.log(document);
      return document;
    } finally {
      // Close the connection
      await client.close();
    }
  }

  async function checkAndProcessEvents() {
    const uri =
      "mongodb+srv://" +
      process.env.MONGODB_USER +
      ":" +
      process.env.MONGODB_PASSWORD +
      "@" +
      process.env.MONGODB_CLUSTER +
      "/" +
      process.env.MONGODB_DBNAME +
      "?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      const event = await FinishedEvent.findOne({ isMoneyTransferred: false });
      if (event) {
        console.log(event);
  
        const userTrades = await accessCollection(
          event.event_id,
          event.event_type
        );
        if (userTrades.length > 0) {
          console.log(
            `Found ${userTrades.length} user trades for event ${event.event_id}`
          );
  
          await client.connect();
          const database = client.db("cluster");
          const collection = database.collection("usertrades");
          setTimeout(async () => {
            for (const trade of userTrades) {
              if (event.result.toUpperCase() == trade.bet_type.toUpperCase()) {
                console.log(`Processing trade ${trade._id}`);
                trade.amount += trade.investment;
              }
              trade.status = "SUCCESS";
              try {
                await collection.updateOne({ _id: trade._id }, { $set: trade });
                console.log(`Trade ${trade._id} updated in the database`);
              } catch (err) {
                console.error(`Error updating trade ${trade._id}:`, err);
              }
            }
  
            event.isMoneyTransferred = true;
            try {
              //await userTrades.save();
              await event.save();
              console.log(
                `Event ${event.event_id} updated to isMoneyTransferred: true`
              );
            } catch (err) {
              console.error(`Error updating event ${event.event_id}:`, err);
            }
          }, 1000);
        } else {
          console.log(`No user trades found for event ${event.event_id}`);
        }
      } else {
        console.log("No events to process");
      }
    } catch (err) {
      console.error("Error finding event or user trades:", err);
    }
  }