# Python SQL toolkit and Object Relational Mapper
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect
from flask import Flask, jsonify
import pandas as pd
import json
app = Flask(__name__)

engine = create_engine("postgres://cxqoiyqtnoanqo:fad124c7b10ff6e492b6513fd54bc446b3ca6fd46b958200a1f05828504b4930@ec2-54-160-120-28.compute-1.amazonaws.com:5432/de5lod0g63lbce", echo=False)

conn = engine.connect()

data1  = pd.read_sql("select * from daily_data where ticker in ('MMM','AXP','AMGN','AAPL','BA','CAT','CVX','CSCO','KO','DOW','GS','HD','HON','IBM','INTC','JNJ','JPM','MCD','MRK','MSFT','NKE','PG','CRM','TRV','UNH','VZ','V','WBA','WMT','DIS') AND date_close > '2017/01/01'",conn)

result=data1.to_json(orient='index')
parsed = json.loads(result)



@app.route("/")
def home():
    return "Blank for now"

@app.route("/jsonified")
def jsonified():
    return jsonify(parsed)

if __name__ == "__main__":
    app.run(debug=True)