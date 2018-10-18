"use strict"
const express = require("express")
const bodyParser = require('body-parser')
const DatabaseManager = require("./dbmanager")
const db = new DatabaseManager("./transactionsdb.sqlite3", (err) => {
	if(err) {
		return
	}
	const app = express()
	const port = 8080
	app.use(bodyParser.json())
	app.get("/", function(req, res) {
		db.getAll((err, rows) => {
			if(err) {
				res.json(err)
				return
			}
			res.json({
				status: "ok",
				data: rows
			})
		})
	})
	app.put("/:transactionId", function(req, res) {
		var v = JSON.parse(JSON.stringify(req.body))
		var err = validateAndSanitizeData(v)
		if(err) {
			res.json(err)
			return
		}
		db.update(req.params.transactionId, v.amount, v.type, v.description, (err2) => {
			if(err2) {
				resz.json(err2)
				return
			}
			res.json({
				status: "ok"
			})
		})
	})
	app.delete("/:transactionId", function(req, res) {
		db.delete(req.params.transactionId, (err) => {
			if(err) {
				resz.json(err)
				return
			}
			res.json({
				status: "ok"
			})
		})
	})
	app.post("/", function(req, res) {
		var v = JSON.parse(JSON.stringify(req.body))
		var err = validateAndSanitizeData(v)
		if(err) {
			res.json(err)
			return
		}
		db.add(v.amount, v.type, v.description, (err2) => {
			if(err2) {
				res.json(err2)
				return
			}
			res.json({
				status: "ok"
			})
		})
	})
	app.get("/:transactionId", function(req, res) {
		db.get(req.params.transactionId, (err, row) => {
			if(err) {
				res.json(err)
				return
			}
			res.json({
				status: "ok",
				data: row
			})
		})
	})
	app.listen(port)
	console.log("RESTful Wallet API server started on port: " + port)
})

function validateAndSanitizeData(data) {
	if(data) {
		var v = {}
		if(data.amount) {
			var i
			for(i = 0; i < data.amount.length; i++) {
				var c = data.amount.charCodeAt(i)
				if((c >= 48 && c <= 57) || (c == 46)) {
				}
				else {
					return {
						status: "error",
						code: "invalidAmount"
					}
				}
			}
			v["amount"] = data.amount
		}
		else {
			return {
				status: "error",
				code: "noAmount"
			}
		}
		if(data.type) {
			if(data.type === "deduction" || data.type === "addition") {
				v["type"] = data.type
			}
			else {
				return {
					status: "error",
					code: "invalidType"
				}
			}
		}
		else {
			return {
				status: "error",
				code: "noType"
			}
		}
		if(data.description) {
			v["description"] = data.description
		}
		else {
			return {
				status: "error",
				code: "noDescription"
			}
		}
		data = v
	}
	else {
		return {
			status: "error",
			code: "noData"
		}
	}
	return null
}
