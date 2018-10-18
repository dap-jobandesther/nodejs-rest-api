"use strict"
const sqlite3 = require("sqlite3")

class DatabaseManager {
	constructor(file, callback) {
		this.db = new sqlite3.Database(file, (err) => {
			if(err) {
				console.log('Could not connect to SQLite database', err)
			}
			else {
				console.log('Connected to SQLite database')
				this.initialize((err2) => {
					if(err2) {
						console.log('Failed to create database table', err2)
					}
					callback(err2)
				})
				return
			}
			callback(err)
		})
	}

	initialize(callback) {
		this.db.run("CREATE TABLE IF NOT EXISTS transactions (transactionId TEXT PRIMARY KEY, amount BIGINT, type VARCHAR(255), description TEXT);", callback)
	}

	generateTransactionId() {
		var id = ""
		var length = 10
		var i
		for(i = 0; i < length; i++) {
			id = id.concat((Math.floor(Math.random() * 10)).toString())
		}
		return id
	}

	add(amount, type, description, callback) {
		this.db.run("INSERT INTO transactions (transactionId, amount, type, description) VALUES (?, ?, ?, ?);", [ this.generateTransactionId(), this.convertToLong(amount), type, description ], callback)
	}

	update(transactionId, amount, type, description, callback) {
		this.db.run("UPDATE transactions SET amount = ?, type = ?, description = ? WHERE transactionId = ?;", [ this.convertToLong(amount), type, description, transactionId ], callback)
	}

	delete(transactionId, callback) {
		this.db.run("DELETE FROM transactions WHERE transactionId = ?;", [ transactionId ], callback)
	}

	get(transactionId, callback) {
		this.db.get("SELECT * FROM transactions WHERE transactionId = ?;", [ transactionId ], (err, row) => {
			if(err) {
				callback(err, null)
				return
			}
			else if(row) {
				row.amount = this.convertToString(row.amount)
			}
			callback(null, row)
		})
	}
	
	getAll(callback) {
		this.db.all("SELECT * FROM transactions;", (err, rows) => {
			if(err) {
				callback(err, null)
				return
			}
			else if(rows) {
				var i
				for(i = 0; i < rows.length; i++) {
					rows[i].amount = this.convertToString(rows[i].amount)
				}
			}
			callback(null, rows)
		})
	}

	convertToString(amount) {
		if(amount) {
			return parseFloat(amount / 100).toFixed(2).toString()
		}
		return "0.00"
	}

	convertToLong(amount) {
		if(amount && /\S/.test(amount)) {
			var i = amount.indexOf(".")
			if(i > -1) {
				var diff = (amount.length - 1) - i
				if(diff > 2) {
					if(parseInt(amount.charAt(i + 3)) > 4) {
						var d = parseFloat(amount) + 0.01
						amount = d.toString()
					}
					amount = amount.substring(0, amount.indexOf(".") + 3)
				}
				else if (diff > 1) {
				}
				else if (diff > 0) {
					amount = amount + "0"
				}
				else if (diff > -1) {
					amount = amount + "00"
				}
				while(amount.indexOf(".") > -1) {
					amount = amount.replace(".", "")
				}
				return parseInt(amount)
			}
			return parseInt(amount + "00")
		}
		return 0
	}
}

module.exports = DatabaseManager