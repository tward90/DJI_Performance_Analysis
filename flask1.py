
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

data1  = pd.read_sql("select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where djia30=true and date_close = (select max(date_close) from daily_data)",conn)

data2  = pd.read_sql("select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where djia30=true and date_close > '2017/01/01'",conn)

result=data1.to_json(orient='index')
parsed = json.loads(result)

result2=data2.to_json(orient='index')
parsed2 = json.loads(result2)


@app.route("/")
def home():
    return "Blank for now"


@app.route("/max_date")
def max_date():
    return jsonify(parsed)

@app.route("/time_series")
def time_series():
    return jsonify(parsed2)




if __name__ == "__main__":
    app.run(debug=True)