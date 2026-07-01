import { connectDB } from './lib/database/db.js'
import User from './lib/database/models/zen-users.js'

await connectDB()

const user = await User.findOne({
  jid: '51991579415@s.whatsapp.net'
})

console.log(user.genos)
console.log(user.lastGenosTraining)