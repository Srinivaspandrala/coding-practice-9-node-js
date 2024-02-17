const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'userData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.post('/register/', async (request, response) => {
  const {username, password, name, gender, location} = request.body
  const hashedPassword = bcrypt.hash(password, 10)
  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    const createUserQuery = `
  INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`

    if(password.length < 5){
        response.status(400);
        response.send('Password is too short');
    }else{
        const letnewuserdetails = await db.run(createUserQuery);
        response.send(200)
        response.send('User created successfully')
    }else{
        response.status(400)
        response.send('User already exists');
  }

    }
    
})
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectLoginuserQuery = `SElECT * from user where username = '${username}'`
  const dbUser = await db.get(selectLoginuserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid User')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched == true) {
      response.status(200)  
      response.send('Login Sucess!')
    } else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const databaseUser = await database.get(selectUserQuery)
  if (databaseUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      databaseUser.password,
    )
    if (isPasswordMatched === true) {
      if (password.length < 5) {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const updatePasswordQuery = `
          UPDATE
            user
          SET
            password = '${hashedPassword}'
          WHERE
            username = '${username}';`

        const user = await database.run(updatePasswordQuery)

        response.send('Password updated')
      } else {
        response.status(400)
        response.send('Password is too short')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})



module.exports = app
