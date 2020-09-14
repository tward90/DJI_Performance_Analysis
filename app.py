
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect
from flask import Flask, jsonify, render_template
import pandas as pd
import json
app = Flask(__name__)

engine = create_engine("postgres://cxqoiyqtnoanqo:fad124c7b10ff6e492b6513fd54bc446b3ca6fd46b958200a1f05828504b4930@ec2-54-160-120-28.compute-1.amazonaws.com:5432/de5lod0g63lbce", echo=False)

conn = engine.connect()

data1  = pd.read_sql("select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where djia30=true and date_close = (select max(date_close) from daily_data)",conn)

data2  = pd.read_sql("select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where djia30=true and date_close > '2017/01/01'",conn)

data3  = pd.read_sql("select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where a.ticker in ('FB','AAPL','AMZN','NFLX','GOOGL','NVDA','TSLA','TWTR') and date_close = (select max(date_close) from daily_data)",conn)

data4  = pd.read_sql("select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where a.ticker in ('FB','AAPL','AMZN','NFLX','GOOGL','NVDA','TSLA','TWTR')and date_close > '2017/01/01'",conn)

data5  = pd.read_sql("with last_day as(select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where sp500=true and date_close = (select max(date_close) from daily_data)),prior_day as(select a.*, b.security_name as company from daily_data a join ticker_security b on a.ticker=b.ticker where sp500=true and date_close = (select max(date_close-1) from daily_data))select a.ticker, a.date_close, b.date_close as prior_date_close, a.close, b.close as prior_close, (a.close-b.close)/b.close as pcnt_change, a.company from last_day a join prior_day b on a.ticker=b.ticker",conn)

result=data1.to_json(orient='index')
parsed = json.loads(result)

result2=data2.to_json(orient='index')
parsed2 = json.loads(result2)

result3=data3.to_json(orient='index')
parsed3 = json.loads(result3)

result4=data4.to_json(orient='index')
parsed4 = json.loads(result4)

result5=data5.to_json(orient='index')
parsed5 = json.loads(result5)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/max_date")
def max_date():
    return jsonify(parsed)

@app.route("/time_series")
def time_series():
    return jsonify(parsed2)

@app.route("/fang_max_date")
def fang_max_date():
    return jsonify(parsed3)

@app.route("/fang_time_series")
def fang_time_series():
    return jsonify(parsed4)

@app.route("/ticker")
def ticker():
    return jsonify(parsed5)


if __name__ == "__main__":
    app.run(debug=True)