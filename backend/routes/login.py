from flask import Blueprint, request, jsonify
from db import get_db

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM client WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user:
        return jsonify({'error': 'Invalid email'}), 401

    return jsonify({'message': 'Login successful', 'user': user}), 200