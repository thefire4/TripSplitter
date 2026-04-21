from flask import Blueprint, request, jsonify
from db import get_db

register_bp = Blueprint('register', __name__)
@register_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    firstName = data.get('firstName')
    lastName = data.get('lastName')
    email = data.get('email')

    if not firstName or not lastName or not email:
        return jsonify({'error': 'First Name, Last Name, and email are required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM client WHERE email = %s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        db.close()
        return jsonify({'error': 'Email already registered'}), 409

    cursor.execute("INSERT INTO client (firstName, lastName, email) VALUES (%s, %s, %s)", (firstName, lastName, email))
    db.commit()
    
    new_user_id = cursor.lastrowid
    cursor.close()
    db.close()

    return jsonify({'message': 'Registration successful', 'user_id': new_user_id}), 201