from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.login import login_bp
from routes.landing_page import landing_page_bp
from routes.tripExpenses import tripexpenses_bp
from routes.register import register_bp
from routes.createtrip import createtrip_bp
from routes.editexpenses import editexpenses_bp
from routes.addexpense import addexpense_bp
from routes.edittrip import edittrip_bp
from routes.deletetrip import deletetrip_bp
from routes.settlement import settlement_bp
from routes.deleteexpense import deleteexpense_bp
load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the Trip Planner API',
                    "endpoints": ["/api/auth/login","/api/auth/register", "/api/landing_page/<client_id>", "/api/trip_expenses/<client_id>/<trip_id>",
                                  "/api/createtrip", "/api/<client_id>/editexpenses/<trip_id>/<expense_id>", "/api/<client_id>/<trip_id>/addexpense", "/api/<client_id>/edittrip/<trip_id>",
                                  "/api/<client_id>/deletetrip/<trip_id>", "/api/settlement/<trip_id>", "/api/<client_id>/deleteexpense/<expense_id>"
                                  ]}), 200
app.register_blueprint(login_bp, url_prefix='/api/auth')
app.register_blueprint(landing_page_bp, url_prefix='/api/landing_page')
app.register_blueprint(tripexpenses_bp, url_prefix='/api/trip_expenses')
app.register_blueprint(register_bp, url_prefix='/api/auth')
app.register_blueprint(createtrip_bp, url_prefix='/api')
app.register_blueprint(editexpenses_bp, url_prefix='/api')
app.register_blueprint(addexpense_bp, url_prefix='/api')
app.register_blueprint(edittrip_bp, url_prefix='/api')
app.register_blueprint(deletetrip_bp, url_prefix='/api')
app.register_blueprint(settlement_bp, url_prefix='/api/settlement')
app.register_blueprint(deleteexpense_bp, url_prefix='/api')
if __name__ == '__main__':
    app.run(debug=True)