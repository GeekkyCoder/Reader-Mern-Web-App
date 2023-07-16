const mongoose  = require("mongoose")


const mongoConnect =  async (url) => {
      await mongoose.connect(url)
}

module.exports = mongoConnect